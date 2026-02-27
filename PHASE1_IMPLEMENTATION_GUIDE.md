# Phase 1 Implementation Guide

## ✅ Completed

### 1. Toast Notifications Service
- ✅ Created `ToastService` (`services/toast.service.ts`)
- ✅ Created `ToastComponent` (`components/toast/toast.component.ts`)
- ✅ Added to `app.ts` imports
- ✅ Added to `app.html` template

**Usage**:
```typescript
import { ToastService } from './services/toast.service';

constructor(private toast: ToastService) {}

// Replace alert() with:
this.toast.success('Thành công!');
this.toast.error('Có lỗi xảy ra!');
this.toast.warning('Cảnh báo!');
this.toast.info('Thông tin');
```

### 2. Empty State Component
- ✅ Created `EmptyStateComponent` (`components/empty-state/empty-state.component.ts`)

**Usage**:
```html
<app-empty-state
  icon="🧪"
  title="Chưa có thí nghiệm"
  description="Bạn chưa tạo thí nghiệm nào. Hãy tạo thí nghiệm đầu tiên!"
  actionLabel="Tạo thí nghiệm mới"
  (action)="openCreateModal()"
/>
```

### 3. Preset Service
- ✅ Created `PresetService` (`services/preset.service.ts`)
- Provides presets for different experiment types
- Supports custom presets with localStorage

---

## 🔧 Manual Changes Needed

### Step 1: Update simulations-page.component.ts

Add these imports at the top:
```typescript
import { ToastService } from '../../services/toast.service';
import { PresetService, ExperimentPreset } from '../../services/preset.service';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
```

Add to imports array in @Component:
```typescript
imports: [CommonModule, FormsModule, RouterModule, EmptyStateComponent],
```

Inject services in constructor area:
```typescript
private toastService = inject(ToastService);
private presetService = inject(PresetService);
```

Add new signals for presets:
```typescript
// Experiment presets
availablePresets = signal<ExperimentPreset[]>([]);
selectedPreset = signal<ExperimentPreset | null>(null);
showPresetMenu = signal<boolean>(false);
```

Add method to load presets when experiment is selected:
```typescript
selectExperiment(experiment: Experiment) {
  this.selectedExperiment.set(experiment);
  
  // Load presets for this experiment
  const presets = this.presetService.getPresetsForExperiment(experiment.simulation.type);
  const customPresets = this.presetService.getCustomPresets(experiment.id);
  this.availablePresets.set([...presets, ...customPresets]);
  this.selectedPreset.set(null);
  
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
```

Add method to apply preset:
```typescript
applyPreset(preset: ExperimentPreset) {
  const experiment = this.selectedExperiment();
  if (!experiment) return;
  
  this.selectedPreset.set(preset);
  this.simulationState.update(state => ({
    ...state,
    parameters: { ...preset.parameters }
  }));
  
  this.showPresetMenu.set(false);
  this.toastService.success(`Đã áp dụng preset "${preset.name}"`);
}
```

Replace ALL `alert()` calls with toast:
```typescript
// OLD: alert('⚠️ Vui lòng nhập tên thí nghiệm!');
// NEW:
this.toastService.warning('Vui lòng nhập tên thí nghiệm!');

// OLD: alert('✅ Thí nghiệm đã được xóa!');
// NEW:
this.toastService.success('Thí nghiệm đã được xóa!');

// OLD: alert('Chưa có dữ liệu để xuất báo cáo...');
// NEW:
this.toastService.warning('Chưa có dữ liệu để xuất báo cáo. Vui lòng chạy thí nghiệm trước.');
```

Add keyboard shortcuts in ngOnInit:
```typescript
ngOnInit() {
  // Test database connection
  this.testDatabaseConnection();
  
  // Load user's custom experiments from database
  this.loadUserExperiments();
  
  // Tự động chọn thí nghiệm đầu tiên
  if (this.experiments.length > 0) {
    this.selectExperiment(this.experiments[0]);
  }
  
  // Setup keyboard shortcuts
  this.setupKeyboardShortcuts();
}

private setupKeyboardShortcuts() {
  if (!isPlatformBrowser(this.platformId)) return;
  
  document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    const experiment = this.selectedExperiment();
    const state = this.simulationState();
    
    switch(e.key.toLowerCase()) {
      case ' ': // Space - Start/Stop
        e.preventDefault();
        if (experiment) {
          if (state.isRunning) {
            this.stopSimulation();
          } else {
            this.startSimulation();
          }
        }
        break;
      
      case 'r': // R - Reset
        if (experiment) {
          this.resetSimulation();
          this.toastService.info('Đã reset thí nghiệm');
        }
        break;
      
      case 'p': // P - Pause/Resume
        if (state.isRunning) {
          if (this.isPaused()) {
            this.resumeSimulation();
          } else {
            this.pauseSimulation();
          }
        }
        break;
      
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        const index = parseInt(e.key) - 1;
        const filtered = this.filteredExperiments();
        if (filtered[index]) {
          this.selectExperiment(filtered[index]);
          this.toastService.info(`Đã chọn: ${filtered[index].title}`);
        }
        break;
    }
  });
}
```

### Step 2: Update simulations-page.component.html

Add preset selector in the controls panel (after the "Điều khiển" header):
```html
<!-- Preset Selector -->
@if (selectedExperiment() && availablePresets().length > 0) {
  <div class="mt-4 space-y-2">
    <label class="block text-xs font-medium text-slate-300">Bộ thông số mẫu</label>
    <div class="relative">
      <button
        (click)="showPresetMenu.set(!showPresetMenu())"
        class="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-left text-sm text-slate-200 hover:border-cyan-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors"
      >
        <span class="flex items-center justify-between">
          <span>
            @if (selectedPreset()) {
              {{ selectedPreset()!.icon }} {{ selectedPreset()!.name }}
            } @else {
              Chọn preset...
            }
          </span>
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </span>
      </button>
      
      @if (showPresetMenu()) {
        <div class="absolute z-10 mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 shadow-lg">
          @for (preset of availablePresets(); track preset.name) {
            <button
              (click)="applyPreset(preset)"
              class="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <div class="flex items-start gap-2">
                <span class="text-lg">{{ preset.icon }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-200">{{ preset.name }}</p>
                  <p class="text-xs text-slate-400">{{ preset.description }}</p>
                </div>
              </div>
            </button>
          }
        </div>
      }
    </div>
  </div>
}
```

Add keyboard shortcuts help tooltip (add after the hero section):
```html
<!-- Keyboard Shortcuts Help -->
<div class="fixed bottom-4 right-4 z-40">
  <button
    class="group relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-cyan-400 transition-all duration-200 backdrop-blur-sm"
    title="Phím tắt"
  >
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
    </svg>
    
    <!-- Tooltip -->
    <div class="invisible group-hover:visible absolute bottom-full right-0 mb-2 w-64 rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm">
      <p class="mb-2 text-xs font-semibold text-cyan-400">PHÍM TẮT</p>
      <div class="space-y-1 text-xs text-slate-300">
        <div class="flex justify-between">
          <span class="text-slate-400">Space</span>
          <span>Bắt đầu/Dừng</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">R</span>
          <span>Reset</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">P</span>
          <span>Tạm dừng/Tiếp tục</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">1-9</span>
          <span>Chọn thí nghiệm</span>
        </div>
      </div>
    </div>
  </button>
</div>
```

Replace empty experiments list with empty state:
```html
@if (isLoading()) {
  <div class="flex items-center justify-center py-8">
    <div class="flex items-center gap-3 text-slate-400">
      <div class="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400"></div>
      <span>Đang tải thí nghiệm từ database...</span>
    </div>
  </div>
} @else if (filteredExperiments().length === 0) {
  <app-empty-state
    icon="🧪"
    title="Không tìm thấy thí nghiệm"
    description="Không có thí nghiệm nào phù hợp với bộ lọc hiện tại."
    actionLabel="Tạo thí nghiệm mới"
    (action)="openCreateModal()"
  />
} @else {
  <!-- Existing experiments grid -->
}
```

### Step 3: Update simulation-controls.component.ts (for indicator selector)

Add indicator selector to the 3D simulation controls:

```typescript
import { Simulation3DStateService } from '../../services/simulation-3d-state.service';

// In component class:
private stateService = inject(Simulation3DStateService);

indicators = [
  { value: 'universal', label: 'Universal', color: 'Đa sắc' },
  { value: 'phenolphthalein', label: 'Phenolphthalein', color: 'Không màu → Hồng' },
  { value: 'methyl-orange', label: 'Methyl Orange', color: 'Đỏ → Vàng' }
];

currentIndicator = signal<string>('universal');

changeIndicator(type: 'universal' | 'phenolphthalein' | 'methyl-orange') {
  this.currentIndicator.set(type);
  this.stateService.setIndicator(type);
}
```

Add to template:
```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-slate-300">Chỉ thị màu</label>
  <select
    [value]="currentIndicator()"
    (change)="changeIndicator($any($event.target).value)"
    class="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
  >
    @for (indicator of indicators; track indicator.value) {
      <option [value]="indicator.value">
        {{ indicator.label }} ({{ indicator.color }})
      </option>
    }
  </select>
</div>
```

---

## 🎯 Testing Checklist

- [ ] Toast notifications appear and auto-dismiss
- [ ] Toast can be manually closed by clicking
- [ ] Empty state shows when no experiments match filter
- [ ] Presets load correctly for each experiment type
- [ ] Applying preset updates all parameters
- [ ] Keyboard shortcuts work (Space, R, P, 1-9)
- [ ] Keyboard shortcuts don't interfere with input fields
- [ ] Indicator selector changes color in 3D simulation
- [ ] All alert() replaced with toast notifications
- [ ] Shortcuts tooltip shows on hover

---

## 📝 Summary

Phase 1 adds:
1. ✅ Professional toast notification system
2. ✅ Empty state component for better UX
3. ✅ Experiment presets (4 presets per type)
4. ✅ Indicator selector for 3D simulation
5. ✅ Keyboard shortcuts (Space, R, P, 1-9)

Total implementation time: ~2-3 hours
Impact: High - Significantly improves UX with minimal code changes
