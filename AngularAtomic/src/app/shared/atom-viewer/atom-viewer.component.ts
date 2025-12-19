import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface AtomElement {
  symbol: string;
  number: number;
  shells?: number[];
}

@Component({
  selector: 'app-atom-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './atom-viewer.component.html'
})
export class AtomViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() element: AtomElement | null = null;
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private animationFrameId?: number;
  private electronGroups: THREE.Group[] = [];
  private nucleus?: THREE.Mesh;
  private isInitialized = false;

  constructor(
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScene();
      this.zone.runOutsideAngular(() => this.animate());
      this.isInitialized = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isInitialized && changes['element'] && !changes['element'].firstChange) {
      this.rebuildScene();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId != null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.controls?.dispose();
    this.renderer?.dispose();
  }

  private initScene() {
    const container = this.canvasContainer.nativeElement;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Soft lights
    const ambient = new THREE.AmbientLight(0x38bdf8, 0.8);
    scene.add(ambient);
    const point = new THREE.PointLight(0x22c55e, 1.2);
    point.position.set(5, 5, 5);
    scene.add(point);

    // OrbitControls for mouse rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 15;
    controls.autoRotate = false;

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.controls = controls;

    this.buildAtom();
  }

  private buildAtom() {
    if (!this.scene) return;

    // Remove old atom parts
    if (this.nucleus) {
      this.scene.remove(this.nucleus);
      this.nucleus.geometry.dispose();
      (this.nucleus.material as THREE.Material).dispose();
    }

    this.electronGroups.forEach(group => {
      group.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
      this.scene!.remove(group);
    });
    this.electronGroups = [];

    // Nucleus
    const nucleusGeometry = new THREE.SphereGeometry(1.2, 48, 48);
    const nucleusMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.7,
      metalness: 0.2,
      roughness: 0.1
    });
    this.nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    this.scene.add(this.nucleus);

    // Electron shells based on element.shells or fallback
    const shells = this.element?.shells && this.element.shells.length
      ? this.element.shells
      : [2, 8, 8];

    const electronMaterial = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    shells.forEach((electronCount, shellIndex) => {
      const radius = 2 + shellIndex * 0.9;
      const group = new THREE.Group();

      // Orbit circle (optional visual)
      const orbitGeometry = new THREE.RingGeometry(radius - 0.01, radius + 0.01, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x0f172a,
        side: THREE.DoubleSide
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      group.add(orbit);

      const electronsOnThisShell = Math.min(electronCount, 12);
      for (let i = 0; i < electronsOnThisShell; i++) {
        const angle = (i / electronsOnThisShell) * Math.PI * 2;
        const electronGeometry = new THREE.SphereGeometry(0.12, 24, 24);
        const electron = new THREE.Mesh(electronGeometry, electronMaterial);
        electron.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        group.add(electron);
      }

      group.rotation.x = 0.3 + shellIndex * 0.2;
      this.scene!.add(group);
      this.electronGroups.push(group);
    });
  }

  private rebuildScene() {
    this.buildAtom();
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (!this.scene || !this.camera || !this.renderer || !this.controls) {
      return;
    }

    const elapsed = performance.now() / 1000;

    this.electronGroups.forEach((group, index) => {
      group.rotation.y = elapsed * (0.4 + index * 0.2);
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}


