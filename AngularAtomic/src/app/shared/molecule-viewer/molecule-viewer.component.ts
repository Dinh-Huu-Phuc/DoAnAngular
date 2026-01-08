import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AtomViewerComponent, AtomElement } from '../atom-viewer/atom-viewer.component';
import PeriodicTableData from '../../assets/PeriodicTable.json';

// three.js imports
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Element {
  name: string;
  symbol: string;
  number: number;
  shells?: number[];
}

@Component({
  selector: 'app-molecule-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, AtomViewerComponent],
  templateUrl: './molecule-viewer.component.html'
})
export class MoleculeViewerComponent implements OnInit {
  elements: Element[] = [];
  selectedElement: Element | null = null;
  selectedAtomElement: AtomElement | null = null;
  @ViewChild('threeContainer', { static: false }) threeContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('videoEl', { static: false }) videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayCanvas', { static: false }) overlayCanvas!: ElementRef<HTMLCanvasElement>;

  // three.js related
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private nucleus?: THREE.Mesh;
  private ringGroup?: THREE.Group;
  private animationId?: number;
  private electronGroup?: THREE.Group;
  private orbitingElectrons: Array<{ mesh: THREE.Mesh; radius: number; angle: number; speed: number; incline: number; phase: number }> = [];
  private lastFrameTime = 0;
  // orientation smoothing
  private targetQuaternion?: THREE.Quaternion;
  private currentQuaternion = new THREE.Quaternion();
  private targetYaw = 0;
  private currentYaw = 0;

  // camera / hand tracking
  cameraStarted = false;
  private handsWorker: any = null;
  private mpCamera: any = null;
  cameraError: string | null = null;
  // smoothing targets
  private targetScale = 1;
  currentScale = 1;
  // UI toggles
  sensitivity = 1.0;
  showPreview = false;
  showLandmarks = false;
  alwaysShowPreview = false;
  showSkeleton = false;

  isBrowser = false;

  constructor(private ngZone: NgZone, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.elements = (PeriodicTableData.elements as Element[]).sort((a, b) => a.number - b.number);
    // Select first element by default
    if (this.elements.length > 0) {
      this.selectElement(this.elements[0]);
    }
  }

  ngAfterViewInit(): void {
    // Only initialize browser-only APIs (WebGL, MediaPipe) when running in browser.
    if (isPlatformBrowser(this.platformId)) {
      this.initThree();
      // Start animation outside Angular to avoid change detection churn
      this.ngZone.runOutsideAngular(() => this.animate());
      // load mediapipe scripts lazily (but don't start camera yet)
      this.loadMediaPipeScripts();
    }
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.mpCamera && this.mpCamera.stop) {
      try { this.mpCamera.stop(); } catch (e) { /* ignore */ }
    }
    if (this.handsWorker && this.handsWorker.close) {
      try { this.handsWorker.close(); } catch (e) { /* ignore */ }
    }
  }

  selectElement(element: Element) {
    this.selectedElement = element;
    this.selectedAtomElement = {
      symbol: element.symbol,
      number: element.number,
      shells: element.shells
    };
    // update the Three.js model to match the selected atom
    this.updateThreeModelForSelectedAtom();
  }

  onElementChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const elementNumber = parseInt(select.value, 10);
    const element = this.elements.find(e => e.number === elementNumber);
    if (element) {
      this.selectElement(element);
    }
  }

  private initThree() {
    const container = this.threeContainer?.nativeElement;
    if (!container) return;

    const width = container.clientWidth || container.offsetWidth || 800;
    const height = container.clientHeight || 400;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x071422);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 5, 12);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enableZoom = true;

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    this.scene.add(light);

    // nucleus
    this.nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x1fb6ff, metalness: 0.3, roughness: 0.4 })
    );
    this.scene.add(this.nucleus);

    // electron group (we will animate electrons along orbits)
    this.electronGroup = new THREE.Group();
    this.scene.add(this.electronGroup);
    // initialize last frame time for animation
    this.lastFrameTime = performance.now();
    // build electrons for current selection (or default)
    this.rebuildElectronGroup(this.selectedAtomElement?.shells);

    // create decorative orbital rings around nucleus
    this.ringGroup = new THREE.Group();
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4dd0e1, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false });
    const ringGeo = new THREE.TorusGeometry(2.6, 0.02, 8, 128);
    const ringGeo2 = new THREE.TorusGeometry(3.4, 0.02, 8, 128);
    const ringGeo3 = new THREE.TorusGeometry(4.4, 0.02, 8, 128);
    const r1 = new THREE.Mesh(ringGeo, ringMat);
    const r2 = new THREE.Mesh(ringGeo2, ringMat);
    const r3 = new THREE.Mesh(ringGeo3, ringMat);
    r1.rotation.x = Math.PI * 0.12;
    r2.rotation.x = Math.PI * 0.42;
    r3.rotation.x = Math.PI * -0.22;
    this.ringGroup.add(r1, r2, r3);
    this.ringGroup.renderOrder = 0;
    this.scene.add(this.ringGroup);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  /**
   * Rebuild electron group based on shells array.
   * shells: [n1, n2, ...] where each number is electrons in that shell.
   */
  private rebuildElectronGroup(shells?: number[]) {
    if (!this.scene) return;

    // remove old group if exists
    if (this.electronGroup) {
      this.electronGroup.traverse((child: any) => {
        if (child.geometry) try { child.geometry.dispose(); } catch (e) {}
        if (child.material) try { child.material.dispose(); } catch (e) {}
      });
      this.scene.remove(this.electronGroup);
      this.electronGroup = undefined;
    }

    this.electronGroup = new THREE.Group();

    // fallback: if shells not provided, create a simple default configuration
    const shellsToUse = shells && shells.length > 0 ? shells : [2, 8];

    const electronGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const electronMat = new THREE.MeshStandardMaterial({ color: 0xff7b7b, emissive: 0xff4444, emissiveIntensity: 0.6, metalness: 0.1, roughness: 0.5 });

    this.orbitingElectrons = [];
    for (let s = 0; s < shellsToUse.length; s++) {
      const count = Math.max(1, shellsToUse[s]);
      const radius = 1.8 + s * 1.4;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const el = new THREE.Mesh(electronGeo, electronMat);
        // initial position (will be animated)
        const y = Math.sin(angle * 0.5 + s) * 0.12;
        el.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        // randomize speed and inclination a bit for natural motion
        const speed = (0.6 + Math.random() * 0.9) / (1 + s * 0.6);
        const incline = (Math.random() - 0.5) * 0.15;
        const phase = Math.random() * Math.PI * 2;
        el.renderOrder = 2;
        this.electronGroup.add(el);
        this.orbitingElectrons.push({ mesh: el, radius, angle: angle + phase, speed, incline, phase });
      }
    }
  }

  private updateThreeModelForSelectedAtom() {
    // called after selectedAtomElement is set to sync Three.js scene
    const atom = this.selectedAtomElement;
    if (!atom) {
      // no selection -> use default small electron group
      this.rebuildElectronGroup([2, 6]);
      if (this.nucleus) this.nucleus.material && (this.nucleus.material as THREE.Material).needsUpdate && null;
      return;
    }

    // rebuild electrons from shells if present
    this.rebuildElectronGroup(atom.shells);

    // optionally scale nucleus slightly by atomic number for visual cue
    if (this.nucleus) {
      const z = atom.number || 1;
      const scale = 0.8 + Math.min(2.0, Math.log(z + 1) * 0.18);
      this.nucleus.scale.setScalar(scale);
    }
  }

  private onWindowResize() {
    const container = this.threeContainer?.nativeElement;
    if (!container || !this.camera || !this.renderer) return;
    const width = container.clientWidth || container.offsetWidth || 800;
    const height = container.clientHeight || container.offsetHeight || 400;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = () => {
    if (!this.renderer || !this.scene || !this.camera) return;
    const now = performance.now();
    const dt = this.lastFrameTime ? (now - this.lastFrameTime) / 1000 : 0;
    this.lastFrameTime = now;
    // rotate electron group slowly and apply smooth scaling
    if (this.electronGroup) {
      this.electronGroup.rotation.y += 0.007;
      // smooth scale lerp towards targetScale
      this.currentScale = this.currentScale + (this.targetScale - this.currentScale) * 0.12;
      this.electronGroup.scale.setScalar(this.currentScale);
      // update orbiting electron positions
      for (const e of this.orbitingElectrons) {
        e.angle += e.speed * dt;
        const x = Math.cos(e.angle) * e.radius;
        const z = Math.sin(e.angle) * e.radius;
        const y = Math.sin(e.angle * 2 + e.phase) * e.radius * e.incline;
        e.mesh.position.set(x, y, z);
        // small self-rotation
        e.mesh.rotation.y += 1.2 * dt;
      }
    }
    // smoothly slerp nucleus orientation toward targetQuaternion
    if (this.nucleus && this.targetQuaternion) {
      this.currentQuaternion.slerp(this.targetQuaternion, 0.14);
      this.nucleus.quaternion.copy(this.currentQuaternion);
      if (this.ringGroup) {
        // make rings tilt subtly with nucleus
        this.ringGroup.quaternion.copy(this.currentQuaternion);
      }
    }
    // smooth yaw for electronGroup rotation
    if (this.electronGroup) {
      this.currentYaw = this.currentYaw + (this.targetYaw - this.currentYaw) * 0.12;
      this.electronGroup.rotation.y = this.electronGroup.rotation.y * 0.3 + this.currentYaw * 0.7;
    }
    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  };

  // --- MediaPipe / hand-tracking helpers ---
  private loadMediaPipeScripts() {
    // Load hands.js and camera_utils.js from CDN if not already present
    const doc = document;
    const already = (window as any).Hands;
    if (already) return;

    const s1 = doc.createElement('script');
    s1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
    s1.async = true;
    doc.head.appendChild(s1);

    const s2 = doc.createElement('script');
    s2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
    s2.async = true;
    doc.head.appendChild(s2);
    // drawing utils not necessary for our logic
  }

  async startCameraAndHands() {
    if (this.cameraStarted) return;
    const video = this.videoEl.nativeElement;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      video.srcObject = stream;
      await video.play();
    } catch (e) {
      console.warn('Camera permission denied or not available', e);
      this.cameraError = 'Không thể truy cập camera — cho phép quyền camera hoặc dùng thiết bị hỗ trợ.';
      return;
    }

    // wait until mediapipe loaded
    const waitFor = (condFn: () => boolean, timeout = 5000) => {
      return new Promise<void>((resolve, reject) => {
        const start = Date.now();
        const iv = setInterval(() => {
          if (condFn()) {
            clearInterval(iv);
            resolve();
          } else if (Date.now() - start > timeout) {
            clearInterval(iv);
            reject(new Error('timeout'));
          }
        }, 100);
      });
    };

    try {
      await waitFor(() => (window as any).Hands && (window as any).Camera, 7000);
    } catch (err) {
      console.warn('MediaPipe scripts not loaded in time', err);
      this.cameraError = 'Không tải được thư viện nhận diện tay. Vui lòng kiểm tra kết nối.';
      return;
    }

    const HandsClass = (window as any).Hands;
    const CameraClass = (window as any).Camera;

    this.handsWorker = new HandsClass({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    this.handsWorker.setOptions({
      selfieMode: true,
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    this.handsWorker.onResults((results: any) => {
      this.onHandResults(results);
    });

    this.mpCamera = new CameraClass(video, {
      onFrame: async () => {
        try {
          await this.handsWorker.send({ image: video });
        } catch (e) {
          // ignore frame errors
        }
      },
      width: 640,
      height: 480
    });
    this.mpCamera.start();
    this.cameraStarted = true;
    // if user wants preview always, enable it
    if (this.alwaysShowPreview) {
      this.showPreview = true;
    }
    this.cameraError = null;
  }
  private onHandResults(results: any) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      // no hand detected -> relax target scale back to 1
      this.targetScale = 1;
      // clear overlay if present
      if (this.showLandmarks && this.overlayCanvas) {
        const c = this.overlayCanvas.nativeElement;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, c.width, c.height);
        }
      }
      return;
    }
    const lm = results.multiHandLandmarks[0];
    // landmarks are normalized [0..1] coordinates in image space
    // compute average distance from wrist (index 0) to finger tips (4,8,12,16,20)
    const wrist = lm[0];
    const tipsIdx = [4, 8, 12, 16, 20];
    let total = 0;
    for (const i of tipsIdx) {
      const p = lm[i];
      const dx = p.x - wrist.x;
      const dy = p.y - wrist.y;
      const dz = (p.z || 0) - (wrist.z || 0);
      total += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    const avg = total / tipsIdx.length;
    // map avg to scale (heuristic values)
    const min = 0.08;
    const max = 0.35;
    const norm = Math.min(1, Math.max(0, (avg - min) / (max - min)));
    // apply sensitivity multiplier and clamp
    const scale = Math.max(0.4, Math.min(3.5, 0.8 + norm * 1.6 * this.sensitivity));
    // set smoothing target; actual application happens in animate()
    this.targetScale = scale;

    // draw landmarks overlay for debugging if enabled
    if ((this.showLandmarks || this.showSkeleton) && this.overlayCanvas) {
      this.drawLandmarks(results.multiHandLandmarks[0]);
    }
    // map hand orientation to model rotation
    this.applyHandOrientation(lm);
  }

  private drawLandmarks(landmarks: Array<any>) {
    try {
      const video = this.videoEl.nativeElement;
      const canvas = this.overlayCanvas.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx || !video) return;
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
      // size canvas to video pixel size
      if (canvas.width !== vw || canvas.height !== vh) {
        canvas.width = vw;
        canvas.height = vh;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // draw skeleton lines first if enabled
      if (this.showSkeleton) {
        ctx.strokeStyle = 'rgba(0,200,200,0.9)';
        ctx.lineWidth = 2;
        for (const conn of HAND_CONNECTIONS) {
          const a = landmarks[conn[0]];
          const b = landmarks[conn[1]];
          if (!a || !b) continue;
          ctx.beginPath();
          ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
          ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
          ctx.stroke();
        }
      }
      if (this.showLandmarks) {
        ctx.fillStyle = 'rgba(0,200,200,0.95)';
        for (let i = 0; i < landmarks.length; i++) {
          const p = landmarks[i];
          const x = p.x * canvas.width;
          const y = p.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } catch (e) {
      // ignore drawing errors
    }
  }

  private applyHandOrientation(lm: Array<any>) {
    try {
      // compute palm normal from vectors wrist->index_mcp (5) and wrist->pinky_mcp (17)
      const wrist = lm[0];
      const idx = lm[5];
      const pinky = lm[17];
      const v1 = new THREE.Vector3(idx.x - wrist.x, idx.y - wrist.y, (idx.z || 0) - (wrist.z || 0));
      const v2 = new THREE.Vector3(pinky.x - wrist.x, pinky.y - wrist.y, (pinky.z || 0) - (wrist.z || 0));
      const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
      if (normal.lengthSq() < 1e-6) return;

      // MediaPipe coords: x to right, y down. Convert to right-handed for three.js by flipping y and z
      const corrected = new THREE.Vector3(normal.x, -normal.y, -normal.z).normalize();

      // quaternion that rotates +Z (0,0,1) to point along corrected normal
      const from = new THREE.Vector3(0, 0, 1);
      const q = new THREE.Quaternion().setFromUnitVectors(from, corrected);
      this.targetQuaternion = q;

      // compute yaw (rotation around Y) from corrected vector projection
      const yaw = Math.atan2(corrected.x, corrected.z);
      this.targetYaw = yaw;
    } catch (e) {
      // ignore orientation errors
    }
  }

  setSensitivityPreset(level: 'light' | 'medium' | 'strong') {
    if (level === 'light') this.sensitivity = 0.8;
    if (level === 'medium') this.sensitivity = 1.0;
    if (level === 'strong') this.sensitivity = 1.4;
  }

  // UI helper (bound from template if needed)
  toggleCamera() {
    if (this.cameraStarted) {
      // stop camera
      const video = this.videoEl.nativeElement;
      const tracks = (video.srcObject as MediaStream)?.getTracks() || [];
      tracks.forEach(t => t.stop());
      video.srcObject = null;
      if (this.mpCamera && this.mpCamera.stop) {
        try { this.mpCamera.stop(); } catch (e) { /* ignore */ }
      }
      this.cameraStarted = false;
    } else {
      this.startCameraAndHands();
    }
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
    if (this.showPreview && !this.cameraStarted) {
      // start camera automatically when preview requested
      this.startCameraAndHands();
    }
  }

  resetScale() {
    this.targetScale = 1;
    this.currentScale = 1;
  }
}
// standard MediaPipe hand connections used to draw skeleton (top-level constant)
const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // index
  [5, 9], [9, 10], [10, 11], [11, 12],  // middle
  [9, 13], [13, 14], [14, 15], [15, 16],// ring
  [13, 17], [17, 18], [18, 19], [19, 20],// pinky
  [0, 17]                                // wrist to pinky base
];
