# Design Document: 3D Simulation Upgrade

## Overview

This design describes the architecture for upgrading the acid-base titration simulation from a 2D canvas-based interface to a fully interactive 3D laboratory environment using Three.js. The system will maintain all existing database synchronization functionality while providing a realistic, physics-based simulation experience.

The design follows a service-oriented architecture where the 3D rendering logic is encapsulated in a dedicated component, state management is handled by a shared service, and chemistry calculations are performed by a separate calculation service. This separation ensures maintainability, testability, and seamless integration with the existing Angular application infrastructure.

### Key Design Decisions

1. **Three.js for 3D Rendering**: Three.js provides a mature, well-documented WebGL abstraction with excellent performance characteristics and a rich ecosystem of examples and extensions.

2. **Service-Based State Management**: A dedicated `Simulation3DStateService` will manage all simulation state, enabling clean separation between rendering logic and business logic.

3. **Object Pooling for Droplets**: To maintain 60 FPS with multiple simultaneous droplets, we'll use object pooling rather than creating/destroying objects continuously.

4. **Shader-Based Liquid Surface**: A custom shader will handle color mixing and ripple effects efficiently on the GPU.

5. **Preservation of Existing DB Sync**: The current `saveSimulationResults()`, `HistoryService`, and `ExperimentService` integration will remain completely unchanged.

## Architecture

### Component Structure

```
SimulationsPageComponent (existing)
├── Simulation3DComponent (new)
│   ├── Three.js Scene Management
│   ├── Camera & Lighting Setup
│   ├── Equipment Rendering (Beaker, Buret, Stirrer)
│   ├── Droplet System (Object Pool)
│   └── Animation Loop
├── TitrationChartComponent (new)
│   └── Chart.js Integration
└── Existing DB Sync Logic (preserved)
    ├── saveSimulationResults()
    ├── HistoryService.autoSaveResult()
    └── ExperimentService integration
```

### Service Architecture

```
Simulation3DStateService (new)
├── State Management
│   ├── pH: number
│   ├── volumeAdded: number
│   ├── isDripping: boolean
│   ├── dropRate: number (1-20 drops/sec)
│   ├── indicatorType: 'universal' | 'phenolphthalein' | 'methyl-orange'
│   ├── stirrerEnabled: boolean
│   ├── stirrerSpeed: number
│   └── parameters: { C_acid, V_acid, C_base, temperature }
├── Observable Streams
│   ├── state$: Observable<SimulationState>
│   ├── dropletAdded$: Subject<Droplet>
│   └── equivalenceReached$: Subject<void>
└── Methods
    ├── startDripping()
    ├── stopDripping()
    ├── addDroplet()
    ├── reset()
    └── updateParameters()

ChemistryCalculationService (new)
├── calculatePH(molesAcid, molesBase, totalVolume, temperature): number
├── calculateColor(pH, indicator): Color
├── detectEquivalencePoint(phHistory): number | null
└── calculateDropletVolume(dropRate): number
```

### Data Flow

1. **User Interaction** → UI Controls (button press, slider change)
2. **UI Controls** → `Simulation3DStateService` (state update)
3. **State Service** → `ChemistryCalculationService` (pH calculation)
4. **State Service** → `Simulation3DComponent` (render update via Observable)
5. **State Service** → `TitrationChartComponent` (chart update via Observable)
6. **Simulation Complete** → `SimulationsPageComponent.saveSimulationResults()` (DB sync)

## Components and Interfaces

### Simulation3DComponent

**Responsibilities:**
- Initialize and manage Three.js scene, camera, renderer
- Render laboratory equipment (beaker, buret, stirrer)
- Manage droplet object pool
- Handle animation loop and frame updates
- Apply color changes to liquid surface based on pH
- Render ripple effects on liquid surface

**Key Methods:**

```typescript
class Simulation3DComponent implements OnInit, OnDestroy {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private dropletPool: DropletPool;
  private liquidSurface: LiquidSurface;
  private beaker: THREE.Mesh;
  private buret: Buret;
  
  ngOnInit(): void;
  ngOnDestroy(): void;
  
  private initThreeJS(): void;
  private createScene(): void;
  private createBeaker(): THREE.Mesh;
  private createBuret(): Buret;
  private createStirrer(): THREE.Mesh;
  private setupLighting(): void;
  private setupCamera(): void;
  private animate(): void;
  private onWindowResize(): void;
  private updateDroplets(deltaTime: number): void;
  private updateLiquidColor(color: THREE.Color): void;
  private triggerRipple(position: THREE.Vector3): void;
}
```

**Three.js Scene Setup:**

```typescript
// Scene hierarchy
Scene
├── AmbientLight (intensity: 0.6)
├── DirectionalLight (position: [5, 10, 5], intensity: 0.8)
├── Beaker (CylinderGeometry, transparent material)
│   └── LiquidSurface (PlaneGeometry with custom shader)
├── Buret (CylinderGeometry + graduated markings)
│   └── LiquidColumn (CylinderGeometry, dynamic height)
├── Stirrer (optional, BoxGeometry + rotating disc)
└── DropletPool (InstancedMesh, max 50 instances)
```

### Simulation3DStateService

**Responsibilities:**
- Maintain current simulation state
- Emit state changes via Observables
- Coordinate between chemistry calculations and rendering
- Manage dripping timer
- Track titration history for curve plotting

**Interface:**

```typescript
interface SimulationState {
  // Chemistry state
  pH: number;
  volumeAdded: number; // mL
  molesAcidRemaining: number;
  molesBaseAdded: number;
  totalVolume: number;
  
  // Visual state
  currentColor: { r: number; g: number; b: number };
  mixingProgress: number; // 0-1, how well mixed
  
  // Control state
  isDripping: boolean;
  dropRate: number; // drops per second
  indicatorType: 'universal' | 'phenolphthalein' | 'methyl-orange';
  stirrerEnabled: boolean;
  stirrerSpeed: number; // RPM
  
  // Parameters
  parameters: {
    C_acid: number; // mol/L
    V_acid: number; // mL
    C_base: number; // mol/L
    temperature: number; // Celsius
  };
  
  // History
  titrationPoints: Array<{ volume: number; pH: number }>;
  equivalencePoint: { volume: number; pH: number } | null;
  
  // Timing
  startTime: number;
  currentTime: number;
  isComplete: boolean;
}

interface Droplet {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  volume: number; // mL
  active: boolean;
}
```

**Key Methods:**

```typescript
class Simulation3DStateService {
  private stateSubject = new BehaviorSubject<SimulationState>(initialState);
  public state$ = this.stateSubject.asObservable();
  
  private dropletSubject = new Subject<Droplet>();
  public dropletAdded$ = this.dropletSubject.asObservable();
  
  private drippingTimer: any;
  
  startDripping(): void {
    // Start interval timer based on dropRate
    // Emit droplet events at configured rate
  }
  
  stopDripping(): void {
    // Clear interval timer
  }
  
  addDroplet(): void {
    // Calculate droplet volume
    // Update chemistry state
    // Emit droplet event
    // Check for equivalence point
  }
  
  updateParameters(params: Partial<SimulationState['parameters']>): void {
    // Update parameters
    // Reset simulation state
  }
  
  reset(): void {
    // Reset to initial state
  }
  
  private checkEquivalencePoint(): void {
    // Analyze pH history for inflection point
  }
}
```

### ChemistryCalculationService

**Responsibilities:**
- Perform accurate pH calculations for strong acid-base titrations
- Map pH values to colors based on indicator type
- Detect equivalence point from pH curve
- Apply temperature corrections

**Key Methods:**

```typescript
class ChemistryCalculationService {
  /**
   * Calculate pH for strong acid + strong base titration
   * Uses excess moles method
   */
  calculatePH(
    molesAcid: number,
    molesBase: number,
    totalVolume: number,
    temperature: number = 25
  ): number {
    const excessMoles = molesAcid - molesBase;
    const Kw = this.getKw(temperature);
    
    if (Math.abs(excessMoles) < 1e-10) {
      // At equivalence point
      return 7.0;
    } else if (excessMoles > 0) {
      // Excess acid
      const [H+] = excessMoles / totalVolume;
      return -Math.log10([H+]);
    } else {
      // Excess base
      const [OH-] = -excessMoles / totalVolume;
      const [H+] = Kw / [OH-];
      return -Math.log10([H+]);
    }
  }
  
  /**
   * Get water ionization constant at given temperature
   */
  private getKw(temperature: number): number {
    // Kw varies with temperature
    // At 25°C: Kw = 1.0 × 10^-14
    // Use empirical formula for temperature correction
    const T = temperature + 273.15; // Convert to Kelvin
    const logKw = -4470.99 / T + 6.0875 - 0.01706 * T;
    return Math.pow(10, logKw);
  }
  
  /**
   * Calculate color based on pH and indicator
   */
  calculateColor(pH: number, indicator: string): { r: number; g: number; b: number } {
    switch (indicator) {
      case 'universal':
        return this.universalIndicatorColor(pH);
      case 'phenolphthalein':
        return this.phenolphthaleinColor(pH);
      case 'methyl-orange':
        return this.methylOrangeColor(pH);
      default:
        return { r: 0, g: 0, b: 255 }; // Default blue
    }
  }
  
  private universalIndicatorColor(pH: number): { r: number; g: number; b: number } {
    // pH 1-3: Red
    // pH 4-6: Orange/Yellow
    // pH 7: Green
    // pH 8-10: Blue
    // pH 11-14: Purple
    // Use smooth interpolation between color stops
  }
  
  private phenolphthaleinColor(pH: number): { r: number; g: number; b: number } {
    // pH < 8.2: Colorless (255, 255, 255)
    // pH 8.2-10.0: Gradient to pink
    // pH > 10.0: Pink (255, 0, 128)
  }
  
  private methylOrangeColor(pH: number): { r: number; g: number; b: number } {
    // pH < 3.1: Red (255, 0, 0)
    // pH 3.1-4.4: Gradient to yellow
    // pH > 4.4: Yellow (255, 255, 0)
  }
  
  /**
   * Detect equivalence point from pH history
   * Returns volume at maximum slope (inflection point)
   */
  detectEquivalencePoint(
    titrationPoints: Array<{ volume: number; pH: number }>
  ): { volume: number; pH: number } | null {
    if (titrationPoints.length < 5) return null;
    
    // Calculate first derivative (slope) at each point
    const slopes: number[] = [];
    for (let i = 1; i < titrationPoints.length; i++) {
      const dPH = titrationPoints[i].pH - titrationPoints[i - 1].pH;
      const dV = titrationPoints[i].volume - titrationPoints[i - 1].volume;
      slopes.push(Math.abs(dPH / dV));
    }
    
    // Find maximum slope
    const maxSlopeIndex = slopes.indexOf(Math.max(...slopes));
    return titrationPoints[maxSlopeIndex + 1];
  }
  
  /**
   * Calculate volume of a single droplet based on drop rate
   * Typical droplet: 0.05 mL
   */
  calculateDropletVolume(dropRate: number): number {
    // Standard droplet volume
    return 0.05; // mL
  }
}
```

### TitrationChartComponent

**Responsibilities:**
- Render real-time titration curve using Chart.js
- Display equivalence point marker
- Show current position indicator
- Update chart as new data points arrive

**Interface:**

```typescript
class TitrationChartComponent implements OnInit, OnDestroy {
  @Input() titrationPoints: Array<{ volume: number; pH: number }>;
  @Input() equivalencePoint: { volume: number; pH: number } | null;
  @Input() currentPoint: { volume: number; pH: number };
  
  private chart: Chart;
  
  ngOnInit(): void;
  ngOnDestroy(): void;
  
  private initChart(): void;
  updateChart(newPoint: { volume: number; pH: number }): void;
  private markEquivalencePoint(): void;
}
```

### DropletPool

**Responsibilities:**
- Manage a pool of reusable droplet objects
- Optimize performance by avoiding object creation/destruction
- Handle droplet physics and collision detection

**Implementation:**

```typescript
class DropletPool {
  private pool: Droplet[] = [];
  private activeDroplets: Set<number> = new Set();
  private instancedMesh: THREE.InstancedMesh;
  private readonly maxDroplets = 50;
  private readonly gravity = -9.8; // m/s^2
  
  constructor(scene: THREE.Scene) {
    // Create InstancedMesh for efficient rendering
    const geometry = new THREE.SphereGeometry(0.01, 8, 8);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x88ccff,
      transparent: true,
      opacity: 0.8
    });
    this.instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      this.maxDroplets
    );
    scene.add(this.instancedMesh);
    
    // Initialize pool
    for (let i = 0; i < this.maxDroplets; i++) {
      this.pool.push({
        id: i,
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(0, 0, 0),
        volume: 0.05,
        active: false
      });
    }
  }
  
  spawnDroplet(startPosition: THREE.Vector3, volume: number): Droplet | null {
    // Find inactive droplet
    const droplet = this.pool.find(d => !d.active);
    if (!droplet) return null;
    
    droplet.active = true;
    droplet.position.copy(startPosition);
    droplet.velocity.set(0, 0, 0);
    droplet.volume = volume;
    this.activeDroplets.add(droplet.id);
    
    return droplet;
  }
  
  update(deltaTime: number, liquidSurfaceY: number): Droplet[] {
    const collided: Droplet[] = [];
    
    this.activeDroplets.forEach(id => {
      const droplet = this.pool[id];
      
      // Apply gravity
      droplet.velocity.y += this.gravity * deltaTime;
      
      // Update position
      droplet.position.x += droplet.velocity.x * deltaTime;
      droplet.position.y += droplet.velocity.y * deltaTime;
      droplet.position.z += droplet.velocity.z * deltaTime;
      
      // Check collision with liquid surface
      if (droplet.position.y <= liquidSurfaceY) {
        collided.push(droplet);
        droplet.active = false;
        this.activeDroplets.delete(id);
      }
      
      // Update instance matrix
      const matrix = new THREE.Matrix4();
      matrix.setPosition(droplet.position);
      this.instancedMesh.setMatrixAt(id, matrix);
    });
    
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    return collided;
  }
  
  clear(): void {
    this.activeDroplets.forEach(id => {
      this.pool[id].active = false;
    });
    this.activeDroplets.clear();
  }
}
```

### LiquidSurface

**Responsibilities:**
- Render liquid surface with dynamic color
- Apply ripple effects at droplet impact points
- Simulate color mixing propagation
- Handle stirrer acceleration of mixing

**Implementation:**

```typescript
class LiquidSurface {
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private ripples: Array<{ center: THREE.Vector2; time: number; strength: number }> = [];
  private targetColor: THREE.Color;
  private currentColor: THREE.Color;
  private mixingSpeed: number = 0.1; // Base mixing speed
  
  constructor(radius: number, position: THREE.Vector3) {
    const geometry = new THREE.CircleGeometry(radius, 64);
    
    // Custom shader for color mixing and ripples
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        targetColor: { value: new THREE.Color(0xff0000) },
        currentColor: { value: new THREE.Color(0xff0000) },
        mixingProgress: { value: 0.0 },
        ripples: { value: [] },
        time: { value: 0.0 }
      },
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      transparent: true,
      side: THREE.DoubleSide
    });
    
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2; // Horizontal
    this.mesh.position.copy(position);
    
    this.currentColor = new THREE.Color(0xff0000);
    this.targetColor = new THREE.Color(0xff0000);
  }
  
  setTargetColor(color: THREE.Color): void {
    this.targetColor.copy(color);
  }
  
  setMixingSpeed(speed: number): void {
    this.mixingSpeed = speed;
  }
  
  addRipple(impactPoint: THREE.Vector2): void {
    this.ripples.push({
      center: impactPoint.clone(),
      time: 0,
      strength: 1.0
    });
    
    // Limit ripple count
    if (this.ripples.length > 10) {
      this.ripples.shift();
    }
  }
  
  update(deltaTime: number): void {
    // Update color mixing
    this.currentColor.lerp(this.targetColor, this.mixingSpeed * deltaTime);
    this.material.uniforms.currentColor.value.copy(this.currentColor);
    
    // Update ripples
    this.ripples = this.ripples.filter(ripple => {
      ripple.time += deltaTime;
      ripple.strength = Math.max(0, 1.0 - ripple.time / 2.0);
      return ripple.strength > 0;
    });
    
    this.material.uniforms.ripples.value = this.ripples;
    this.material.uniforms.time.value += deltaTime;
  }
  
  private getVertexShader(): string {
    return `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }
  
  private getFragmentShader(): string {
    return `
      uniform vec3 targetColor;
      uniform vec3 currentColor;
      uniform float mixingProgress;
      uniform float time;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vec3 color = currentColor;
        
        // Add subtle shimmer effect
        float shimmer = sin(vUv.x * 10.0 + time) * 0.05;
        color += shimmer;
        
        gl_FragColor = vec4(color, 0.9);
      }
    `;
  }
  
  getMesh(): THREE.Mesh {
    return this.mesh;
  }
}
```

### Buret

**Responsibilities:**
- Render buret with graduated markings
- Display liquid column with dynamic height
- Update liquid level as droplets are dispensed

**Implementation:**

```typescript
class Buret {
  private group: THREE.Group;
  private liquidColumn: THREE.Mesh;
  private maxVolume: number = 50; // mL
  private currentVolume: number = 50; // mL
  private height: number = 0.5; // meters
  
  constructor() {
    this.group = new THREE.Group();
    
    // Create glass tube
    const tubeGeometry = new THREE.CylinderGeometry(0.015, 0.015, this.height, 32, 1, true);
    const tubeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    this.group.add(tube);
    
    // Create liquid column
    const liquidGeometry = new THREE.CylinderGeometry(0.014, 0.014, this.height, 32);
    const liquidMaterial = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.7
    });
    this.liquidColumn = new THREE.Mesh(liquidGeometry, liquidMaterial);
    this.group.add(this.liquidColumn);
    
    // Add graduated markings (simplified)
    this.addGraduations();
    
    this.updateLiquidLevel();
  }
  
  private addGraduations(): void {
    // Add text sprites or line markings for volume graduations
    // Simplified for brevity
  }
  
  removeVolume(volume: number): void {
    this.currentVolume = Math.max(0, this.currentVolume - volume);
    this.updateLiquidLevel();
  }
  
  refill(): void {
    this.currentVolume = this.maxVolume;
    this.updateLiquidLevel();
  }
  
  private updateLiquidLevel(): void {
    const fillRatio = this.currentVolume / this.maxVolume;
    const newHeight = this.height * fillRatio;
    
    this.liquidColumn.scale.y = fillRatio;
    this.liquidColumn.position.y = -(this.height - newHeight) / 2;
  }
  
  getGroup(): THREE.Group {
    return this.group;
  }
  
  getDropletSpawnPosition(): THREE.Vector3 {
    // Return position at bottom of buret
    return new THREE.Vector3(0, -this.height / 2, 0);
  }
}
```

## Data Models

### SimulationState (Extended)

```typescript
interface SimulationState {
  // Chemistry state
  pH: number;
  volumeAdded: number; // mL
  molesAcidInitial: number;
  molesAcidRemaining: number;
  molesBaseAdded: number;
  totalVolume: number; // mL
  
  // Visual state
  currentColor: { r: number; g: number; b: number };
  mixingProgress: number; // 0-1
  
  // Control state
  isDripping: boolean;
  dropRate: number; // drops/sec (1-20)
  indicatorType: 'universal' | 'phenolphthalein' | 'methyl-orange';
  stirrerEnabled: boolean;
  stirrerSpeed: number; // RPM (0-300)
  
  // Parameters
  parameters: {
    C_acid: number; // mol/L
    V_acid: number; // mL
    C_base: number; // mol/L
    temperature: number; // Celsius
  };
  
  // History for charting
  titrationPoints: Array<{ volume: number; pH: number; timestamp: number }>;
  equivalencePoint: { volume: number; pH: number } | null;
  
  // Timing
  startTime: number; // timestamp
  currentTime: number; // elapsed seconds
  isComplete: boolean;
  
  // Results (for DB sync)
  results: {
    ph: number;
    color: string;
    efficiency: number; // How close to theoretical equivalence point
    volumeAtEquivalence: number;
    duration: number;
  };
}
```

### Droplet

```typescript
interface Droplet {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  volume: number; // mL
  active: boolean;
  spawnTime: number;
}
```

### RippleEffect

```typescript
interface RippleEffect {
  center: THREE.Vector2; // Impact point in 2D surface coordinates
  time: number; // Time since creation
  strength: number; // 0-1, fades over time
  radius: number; // Current radius of ripple
}
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several redundancies were identified:

- **Stirrer state properties (3.2, 3.3)** can be combined into one property about mixing speed based on stirrer state
- **Color mapping properties (3.5, 3.6, 3.7)** are all instances of the general property 3.4 (color calculation based on pH and indicator)
- **Window resize properties (1.6, 10.1, 10.2, 10.4)** can be consolidated into a comprehensive responsive behavior property
- **DB sync properties (8.2, 8.3, 8.5, 8.6, 8.7)** are all aspects of the general DB sync preservation requirement
- **UI control existence checks (9.1-9.7, 11.1-11.5)** are examples rather than properties and don't need separate property tests

The following properties represent the unique, testable behaviors that provide comprehensive validation coverage:

### Core Properties

**Property 1: Droplet Volume Conservation**

*For any* sequence of droplet additions, the sum of all droplet volumes SHALL equal the decrease in buret liquid level plus the increase in beaker total volume.

**Validates: Requirements 2.3, 4.2**

**Property 2: Gravity Physics Accuracy**

*For any* droplet with initial position and zero initial velocity, after time t, the droplet's y-position SHALL equal initial_y + 0.5 * gravity * t^2 and velocity SHALL equal gravity * t (within numerical tolerance).

**Validates: Requirements 2.5**

**Property 3: Droplet Collision Detection**

*For any* droplet whose y-position reaches or falls below the liquid surface y-coordinate, the droplet SHALL be marked as inactive and a ripple effect SHALL be created at the impact point.

**Validates: Requirements 2.6, 3.1**

**Property 4: Drop Rate Timing**

*For any* configured drop rate R (1-20 drops/sec), when dripping is active for time T seconds, the number of droplets generated SHALL be within ±10% of R * T.

**Validates: Requirements 2.1, 2.4**

**Property 5: Dripping State Transition**

*For any* simulation state, when the drip button is released, no new droplets SHALL be generated in subsequent frames until the button is pressed again.

**Validates: Requirements 2.2**

**Property 6: Droplet Pool Capacity Limit**

*For any* sequence of droplet spawn requests, the number of simultaneously active droplets SHALL never exceed 50.

**Validates: Requirements 6.2, 6.3**

**Property 7: pH Calculation Correctness (Excess Acid)**

*For any* strong acid-base titration where moles_acid > moles_base, the calculated pH SHALL equal -log10((moles_acid - moles_base) / total_volume) within 0.01 pH units.

**Validates: Requirements 4.4, 4.5**

**Property 8: pH Calculation Correctness (Excess Base)**

*For any* strong acid-base titration where moles_base > moles_acid, the calculated pH SHALL equal 14 + log10((moles_base - moles_acid) / total_volume) within 0.01 pH units (using Kw at given temperature).

**Validates: Requirements 4.4, 4.5, 4.7**

**Property 9: pH Calculation at Equivalence**

*For any* strong acid-base titration where |moles_acid - moles_base| < 1e-10, the calculated pH SHALL be 7.0 ± 0.1 at 25°C.

**Validates: Requirements 4.4**

**Property 10: Moles Calculation from Droplet**

*For any* base concentration C_base (mol/L) and droplet volume V_drop (mL), the moles of base added SHALL equal C_base * V_drop / 1000 within numerical tolerance.

**Validates: Requirements 4.3**

**Property 11: Color Mapping Determinism**

*For any* pH value and indicator type, calling calculateColor(pH, indicator) multiple times SHALL return the same RGB color values.

**Validates: Requirements 3.4**

**Property 12: Universal Indicator Color Range**

*For any* pH value between 1 and 14 with Universal indicator, the calculated color SHALL be within the red-green-purple gradient spectrum with red at pH 1, green at pH 7, and purple at pH 14.

**Validates: Requirements 3.5**

**Property 13: Phenolphthalein Color Transition**

*For any* pH value with Phenolphthalein indicator, the color SHALL be colorless (white) for pH < 8.2, pink for pH > 10.0, and a gradient between for 8.2 ≤ pH ≤ 10.0.

**Validates: Requirements 3.6**

**Property 14: Methyl Orange Color Transition**

*For any* pH value with Methyl Orange indicator, the color SHALL be red for pH < 3.1, yellow for pH > 4.4, and a gradient between for 3.1 ≤ pH ≤ 4.4.

**Validates: Requirements 3.7**

**Property 15: Mixing Speed Based on Stirrer**

*For any* simulation state, when stirrer is enabled, the mixing speed SHALL be greater than when stirrer is disabled.

**Validates: Requirements 3.2, 3.3**

**Property 16: Titration Curve Data Accumulation**

*For any* droplet addition that changes pH, a new data point with (volume_added, pH) SHALL be appended to the titration curve data array.

**Validates: Requirements 5.2**

**Property 17: Equivalence Point Detection**

*For any* titration curve with at least 5 data points, the detected equivalence point SHALL be the point with maximum |dPH/dV| (maximum slope).

**Validates: Requirements 5.3, 5.4**

**Property 18: Responsive Canvas Resize**

*For any* window resize event, the Three.js renderer dimensions SHALL be updated to match the canvas container dimensions, and the camera aspect ratio SHALL be updated accordingly.

**Validates: Requirements 1.6, 10.1, 10.2, 10.4**

**Property 19: Parameter Change Triggers Reset**

*For any* change to initial parameters (C_acid, V_acid, C_base, temperature), the simulation state SHALL be reset to initial conditions with pH recalculated and volume_added set to 0.

**Validates: Requirements 7.4, 9.6**

**Property 20: Three.js Resource Cleanup**

*For any* Simulation3DComponent instance, when ngOnDestroy is called, all Three.js geometries, materials, and the renderer SHALL have their dispose() methods invoked.

**Validates: Requirements 7.6**

**Property 21: SSR Platform Check**

*For any* browser-only library initialization (Three.js, OrbitControls), the code SHALL only execute when isPlatformBrowser returns true.

**Validates: Requirements 7.2, 11.6**

**Property 22: DB Sync Preservation**

*For any* simulation completion event (equivalence point reached or user stops), the saveSimulationResults() method SHALL be invoked with a SimulationCompletionEvent containing all required fields (experimentId, userId, parameters, results, duration, timestamp, efficiency).

**Validates: Requirements 8.1, 8.2, 8.3, 8.5**

**Property 23: Authentication Check Before Save**

*For any* attempt to save simulation results, the save operation SHALL only proceed if isAuthenticated is true and userId is defined.

**Validates: Requirements 8.6**

**Property 24: Stirrer Conditional Rendering**

*For any* simulation state, the stirrer mesh SHALL be present in the scene if and only if stirrerEnabled is true.

**Validates: Requirements 1.3**

**Property 25: Current State Display Updates**

*For any* change to pH, volume_added, or equivalence point status, the corresponding text overlay elements SHALL be updated to display the new values within one render frame.

**Validates: Requirements 9.8**

### Edge Case Properties

**Property 26: Empty Buret Handling**

*For any* simulation state where buret current volume is 0, attempting to generate a new droplet SHALL fail gracefully without crashing or generating invalid droplets.

**Validates: Requirements 2.3 (edge case)**

**Property 27: Maximum Volume Handling**

*For any* simulation where total volume exceeds the beaker capacity, the system SHALL either prevent further droplet addition or handle overflow gracefully.

**Validates: Requirements 4.2 (edge case)**

**Property 28: Temperature Extremes**

*For any* temperature value outside the range [0°C, 100°C], the system SHALL either clamp the value to valid range or display an appropriate error message.

**Validates: Requirements 4.7 (edge case)**

## Error Handling

### Three.js Initialization Errors

**Strategy**: Wrap Three.js initialization in try-catch blocks and provide fallback UI.

```typescript
private initThreeJS(): void {
  if (!isPlatformBrowser(this.platformId)) {
    console.warn('Three.js initialization skipped on server');
    return;
  }
  
  try {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(/* ... */);
    this.renderer = new THREE.WebGLRenderer(/* ... */);
    // ... rest of initialization
  } catch (error) {
    console.error('Failed to initialize Three.js:', error);
    this.showFallbackUI();
    this.notifyUser('3D rendering unavailable. Please check WebGL support.');
  }
}
```

### WebGL Not Supported

**Strategy**: Detect WebGL support before initialization and show informative message.

```typescript
private checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}
```

### Chemistry Calculation Errors

**Strategy**: Validate inputs before calculations and handle edge cases (division by zero, negative concentrations).

```typescript
calculatePH(molesAcid: number, molesBase: number, totalVolume: number, temperature: number): number {
  // Validate inputs
  if (molesAcid < 0 || molesBase < 0) {
    throw new Error('Moles cannot be negative');
  }
  
  if (totalVolume <= 0) {
    throw new Error('Total volume must be positive');
  }
  
  if (temperature < 0 || temperature > 100) {
    console.warn('Temperature outside normal range, clamping');
    temperature = Math.max(0, Math.min(100, temperature));
  }
  
  // Perform calculation with error handling
  try {
    const excessMoles = molesAcid - molesBase;
    // ... calculation logic
  } catch (error) {
    console.error('pH calculation error:', error);
    return 7.0; // Default to neutral pH
  }
}
```

### Database Sync Failures

**Strategy**: Preserve existing retry mechanism in HistoryService. No changes needed.

The existing `HistoryService.autoSaveResult()` already handles:
- Network failures with automatic retry
- Exponential backoff
- Retry queue persistence to localStorage
- User notifications for save status

### Resource Cleanup Failures

**Strategy**: Ensure cleanup is defensive and doesn't throw errors.

```typescript
ngOnDestroy(): void {
  try {
    // Stop animation loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Dispose Three.js resources
    this.dropletPool?.clear();
    this.liquidSurface?.dispose();
    this.beaker?.geometry?.dispose();
    (this.beaker?.material as THREE.Material)?.dispose();
    this.buret?.dispose();
    this.renderer?.dispose();
    this.controls?.dispose();
    
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);
  } catch (error) {
    console.error('Error during cleanup:', error);
    // Continue cleanup despite errors
  }
}
```

### Droplet Pool Exhaustion

**Strategy**: Implement graceful degradation when pool is full.

```typescript
spawnDroplet(startPosition: THREE.Vector3, volume: number): Droplet | null {
  const droplet = this.pool.find(d => !d.active);
  
  if (!droplet) {
    console.warn('Droplet pool exhausted, skipping droplet');
    // Still update chemistry state even if visual droplet can't be shown
    this.stateService.addDropletWithoutVisual(volume);
    return null;
  }
  
  // ... normal droplet spawn logic
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of pH calculations at known points
- UI component rendering and event handling
- Service initialization and dependency injection
- Integration between Angular services and Three.js
- Edge cases like empty buret, extreme temperatures
- DB sync method invocation and data structure

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs (pH calculations, color mappings)
- Physics simulation accuracy across random initial conditions
- State consistency across random sequences of user actions
- Resource management across random component lifecycles

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript property-based testing

**Configuration**: Each property test runs minimum 100 iterations

**Tagging**: Each test references its design property:
```typescript
// Feature: simulation-3d-upgrade, Property 7: pH Calculation Correctness (Excess Acid)
it('should calculate pH correctly for excess acid across all valid inputs', () => {
  fc.assert(
    fc.property(
      fc.double({ min: 0.001, max: 10 }), // molesAcid
      fc.double({ min: 0.0001, max: 9.999 }), // molesBase (less than acid)
      fc.double({ min: 0.1, max: 1000 }), // totalVolume
      (molesAcid, molesBase, totalVolume) => {
        fc.pre(molesAcid > molesBase); // Ensure excess acid
        
        const pH = service.calculatePH(molesAcid, molesBase, totalVolume, 25);
        const expectedPH = -Math.log10((molesAcid - molesBase) / totalVolume);
        
        expect(Math.abs(pH - expectedPH)).toBeLessThan(0.01);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Test Examples

**Chemistry Calculations**:
```typescript
describe('ChemistryCalculationService', () => {
  it('should calculate pH 7 at equivalence point', () => {
    const pH = service.calculatePH(0.01, 0.01, 100, 25);
    expect(pH).toBeCloseTo(7.0, 1);
  });
  
  it('should calculate pH 1 for 0.1M HCl', () => {
    const pH = service.calculatePH(0.01, 0, 100, 25);
    expect(pH).toBeCloseTo(1.0, 1);
  });
  
  it('should handle empty buret gracefully', () => {
    buret.currentVolume = 0;
    const droplet = buret.spawnDroplet();
    expect(droplet).toBeNull();
  });
});
```

**Three.js Integration**:
```typescript
describe('Simulation3DComponent', () => {
  it('should initialize scene with beaker and buret', () => {
    component.ngOnInit();
    expect(component['scene'].children.length).toBeGreaterThan(0);
    expect(component['beaker']).toBeDefined();
    expect(component['buret']).toBeDefined();
  });
  
  it('should skip Three.js init on server', () => {
    // Mock isPlatformBrowser to return false
    component.ngOnInit();
    expect(component['renderer']).toBeUndefined();
  });
  
  it('should clean up resources on destroy', () => {
    component.ngOnInit();
    const disposeSpy = jest.spyOn(component['renderer'], 'dispose');
    component.ngOnDestroy();
    expect(disposeSpy).toHaveBeenCalled();
  });
});
```

**DB Sync Preservation**:
```typescript
describe('SimulationsPageComponent DB Sync', () => {
  it('should call saveSimulationResults on completion', () => {
    const saveSpy = jest.spyOn(component as any, 'saveSimulationResults');
    component.simulationState.set({ ...state, isComplete: true });
    expect(saveSpy).toHaveBeenCalled();
  });
  
  it('should pass correct data structure to HistoryService', async () => {
    const autoSaveSpy = jest.spyOn(historyService, 'autoSaveResult');
    await component['saveSimulationResults']();
    
    expect(autoSaveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        experimentId: expect.any(String),
        userId: expect.any(Number),
        parameters: expect.any(Object),
        results: expect.any(Object),
        duration: expect.any(Number),
        timestamp: expect.any(Date),
        efficiency: expect.any(Number)
      })
    );
  });
  
  it('should not save when user is not authenticated', async () => {
    component['isAuthenticated'].set(false);
    const autoSaveSpy = jest.spyOn(historyService, 'autoSaveResult');
    await component['saveSimulationResults']();
    expect(autoSaveSpy).not.toHaveBeenCalled();
  });
});
```

### Integration Testing

**End-to-End Simulation Flow**:
```typescript
describe('3D Simulation Integration', () => {
  it('should complete full titration workflow', async () => {
    // 1. Initialize simulation
    component.ngOnInit();
    stateService.updateParameters({ C_acid: 0.1, V_acid: 100, C_base: 0.1 });
    
    // 2. Start dripping
    stateService.startDripping();
    
    // 3. Wait for equivalence point
    await waitFor(() => stateService.state$.pipe(
      map(s => s.equivalencePoint !== null),
      first()
    ));
    
    // 4. Verify results
    const finalState = stateService.getCurrentState();
    expect(finalState.equivalencePoint).toBeDefined();
    expect(finalState.equivalencePoint.pH).toBeCloseTo(7.0, 1);
    expect(finalState.equivalencePoint.volume).toBeCloseTo(100, 5);
    
    // 5. Verify DB sync was triggered
    expect(historyService.autoSaveResult).toHaveBeenCalled();
  });
});
```

### Performance Testing

While automated performance tests are challenging, manual performance validation should include:

1. **Frame Rate Monitoring**: Use Chrome DevTools Performance tab to verify 30+ FPS with 20 simultaneous droplets
2. **Memory Profiling**: Verify no memory leaks during extended simulation runs
3. **Droplet Pool Efficiency**: Verify object reuse is working (no continuous memory growth)
4. **Shader Performance**: Verify liquid surface shader doesn't cause frame drops

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage for services and components
- **Property Test Coverage**: All 28 correctness properties implemented as property tests
- **Integration Test Coverage**: All major user workflows (start, drip, complete, save)
- **Edge Case Coverage**: All identified edge cases (empty buret, extreme values, etc.)

## Implementation Notes

### Package Installation

```bash
npm install three @types/three
npm install chart.js
npm install --save-dev fast-check @types/fast-check
```

### Angular Configuration

Ensure `angular.json` includes Three.js in optimization exclusions for SSR:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "externalDependencies": ["three"]
          }
        }
      }
    }
  }
}
```

### Performance Optimization Checklist

- [ ] Use `InstancedMesh` for droplets (not individual meshes)
- [ ] Implement object pooling for droplets
- [ ] Use `MeshPhongMaterial` or `MeshStandardMaterial` (not `MeshLambertMaterial` for better performance)
- [ ] Disable shadows if not needed
- [ ] Use `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` to cap pixel ratio
- [ ] Implement frustum culling (Three.js does this automatically)
- [ ] Use `requestAnimationFrame` for animation loop
- [ ] Dispose of geometries and materials in `ngOnDestroy`

### Accessibility Considerations

- Provide text alternatives for visual pH changes
- Ensure keyboard navigation for all controls
- Add ARIA labels to buttons and sliders
- Provide screen reader announcements for equivalence point detection
- Ensure sufficient color contrast for UI elements
- Support keyboard shortcuts for common actions (Space to drip, R to reset)
