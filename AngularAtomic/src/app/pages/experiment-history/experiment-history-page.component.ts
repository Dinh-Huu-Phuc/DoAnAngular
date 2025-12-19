import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExperimentService, ExperimentData, SimulationResult } from '../../services/experiment.service';

interface ExperimentWithResults {
  experiment: ExperimentData;
  results: SimulationResult[];
  totalRuns: number;
  averageEfficiency: number;
  bestEfficiency: number;
  lastRun?: string;
}

@Component({
  selector: 'app-experiment-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './experiment-history-page.component.html',
  styleUrls: ['./experiment-history-page.component.css']
})
export class ExperimentHistoryPageComponent implements OnInit {
  private experimentService = inject(ExperimentService);
  
  // State
  currentUserId = signal<number>(1); // TODO: Get from auth service
  isLoading = signal<boolean>(false);
  experiments = signal<ExperimentWithResults[]>([]);
  selectedExperiment = signal<ExperimentWithResults | null>(null);
  selectedResult = signal<SimulationResult | null>(null);
  
  // Filters
  levelFilter = signal<string>('Tất cả');
  typeFilter = signal<string>('Tất cả');
  searchQuery = signal<string>('');
  sortBy = signal<'date' | 'efficiency' | 'runs'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');
  
  // Statistics
  totalExperiments = computed(() => this.experiments().length);
  totalSimulations = computed(() => 
    this.experiments().reduce((sum, exp) => sum + exp.totalRuns, 0)
  );
  averageEfficiency = computed(() => {
    const experiments = this.experiments();
    if (experiments.length === 0) return 0;
    const total = experiments.reduce((sum, exp) => sum + exp.averageEfficiency, 0);
    return total / experiments.length;
  });
  
  // Filter options
  levels = ['Tất cả', 'THCS', 'THPT', 'Đại học'];
  types = ['Tất cả', 'acid-base', 'decomposition', 'electrolysis', 'equilibrium', 'combustion', 'precipitation', 'catalysis', 'redox'];
  
  // Filtered and sorted experiments
  filteredExperiments = computed(() => {
    let filtered = this.experiments();
    
    // Apply level filter
    if (this.levelFilter() !== 'Tất cả') {
      filtered = filtered.filter(exp => exp.experiment.level === this.levelFilter());
    }
    
    // Apply type filter
    if (this.typeFilter() !== 'Tất cả') {
      filtered = filtered.filter(exp => exp.experiment.experimentType === this.typeFilter());
    }
    
    // Apply search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(exp => 
        exp.experiment.title.toLowerCase().includes(query) ||
        exp.experiment.description.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.experiment.updatedAt || a.experiment.createdAt || '');
          const dateB = new Date(b.experiment.updatedAt || b.experiment.createdAt || '');
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'efficiency':
          comparison = a.averageEfficiency - b.averageEfficiency;
          break;
        case 'runs':
          comparison = a.totalRuns - b.totalRuns;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  });

  ngOnInit() {
    this.loadExperimentHistory();
  }

  private async loadExperimentHistory() {
    const userId = this.currentUserId();
    if (!userId) return;
    
    this.isLoading.set(true);
    
    try {
      // Load user's experiments
      const experiments = await this.experimentService.getUserExperiments(userId).toPromise() || [];
      
      // Load results for each experiment
      const experimentsWithResults: ExperimentWithResults[] = [];
      
      for (const experiment of experiments) {
        const results = await this.experimentService.getSimulationResults(experiment.experimentId, userId).toPromise() || [];
        
        // Calculate statistics
        const totalRuns = results.length;
        const efficiencies = results.map(r => r.efficiency || 0).filter(e => e > 0);
        const averageEfficiency = efficiencies.length > 0 ? 
          efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length : 0;
        const bestEfficiency = efficiencies.length > 0 ? Math.max(...efficiencies) : 0;
        const lastRun = results.length > 0 ? results[results.length - 1].createdAt : undefined;
        
        experimentsWithResults.push({
          experiment,
          results,
          totalRuns,
          averageEfficiency,
          bestEfficiency,
          lastRun
        });
      }
      
      this.experiments.set(experimentsWithResults);
    } catch (error) {
      console.error('Error loading experiment history:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectExperiment(experiment: ExperimentWithResults) {
    this.selectedExperiment.set(experiment);
    this.selectedResult.set(null);
  }

  selectResult(result: SimulationResult) {
    this.selectedResult.set(result);
  }

  closeDetails() {
    this.selectedExperiment.set(null);
    this.selectedResult.set(null);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Không xác định';
    return new Date(dateString).toLocaleString('vi-VN');
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  }

  getExperimentTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'acid-base': 'Acid-Base',
      'decomposition': 'Phân hủy',
      'electrolysis': 'Điện phân',
      'equilibrium': 'Cân bằng',
      'combustion': 'Đốt cháy',
      'precipitation': 'Kết tủa',
      'catalysis': 'Xúc tác',
      'redox': 'Oxi hóa khử'
    };
    return typeLabels[type] || type;
  }

  getEfficiencyColor(efficiency: number): string {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 70) return 'text-blue-600';
    if (efficiency >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getEfficiencyBadge(efficiency: number): string {
    if (efficiency >= 90) return 'bg-green-100 text-green-800';
    if (efficiency >= 70) return 'bg-blue-100 text-blue-800';
    if (efficiency >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  exportExperimentData(experiment: ExperimentWithResults) {
    const data = {
      experiment: experiment.experiment,
      results: experiment.results,
      statistics: {
        totalRuns: experiment.totalRuns,
        averageEfficiency: experiment.averageEfficiency,
        bestEfficiency: experiment.bestEfficiency,
        lastRun: experiment.lastRun
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment-${experiment.experiment.experimentId}-data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  deleteExperiment(experiment: ExperimentWithResults) {
    if (!experiment.experiment.id) return;
    
    const confirmMessage = `Bạn có chắc chắn muốn xóa thí nghiệm "${experiment.experiment.title}" và tất cả ${experiment.totalRuns} kết quả liên quan?`;
    
    if (confirm(confirmMessage)) {
      this.experimentService.deleteExperiment(experiment.experiment.id).subscribe({
        next: () => {
          // Remove from local list
          const updated = this.experiments().filter(exp => exp.experiment.id !== experiment.experiment.id);
          this.experiments.set(updated);
          
          // Close details if this experiment was selected
          if (this.selectedExperiment() && this.selectedExperiment()!.experiment.id === experiment.experiment.id) {
            this.closeDetails();
          }
          
          alert('Thí nghiệm đã được xóa thành công!');
        },
        error: (error) => {
          console.error('Error deleting experiment:', error);
          alert('Có lỗi xảy ra khi xóa thí nghiệm. Vui lòng thử lại.');
        }
      });
    }
  }

  refreshData() {
    this.loadExperimentHistory();
  }

  parseJsonSafely(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch {
      return {};
    }
  }
}