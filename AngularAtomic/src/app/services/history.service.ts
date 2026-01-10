import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// Interfaces for the history system
export interface SimulationCompletionEvent {
  experimentId: string;
  userId: number;
  parameters: SimulationParameters;
  results: SimulationResults;
  duration: number;
  timestamp: Date;
  efficiency?: number;
}

export interface SimulationParameters {
  temperature: number;
  concentration: number;
  volume: number;
  time: number;
  [key: string]: any;
}

export interface SimulationResults {
  ph?: number;
  color?: string;
  gasVolume?: number;
  efficiency?: number;
  mass?: number;
  [key: string]: any;
}

export interface HistoryEntry {
  id: number;
  userId: number;
  experimentId: string;
  experimentTitle: string;
  experimentType: string;
  parameters: SimulationParameters;
  results: SimulationResults;
  duration: number;
  efficiency?: number;
  timestamp: Date;
  isPublic: boolean;
  tags: string[];
  notes?: string;
}

export interface HistoryFilters {
  experimentType?: string;
  dateRange?: { start: Date; end: Date };
  minEfficiency?: number;
  maxEfficiency?: number;
  searchText?: string;
}

export interface RetryQueueEntry {
  id: string;
  result: SimulationCompletionEvent;
  attempts: number;
  nextRetry: Date;
  lastError?: string;
}

export interface AutoSaveConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  queueSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiUrl;

  // Configuration
  private readonly autoSaveConfig: AutoSaveConfig = {
    maxRetries: 5,
    retryDelay: 1000, // 1 second
    backoffMultiplier: 2,
    queueSize: 100
  };

  // State management
  private readonly historyEntries = signal<HistoryEntry[]>([]);
  private readonly isLoading = signal<boolean>(false);
  private readonly saveStatus = signal<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Event streams for real-time updates
  private readonly newResultSubject = new Subject<HistoryEntry>();
  private readonly resultUpdatedSubject = new Subject<HistoryEntry>();
  private readonly resultDeletedSubject = new Subject<number>();
  
  // Retry queue
  private retryQueue: RetryQueueEntry[] = [];
  private retryTimer?: any;

  // Public observables
  readonly onNewResult$ = this.newResultSubject.asObservable();
  readonly onResultUpdated$ = this.resultUpdatedSubject.asObservable();
  readonly onResultDeleted$ = this.resultDeletedSubject.asObservable();

  // Public signals
  readonly entries = this.historyEntries.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly status = this.saveStatus.asReadonly();

  constructor() {
    this.initializeRetryProcessor();
    this.loadRetryQueueFromStorage();
  }

  /**
   * Auto-save simulation result with retry mechanism
   */
  async autoSaveResult(event: SimulationCompletionEvent): Promise<void> {
    console.log('🔄 Auto-saving simulation result:', event);
    
    this.saveStatus.set('saving');
    
    try {
      const historyEntry = await this.saveResultWithRetry(event);
      
      // Add to local state immediately
      const currentEntries = this.historyEntries();
      this.historyEntries.set([historyEntry, ...currentEntries]);
      
      // Broadcast the new result
      this.newResultSubject.next(historyEntry);
      
      this.saveStatus.set('success');
      console.log('✅ Auto-save successful:', historyEntry);
      
      // Show success notification
      this.showSaveNotification('success', 'Kết quả thí nghiệm đã được lưu thành công!');
      
    } catch (error) {
      console.error('❌ Auto-save failed, adding to retry queue:', error);
      
      // Add to retry queue
      this.addToRetryQueue(event, error as Error);
      this.saveStatus.set('error');
      
      // Show error notification
      this.showSaveNotification('error', 'Lưu kết quả thất bại, sẽ thử lại tự động.');
    }
  }

  /**
   * Save result with immediate attempt
   */
  private async saveResultWithRetry(event: SimulationCompletionEvent): Promise<HistoryEntry> {
    const payload = {
      experimentId: event.experimentId,
      userId: event.userId,
      parameters: event.parameters,
      results: event.results,
      duration: event.duration,
      efficiency: event.efficiency,
      timestamp: event.timestamp.toISOString()
    };

    return new Promise((resolve, reject) => {
      this.http.post<any>(`${this.apiBase}/api/experiments/results`, payload)
        .pipe(
          tap(response => console.log('💾 Result saved to database:', response)),
          catchError(error => {
            console.error('💥 Database save failed:', error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {
            const historyEntry: HistoryEntry = {
              id: response.id || Date.now(),
              userId: event.userId,
              experimentId: event.experimentId,
              experimentTitle: this.getExperimentTitle(event.experimentId),
              experimentType: this.getExperimentType(event.experimentId),
              parameters: event.parameters,
              results: event.results,
              duration: event.duration,
              efficiency: event.efficiency,
              timestamp: event.timestamp,
              isPublic: false,
              tags: this.getExperimentTags(event.experimentId),
              notes: undefined
            };
            resolve(historyEntry);
          },
          error: (error) => reject(error)
        });
    });
  }

  /**
   * Add failed save to retry queue
   */
  private addToRetryQueue(event: SimulationCompletionEvent, error: Error): void {
    if (this.retryQueue.length >= this.autoSaveConfig.queueSize) {
      console.warn('⚠️ Retry queue full, removing oldest entry');
      this.retryQueue.shift();
    }

    const queueEntry: RetryQueueEntry = {
      id: `retry_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      result: event,
      attempts: 0,
      nextRetry: new Date(Date.now() + this.autoSaveConfig.retryDelay),
      lastError: error.message
    };

    this.retryQueue.push(queueEntry);
    this.saveRetryQueueToStorage();
    
    console.log('📝 Added to retry queue:', queueEntry.id);
  }

  /**
   * Initialize retry processor
   */
  private initializeRetryProcessor(): void {
    // Process retry queue every 30 seconds
    this.retryTimer = setInterval(() => {
      this.processRetryQueue();
    }, 30000);
  }

  /**
   * Process retry queue
   */
  private async processRetryQueue(): Promise<void> {
    if (this.retryQueue.length === 0) return;

    const now = new Date();
    const readyToRetry = this.retryQueue.filter(entry => entry.nextRetry <= now);

    for (const entry of readyToRetry) {
      if (entry.attempts >= this.autoSaveConfig.maxRetries) {
        console.warn('⚠️ Max retries reached for entry:', entry.id);
        this.removeFromRetryQueue(entry.id);
        continue;
      }

      try {
        console.log(`🔄 Retrying save (attempt ${entry.attempts + 1}):`, entry.id);
        
        const historyEntry = await this.saveResultWithRetry(entry.result);
        
        // Success - remove from queue and add to history
        this.removeFromRetryQueue(entry.id);
        
        const currentEntries = this.historyEntries();
        this.historyEntries.set([historyEntry, ...currentEntries]);
        this.newResultSubject.next(historyEntry);
        
        console.log('✅ Retry successful:', entry.id);
        this.showSaveNotification('success', 'Kết quả đã được lưu thành công sau khi thử lại!');
        
      } catch (error) {
        // Update retry info
        entry.attempts++;
        entry.lastError = (error as Error).message;
        entry.nextRetry = new Date(
          now.getTime() + 
          this.autoSaveConfig.retryDelay * 
          Math.pow(this.autoSaveConfig.backoffMultiplier, entry.attempts)
        );
        
        console.log(`❌ Retry ${entry.attempts} failed for ${entry.id}, next retry at:`, entry.nextRetry);
      }
    }

    this.saveRetryQueueToStorage();
  }

  /**
   * Remove entry from retry queue
   */
  private removeFromRetryQueue(id: string): void {
    this.retryQueue = this.retryQueue.filter(entry => entry.id !== id);
    this.saveRetryQueueToStorage();
  }

  /**
   * Load user's history entries
   */
  async loadUserHistory(userId: number, filters?: HistoryFilters): Promise<HistoryEntry[]> {
    this.isLoading.set(true);
    
    try {
      console.log('📚 Loading user history:', userId, filters);
      
      // Clear current entries to force fresh load
      this.historyEntries.set([]);
      
      // Step 1: Get user's experiments
      let userExperiments: any[] = [];
      try {
        userExperiments = await new Promise<any[]>((resolve, reject) => {
          this.http.get<any[]>(`${this.apiBase}/api/experiments/user/${userId}`)
            .pipe(
              tap(response => console.log('📊 User experiments loaded:', response.length, 'experiments')),
              catchError(error => {
                console.warn('⚠️ Failed to load user experiments:', error);
                return of([]); // Return empty array instead of throwing error
              })
            )
            .subscribe({
              next: resolve,
              error: reject
            });
        });
      } catch (error) {
        console.warn('⚠️ Error loading user experiments, will try to load results directly:', error);
        userExperiments = [];
      }

      const allHistoryEntries: HistoryEntry[] = [];
      
      if (userExperiments.length > 0) {
        // Step 2a: Get simulation results for each experiment (original approach)
        for (const experiment of userExperiments) {
          try {
            console.log('🔍 Loading results for experiment:', experiment.experimentId);
            
            const results = await new Promise<any[]>((resolve, reject) => {
              this.http.get<any[]>(`${this.apiBase}/api/experiments/results/${experiment.experimentId}/${userId}`)
                .pipe(
                  tap(response => console.log(`📈 Results for ${experiment.experimentId}:`, response.length, 'results')),
                  catchError(error => {
                    console.warn(`⚠️ Failed to load results for ${experiment.experimentId}:`, error);
                    return of([]); // Return empty array if results fail to load
                  })
                )
                .subscribe({
                  next: resolve,
                  error: reject
                });
            });

            // Convert each result to HistoryEntry
            for (const result of results) {
              const historyEntry: HistoryEntry = {
                id: result.id,
                userId: result.userId,
                experimentId: result.experimentId,
                experimentTitle: experiment.title || this.getExperimentTitle(result.experimentId),
                experimentType: experiment.experimentType || this.getExperimentType(result.experimentId),
                parameters: typeof result.parameters === 'string' ? 
                  JSON.parse(result.parameters) : result.parameters,
                results: typeof result.results === 'string' ? 
                  JSON.parse(result.results) : result.results,
                duration: result.duration,
                efficiency: result.efficiency,
                timestamp: new Date(result.createdAt || result.timestamp),
                isPublic: experiment.isPublic || false,
                tags: experiment.tags ? 
                  (typeof experiment.tags === 'string' ? JSON.parse(experiment.tags) : experiment.tags) :
                  this.getExperimentTags(result.experimentId),
                notes: result.notes
              };
              
              allHistoryEntries.push(historyEntry);
            }
            
          } catch (error) {
            console.warn(`⚠️ Error processing experiment ${experiment.experimentId}:`, error);
          }
        }
      } else {
        // Step 2b: No experiments found, try to load results directly from SimulationResults table
        console.log('🔄 No experiments found, loading results directly from SimulationResults table');
        
        try {
          // Get all results for this user by checking all common experiment IDs
          const commonExperimentIds = [
            'acid-base', 'decomposition', 'electrolysis', 'equilibrium', 
            'combustion', 'precipitation', 'catalysis', 'redox',
            'test-experiment-123' // Include test experiment ID
          ];
          
          console.log(`🔍 Checking ${commonExperimentIds.length} experiment types for user ${userId}...`);
          
          for (const experimentId of commonExperimentIds) {
            try {
              const results = await new Promise<any[]>((resolve, reject) => {
                this.http.get<any[]>(`${this.apiBase}/api/experiments/results/${experimentId}/${userId}`)
                  .pipe(
                    tap(response => {
                      if (response.length > 0) {
                        console.log(`📈 Found ${response.length} results for experiment ${experimentId}`);
                      }
                    }),
                    catchError(error => {
                      // Silently ignore 404s for experiments that don't have results
                      return of([]);
                    })
                  )
                  .subscribe({
                    next: resolve,
                    error: reject
                  });
              });

              // Convert each result to HistoryEntry
              for (const result of results) {
                const historyEntry: HistoryEntry = {
                  id: result.id,
                  userId: result.userId,
                  experimentId: result.experimentId,
                  experimentTitle: this.getExperimentTitle(result.experimentId),
                  experimentType: this.getExperimentType(result.experimentId),
                  parameters: typeof result.parameters === 'string' ? 
                    JSON.parse(result.parameters) : result.parameters,
                  results: typeof result.results === 'string' ? 
                    JSON.parse(result.results) : result.results,
                  duration: result.duration,
                  efficiency: result.efficiency,
                  timestamp: new Date(result.createdAt || result.timestamp),
                  isPublic: false,
                  tags: this.getExperimentTags(result.experimentId),
                  notes: result.notes
                };
                
                allHistoryEntries.push(historyEntry);
              }
            } catch (error) {
              // Silently continue to next experiment ID
            }
          }
        } catch (error) {
          console.warn('⚠️ Error loading results directly:', error);
        }
      }

      // Sort by timestamp (newest first)
      allHistoryEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      console.log('✅ Total history entries loaded:', allHistoryEntries.length);
      
      // Apply filters if provided
      let filteredEntries = allHistoryEntries;
      if (filters) {
        filteredEntries = this.applyFilters(allHistoryEntries, filters);
        console.log('🔍 Filtered entries:', filteredEntries.length);
      }
      
      this.historyEntries.set(filteredEntries);
      this.isLoading.set(false);
      return filteredEntries;
      
    } catch (error) {
      console.error('💥 Failed to load user history:', error);
      this.isLoading.set(false);
      
      // Return cached data if available
      const cached = this.historyEntries();
      if (cached.length > 0) {
        console.log('📋 Returning cached history data');
        return cached;
      }
      
      throw error;
    }
  }

  /**
   * Apply filters to history entries
   */
  private applyFilters(entries: HistoryEntry[], filters: HistoryFilters): HistoryEntry[] {
    let filtered = entries;
    
    if (filters.experimentType) {
      filtered = filtered.filter(entry => entry.experimentType === filters.experimentType);
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        filtered = filtered.filter(entry => entry.timestamp >= filters.dateRange!.start);
      }
      if (filters.dateRange.end) {
        filtered = filtered.filter(entry => entry.timestamp <= filters.dateRange!.end);
      }
    }
    
    if (filters.minEfficiency !== undefined) {
      filtered = filtered.filter(entry => (entry.efficiency || 0) >= filters.minEfficiency!);
    }
    
    if (filters.maxEfficiency !== undefined) {
      filtered = filtered.filter(entry => (entry.efficiency || 0) <= filters.maxEfficiency!);
    }
    
    if (filters.searchText) {
      const searchText = filters.searchText.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.experimentTitle.toLowerCase().includes(searchText) ||
        entry.experimentType.toLowerCase().includes(searchText) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchText))
      );
    }
    
    return filtered;
  }

  /**
   * Get experiment title by ID
   */
  private getExperimentTitle(experimentId: string): string {
    const titleMap: { [key: string]: string } = {
      'acid-base': 'Phản ứng trung hòa acid-base',
      'decomposition': 'Nhiệt phân KMnO₄ thu O₂',
      'electrolysis': 'Điện phân dung dịch CuSO₄',
      'equilibrium': 'Cân bằng Haber tổng hợp NH₃',
      'combustion': 'Đốt cháy Mg trong không khí',
      'precipitation': 'Kết tủa AgCl từ AgNO₃ + NaCl',
      'catalysis': 'Phân hủy H₂O₂ với xúc tác MnO₂',
      'redox': 'Phản ứng Zn + CuSO₄'
    };
    return titleMap[experimentId] || experimentId;
  }

  /**
   * Get experiment type by ID
   */
  private getExperimentType(experimentId: string): string {
    return experimentId.includes('-') ? experimentId : 'custom';
  }

  /**
   * Get experiment tags by ID
   */
  private getExperimentTags(experimentId: string): string[] {
    const tagMap: { [key: string]: string[] } = {
      'acid-base': ['pH', 'nhiệt độ', 'chỉ thị'],
      'decomposition': ['oxy hóa', 'thể tích khí'],
      'electrolysis': ['điện phân', 'khối lượng'],
      'equilibrium': ['cân bằng', 'áp suất', 'nhiệt độ'],
      'combustion': ['đốt cháy', 'ánh sáng', 'khối lượng'],
      'precipitation': ['kết tủa', 'độ đục', 'ion'],
      'catalysis': ['xúc tác', 'phân hủy', 'khí O₂'],
      'redox': ['oxi hóa khử', 'kim loại', 'nhiệt tỏa']
    };
    return tagMap[experimentId] || ['thí nghiệm'];
  }

  /**
   * Save retry queue to localStorage
   */
  private saveRetryQueueToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return; // Skip on server-side
    }
    
    try {
      localStorage.setItem('experiment_retry_queue', JSON.stringify(this.retryQueue));
    } catch (error) {
      console.warn('⚠️ Failed to save retry queue to storage:', error);
    }
  }

  /**
   * Load retry queue from localStorage
   */
  private loadRetryQueueFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      this.retryQueue = [];
      return; // Skip on server-side
    }
    
    try {
      const stored = localStorage.getItem('experiment_retry_queue');
      if (stored) {
        this.retryQueue = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          nextRetry: new Date(entry.nextRetry),
          result: {
            ...entry.result,
            timestamp: new Date(entry.result.timestamp)
          }
        }));
        console.log('📋 Loaded retry queue from storage:', this.retryQueue.length, 'entries');
      }
    } catch (error) {
      console.warn('⚠️ Failed to load retry queue from storage:', error);
      this.retryQueue = [];
    }
  }

  /**
   * Show save notification to user
   */
  private showSaveNotification(type: 'success' | 'error', message: string): void {
    if (typeof window === 'undefined' || !window.document) {
      return; // Skip on server-side
    }
    
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
          <p class="font-semibold ${textColor}">${type === 'success' ? 'Thành công' : 'Lỗi'}</p>
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
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Cleanup resources
   */
  ngOnDestroy(): void {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
    }
  }
}