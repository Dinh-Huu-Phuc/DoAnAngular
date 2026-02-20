# Requirements Document: 3D Simulation Upgrade

## Introduction

This document specifies the requirements for upgrading the acid-base titration simulation from a 2D canvas-based interface with sliders to a realistic 3D interactive laboratory environment using Three.js. The upgrade will provide users with an immersive experience that closely mimics real laboratory procedures while maintaining all existing database synchronization and result-saving functionality.

## Glossary

- **3D_Scene**: The Three.js rendered environment containing all laboratory equipment and visual elements
- **Beaker**: A cylindrical glass container that holds the acid solution being titrated
- **Buret**: A graduated glass tube with a stopcock used to dispense the base solution in controlled amounts
- **Droplet**: A single particle of base solution falling from the buret into the beaker
- **Liquid_Surface**: The top boundary of the solution in the beaker where droplets impact
- **pH_Indicator**: A chemical compound that changes color based on the pH of the solution (Universal, Phenolphthalein, or Methyl Orange)
- **Mixing_Effect**: The visual propagation of color change from the droplet impact point throughout the solution
- **Stirrer**: An optional magnetic stirring device that accelerates the mixing effect
- **Titration_Curve**: A real-time graph plotting pH versus volume of base added
- **Equivalence_Point**: The point in the titration where the acid and base have completely neutralized each other
- **DB_Sync_Logic**: The existing database synchronization mechanism using HistoryService and ExperimentService
- **Simulation_State**: The current state of the simulation including parameters, results, and progress
- **Drop_Rate**: The number of droplets dispensed per second when the drip button is active

## Requirements

### Requirement 1: 3D Laboratory Scene Rendering

**User Story:** As a user, I want to see a realistic 3D laboratory setup, so that I can experience a more immersive and educational simulation environment.

#### Acceptance Criteria

1. THE 3D_Scene SHALL render a beaker positioned at the center of the viewport
2. THE 3D_Scene SHALL render a buret positioned above the beaker with visible liquid level
3. WHERE the user enables the stirrer option, THE 3D_Scene SHALL render a magnetic stirrer beneath the beaker
4. THE 3D_Scene SHALL support orbit camera controls allowing the user to rotate and zoom the view
5. THE 3D_Scene SHALL render at a minimum of 30 frames per second on mid-range hardware
6. WHEN the browser window is resized, THE 3D_Scene SHALL adjust the canvas dimensions and maintain aspect ratio

### Requirement 2: Interactive Droplet Dispensing

**User Story:** As a user, I want to control the addition of base solution by pressing a button instead of using a slider, so that I can simulate the manual process of titration more realistically.

#### Acceptance Criteria

1. WHEN the user presses and holds the drip button, THE System SHALL continuously generate droplets at the configured Drop_Rate
2. WHEN the user releases the drip button, THE System SHALL immediately stop generating new droplets
3. WHEN a droplet is generated, THE Buret SHALL decrease its visible liquid level proportionally to the droplet volume
4. THE System SHALL allow the user to adjust the Drop_Rate between 1 and 20 droplets per second
5. WHEN a droplet is generated, THE System SHALL apply realistic gravity physics to the droplet motion
6. WHEN a droplet contacts the Liquid_Surface, THE System SHALL trigger a ripple effect and remove the droplet from the scene

### Requirement 3: Realistic Color Mixing Visualization

**User Story:** As a user, I want to see the solution color change gradually with mixing effects, so that I can understand how the pH indicator responds to the chemical reaction.

#### Acceptance Criteria

1. WHEN a droplet impacts the Liquid_Surface, THE System SHALL initiate a Mixing_Effect originating from the impact point
2. WHILE the stirrer is disabled, THE Mixing_Effect SHALL propagate at a slow rate simulating natural diffusion
3. WHILE the stirrer is enabled, THE Mixing_Effect SHALL propagate at an accelerated rate simulating mechanical mixing
4. THE System SHALL calculate the solution color based on the current pH and selected pH_Indicator
5. WHEN the pH_Indicator is Universal, THE System SHALL map pH values to a gradient from red (pH 1) through green (pH 7) to purple (pH 14)
6. WHEN the pH_Indicator is Phenolphthalein, THE System SHALL display colorless for pH below 8.2 and pink for pH above 10.0 with gradient transition
7. WHEN the pH_Indicator is Methyl Orange, THE System SHALL display red for pH below 3.1 and yellow for pH above 4.4 with gradient transition
8. THE System SHALL blend colors smoothly without abrupt transitions

### Requirement 4: Chemistry Calculation Model

**User Story:** As a user, I want the simulation to accurately calculate pH based on the volumes and concentrations I input, so that I can learn correct acid-base chemistry principles.

#### Acceptance Criteria

1. THE System SHALL accept initial acid concentration (C_acid), initial acid volume (V_acid), and base concentration (C_base) as input parameters
2. WHEN a droplet is added, THE System SHALL calculate the new total volume by adding the droplet volume to V_acid
3. WHEN a droplet is added, THE System SHALL calculate the moles of base added based on C_base and droplet volume
4. THE System SHALL calculate pH based on the excess moles of acid or base after neutralization
5. WHEN strong acid reacts with strong base, THE System SHALL use the formula pH = -log10([H+]) where [H+] is calculated from excess moles
6. THE System SHALL assume complete dissociation for strong acids and strong bases
7. WHERE temperature parameter is provided, THE System SHALL apply temperature correction to the pH calculation using the temperature coefficient of water ionization

### Requirement 5: Real-Time Titration Curve Display

**User Story:** As a user, I want to see a live graph of pH versus volume added, so that I can visualize the titration progress and identify the equivalence point.

#### Acceptance Criteria

1. THE System SHALL display a 2D chart plotting pH on the y-axis and volume of base added on the x-axis
2. WHEN a droplet is added and pH is recalculated, THE System SHALL add a new data point to the Titration_Curve
3. THE System SHALL automatically detect and mark the Equivalence_Point on the Titration_Curve
4. THE Equivalence_Point SHALL be identified as the point of maximum slope (inflection point) in the pH curve
5. THE System SHALL display a moving marker on the Titration_Curve indicating the current state
6. THE Titration_Curve SHALL update in real-time with a maximum latency of 100 milliseconds per data point

### Requirement 6: Performance Optimization

**User Story:** As a user, I want the simulation to run smoothly even with many droplets on screen, so that I can focus on learning without technical distractions.

#### Acceptance Criteria

1. THE System SHALL use InstancedMesh or object pooling for rendering multiple droplets simultaneously
2. THE System SHALL limit the maximum number of active droplets in the scene to 50
3. WHEN the droplet limit is reached, THE System SHALL reuse the oldest droplet object for new droplets
4. THE Liquid_Surface SHALL use a shader-based or simple plane geometry approach for ripple effects
5. THE System SHALL maintain a frame rate of at least 30 FPS when rendering 20 simultaneous droplets on mid-range hardware
6. THE System SHALL optimize Three.js rendering by using appropriate material types and disabling unnecessary features

### Requirement 7: Angular Component Integration

**User Story:** As a developer, I want the 3D simulation to integrate seamlessly with the existing Angular application, so that I can maintain code consistency and reuse existing services.

#### Acceptance Criteria

1. THE System SHALL create a new Simulation3DComponent that encapsulates the Three.js renderer
2. THE Simulation3DComponent SHALL initialize Three.js only when running in a browser environment (isPlatformBrowser check)
3. THE System SHALL create a shared service to manage Simulation_State including pH, volume added, drop rate, indicator type, and stirrer speed
4. WHEN the user modifies concentration, temperature, or initial volume sliders, THE System SHALL reset the simulation to initial state
5. THE System SHALL preserve the existing component lifecycle hooks (ngOnInit, ngOnDestroy) for proper resource management
6. THE System SHALL clean up Three.js resources (geometries, materials, renderer) in the ngOnDestroy hook

### Requirement 8: Database Synchronization Preservation

**User Story:** As a user, I want my simulation results to be automatically saved to the database, so that I can review my experiment history later.

#### Acceptance Criteria

1. THE System SHALL preserve the existing saveSimulationResults() method without modification to its core logic
2. WHEN the simulation completes (reaches equivalence point or user stops), THE System SHALL invoke saveSimulationResults()
3. THE System SHALL continue to use HistoryService.autoSaveResult() for saving results with retry mechanism
4. THE System SHALL continue to use ExperimentService for experiment data management
5. THE System SHALL maintain the SimulationCompletionEvent data structure with all required fields
6. THE System SHALL preserve the authentication check before attempting to save results
7. THE System SHALL continue to display appropriate notifications for save success, failure, and retry status

### Requirement 9: User Interface Controls

**User Story:** As a user, I want intuitive controls for the simulation parameters, so that I can easily configure and run experiments.

#### Acceptance Criteria

1. THE System SHALL provide a button labeled "Nhỏ giọt" (Drip) that activates droplet dispensing when pressed
2. THE System SHALL provide a slider to adjust Drop_Rate from 1 to 20 droplets per second
3. THE System SHALL provide a toggle switch to enable or disable the stirrer
4. THE System SHALL provide a dropdown menu to select pH_Indicator from Universal, Phenolphthalein, or Methyl Orange
5. THE System SHALL provide sliders for initial acid concentration, acid volume, base concentration, and temperature
6. WHEN any initial parameter slider is adjusted, THE System SHALL display a reset confirmation or automatically reset the simulation
7. THE System SHALL provide start, pause, and reset buttons for simulation control
8. THE System SHALL display current pH value, volume added, and equivalence point status as text overlays

### Requirement 10: Responsive Design

**User Story:** As a user, I want the simulation to work well on different screen sizes, so that I can use it on various devices.

#### Acceptance Criteria

1. WHEN the browser window is resized, THE System SHALL adjust the canvas dimensions to fit the available space
2. THE System SHALL maintain the aspect ratio of the 3D_Scene during resize operations
3. THE System SHALL reposition UI controls appropriately for different viewport sizes
4. THE Titration_Curve chart SHALL resize responsively with the window
5. THE System SHALL ensure all interactive elements remain accessible and usable on screens with minimum width of 768 pixels

### Requirement 11: Package Dependencies

**User Story:** As a developer, I want to use well-maintained libraries for 3D rendering and charting, so that I can build on reliable foundations.

#### Acceptance Criteria

1. THE System SHALL use the three package for 3D rendering functionality
2. THE System SHALL use @types/three for TypeScript type definitions
3. THE System SHALL use OrbitControls from three/examples/jsm/controls/OrbitControls for camera control
4. THE System SHALL use either chart.js or echarts for rendering the Titration_Curve
5. THE System SHALL ensure all dependencies are compatible with Angular's SSR (Server-Side Rendering) requirements
6. THE System SHALL check isPlatformBrowser before initializing any browser-only libraries
