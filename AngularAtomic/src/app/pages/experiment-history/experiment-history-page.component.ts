import { Component, computed, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HistoryService, HistoryEntry, HistoryFilters } from '../../services/history.service';

@Component({
  selector: 'app-experiment-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './experiment-history-page.component.html',
  styleUrls: ['./experiment-history-page.component.css']
})
export class ExperimentHistoryPageComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private historyService = inject(HistoryService);
  readonly router = inject(Router); // Make it public for template access
  
  // Authentication state
  currentUserId = computed(() => {
    const user = this.authService.currentUser();
    return user ? parseInt(user.id) : null;
  });
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  
  // History state from service
  historyEntries = this.historyService.entries;
  isLoading = this.historyService.loading;
  saveStatus = this.historyService.status;
  
  // UI state
  selectedEntry = signal<HistoryEntry | null>(null);
  showFilters = signal<boolean>(false);
  
  // Filters
  filters = signal<HistoryFilters>({});
  searchText = signal<string>('');
  experimentTypeFilter = signal<string>('');
  dateRangeStart = signal<string>('');
  dateRangeEnd = signal<string>('');
  minEfficiency = signal<number | undefined>(undefined);
  maxEfficiency = signal<number | undefined>(undefined);
  
  // Filter options
  experimentTypes = [
    { value: '', label: 'Tất cả loại thí nghiệm' },
    { value: 'acid-base', label: 'Acid-Base' },
    { value: 'decomposition', label: 'Phân hủy' },
    { value: 'electrolysis', label: 'Điện phân' },
    { value: 'equilibrium', label: 'Cân bằng' },
    { value: 'combustion', label: 'Đốt cháy' },
    { value: 'precipitation', label: 'Kết tủa' },
    { value: 'catalysis', label: 'Xúc tác' },
    { value: 'redox', label: 'Oxi hóa khử' }
  ];
  
  // Statistics
  totalEntries = computed(() => this.historyEntries().length);
  averageEfficiency = computed(() => {
    const entries = this.historyEntries();
    if (entries.length === 0) return 0;
    const efficiencies = entries.filter(e => e.efficiency !== undefined).map(e => e.efficiency!);
    if (efficiencies.length === 0) return 0;
    return efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
  });
  bestEfficiency = computed(() => {
    const entries = this.historyEntries();
    const efficiencies = entries.filter(e => e.efficiency !== undefined).map(e => e.efficiency!);
    return efficiencies.length > 0 ? Math.max(...efficiencies) : 0;
  });
  
  // Filtered entries
  filteredEntries = computed(() => {
    let entries = this.historyEntries();
    const currentFilters = this.filters();
    
    // Apply search text filter
    const searchText = this.searchText().toLowerCase();
    if (searchText) {
      entries = entries.filter(entry => 
        entry.experimentTitle.toLowerCase().includes(searchText) ||
        entry.experimentType.toLowerCase().includes(searchText) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchText))
      );
    }
    
    // Apply experiment type filter
    const typeFilter = this.experimentTypeFilter();
    if (typeFilter) {
      entries = entries.filter(entry => entry.experimentType === typeFilter);
    }
    
    // Apply date range filter
    const startDate = this.dateRangeStart();
    const endDate = this.dateRangeEnd();
    if (startDate) {
      const start = new Date(startDate);
      entries = entries.filter(entry => entry.timestamp >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      entries = entries.filter(entry => entry.timestamp <= end);
    }
    
    // Apply efficiency filters
    const minEff = this.minEfficiency();
    const maxEff = this.maxEfficiency();
    if (minEff !== undefined) {
      entries = entries.filter(entry => (entry.efficiency || 0) >= minEff);
    }
    if (maxEff !== undefined) {
      entries = entries.filter(entry => (entry.efficiency || 0) <= maxEff);
    }
    
    return entries;
  });

  ngOnInit() {
    this.loadHistory();
    this.subscribeToHistoryUpdates();
  }

  ngOnDestroy() {
    // Cleanup handled by service
  }

  private subscribeToHistoryUpdates() {
    // Subscribe to real-time updates
    this.historyService.onNewResult$.subscribe(newEntry => {
      console.log('🆕 New result received:', newEntry);
      this.highlightNewEntry(newEntry);
    });
    
    this.historyService.onResultUpdated$.subscribe(updatedEntry => {
      console.log('🔄 Result updated:', updatedEntry);
    });
    
    this.historyService.onResultDeleted$.subscribe(deletedId => {
      console.log('🗑️ Result deleted:', deletedId);
    });
  }

  private highlightNewEntry(entry: HistoryEntry) {
    // Add visual highlighting for new entries
    setTimeout(() => {
      const element = document.querySelector(`[data-entry-id="${entry.id}"]`);
      if (element) {
        element.classList.add('animate-pulse', 'bg-green-50', 'border-green-200');
        setTimeout(() => {
          element.classList.remove('animate-pulse', 'bg-green-50', 'border-green-200');
        }, 3000);
      }
    }, 100);
  }

  // Filter methods
  applyFilters() {
    const filters: HistoryFilters = {};
    
    const searchText = this.searchText();
    if (searchText) filters.searchText = searchText;
    
    const experimentType = this.experimentTypeFilter();
    if (experimentType) filters.experimentType = experimentType;
    
    const startDate = this.dateRangeStart();
    const endDate = this.dateRangeEnd();
    if (startDate || endDate) {
      filters.dateRange = {
        start: startDate ? new Date(startDate) : new Date(0),
        end: endDate ? new Date(endDate) : new Date()
      };
    }
    
    const minEff = this.minEfficiency();
    const maxEff = this.maxEfficiency();
    if (minEff !== undefined) filters.minEfficiency = minEff;
    if (maxEff !== undefined) filters.maxEfficiency = maxEff;
    
    this.filters.set(filters);
    this.loadHistory();
  }

  clearFilters() {
    this.searchText.set('');
    this.experimentTypeFilter.set('');
    this.dateRangeStart.set('');
    this.dateRangeEnd.set('');
    this.minEfficiency.set(undefined);
    this.maxEfficiency.set(undefined);
    this.filters.set({});
    this.loadHistory();
  }

  toggleFilters() {
    this.showFilters.update(show => !show);
  }

  // Entry selection
  selectEntry(entry: HistoryEntry) {
    this.selectedEntry.set(entry);
  }

  closeDetails() {
    this.selectedEntry.set(null);
  }

  // Re-run experiment
  rerunExperiment(entry: HistoryEntry) {
    // Navigate to simulation page with pre-loaded parameters
    this.router.navigate(['/simulations'], {
      queryParams: {
        experimentId: entry.experimentId,
        rerun: 'true',
        historyId: entry.id
      }
    });
  }

  // Export functionality
  exportEntry(entry: HistoryEntry) {
    const data = {
      experiment: {
        id: entry.experimentId,
        title: entry.experimentTitle,
        type: entry.experimentType
      },
      parameters: entry.parameters,
      results: entry.results,
      duration: entry.duration,
      efficiency: entry.efficiency,
      timestamp: entry.timestamp,
      tags: entry.tags
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment-${entry.experimentId}-${entry.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  exportMultiple(entries: HistoryEntry[]) {
    const data = entries.map(entry => ({
      experiment: {
        id: entry.experimentId,
        title: entry.experimentTitle,
        type: entry.experimentType
      },
      parameters: entry.parameters,
      results: entry.results,
      duration: entry.duration,
      efficiency: entry.efficiency,
      timestamp: entry.timestamp,
      tags: entry.tags
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Utility methods
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  }

  getEfficiencyColor(efficiency?: number): string {
    if (!efficiency) return 'text-gray-500';
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 70) return 'text-blue-600';
    if (efficiency >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getEfficiencyBadge(efficiency?: number): string {
    if (!efficiency) return 'bg-gray-100 text-gray-800';
    if (efficiency >= 90) return 'bg-green-100 text-green-800';
    if (efficiency >= 70) return 'bg-blue-100 text-blue-800';
    if (efficiency >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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

  // Track by function for ngFor performance
  trackByEntryId(index: number, entry: HistoryEntry): number {
    return entry.id;
  }

  // Public method for template
  async loadHistory() {
    const userId = this.currentUserId();
    const isAuthenticated = this.isAuthenticated();
    
    if (!isAuthenticated || !userId) {
      console.log('❌ User not authenticated, cannot load history');
      return;
    }
    
    try {
      console.log('🔄 Refreshing history data from database...');
      
      // Force reload by clearing current filters and reloading
      const currentFilters = this.filters();
      await this.historyService.loadUserHistory(userId, currentFilters);
      
      console.log('✅ History refreshed successfully');
      
      // Show success notification
      this.showRefreshNotification('success', `Đã đồng bộ ${this.historyEntries().length} kết quả từ database`);
      
    } catch (error) {
      console.error('❌ Failed to load history:', error);
      this.showRefreshNotification('error', 'Không thể tải dữ liệu từ database');
    }
  }

  private showRefreshNotification(type: 'success' | 'error', message: string) {
    // Create notification element
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const iconColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';

    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 ${iconColor} rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${icon}
          </svg>
        </div>
        <div>
          <p class="font-semibold ${textColor}">${type === 'success' ? 'Đồng bộ thành công' : 'Lỗi đồng bộ'}</p>
          <p class="text-sm ${textColor.replace('800', '600')}">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                class="ml-auto px-2 py-1 ${textColor.replace('800', '600')} hover:${textColor} text-sm">
          ✕
        </button>
      </div>
    `;
    
    notification.className = `fixed top-20 right-4 ${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg z-50 max-w-md border`;
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 4000);
  }
}