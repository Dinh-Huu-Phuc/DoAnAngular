import { Component, computed, signal, OnInit, OnDestroy, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ExperimentService, CreateExperimentRequest, SaveResultRequest } from '../../services/experiment.service';
import { AuthService } from '../../services/auth.service';
import { HistoryService, SimulationCompletionEvent } from '../../services/history.service';

interface Experiment {
  id: string;
  title: string;
  level: 'THCS' | 'THPT' | 'Đại học';
  desc: string;
  tags: string[];
  simulation: SimulationConfig;
}

interface SimulationConfig {
  type: 'acid-base' | 'decomposition' | 'electrolysis' | 'equilibrium' | 'combustion' | 'precipitation' | 'catalysis' | 'redox';
  parameters: {
    temperature: { min: number; max: number; default: number; unit: string };
    concentration: { min: number; max: number; default: number; unit: string };
    volume: { min: number; max: number; default: number; unit: string };
    time: { min: number; max: number; default: number; unit: string };
  };
  reactions: string[];
  phenomena: string[];
}

interface SimulationState {
  isRunning: boolean;
  currentTime: number;
  parameters: {
    temperature: number;
    concentration: number;
    volume: number;
    time: number;
  };
  results: {
    ph?: number;
    color?: string;
    gasVolume?: number;
    efficiency?: number;
    mass?: number;
  };
}

@Component({
  selector: 'app-simulations-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './simulations-page.component.html'
})
export class SimulationsPageComponent implements OnInit, OnDestroy {
  @ViewChild('simulationCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('concentrationChart', { static: false }) concentrationChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('phEfficiencyChart', { static: false }) phEfficiencyChartRef!: ElementRef<HTMLCanvasElement>;
  
  // Inject services
  private experimentService = inject(ExperimentService);
  private authService = inject(AuthService);
  private historyService = inject(HistoryService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  // User and database state - now using Auth Service
  currentUserId = computed(() => {
    const user = this.authService.currentUser();
    return user ? parseInt(user.id) : null;
  });
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  dbConnectionStatus = signal<'connected' | 'disconnected' | 'testing'>('testing');
  
  levels = ['Tất cả', 'THCS', 'THPT', 'Đại học'];
  selectedLevel = signal<string>('Tất cả');
  selectedExperiment = signal<Experiment | null>(null);
  simulationState = signal<SimulationState>({
    isRunning: false,
    currentTime: 0,
    parameters: {
      temperature: 25,
      concentration: 0.1,
      volume: 1.0,
      time: 60
    },
    results: {}
  });

  // Chart data
  concentrationData: { time: number; value: number }[] = [];
  phEfficiencyData: { time: number; ph?: number; efficiency?: number }[] = [];
  isPaused = signal<boolean>(false);
  showAIModal = signal<boolean>(false);
  aiModalContent = signal<string>('');
  
  // Custom experiment creation
  showCreateModal = signal<boolean>(false);
  customExperiment = signal<Partial<Experiment>>({
    title: '',
    level: 'THCS',
    desc: '',
    tags: [],
    simulation: {
      type: 'acid-base',
      parameters: {
        temperature: { min: 20, max: 1500, default: 25, unit: '°C' },
        concentration: { min: 0.01, max: 5.0, default: 0.1, unit: 'mol/L' },
        volume: { min: 0.1, max: 10.0, default: 1.0, unit: 'L' },
        time: { min: 5, max: 3600, default: 60, unit: 's' }
      },
      reactions: [],
      phenomena: []
    }
  });
  
  // Form fields for custom experiment
  newExperimentTitle = signal<string>('');
  newExperimentLevel = signal<'THCS' | 'THPT' | 'Đại học'>('THCS');
  newExperimentDesc = signal<string>('');
  newExperimentTags = signal<string>('');
  newExperimentType = signal<SimulationConfig['type']>('acid-base');
  newExperimentReactions = signal<string>('');
  newExperimentPhenomena = signal<string>('');
  
  // Parameter ranges
  tempMin = signal<number>(20);
  tempMax = signal<number>(1500);
  tempDefault = signal<number>(25);
  concMin = signal<number>(0.01);
  concMax = signal<number>(5.0);
  concDefault = signal<number>(0.1);
  volMin = signal<number>(0.1);
  volMax = signal<number>(10.0);
  volDefault = signal<number>(1.0);
  timeMin = signal<number>(5);
  timeMax = signal<number>(3600);
  timeDefault = signal<number>(60);

  private animationId?: number;
  private ctx?: CanvasRenderingContext2D;
  private concentrationCtx?: CanvasRenderingContext2D;
  private phEfficiencyCtx?: CanvasRenderingContext2D;

  experiments: Experiment[] = [
    {
      id: 'acid-base',
      title: 'Phản ứng trung hòa acid-base',
      level: 'THCS',
      desc: 'Quan sát đổi màu chỉ thị, pH và nhiệt tỏa khi thêm từ từ kiềm vào acid.',
      tags: ['pH', 'nhiệt độ', 'chỉ thị'],
      simulation: {
        type: 'acid-base',
        parameters: {
          temperature: { min: 15, max: 1500, default: 25, unit: '°C' },
          concentration: { min: 0.01, max: 2.0, default: 0.1, unit: 'mol/L' },
          volume: { min: 0.1, max: 5.0, default: 1.0, unit: 'L' },
          time: { min: 10, max: 300, default: 60, unit: 's' }
        },
        reactions: ['HCl + NaOH → NaCl + H₂O'],
        phenomena: ['Đổi màu chỉ thị', 'Tăng nhiệt độ', 'pH thay đổi']
      }
    },
    {
      id: 'decomposition',
      title: 'Nhiệt phân KMnO₄ thu O₂',
      level: 'THPT',
      desc: 'Mô phỏng giải phóng khí oxy, đổi màu chất rắn, đo thể tích khí theo thời gian.',
      tags: ['oxy hóa', 'thể tích khí'],
      simulation: {
        type: 'decomposition',
        parameters: {
          temperature: { min: 200, max: 1500, default: 240, unit: '°C' },
          concentration: { min: 0.1, max: 1.0, default: 0.5, unit: 'mol/L' },
          volume: { min: 0.5, max: 3.0, default: 1.0, unit: 'L' },
          time: { min: 30, max: 600, default: 120, unit: 's' }
        },
        reactions: ['2KMnO₄ → K₂MnO₄ + MnO₂ + O₂'],
        phenomena: ['Tạo khí O₂', 'Đổi màu từ tím sang nâu', 'Tăng thể tích khí']
      }
    },
    {
      id: 'electrolysis',
      title: 'Điện phân dung dịch CuSO₄',
      level: 'THPT',
      desc: 'Theo dõi khối lượng catot, màu dung dịch, tốc độ kết tủa đồng.',
      tags: ['điện phân', 'khối lượng'],
      simulation: {
        type: 'electrolysis',
        parameters: {
          temperature: { min: 20, max: 1500, default: 25, unit: '°C' },
          concentration: { min: 0.1, max: 1.5, default: 0.5, unit: 'mol/L' },
          volume: { min: 0.2, max: 2.0, default: 0.5, unit: 'L' },
          time: { min: 60, max: 1800, default: 300, unit: 's' }
        },
        reactions: ['CuSO₄ + H₂O → Cu + H₂SO₄ + ½O₂ + H₂'],
        phenomena: ['Kết tủa Cu trên catot', 'Tạo khí O₂ ở anot', 'Màu xanh nhạt dần']
      }
    },
    {
      id: 'equilibrium',
      title: 'Cân bằng Haber tổng hợp NH₃',
      level: 'Đại học',
      desc: 'Điều chỉnh áp suất, nhiệt độ, nồng độ để thấy dịch chuyển cân bằng và hiệu suất.',
      tags: ['cân bằng', 'áp suất', 'nhiệt độ'],
      simulation: {
        type: 'equilibrium',
        parameters: {
          temperature: { min: 300, max: 1500, default: 450, unit: '°C' },
          concentration: { min: 0.5, max: 5.0, default: 2.0, unit: 'mol/L' },
          volume: { min: 1.0, max: 10.0, default: 5.0, unit: 'L' },
          time: { min: 120, max: 3600, default: 600, unit: 's' }
        },
        reactions: ['N₂ + 3H₂ ⇌ 2NH₃'],
        phenomena: ['Cân bằng động', 'Hiệu suất thay đổi', 'Áp suất ảnh hưởng']
      }
    },
    {
      id: 'combustion',
      title: 'Đốt cháy Mg trong không khí',
      level: 'THCS',
      desc: 'Quan sát ánh sáng chói, khói trắng MgO, tăng khối lượng và nhiệt độ cao.',
      tags: ['đốt cháy', 'ánh sáng', 'khối lượng'],
      simulation: {
        type: 'combustion',
        parameters: {
          temperature: { min: 400, max: 1500, default: 650, unit: '°C' },
          concentration: { min: 0.1, max: 2.0, default: 1.0, unit: 'mol/L' },
          volume: { min: 0.5, max: 3.0, default: 1.0, unit: 'L' },
          time: { min: 5, max: 120, default: 30, unit: 's' }
        },
        reactions: ['2Mg + O₂ → 2MgO'],
        phenomena: ['Ánh sáng chói', 'Khói trắng MgO', 'Tăng khối lượng', 'Nhiệt độ cao']
      }
    },
    {
      id: 'precipitation',
      title: 'Kết tủa AgCl từ AgNO₃ + NaCl',
      level: 'THPT',
      desc: 'Theo dõi sự hình thành kết tủa trắng, độ đục và tốc độ phản ứng.',
      tags: ['kết tủa', 'độ đục', 'ion'],
      simulation: {
        type: 'precipitation',
        parameters: {
          temperature: { min: 15, max: 1500, default: 25, unit: '°C' },
          concentration: { min: 0.01, max: 1.0, default: 0.1, unit: 'mol/L' },
          volume: { min: 0.1, max: 2.0, default: 0.5, unit: 'L' },
          time: { min: 10, max: 300, default: 60, unit: 's' }
        },
        reactions: ['AgNO₃ + NaCl → AgCl↓ + NaNO₃'],
        phenomena: ['Kết tủa trắng AgCl', 'Tăng độ đục', 'Phản ứng tức thời']
      }
    },
    {
      id: 'catalysis',
      title: 'Phân hủy H₂O₂ với xúc tác MnO₂',
      level: 'THPT',
      desc: 'Quan sát bọt khí O₂ mạnh, nhiệt tỏa và vai trò của xúc tác.',
      tags: ['xúc tác', 'phân hủy', 'khí O₂'],
      simulation: {
        type: 'catalysis',
        parameters: {
          temperature: { min: 20, max: 1500, default: 25, unit: '°C' },
          concentration: { min: 0.1, max: 3.0, default: 1.0, unit: 'mol/L' },
          volume: { min: 0.2, max: 2.0, default: 0.5, unit: 'L' },
          time: { min: 5, max: 180, default: 45, unit: 's' }
        },
        reactions: ['2H₂O₂ → 2H₂O + O₂ (MnO₂)'],
        phenomena: ['Bọt khí O₂ mạnh', 'Nhiệt tỏa', 'Xúc tác không tiêu hao']
      }
    },
    {
      id: 'redox',
      title: 'Phản ứng Zn + CuSO₄',
      level: 'THPT',
      desc: 'Quan sát Cu đỏ bám trên Zn, màu xanh nhạt dần và nhiệt tỏa.',
      tags: ['oxi hóa khử', 'kim loại', 'nhiệt tỏa'],
      simulation: {
        type: 'redox',
        parameters: {
          temperature: { min: 20, max: 1500, default: 25, unit: '°C' },
          concentration: { min: 0.1, max: 2.0, default: 0.5, unit: 'mol/L' },
          volume: { min: 0.2, max: 1.5, default: 0.5, unit: 'L' },
          time: { min: 30, max: 600, default: 120, unit: 's' }
        },
        reactions: ['Zn + CuSO₄ → ZnSO₄ + Cu'],
        phenomena: ['Cu đỏ bám trên Zn', 'Màu xanh nhạt dần', 'Nhiệt tỏa', 'Zn tan dần']
      }
    }
  ];

  filteredExperiments = computed(() => {
    const level = this.selectedLevel();
    if (level === 'Tất cả') return this.experiments;
    return this.experiments.filter((e) => e.level === level);
  });

  ngOnInit() {
    // Test database connection
    this.testDatabaseConnection();
    
    // Load user's custom experiments from database
    this.loadUserExperiments();
    
    // Tự động chọn thí nghiệm đầu tiên
    if (this.experiments.length > 0) {
      this.selectExperiment(this.experiments[0]);
    }
  }
  
  private testDatabaseConnection() {
    this.dbConnectionStatus.set('testing');
    
    // Kiểm tra xem backend có đang chạy không
    this.experimentService.testConnection().subscribe({
      next: () => {
        this.dbConnectionStatus.set('connected');
        console.log('✅ Database connection successful');
      },
      error: (error) => {
        this.dbConnectionStatus.set('disconnected');
        console.warn('⚠️ Database connection failed, using offline mode:', error);
        
        // Hiển thị thông báo cho user
        this.showOfflineNotification();
      }
    });
  }
  
  private loadUserExperiments() {
    const userId = this.currentUserId();
    const isAuthenticated = this.isAuthenticated();
    
    if (!isAuthenticated || !userId) {
      console.log('⚠️ Cannot load user experiments: user not authenticated');
      return;
    }
    
    this.isLoading.set(true);
    this.experimentService.getUserExperiments(userId).subscribe({
      next: (dbExperiments) => {
        console.log('Loaded user experiments from database:', dbExperiments);
        
        // Convert database experiments to frontend format and add to list
        dbExperiments.forEach(dbExp => {
          const frontendExp = this.experimentService.convertToFrontendExperiment(dbExp);
          if (frontendExp) {
            // Check if experiment already exists (avoid duplicates)
            const exists = this.experiments.some(e => e.id === frontendExp.id);
            if (!exists) {
              this.experiments.push(frontendExp);
            }
          }
        });
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user experiments:', error);
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  selectLevel(level: string) {
    this.selectedLevel.set(level);
  }

  selectExperiment(experiment: Experiment) {
    this.selectedExperiment.set(experiment);
    // Reset simulation state với parameters mặc định
    this.simulationState.set({
      isRunning: false,
      currentTime: 0,
      parameters: {
        temperature: experiment.simulation.parameters.temperature.default,
        concentration: experiment.simulation.parameters.concentration.default,
        volume: experiment.simulation.parameters.volume.default,
        time: experiment.simulation.parameters.time.default
      },
      results: {}
    });
    this.stopSimulation();
  }

  updateParameter(param: keyof SimulationState['parameters'], value: number) {
    const currentState = this.simulationState();
    this.simulationState.set({
      ...currentState,
      parameters: {
        ...currentState.parameters,
        [param]: value
      }
    });
  }

  startSimulation() {
    const currentState = this.simulationState();
    if (currentState.isRunning) return;

    this.simulationState.set({
      ...currentState,
      isRunning: true,
      currentTime: 0
    });

    this.runSimulation();
  }

  stopSimulation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    const currentState = this.simulationState();
    this.simulationState.set({
      ...currentState,
      isRunning: false
    });
  }

  resetSimulation() {
    this.stopSimulation();
    this.isPaused.set(false);
    this.concentrationData = [];
    this.phEfficiencyData = [];
    
    const experiment = this.selectedExperiment();
    if (experiment) {
      this.simulationState.set({
        isRunning: false,
        currentTime: 0,
        parameters: {
          temperature: experiment.simulation.parameters.temperature.default,
          concentration: experiment.simulation.parameters.concentration.default,
          volume: experiment.simulation.parameters.volume.default,
          time: experiment.simulation.parameters.time.default
        },
        results: {}
      });
    }

    // Clear charts
    if (this.concentrationChartRef?.nativeElement) {
      const ctx = this.concentrationChartRef.nativeElement.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, this.concentrationChartRef.nativeElement.width, this.concentrationChartRef.nativeElement.height);
      }
    }
    if (this.phEfficiencyChartRef?.nativeElement) {
      const ctx = this.phEfficiencyChartRef.nativeElement.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, this.phEfficiencyChartRef.nativeElement.width, this.phEfficiencyChartRef.nativeElement.height);
      }
    }
  }

  private runSimulation() {
    const experiment = this.selectedExperiment();
    const state = this.simulationState();
    
    if (!experiment || !state.isRunning || this.isPaused()) return;

    const progress = state.currentTime / state.parameters.time;
    const results = this.calculateResults(experiment, state, progress);

    this.simulationState.set({
      ...state,
      currentTime: Math.min(state.currentTime + 1, state.parameters.time),
      results
    });

    // Collect chart data
    this.concentrationData.push({
      time: state.currentTime,
      value: state.parameters.concentration * (1 - progress * 0.8) // Simulate concentration decrease
    });

    this.phEfficiencyData.push({
      time: state.currentTime,
      ph: results.ph,
      efficiency: results.efficiency
    });

    // Vẽ visualization
    this.drawSimulation(experiment, state, progress);
    this.drawConcentrationChart();
    this.drawPhEfficiencyChart();

    if (state.currentTime < state.parameters.time) {
      this.animationId = requestAnimationFrame(() => {
        setTimeout(() => this.runSimulation(), 100); // 100ms delay
      });
    } else {
      this.stopSimulation();
      // Save simulation results when completed
      this.saveSimulationResults();
    }
  }

  private calculateResults(experiment: Experiment, state: SimulationState, progress: number): SimulationState['results'] {
    const { temperature, concentration, volume } = state.parameters;
    
    switch (experiment.simulation.type) {
      case 'acid-base':
        return {
          ph: 7 + (progress - 0.5) * 6, // pH từ 1 đến 13
          color: this.getAcidBaseColor(progress),
          efficiency: Math.min(95, 60 + progress * 35)
        };
      
      case 'decomposition':
        const tempFactor = Math.max(0, (temperature - 200) / 300);
        return {
          gasVolume: progress * volume * tempFactor * 22.4,
          color: this.getDecompositionColor(progress),
          efficiency: Math.min(90, tempFactor * progress * 90)
        };
      
      case 'electrolysis':
        return {
          mass: progress * concentration * volume * 63.5 * 0.1, // Cu mass
          color: this.getElectrolysisColor(progress),
          efficiency: Math.min(85, 50 + progress * 35)
        };
      
      case 'equilibrium':
        const tempOptimal = Math.abs(temperature - 450) < 50 ? 1 : 0.7;
        return {
          efficiency: Math.min(40, tempOptimal * concentration * progress * 20),
          ph: 9 + progress * 2
        };

      case 'combustion':
        const combustionFactor = Math.max(0, (temperature - 400) / 800);
        return {
          mass: progress * concentration * volume * 40.3 * 1.66, // MgO mass increase
          efficiency: Math.min(98, combustionFactor * progress * 98),
          gasVolume: 0 // No gas produced, O2 consumed
        };

      case 'precipitation':
        return {
          mass: progress * Math.min(concentration * volume * 143.3, concentration * volume * 143.3), // AgCl mass
          efficiency: Math.min(99, 80 + progress * 19), // High efficiency for precipitation
          ph: 7 // Neutral pH
        };

      case 'catalysis':
        const catalysisFactor = temperature > 20 ? 1 + (temperature - 20) / 60 : 1;
        return {
          gasVolume: progress * concentration * volume * 11.2 * catalysisFactor, // O2 volume
          efficiency: Math.min(95, catalysisFactor * progress * 95),
          ph: 7 // Neutral pH
        };

      case 'redox':
        return {
          mass: progress * Math.min(concentration * volume * 63.5, concentration * volume * 65.4), // Cu deposited
          efficiency: Math.min(92, 70 + progress * 22),
          ph: 6.5 - progress * 0.5 // Slightly acidic due to H+ formation
        };
      
      default:
        return {};
    }
  }

  private getAcidBaseColor(progress: number): string {
    // Đỏ -> Vàng -> Xanh lá -> Xanh dương -> Tím
    const colors = ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#800080'];
    const index = Math.floor(progress * (colors.length - 1));
    return colors[Math.min(index, colors.length - 1)];
  }

  private getDecompositionColor(progress: number): string {
    // Tím -> Nâu
    const r = Math.floor(128 + progress * 67); // 128 -> 195
    const g = Math.floor(0 + progress * 101);  // 0 -> 101
    const b = Math.floor(128 - progress * 86); // 128 -> 42
    return `rgb(${r}, ${g}, ${b})`;
  }

  private getElectrolysisColor(progress: number): string {
    // Xanh đậm -> Xanh nhạt
    const intensity = Math.floor(255 - progress * 155); // 255 -> 100
    return `rgb(0, ${intensity}, ${intensity})`;
  }

  private drawSimulation(experiment: Experiment, state: SimulationState, progress: number) {
    if (!this.canvasRef?.nativeElement) return;
    
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw based on experiment type
    switch (experiment.simulation.type) {
      case 'acid-base':
        this.drawAcidBase(ctx, canvas, state, progress);
        break;
      case 'decomposition':
        this.drawDecomposition(ctx, canvas, state, progress);
        break;
      case 'electrolysis':
        this.drawElectrolysis(ctx, canvas, state, progress);
        break;
      case 'equilibrium':
        this.drawEquilibrium(ctx, canvas, state, progress);
        break;
      case 'combustion':
        this.drawCombustion(ctx, canvas, state, progress);
        break;
      case 'precipitation':
        this.drawPrecipitation(ctx, canvas, state, progress);
        break;
      case 'catalysis':
        this.drawCatalysis(ctx, canvas, state, progress);
        break;
      case 'redox':
        this.drawRedox(ctx, canvas, state, progress);
        break;
    }
  }

  private drawAcidBase(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: SimulationState, progress: number) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;

    // Draw beaker
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw solution with color change
    const color = state.results.color || '#ff0000';
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Draw pH indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`pH: ${(state.results.ph || 7).toFixed(1)}`, centerX, centerY - radius - 20);
  }

  private drawDecomposition(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: SimulationState, progress: number) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw test tube
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(centerX - 30, centerY - 80, 60, 160, 10);
    ctx.stroke();

    // Draw solid with color change
    const color = state.results.color || '#800080';
    ctx.fillStyle = color;
    ctx.fillRect(centerX - 25, centerY + 40, 50, 35);

    // Draw gas bubbles
    for (let i = 0; i < progress * 10; i++) {
      ctx.fillStyle = '#87ceeb';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(
        centerX + (Math.random() - 0.5) * 40,
        centerY - 60 + Math.random() * 80,
        2 + Math.random() * 3,
        0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw gas volume
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`O₂: ${(state.results.gasVolume || 0).toFixed(2)} L`, centerX, centerY - 100);
  }

  private drawElectrolysis(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: SimulationState, progress: number) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw electrodes
    ctx.fillStyle = '#ffd700'; // Gold color for electrodes
    ctx.fillRect(centerX - 60, centerY - 60, 10, 120); // Cathode
    ctx.fillRect(centerX + 50, centerY - 60, 10, 120);  // Anode

    // Draw solution
    const color = state.results.color || '#0080ff';
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(centerX - 50, centerY - 50, 100, 100);
    ctx.globalAlpha = 1;

    // Draw copper deposit on cathode
    ctx.fillStyle = '#b87333'; // Copper color
    const depositHeight = progress * 40;
    ctx.fillRect(centerX - 58, centerY + 50 - depositHeight, 6, depositHeight);

    // Draw current flow
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX - 55, centerY - 80);
    ctx.lineTo(centerX + 55, centerY - 80);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw mass
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Cu: ${(state.results.mass || 0).toFixed(3)} g`, centerX, centerY + 80);
  }

  private drawEquilibrium(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: SimulationState, progress: number) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw reaction vessel
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(centerX - 80, centerY - 60, 160, 120, 10);
    ctx.stroke();

    // Draw molecules (simplified)
    const efficiency = state.results.efficiency || 0;
    
    // N2 molecules (blue)
    ctx.fillStyle = '#0000ff';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        centerX - 60 + Math.random() * 40,
        centerY - 40 + Math.random() * 30,
        3, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // H2 molecules (red)
    ctx.fillStyle = '#ff0000';
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(
        centerX - 20 + Math.random() * 40,
        centerY - 40 + Math.random() * 80,
        2, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // NH3 molecules (green) - based on efficiency
    ctx.fillStyle = '#00ff00';
    for (let i = 0; i < efficiency / 2; i++) {
      ctx.beginPath();
      ctx.arc(
        centerX + 20 + Math.random() * 40,
        centerY - 40 + Math.random() * 80,
        2.5, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // Draw efficiency
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Hiệu suất: ${efficiency.toFixed(1)}%`, centerX, centerY + 80);
  }

  private drawCombustion(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: SimulationState, progress: number) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw Mg strip
    ctx.fillStyle = '#c0c0c0'; // Silver color for Mg
    ctx.fillRect(centerX - 5, centerY - 40, 10, 80);

    // Draw flame
    if (progress > 0.1) {
      ctx.fillStyle = `rgba(255, 255, 255, ${progress})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 + progress * 30, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw MgO smoke
    for (let i = 0; i < progress * 15; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.7 - i * 0.05})`;
      ctx.beginPath();
      ctx.arc(
        centerX + (Math.random() - 0.5) * 60,
        centerY - 60 - i * 5,
        3 + Math.random() * 4,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    // Draw mass info
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Khối lượng MgO: ${(state.results.mass || 0).toFixed(3)} g`, centerX, centerY + 80);
  }

  private drawPrecipitation(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: SimulationState, progress: number) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw beaker
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Draw clear solution
    ctx.fillStyle = 'rgba(200, 200, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 55, 0, Math.PI * 2);
    ctx.fill();

    // Draw AgCl precipitate
    const precipitateHeight = progress * 40;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 50, centerY + 55 - precipitateHeight, 100, precipitateHeight);

    // Draw precipitate particles
    for (let i = 0; i < progress * 20; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.arc(
        centerX + (Math.random() - 0.5) * 80,
        centerY - 20 + Math.random() * 60,
        1 + Math.random() * 2,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    // Draw mass
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`AgCl: ${(state.results.mass || 0).toFixed(3)} g`, centerX, centerY + 80);
  }

  private drawCatalysis(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: SimulationState, progress: number) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw test tube
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(centerX - 30, centerY - 80, 60, 160, 10);
    ctx.stroke();

    // Draw H2O2 solution
    ctx.fillStyle = 'rgba(200, 220, 255, 0.6)';
    ctx.fillRect(centerX - 25, centerY + 20, 50, 55);

    // Draw MnO2 catalyst at bottom
    ctx.fillStyle = '#654321';
    ctx.fillRect(centerX - 20, centerY + 60, 40, 15);

    // Draw vigorous O2 bubbles
    for (let i = 0; i < progress * 25; i++) {
      ctx.fillStyle = `rgba(135, 206, 235, ${0.8 - (i % 10) * 0.08})`;
      ctx.beginPath();
      ctx.arc(
        centerX + (Math.random() - 0.5) * 40,
        centerY - 80 + Math.random() * 140,
        1 + Math.random() * 4,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    // Draw gas volume
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`O₂: ${(state.results.gasVolume || 0).toFixed(2)} L`, centerX, centerY - 100);
  }

  private drawRedox(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: SimulationState, progress: number) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw beaker
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Draw CuSO4 solution (fading blue)
    const blueIntensity = Math.max(0.2, 1 - progress * 0.8);
    ctx.fillStyle = `rgba(0, 100, 200, ${blueIntensity})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 55, 0, Math.PI * 2);
    ctx.fill();

    // Draw Zn strip
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(centerX - 5, centerY - 50, 10, 100);

    // Draw Cu deposit on Zn
    const copperThickness = progress * 8;
    ctx.fillStyle = '#b87333';
    ctx.fillRect(centerX - 5 - copperThickness/2, centerY - 50, 10 + copperThickness, 100);

    // Draw Cu particles in solution
    for (let i = 0; i < progress * 10; i++) {
      ctx.fillStyle = `rgba(184, 115, 51, ${0.6 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(
        centerX + (Math.random() - 0.5) * 80,
        centerY + (Math.random() - 0.5) * 80,
        1 + Math.random() * 2,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    // Draw mass
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Cu: ${(state.results.mass || 0).toFixed(3)} g`, centerX, centerY + 80);
  }

  // Pause/Resume simulation
  pauseSimulation() {
    this.isPaused.set(true);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  resumeSimulation() {
    this.isPaused.set(false);
    if (this.simulationState().isRunning) {
      this.runSimulation();
    }
  }

  // Request AI re-analysis
  requestReanalysis() {
    const experiment = this.selectedExperiment();
    const state = this.simulationState();
    
    if (!experiment || !state.results) {
      alert('Chưa có dữ liệu để phân tích. Vui lòng chạy thí nghiệm trước.');
      return;
    }

    // Simulate AI re-analysis with more detailed feedback
    const analysis = this.getDetailedAIAnalysis();
    alert(`🤖 AI Phân tích chi tiết:\n\n${analysis}`);
  }

  // AI Comments - Show detailed AI feedback after experiment completion
  showAIComments() {
    const experiment = this.selectedExperiment();
    const state = this.simulationState();
    
    if (!experiment) {
      this.aiModalContent.set('🚫 Vui lòng chọn thí nghiệm trước khi xem nhận xét AI.');
      this.showAIModal.set(true);
      return;
    }

    // Check if experiment has been run (has results or completed)
    const hasResults = state.results && Object.keys(state.results).length > 0;
    const isCompleted = state.currentTime >= state.parameters.time;
    
    if (!hasResults && !isCompleted) {
      this.aiModalContent.set('⚠️ Vui lòng chạy thí nghiệm để AI có thể đưa ra nhận xét chi tiết.');
      this.showAIModal.set(true);
      return;
    }

    const aiComments = this.generateAIComments();
    const modalContent = `${aiComments}

💡 **Gợi ý cải thiện:**
${this.getImprovementSuggestions()}

� **Đánhc giá tổng thể:** ${this.getOverallRating()}/10 ⭐`;
    
    this.aiModalContent.set(modalContent);
    this.showAIModal.set(true);
  }

  closeAIModal() {
    this.showAIModal.set(false);
    this.aiModalContent.set('');
  }

  // Custom experiment creation methods
  openCreateModal() {
    this.resetCreateForm();
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.resetCreateForm();
  }

  resetCreateForm() {
    this.newExperimentTitle.set('');
    this.newExperimentLevel.set('THCS');
    this.newExperimentDesc.set('');
    this.newExperimentTags.set('');
    this.newExperimentType.set('acid-base');
    this.newExperimentReactions.set('');
    this.newExperimentPhenomena.set('');
    this.tempMin.set(20);
    this.tempMax.set(1500);
    this.tempDefault.set(25);
    this.concMin.set(0.01);
    this.concMax.set(5.0);
    this.concDefault.set(0.1);
    this.volMin.set(0.1);
    this.volMax.set(10.0);
    this.volDefault.set(1.0);
    this.timeMin.set(5);
    this.timeMax.set(3600);
    this.timeDefault.set(60);
  }

  createCustomExperiment() {
    // Validate form
    if (!this.newExperimentTitle().trim()) {
      alert('⚠️ Vui lòng nhập tên thí nghiệm!');
      return;
    }
    
    if (!this.newExperimentDesc().trim()) {
      alert('⚠️ Vui lòng nhập mô tả thí nghiệm!');
      return;
    }

    if (!this.newExperimentReactions().trim()) {
      alert('⚠️ Vui lòng nhập ít nhất một phương trình phản ứng!');
      return;
    }

    if (!this.newExperimentPhenomena().trim()) {
      alert('⚠️ Vui lòng nhập ít nhất một hiện tượng quan sát!');
      return;
    }

    // Validate parameter ranges
    if (this.tempMin() >= this.tempMax() || this.tempDefault() < this.tempMin() || this.tempDefault() > this.tempMax()) {
      alert('⚠️ Thông số nhiệt độ không hợp lệ!');
      return;
    }

    if (this.concMin() >= this.concMax() || this.concDefault() < this.concMin() || this.concDefault() > this.concMax()) {
      alert('⚠️ Thông số nồng độ không hợp lệ!');
      return;
    }

    if (this.volMin() >= this.volMax() || this.volDefault() < this.volMin() || this.volDefault() > this.volMax()) {
      alert('⚠️ Thông số thể tích không hợp lệ!');
      return;
    }

    if (this.timeMin() >= this.timeMax() || this.timeDefault() < this.timeMin() || this.timeDefault() > this.timeMax()) {
      alert('⚠️ Thông số thời gian không hợp lệ!');
      return;
    }

    // Create new experiment
    const newExperiment: Experiment = {
      id: `custom-${Date.now()}`,
      title: this.newExperimentTitle().trim(),
      level: this.newExperimentLevel(),
      desc: this.newExperimentDesc().trim(),
      tags: this.newExperimentTags().split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      simulation: {
        type: this.newExperimentType(),
        parameters: {
          temperature: { 
            min: this.tempMin(), 
            max: this.tempMax(), 
            default: this.tempDefault(), 
            unit: '°C' 
          },
          concentration: { 
            min: this.concMin(), 
            max: this.concMax(), 
            default: this.concDefault(), 
            unit: 'mol/L' 
          },
          volume: { 
            min: this.volMin(), 
            max: this.volMax(), 
            default: this.volDefault(), 
            unit: 'L' 
          },
          time: { 
            min: this.timeMin(), 
            max: this.timeMax(), 
            default: this.timeDefault(), 
            unit: 's' 
          }
        },
        reactions: this.newExperimentReactions().split('\n').map(r => r.trim()).filter(r => r.length > 0),
        phenomena: this.newExperimentPhenomena().split('\n').map(p => p.trim()).filter(p => p.length > 0)
      }
    };

    // Add to experiments list
    this.experiments.push(newExperiment);
    
    // Save to database if user is logged in
    const userId = this.currentUserId();
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated && userId && this.dbConnectionStatus() === 'connected') {
      this.saveExperimentToDatabase(newExperiment, userId);
    } else if (!isAuthenticated) {
      console.log('⚠️ User not authenticated - experiment saved locally only');
    }
    
    // Close modal and select new experiment
    this.closeCreateModal();
    this.selectExperiment(newExperiment);
    
    // Show success message
    const saveMessage = isAuthenticated && userId ? 
      ' Đã lưu vào database.' : 
      ' (Chỉ lưu cục bộ - cần đăng nhập để lưu vào database)';
    alert(`🎉 Thí nghiệm "${newExperiment.title}" đã được tạo thành công!${saveMessage}`);
  }

  private saveExperimentToDatabase(experiment: Experiment, userId: number) {
    this.isSaving.set(true);
    
    const request: CreateExperimentRequest = {
      userId: userId,
      experimentId: experiment.id,
      title: experiment.title,
      level: experiment.level,
      description: experiment.desc,
      tags: experiment.tags,
      experimentType: experiment.simulation.type,
      parameters: experiment.simulation,
      reactions: experiment.simulation.reactions,
      phenomena: experiment.simulation.phenomena,
      isPublic: false // Default to private
    };
    
    this.experimentService.saveExperiment(request).subscribe({
      next: (savedExp) => {
        console.log('✅ Experiment saved to database:', savedExp);
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('❌ Error saving experiment to database:', error);
        this.isSaving.set(false);
        // Don't show error to user as experiment is still saved locally
      }
    });
  }
  
  private async saveSimulationResults() {
    const experiment = this.selectedExperiment();
    const state = this.simulationState();
    const userId = this.currentUserId();
    const isAuthenticated = this.isAuthenticated();
    
    // Debug logging
    console.log('=== AUTO-SAVE SIMULATION RESULTS ===');
    console.log('Experiment:', experiment);
    console.log('State:', state);
    console.log('User ID:', userId);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Has results:', !!state.results);
    
    if (!experiment || !state.results) {
      console.log('⚠️ Cannot save simulation results: missing experiment or results data');
      return;
    }

    if (!isAuthenticated || !userId) {
      console.log('⚠️ Cannot save simulation results: user not authenticated');
      this.showAuthenticationRequiredMessage();
      return;
    }
    
    // Create simulation completion event for HistoryService
    const completionEvent: SimulationCompletionEvent = {
      experimentId: experiment.id,
      userId: userId,
      parameters: state.parameters,
      results: state.results,
      duration: state.currentTime,
      timestamp: new Date(),
      efficiency: state.results.efficiency
    };
    
    // Use HistoryService for auto-save with retry mechanism
    try {
      await this.historyService.autoSaveResult(completionEvent);
      console.log('✅ Auto-save completed successfully');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      // HistoryService handles retry automatically, so we don't need to do anything here
    }
  }

  private async ensureExperimentInUserDatabase(experiment: Experiment, userId: number): Promise<void> {
    try {
      // Check if user already has this experiment
      const userExperiments = await firstValueFrom(this.experimentService.getUserExperiments(userId));
      const existingExperiment = userExperiments.find(exp => exp.experimentId === experiment.id);
      
      if (!existingExperiment) {
        console.log('🔄 Creating user copy of experiment:', experiment.title);
        
        // Create a copy of the experiment for this user
        const request: CreateExperimentRequest = {
          userId: userId,
          experimentId: experiment.id,
          title: experiment.title,
          level: experiment.level,
          description: experiment.desc,
          tags: experiment.tags,
          experimentType: experiment.simulation.type,
          parameters: experiment.simulation,
          reactions: experiment.simulation.reactions,
          phenomena: experiment.simulation.phenomena,
          isPublic: false // User's private copy
        };
        
        await firstValueFrom(this.experimentService.saveExperiment(request));
        console.log('✅ User copy of experiment created');
      } else {
        console.log('✅ User already has this experiment');
      }
    } catch (error) {
      console.error('⚠️ Error ensuring experiment in user database:', error);
      // Continue anyway - we can still save results
    }
  }

  private showSyncNotification() {
    // Chỉ chạy trên browser, không chạy trên server
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Create a more interactive notification element
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-green-800">Kết quả đã được lưu!</p>
            <p class="text-sm text-green-600">Thí nghiệm đã được đồng bộ vào lịch sử</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button id="viewHistoryBtn" 
                  class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
            Xem lịch sử
          </button>
          <button id="closeNotificationBtn" 
                  class="px-2 py-1 text-green-600 hover:text-green-800 text-sm">
            ✕
          </button>
        </div>
      </div>
    `;
    notification.className = 'fixed top-20 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md';
    document.body.appendChild(notification);
    
    // Add event listeners for buttons
    const viewHistoryBtn = notification.querySelector('#viewHistoryBtn');
    const closeBtn = notification.querySelector('#closeNotificationBtn');
    
    if (viewHistoryBtn) {
      viewHistoryBtn.addEventListener('click', () => {
        this.router.navigate(['/experiment-history']);
        this.removeNotification(notification);
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.removeNotification(notification);
      });
    }
    
    // Auto remove after 8 seconds
    setTimeout(() => {
      this.removeNotification(notification);
    }, 8000);
  }

  private removeNotification(notification: HTMLElement) {
    if (notification && notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }

  private showOfflineNotification() {
    // Chỉ chạy trên browser, không chạy trên server
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div>
          <p class="font-semibold text-yellow-800">Backend chưa sẵn sàng</p>
          <p class="text-sm text-yellow-600">API endpoints chưa được triển khai. Ứng dụng hoạt động ở chế độ offline.</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                class="ml-auto px-2 py-1 text-yellow-600 hover:text-yellow-800 text-sm">
          ✕
        </button>
      </div>
    `;
    notification.className = 'fixed top-20 right-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      this.removeNotification(notification);
    }, 8000);
  }

  private showAuthenticationRequiredMessage() {
    // Chỉ chạy trên browser, không chạy trên server
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <div>
          <p class="font-semibold text-blue-800">Cần đăng nhập</p>
          <p class="text-sm text-blue-600">Bạn cần đăng nhập để lưu kết quả thí nghiệm.</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                class="ml-auto px-2 py-1 text-blue-600 hover:text-blue-800 text-sm">
          ✕
        </button>
      </div>
    `;
    notification.className = 'fixed top-20 right-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      this.removeNotification(notification);
    }, 6000);
  }

  private showSyncErrorNotification() {
    // Chỉ chạy trên browser, không chạy trên server
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <div>
          <p class="font-semibold text-red-800">Lỗi đồng bộ</p>
          <p class="text-sm text-red-600">Không thể lưu kết quả vào lịch sử</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                class="ml-auto px-2 py-1 text-red-600 hover:text-red-800 text-sm">
          ✕
        </button>
      </div>
    `;
    notification.className = 'fixed top-20 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      this.removeNotification(notification);
    }, 6000);
  }

  deleteCustomExperiment(experimentId: string) {
    if (!experimentId.startsWith('custom-')) {
      alert('⚠️ Chỉ có thể xóa thí nghiệm tự tạo!');
      return;
    }

    const experiment = this.experiments.find(e => e.id === experimentId);
    if (!experiment) return;

    if (confirm(`🗑️ Bạn có chắc chắn muốn xóa thí nghiệm "${experiment.title}"?`)) {
      this.experiments = this.experiments.filter(e => e.id !== experimentId);
      
      // If deleted experiment was selected, select first experiment
      if (this.selectedExperiment()?.id === experimentId) {
        if (this.experiments.length > 0) {
          this.selectExperiment(this.experiments[0]);
        } else {
          this.selectedExperiment.set(null);
        }
      }
      
      alert('✅ Thí nghiệm đã được xóa!');
    }
  }

  // Export report
  exportReport() {
    const experiment = this.selectedExperiment();
    const state = this.simulationState();
    
    if (!experiment || !state.results) {
      alert('Chưa có dữ liệu để xuất báo cáo. Vui lòng chạy thí nghiệm trước.');
      return;
    }

    // Chỉ chạy trên browser, không chạy trên server
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const report = this.generateReport();
    
    // Create and download report file
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-thi-nghiem-${experiment.id}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private generateReport(): string {
    const experiment = this.selectedExperiment()!;
    const state = this.simulationState();
    const now = new Date();

    return `
=== BÁO CÁO THÍ NGHIỆM MÔ PHỎNG ===

Thời gian: ${now.toLocaleString('vi-VN')}
Thí nghiệm: ${experiment.title}
Cấp học: ${experiment.level}
Mô tả: ${experiment.desc}

=== THÔNG SỐ THÍ NGHIỆM ===
- Nhiệt độ: ${state.parameters.temperature}°C
- Nồng độ: ${state.parameters.concentration} mol/L
- Thể tích: ${state.parameters.volume} L
- Thời gian: ${state.parameters.time} s

=== PHƯƠNG TRÌNH PHẢN ỨNG ===
${experiment.simulation.reactions.map(r => `- ${r}`).join('\n')}

=== HIỆN TƯỢNG QUAN SÁT ===
${experiment.simulation.phenomena.map(p => `- ${p}`).join('\n')}

=== KẾT QUẢ ===
${state.results.ph !== undefined ? `- pH: ${state.results.ph.toFixed(2)}` : ''}
${state.results.gasVolume !== undefined ? `- Thể tích khí: ${state.results.gasVolume.toFixed(2)} L` : ''}
${state.results.mass !== undefined ? `- Khối lượng: ${state.results.mass.toFixed(3)} g` : ''}
${state.results.efficiency !== undefined ? `- Hiệu suất: ${state.results.efficiency.toFixed(1)}%` : ''}

=== PHÂN TÍCH AI ===
${this.getDetailedAIAnalysis()}

=== DỮ LIỆU BIỂU ĐỒ ===
Nồng độ theo thời gian:
${this.concentrationData.map(d => `${d.time}s: ${d.value.toFixed(3)}`).join('\n')}

pH/Hiệu suất theo thời gian:
${this.phEfficiencyData.map(d => `${d.time}s: pH=${d.ph?.toFixed(2) || 'N/A'}, Hiệu suất=${d.efficiency?.toFixed(1) || 'N/A'}%`).join('\n')}

=== KẾT LUẬN ===
${this.getConclusion()}

---
Báo cáo được tạo tự động bởi AngularAtomic Simulation System
    `.trim();
  }

  private getDetailedAIAnalysis(): string {
    const experiment = this.selectedExperiment()!;
    const state = this.simulationState();
    
    switch (experiment.simulation.type) {
      case 'acid-base':
        const ph = state.results.ph || 7;
        return `Phản ứng trung hòa acid-base đang diễn ra với pH hiện tại là ${ph.toFixed(2)}. 
${ph < 3 ? 'Môi trường rất acid, cần thêm base để trung hòa.' : ''}
${ph > 11 ? 'Môi trường rất kiềm, cần thêm acid để trung hòa.' : ''}
${ph >= 6.5 && ph <= 7.5 ? 'Đã đạt điểm trung hòa, phản ứng hoàn thành tốt.' : ''}
Nhiệt độ ${state.parameters.temperature}°C phù hợp cho phản ứng này.`;

      case 'combustion':
        return `Phản ứng đốt cháy Mg tạo ra ánh sáng chói và MgO trắng. 
Nhiệt độ ${state.parameters.temperature}°C đủ cao để duy trì phản ứng.
Khối lượng tăng do hấp thụ O₂ từ không khí.`;

      case 'precipitation':
        return `Phản ứng kết tủa tạo AgCl trắng không tan. 
Tốc độ phản ứng phụ thuộc vào nồng độ ${state.parameters.concentration} mol/L.
Kết tủa hình thành ngay lập tức khi trộn hai dung dịch.`;

      case 'catalysis':
        return `Xúc tác MnO₂ làm tăng tốc độ phân hủy H₂O₂ đáng kể.
Nhiệt độ ${state.parameters.temperature}°C tối ưu cho hoạt động xúc tác.
Khí O₂ thoát ra mạnh, tạo bọt khí liên tục.`;

      case 'redox':
        return `Phản ứng oxi hóa khử giữa Zn và Cu²⁺ tạo Cu kim loại.
Zn bị oxi hóa thành Zn²⁺, Cu²⁺ bị khử thành Cu.
Màu xanh của CuSO₄ nhạt dần khi Cu²⁺ giảm.`;

      default:
        return this.getAIAnalysis();
    }
  }

  private getConclusion(): string {
    const experiment = this.selectedExperiment()!;
    const state = this.simulationState();
    
    return `Thí nghiệm "${experiment.title}" đã được thực hiện thành công với các thông số đã thiết lập. 
Kết quả thu được phù hợp với lý thuyết và các hiện tượng quan sát được rõ ràng. 
Thí nghiệm này giúp hiểu rõ hơn về ${experiment.tags.join(', ')} trong hóa học.`;
  }

  // Generate comprehensive AI comments
  private generateAIComments(): string {
    const experiment = this.selectedExperiment()!;
    const state = this.simulationState();
    const progress = state.currentTime / state.parameters.time;
    
    let comments = '';
    
    // Performance analysis
    comments += `📈 **PHÂN TÍCH HIỆU SUẤT:**\n`;
    if (state.results.efficiency !== undefined) {
      const efficiency = state.results.efficiency;
      if (efficiency >= 90) {
        comments += `🎉 Xuất sắc! Hiệu suất ${efficiency.toFixed(1)}% rất cao, cho thấy điều kiện thí nghiệm được tối ưu hóa tốt.\n`;
      } else if (efficiency >= 70) {
        comments += `👍 Tốt! Hiệu suất ${efficiency.toFixed(1)}% ở mức khá, có thể cải thiện thêm bằng cách điều chỉnh thông số.\n`;
      } else if (efficiency >= 50) {
        comments += `😐 Trung bình. Hiệu suất ${efficiency.toFixed(1)}% cần được cải thiện bằng cách tối ưu nhiệt độ và nồng độ.\n`;
      } else {
        comments += `😟 Cần cải thiện. Hiệu suất ${efficiency.toFixed(1)}% thấp, hãy xem xét lại các thông số thí nghiệm.\n`;
      }
    }
    
    // Parameter analysis
    comments += `\n🔬 **PHÂN TÍCH THÔNG SỐ:**\n`;
    comments += `🌡️ Nhiệt độ ${state.parameters.temperature}°C: ${this.analyzeTemperature(experiment, state.parameters.temperature)}\n`;
    comments += `⚗️ Nồng độ ${state.parameters.concentration} mol/L: ${this.analyzeConcentration(experiment, state.parameters.concentration)}\n`;
    comments += `📏 Thể tích ${state.parameters.volume} L: ${this.analyzeVolume(experiment, state.parameters.volume)}\n`;
    comments += `⏱️ Thời gian ${state.parameters.time}s: ${this.analyzeTime(experiment, state.parameters.time)}\n`;
    
    // Results analysis
    comments += `\n📊 **PHÂN TÍCH KẾT QUẢ:**\n`;
    if (state.results.ph !== undefined) {
      comments += `🧪 pH = ${state.results.ph.toFixed(2)}: ${this.analyzePH(state.results.ph)}\n`;
    }
    if (state.results.gasVolume !== undefined) {
      comments += `💨 Thể tích khí = ${state.results.gasVolume.toFixed(2)} L: ${this.analyzeGasVolume(state.results.gasVolume)}\n`;
    }
    if (state.results.mass !== undefined) {
      comments += `⚖️ Khối lượng = ${state.results.mass.toFixed(3)} g: ${this.analyzeMass(state.results.mass)}\n`;
    }
    
    // Experiment-specific insights
    comments += `\n🧪 **NHẬN XÉT CHUYÊN MÔN:**\n`;
    comments += this.getExperimentSpecificInsights(experiment, state);
    
    return comments;
  }

  private analyzeTemperature(experiment: Experiment, temp: number): string {
    const params = experiment.simulation.parameters.temperature;
    const optimal = (params.min + params.max) / 2;
    
    if (Math.abs(temp - optimal) < (params.max - params.min) * 0.2) {
      return 'Tối ưu cho phản ứng này';
    } else if (temp < optimal) {
      return 'Hơi thấp, có thể tăng để tăng tốc độ phản ứng';
    } else {
      return 'Hơi cao, cần cân nhắc để tránh phản ứng phụ';
    }
  }

  private analyzeConcentration(experiment: Experiment, conc: number): string {
    const params = experiment.simulation.parameters.concentration;
    
    if (conc >= params.max * 0.8) {
      return 'Nồng độ cao, phản ứng diễn ra nhanh';
    } else if (conc >= params.max * 0.4) {
      return 'Nồng độ vừa phải, cân bằng tốc độ và hiệu quả';
    } else {
      return 'Nồng độ thấp, phản ứng chậm nhưng dễ quan sát';
    }
  }

  private analyzeVolume(experiment: Experiment, vol: number): string {
    const params = experiment.simulation.parameters.volume;
    
    if (vol >= params.max * 0.7) {
      return 'Thể tích lớn, thuận lợi cho quan sát hiện tượng';
    } else {
      return 'Thể tích nhỏ gọn, tiết kiệm hóa chất';
    }
  }

  private analyzeTime(experiment: Experiment, time: number): string {
    const params = experiment.simulation.parameters.time;
    
    if (time >= params.max * 0.8) {
      return 'Thời gian dài, đảm bảo phản ứng hoàn toàn';
    } else if (time >= params.max * 0.4) {
      return 'Thời gian vừa phải cho quan sát';
    } else {
      return 'Thời gian ngắn, phù hợp cho demo nhanh';
    }
  }

  private analyzePH(ph: number): string {
    if (ph < 2) return 'Rất acid, cần thận trọng khi xử lý';
    if (ph < 6) return 'Acid, môi trường thuận lợi cho một số phản ứng';
    if (ph >= 6 && ph <= 8) return 'Gần trung tính, môi trường ổn định';
    if (ph <= 12) return 'Kiềm, cần chú ý an toàn';
    return 'Rất kiềm, môi trường ăn mòn cao';
  }

  private analyzeGasVolume(volume: number): string {
    if (volume > 5) return 'Lượng khí sinh ra nhiều, phản ứng mạnh';
    if (volume > 1) return 'Lượng khí vừa phải, dễ quan sát';
    return 'Lượng khí ít, cần thiết bị đo chính xác';
  }

  private analyzeMass(mass: number): string {
    if (mass > 1) return 'Khối lượng sản phẩm cao, hiệu suất tốt';
    if (mass > 0.1) return 'Khối lượng vừa phải, có thể quan sát được';
    return 'Khối lượng nhỏ, cần cân chính xác';
  }

  private getExperimentSpecificInsights(experiment: Experiment, state: SimulationState): string {
    switch (experiment.simulation.type) {
      case 'acid-base':
        return 'Phản ứng trung hòa là cơ sở của nhiều ứng dụng thực tế. Điểm tương đương có thể xác định bằng chỉ thị màu hoặc pH kế.';
      
      case 'combustion':
        return 'Phản ứng đốt cháy Mg tỏa nhiều nhiệt và ánh sáng. Trong công nghiệp, Mg được dùng làm pháo sáng và hợp kim nhẹ.';
      
      case 'precipitation':
        return 'Phản ứng kết tủa được ứng dụng trong phân tích định tính và xử lý nước thải để loại bỏ ion độc hại.';
      
      case 'catalysis':
        return 'Xúc tác đóng vai trò quan trọng trong công nghiệp hóa học, giúp tăng tốc độ phản ứng mà không bị tiêu hao.';
      
      case 'redox':
        return 'Phản ứng oxi hóa khử là cơ sở của pin, ắc quy và quá trình mạ điện trong công nghiệp.';
      
      case 'electrolysis':
        return 'Điện phân được ứng dụng rộng rãi trong sản xuất kim loại, tinh chế và mạ điện.';
      
      case 'decomposition':
        return 'Phản ứng phân hủy nhiệt là phương pháp quan trọng để sản xuất khí công nghiệp và xử lý chất thải.';
      
      case 'equilibrium':
        return 'Cân bằng hóa học là nguyên lý cơ bản trong sản xuất amoniac - nguyên liệu quan trọng cho phân bón.';
      
      default:
        return 'Thí nghiệm này minh họa các nguyên lý cơ bản của hóa học, có ứng dụng thực tế trong nhiều lĩnh vực.';
    }
  }

  private getImprovementSuggestions(): string {
    const experiment = this.selectedExperiment()!;
    const state = this.simulationState();
    
    let suggestions = [];
    
    // Temperature suggestions
    const tempParams = experiment.simulation.parameters.temperature;
    const currentTemp = state.parameters.temperature;
    if (currentTemp < tempParams.default) {
      suggestions.push(`Tăng nhiệt độ lên ${tempParams.default}°C để đạt hiệu suất tối ưu`);
    } else if (currentTemp > tempParams.default * 1.5) {
      suggestions.push(`Giảm nhiệt độ xuống ${tempParams.default}°C để tránh phản ứng phụ`);
    }
    
    // Concentration suggestions
    const concParams = experiment.simulation.parameters.concentration;
    const currentConc = state.parameters.concentration;
    if (currentConc < concParams.default * 0.8) {
      suggestions.push(`Tăng nồng độ lên ${concParams.default} mol/L để tăng tốc độ phản ứng`);
    }
    
    // Time suggestions
    const timeParams = experiment.simulation.parameters.time;
    const currentTime = state.parameters.time;
    if (currentTime < timeParams.default * 0.7) {
      suggestions.push(`Tăng thời gian lên ${timeParams.default}s để phản ứng hoàn toàn`);
    }
    
    // Efficiency-based suggestions
    if (state.results.efficiency !== undefined && state.results.efficiency < 80) {
      suggestions.push('Thử nghiệm với các thông số khác nhau để tìm điều kiện tối ưu');
      suggestions.push('Kiểm tra độ tinh khiết của hóa chất sử dụng');
    }
    
    return suggestions.length > 0 ? suggestions.join('\n• ') : 'Thí nghiệm đã được thực hiện tối ưu!';
  }

  private getOverallRating(): number {
    const state = this.simulationState();
    let score = 5; // Base score
    
    // Efficiency bonus
    if (state.results.efficiency !== undefined) {
      score += (state.results.efficiency / 100) * 3; // Max 3 points
    }
    
    // Completion bonus
    const progress = state.currentTime / state.parameters.time;
    if (progress >= 1) {
      score += 1; // Completion bonus
    }
    
    // Parameter optimization bonus
    const experiment = this.selectedExperiment()!;
    const tempOptimal = Math.abs(state.parameters.temperature - experiment.simulation.parameters.temperature.default) < 50;
    const concOptimal = Math.abs(state.parameters.concentration - experiment.simulation.parameters.concentration.default) < 0.2;
    
    if (tempOptimal && concOptimal) {
      score += 1; // Optimization bonus
    }
    
    return Math.min(10, Math.round(score));
  }

  // Draw charts
  private drawConcentrationChart() {
    if (!this.concentrationChartRef?.nativeElement) return;
    
    const canvas = this.concentrationChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (this.concentrationData.length < 2) return;

    // Draw axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, canvas.height - 30);
    ctx.stroke();
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(40, canvas.height - 30);
    ctx.lineTo(canvas.width - 20, canvas.height - 30);
    ctx.stroke();

    // Draw data line
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxTime = Math.max(...this.concentrationData.map(d => d.time));
    const maxValue = Math.max(...this.concentrationData.map(d => d.value));
    
    this.concentrationData.forEach((point, index) => {
      const x = 40 + (point.time / maxTime) * (canvas.width - 60);
      const y = canvas.height - 30 - (point.value / maxValue) * (canvas.height - 50);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px Arial';
    ctx.fillText('Thời gian (s)', canvas.width / 2 - 30, canvas.height - 5);
    
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Nồng độ (mol/L)', -40, 0);
    ctx.restore();
  }

  private drawPhEfficiencyChart() {
    if (!this.phEfficiencyChartRef?.nativeElement) return;
    
    const canvas = this.phEfficiencyChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (this.phEfficiencyData.length < 2) return;

    // Draw bars for pH and efficiency
    const barWidth = (canvas.width - 80) / this.phEfficiencyData.length;
    
    this.phEfficiencyData.forEach((point, index) => {
      const x = 40 + index * barWidth;
      
      // pH bar (if exists)
      if (point.ph !== undefined) {
        const phHeight = (point.ph / 14) * (canvas.height - 50);
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(x, canvas.height - 30 - phHeight, barWidth * 0.4, phHeight);
      }
      
      // Efficiency bar (if exists)
      if (point.efficiency !== undefined) {
        const effHeight = (point.efficiency / 100) * (canvas.height - 50);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(x + barWidth * 0.5, canvas.height - 30 - effHeight, barWidth * 0.4, effHeight);
      }
    });

    // Draw axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, canvas.height - 30);
    ctx.stroke();
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(40, canvas.height - 30);
    ctx.lineTo(canvas.width - 20, canvas.height - 30);
    ctx.stroke();
  }

  getAIAnalysis(): string {
    const experiment = this.selectedExperiment();
    const state = this.simulationState();
    
    if (!experiment || !state.results) return 'Chưa có dữ liệu để phân tích';

    switch (experiment.simulation.type) {
      case 'acid-base':
        const ph = state.results.ph || 7;
        if (ph < 3) return 'Môi trường rất acid, cần thêm base để trung hòa';
        if (ph > 11) return 'Môi trường rất kiềm, cần thêm acid để trung hòa';
        if (ph >= 6.5 && ph <= 7.5) return 'Đã đạt điểm trung hòa, phản ứng hoàn thành';
        return 'Phản ứng đang diễn ra, tiếp tục quan sát';

      case 'decomposition':
        const temp = state.parameters.temperature;
        if (temp < 240) return 'Nhiệt độ thấp, tăng nhiệt để tăng tốc độ phản ứng';
        if (temp > 400) return 'Nhiệt độ cao, có thể gây phân hủy không mong muốn';
        return 'Nhiệt độ phù hợp, phản ứng diễn ra ổn định';

      case 'electrolysis':
        const mass = state.results.mass || 0;
        if (mass < 0.1) return 'Khối lượng Cu kết tủa còn ít, tăng thời gian điện phân';
        return `Đã thu được ${mass.toFixed(3)}g Cu, quá trình diễn ra tốt`;

      case 'equilibrium':
        const efficiency = state.results.efficiency || 0;
        if (efficiency < 20) return 'Hiệu suất thấp, cần tối ưu nhiệt độ và áp suất';
        if (efficiency > 30) return 'Hiệu suất cao, điều kiện phản ứng tối ưu';
        return 'Hiệu suất trung bình, có thể cải thiện';

      case 'combustion':
        return 'Phản ứng đốt cháy mạnh, tạo ánh sáng chói và MgO trắng';

      case 'precipitation':
        return 'Kết tủa AgCl trắng hình thành ngay lập tức';

      case 'catalysis':
        return 'Xúc tác MnO₂ làm tăng tốc độ phân hủy H₂O₂ đáng kể';

      case 'redox':
        return 'Cu kim loại bám trên Zn, dung dịch nhạt màu dần';

      default:
        return 'Đang phân tích...';
    }
  }
}



