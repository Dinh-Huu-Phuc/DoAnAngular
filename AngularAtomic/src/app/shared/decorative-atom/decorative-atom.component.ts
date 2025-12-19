import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-decorative-atom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './decorative-atom.component.html'
})
export class DecorativeAtomComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private animationFrameId?: number;
  private electronGroups: THREE.Group[] = [];
  private nucleus?: THREE.Mesh;
  private atomGroup?: THREE.Group;

  constructor(
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScene();
      this.zone.runOutsideAngular(() => this.animate());
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId != null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer?.dispose();
  }

  private initScene() {
    const container = this.canvasContainer.nativeElement;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0x38bdf8, 0.6);
    scene.add(ambient);
    const point1 = new THREE.PointLight(0x22c55e, 1.0);
    point1.position.set(5, 5, 5);
    scene.add(point1);
    const point2 = new THREE.PointLight(0xf97316, 0.8);
    point2.position.set(-5, -5, 5);
    scene.add(point2);

    // Atom group for rotation
    const atomGroup = new THREE.Group();
    scene.add(atomGroup);

    // Nucleus (Uranium - larger and more glowing)
    const nucleusGeometry = new THREE.SphereGeometry(2.5, 64, 64);
    const nucleusMaterial = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x3b82f6,
      emissiveIntensity: 1.2,
      metalness: 0.4,
      roughness: 0.1
    });
    this.nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    atomGroup.add(this.nucleus);

    // Uranium shells: [2, 8, 18, 32, 21, 9, 2] - simplified for visual
    const shells = [2, 8, 12, 16, 12, 8, 4]; // Simplified for better visual

    const electronMaterial = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 1.0,
      roughness: 0.2
    });

    shells.forEach((electronCount, shellIndex) => {
      const radius = 4 + shellIndex * 1.8;
      const group = new THREE.Group();

      // Orbit circle
      const orbitGeometry = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x1e293b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      group.add(orbit);

      const electronsOnThisShell = Math.min(electronCount, 16);
      for (let i = 0; i < electronsOnThisShell; i++) {
        const angle = (i / electronsOnThisShell) * Math.PI * 2;
        const electronGeometry = new THREE.SphereGeometry(0.25, 24, 24);
        const electron = new THREE.Mesh(electronGeometry, electronMaterial);
        electron.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        group.add(electron);
      }

      group.rotation.x = 0.4 + shellIndex * 0.2;
      group.rotation.z = shellIndex * 0.15;
      atomGroup.add(group);
      this.electronGroups.push(group);
    });

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.atomGroup = atomGroup;
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (!this.scene || !this.camera || !this.renderer || !this.atomGroup) {
      return;
    }

    const elapsed = performance.now() / 1000;

    // Auto-rotate the entire atom on multiple axes
    this.atomGroup.rotation.y = elapsed * 0.3;
    this.atomGroup.rotation.x = Math.sin(elapsed * 0.15) * 0.4 + elapsed * 0.1;
    this.atomGroup.rotation.z = Math.cos(elapsed * 0.12) * 0.3;

    // Rotate electron shells independently on multiple axes
    this.electronGroups.forEach((group, index) => {
      group.rotation.y = elapsed * (0.6 + index * 0.2);
      group.rotation.x = elapsed * (0.3 + index * 0.1) + Math.sin(elapsed * 0.2 + index) * 0.2;
      group.rotation.z = elapsed * (0.2 + index * 0.08);
    });

    // Pulsing nucleus with more intensity
    if (this.nucleus) {
      const scale = 1 + Math.sin(elapsed * 2.5) * 0.08;
      this.nucleus.scale.set(scale, scale, scale);
    }

    this.renderer.render(this.scene, this.camera);
  };
}

