declare module 'three/examples/jsm/controls/OrbitControls' {
  import { PerspectiveCamera, EventDispatcher } from 'three';
  export class OrbitControls extends EventDispatcher {
    constructor(object: PerspectiveCamera, domElement?: HTMLElement);
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    update(): void;
  }
  export default OrbitControls;
}


