# Implementation Plan: 3D Simulation Upgrade

## Overview

This implementation plan converts the acid-base titration simulation from 2D canvas to 3D Three.js with realistic laboratory interactions. The implementation follows a service-oriented architecture with clear separation between rendering, state management, and chemistry calculations. All existing database synchronization functionality will be preserved without modification.

The implementation is structured to build incrementally, with early validation of core functionality through property-based tests. Each major component is developed independently and then integrated, with checkpoints to ensure stability before proceeding.

## Tasks

- [x] 1. Install dependencies and configure Angular for Three.js
  - Install three, @types/three, chart.js, fast-check packages
  - Configure angular.json to exclude Three.js from SSR optimization
  - Add isPlatformBrowser checks to app configuration
  - Verify SSR build completes without errors
  - _Requirements: 11.1, 11.2, 11.4, 11.5_

- [x] 2. Create ChemistryCalculationService with pH calculation logic
  - [x] 2.1 Implement core pH calculation methods
    - Create ChemistryCalculationService with calculatePH method
    - Implement excess acid calculation (pH = -log10([H+]))
    - Implement excess base calculation using Kw
    - Implement equivalence point detection (pH = 7)
    - Add temperature-dependent Kw calculation (getKw method)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_
  
  - [ ]* 2.2 Write property tests for pH calculations
    - **Property 7: pH Calculation Correctness (Excess Acid)**
    - **Validates: Requirements 4.4, 4.5**
  
  - [ ]* 2.3 Write property test for excess base pH calculation
    - **Property 8: pH Calculation Correctness (Excess Base)**
    - **Validates: Requirements 4.4, 4.5, 4.7**
  
  - [ ]* 2.4 Write property test for equivalence point pH
    - **Property 9: pH Calculation at Equivalence**
    - **Validates: Requirements 4.4**
  
  - [ ]* 2.5 Write property test for moles calculation
    - **Property 10: Moles Calculation from Droplet**
    - **Validates: Requirements 4.3**
  
  - [ ]* 2.6 Write unit tests for edge cases
    - Test negative moles handling
    - Test zero volume handling
    - Test temperature extremes (Property 28)
    - _Requirements: 4.7_

- [x] 3. Implement color calculation methods in ChemistryCalculationService
  - [x] 3.1 Create color mapping functions
    - Implement calculateColor(pH, indicator) method
    - Implement universalIndicatorColor with red-green-purple gradient
    - Implement phenolphthaleinColor with colorless-to-pink transition
    - Implement methylOrangeColor with red-to-yellow transition
    - Use smooth interpolation for gradient transitions
    - _Requirements: 3.4, 3.5, 3.6, 3.7_
  
  - [ ]* 3.2 Write property test for color determinism
    - **Property 11: Color Mapping Determinism**
    - **Validates: Requirements 3.4**
  
  - [ ]* 3.3 Write property tests for indicator color ranges
    - **Property 12: Universal Indicator Color Range**
    - **Property 13: Phenolphthalein Color Transition**
    - **Property 14: Methyl Orange Color Transition**
    - **Validates: Requirements 3.5, 3.6, 3.7**

- [x] 4. Create Simulation3DStateService for state management
  - [x] 4.1 Implement state service with observables
    - Create SimulationState interface with all required fields
    - Create Droplet interface
    - Implement BehaviorSubject for state management
    - Implement Subject for droplet events
    - Create startDripping() and stopDripping() methods with timer
    - Create addDroplet() method to update chemistry state
    - Create updateParameters() method with reset logic
    - Create reset() method
    - _Requirements: 7.3, 9.6_
  
  - [ ]* 4.2 Write property test for dripping state transitions
    - **Property 5: Dripping State Transition**
    - **Validates: Requirements 2.2**
  
  - [ ]* 4.3 Write property test for drop rate timing
    - **Property 4: Drop Rate Timing**
    - **Validates: Requirements 2.1, 2.4**
  
  - [ ]* 4.4 Write property test for parameter change reset
    - **Property 19: Parameter Change Triggers Reset**
    - **Validates: Requirements 7.4, 9.6**

- [x] 5. Implement equivalence point detection
  - [x] 5.1 Add equivalence point detection to state service
    - Implement checkEquivalencePoint() method
    - Calculate first derivative (slope) for each point
    - Find maximum slope to identify equivalence point
    - Emit equivalenceReached$ event when detected
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 5.2 Write property test for equivalence point detection
    - **Property 17: Equivalence Point Detection**
    - **Validates: Requirements 5.3, 5.4**
  
  - [ ]* 5.3 Write unit test for titration curve data accumulation
    - Test that each droplet adds a data point
    - Verify data point contains correct volume and pH
    - _Requirements: 5.2_

- [ ] 6. Checkpoint - Ensure chemistry and state services work correctly
  - Run all property tests for chemistry calculations
  - Run all property tests for state management
  - Verify state observables emit correctly
  - Ensure all tests pass, ask the user if questions arise

- [x] 7. Create DropletPool class for efficient droplet rendering
  - [x] 7.1 Implement droplet object pool
    - Create DropletPool class with InstancedMesh
    - Initialize pool with 50 droplet objects
    - Implement spawnDroplet() method to find inactive droplets
    - Implement update() method with gravity physics
    - Implement collision detection with liquid surface
    - Return collided droplets for ripple triggering
    - _Requirements: 2.5, 2.6, 6.1, 6.2, 6.3_
  
  - [ ]* 7.2 Write property test for gravity physics
    - **Property 2: Gravity Physics Accuracy**
    - **Validates: Requirements 2.5**
  
  - [ ]* 7.3 Write property test for collision detection
    - **Property 3: Droplet Collision Detection**
    - **Validates: Requirements 2.6, 3.1**
  
  - [ ]* 7.4 Write property test for pool capacity limit
    - **Property 6: Droplet Pool Capacity Limit**
    - **Validates: Requirements 6.2, 6.3**
  
  - [ ]* 7.5 Write unit test for empty pool handling
    - Test graceful degradation when pool is exhausted
    - Verify chemistry state updates even without visual droplet
    - _Requirements: 6.3_

- [x] 8. Create LiquidSurface class with shader-based rendering
  - [x] 8.1 Implement liquid surface with color mixing
    - Create LiquidSurface class with CircleGeometry
    - Implement custom ShaderMaterial with vertex and fragment shaders
    - Add setTargetColor() method
    - Add setMixingSpeed() method for stirrer effect
    - Implement addRipple() method for droplet impacts
    - Implement update() method for color lerping and ripple animation
    - _Requirements: 3.1, 3.2, 3.3, 6.4_
  
  - [ ]* 8.2 Write property test for mixing speed based on stirrer
    - **Property 15: Mixing Speed Based on Stirrer**
    - **Validates: Requirements 3.2, 3.3**
  
  - [ ]* 8.3 Write unit test for ripple effect creation
    - Test that addRipple creates ripple at correct position
    - Verify ripple fades over time
    - Test ripple limit (max 10 ripples)
    - _Requirements: 3.1_

- [x] 9. Create Buret class for base solution dispensing
  - [x] 9.1 Implement buret with liquid level
    - Create Buret class with CylinderGeometry for tube
    - Add transparent glass material
    - Create liquid column mesh with dynamic height
    - Implement removeVolume() method to decrease liquid level
    - Implement refill() method
    - Implement updateLiquidLevel() to scale liquid column
    - Add getDropletSpawnPosition() method
    - _Requirements: 1.2, 2.3_
  
  - [ ]* 9.2 Write property test for volume conservation
    - **Property 1: Droplet Volume Conservation**
    - **Validates: Requirements 2.3, 4.2**
  
  - [ ]* 9.3 Write unit test for empty buret handling
    - **Property 26: Empty Buret Handling**
    - Test that droplet generation fails gracefully when buret is empty
    - _Requirements: 2.3_

- [x] 10. Create Simulation3DComponent with Three.js scene
  - [x] 10.1 Implement component with scene initialization
    - Create Simulation3DComponent with canvas element
    - Add isPlatformBrowser check in ngOnInit
    - Initialize Three.js scene, camera, renderer in initThreeJS()
    - Set up OrbitControls for camera
    - Create ambient and directional lighting
    - Implement onWindowResize() handler
    - Add window resize event listener
    - _Requirements: 1.4, 1.6, 7.1, 7.2, 11.3_
  
  - [ ]* 10.2 Write property test for SSR platform check
    - **Property 21: SSR Platform Check**
    - **Validates: Requirements 7.2, 11.6**
  
  - [ ]* 10.3 Write property test for responsive canvas resize
    - **Property 18: Responsive Canvas Resize**
    - **Validates: Requirements 1.6, 10.1, 10.2, 10.4**
  
  - [ ]* 10.4 Write unit test for Three.js initialization
    - Test that scene, camera, renderer are created
    - Test that initialization is skipped on server
    - Verify WebGL support check
    - _Requirements: 7.2_

- [x] 11. Add laboratory equipment to 3D scene
  - [x] 11.1 Create beaker, buret, and stirrer meshes
    - Implement createBeaker() method with CylinderGeometry
    - Add transparent material for glass effect
    - Position beaker at scene center
    - Instantiate Buret class and add to scene
    - Position buret above beaker
    - Implement createStirrer() method (optional, conditional)
    - Instantiate LiquidSurface and add to beaker
    - Instantiate DropletPool and add to scene
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 11.2 Write property test for stirrer conditional rendering
    - **Property 24: Stirrer Conditional Rendering**
    - **Validates: Requirements 1.3**
  
  - [ ]* 11.3 Write unit tests for scene structure
    - Test that beaker exists at center position
    - Test that buret exists above beaker
    - Test that liquid surface is added to scene
    - _Requirements: 1.1, 1.2_

- [x] 12. Implement animation loop and droplet updates
  - [x] 12.1 Create animation loop with droplet physics
    - Implement animate() method with requestAnimationFrame
    - Calculate deltaTime between frames
    - Subscribe to state$ observable for state updates
    - Subscribe to dropletAdded$ to spawn visual droplets
    - Call dropletPool.update() with deltaTime
    - Handle collided droplets (trigger ripples, update chemistry)
    - Update liquid surface color based on pH
    - Call liquidSurface.update() for mixing animation
    - Update buret liquid level
    - _Requirements: 2.5, 2.6, 3.1_
  
  - [ ]* 12.2 Write integration test for droplet lifecycle
    - Test full droplet lifecycle: spawn, fall, collide, remove
    - Verify ripple is created on collision
    - Verify chemistry state is updated
    - _Requirements: 2.5, 2.6, 3.1_

- [ ] 13. Checkpoint - Ensure 3D rendering works correctly
  - Manually test 3D scene rendering in browser
  - Verify beaker, buret, and liquid surface are visible
  - Test camera controls (orbit, zoom)
  - Verify droplets fall with gravity
  - Ensure all tests pass, ask the user if questions arise

- [x] 14. Create TitrationChartComponent with Chart.js
  - [x] 14.1 Implement chart component
    - Create TitrationChartComponent with canvas element
    - Add @Input() for titrationPoints, equivalencePoint, currentPoint
    - Initialize Chart.js in ngOnInit with line chart
    - Configure x-axis for volume, y-axis for pH
    - Implement updateChart() method to add new data points
    - Implement markEquivalencePoint() to add marker annotation
    - Add current position indicator
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ]* 14.2 Write property test for chart data accumulation
    - **Property 16: Titration Curve Data Accumulation**
    - **Validates: Requirements 5.2**
  
  - [ ]* 14.3 Write unit tests for chart rendering
    - Test that chart is initialized with correct configuration
    - Test that data points are added correctly
    - Test that equivalence point marker is displayed
    - _Requirements: 5.1, 5.5_

- [x] 15. Create UI controls component
  - [x] 15.1 Implement control panel with all inputs
    - Create template with "Nhỏ giọt" button (mousedown/mouseup events)
    - Add drop rate slider (1-20 range)
    - Add stirrer toggle switch
    - Add indicator dropdown (Universal, Phenolphthalein, Methyl Orange)
    - Add parameter sliders (C_acid, V_acid, C_base, temperature)
    - Add start, pause, reset buttons
    - Add text overlays for pH, volume added, equivalence status
    - Bind all controls to Simulation3DStateService methods
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7, 9.8_
  
  - [ ]* 15.2 Write property test for current state display updates
    - **Property 25: Current State Display Updates**
    - **Validates: Requirements 9.8**
  
  - [ ]* 15.3 Write unit tests for UI controls
    - Test that all controls exist and are bound correctly
    - Test button click handlers
    - Test slider value changes
    - Test dropdown selection
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7_

- [x] 16. Integrate 3D component with existing SimulationsPageComponent
  - [x] 16.1 Add Simulation3DComponent to simulations page
    - Import Simulation3DComponent and TitrationChartComponent
    - Add components to template (conditional on experiment type)
    - Inject Simulation3DStateService
    - Connect state service to existing parameter controls
    - Preserve all existing DB sync logic (no modifications)
    - Ensure saveSimulationResults() is called on completion
    - _Requirements: 7.1, 8.1, 8.2_
  
  - [ ]* 16.2 Write property test for DB sync preservation
    - **Property 22: DB Sync Preservation**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.5**
  
  - [ ]* 16.3 Write property test for authentication check
    - **Property 23: Authentication Check Before Save**
    - **Validates: Requirements 8.6**
  
  - [ ]* 16.4 Write unit tests for DB sync integration
    - Test that saveSimulationResults() is called on completion
    - Test that SimulationCompletionEvent has all required fields
    - Test that HistoryService.autoSaveResult() is invoked
    - Test that save is skipped when not authenticated
    - Test that notifications are displayed for save status
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.7_

- [x] 17. Implement resource cleanup in ngOnDestroy
  - [x] 17.1 Add cleanup logic to Simulation3DComponent
    - Cancel animation frame in ngOnDestroy
    - Dispose droplet pool
    - Dispose liquid surface
    - Dispose beaker geometry and material
    - Dispose buret resources
    - Dispose renderer
    - Dispose controls
    - Remove window resize event listener
    - Wrap cleanup in try-catch for defensive error handling
    - _Requirements: 7.5, 7.6_
  
  - [ ]* 17.2 Write property test for resource cleanup
    - **Property 20: Three.js Resource Cleanup**
    - **Validates: Requirements 7.6**
  
  - [ ]* 17.3 Write unit test for cleanup error handling
    - Test that cleanup continues despite errors
    - Verify all dispose methods are called
    - _Requirements: 7.6_

- [x] 18. Add error handling and fallback UI
  - [x] 18.1 Implement error handling strategies
    - Add WebGL support detection
    - Wrap Three.js initialization in try-catch
    - Add showFallbackUI() method for WebGL unavailable
    - Add input validation to chemistry calculations
    - Add defensive checks for division by zero
    - Clamp temperature to valid range [0, 100]
    - Handle droplet pool exhaustion gracefully
    - Add console logging for debugging
    - _Requirements: 4.7_
  
  - [ ]* 18.2 Write unit tests for error handling
    - Test WebGL support detection
    - Test initialization error handling
    - Test chemistry calculation input validation
    - Test temperature clamping (Property 28)
    - Test droplet pool exhaustion handling
    - _Requirements: 4.7_

- [ ] 19. Checkpoint - Full integration testing
  - Test complete simulation workflow from start to finish
  - Verify droplets fall, colors change, chart updates
  - Test equivalence point detection
  - Verify DB sync triggers on completion
  - Test parameter changes reset simulation
  - Test responsive behavior (resize window)
  - Ensure all tests pass, ask the user if questions arise

- [x] 20. Optimize performance
  - [x] 20.1 Apply performance optimizations
    - Verify InstancedMesh is used for droplets
    - Cap pixel ratio to max 2
    - Disable shadows if not needed
    - Use MeshPhongMaterial for better performance
    - Verify object pooling prevents memory leaks
    - Test frame rate with 20 simultaneous droplets
    - Profile memory usage during extended runs
    - _Requirements: 1.5, 6.1, 6.5_
  
  - [ ]* 20.2 Manual performance validation
    - Use Chrome DevTools to verify 30+ FPS
    - Check memory profiler for leaks
    - Verify shader performance
    - Test on mid-range hardware
    - _Requirements: 1.5, 6.5_

- [x] 21. Add accessibility features
  - [x] 21.1 Implement accessibility enhancements
    - Add ARIA labels to all buttons and sliders
    - Add text alternatives for pH changes
    - Implement keyboard navigation for controls
    - Add keyboard shortcuts (Space to drip, R to reset)
    - Add screen reader announcements for equivalence point
    - Ensure color contrast meets WCAG standards
    - Test with keyboard-only navigation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7_

- [x] 22. Final checkpoint - Complete system validation
  - Run full test suite (unit + property tests)
  - Verify all 28 correctness properties pass
  - Test all user workflows end-to-end
  - Verify DB sync works correctly
  - Test responsive behavior on different screen sizes
  - Verify SSR build works without errors
  - Test accessibility with screen reader
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each property test references a specific correctness property from the design document
- DB sync logic is preserved completely - no modifications to existing saveSimulationResults(), HistoryService, or ExperimentService
- All Three.js initialization must check isPlatformBrowser for SSR compatibility
- Minimum 100 iterations per property test using fast-check library
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Performance optimization is a separate task to avoid premature optimization
- Accessibility is addressed as a dedicated task to ensure inclusive design
