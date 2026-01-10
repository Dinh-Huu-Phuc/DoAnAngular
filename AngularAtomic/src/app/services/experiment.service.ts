import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces for database operations
export interface ExperimentData {
  id?: number; // Database ID
  experimentId: string; // Frontend ID (like 'custom-123456')
  userId: number;
  title: string;
  level: 'THCS' | 'THPT' | 'Đại học';
  description: string;
  tags: string; // JSON string of array
  experimentType: string;
  parameters: string; // JSON string of SimulationConfig
  reactions: string; // JSON string of array
  phenomena: string; // JSON string of array
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimulationResult {
  id?: number;
  experimentId: string; // Frontend experiment ID
  userId: number;
  parameters: string; // JSON string of simulation parameters
  results: string; // JSON string of simulation results
  duration: number; // Simulation duration in seconds
  efficiency?: number;
  createdAt?: string;
}

export interface CreateExperimentRequest {
  userId: number;
  experimentId: string;
  title: string;
  level: 'THCS' | 'THPT' | 'Đại học';
  description: string;
  tags: string[];
  experimentType: string;
  parameters: any;
  reactions: string[];
  phenomena: string[];
  isPublic?: boolean;
}

export interface SaveResultRequest {
  userId: number;
  experimentId: string;
  parameters: any;
  results: any;
  duration: number;
  efficiency?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExperimentService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiUrl; // Sử dụng environment config

  /**
   * Save a custom experiment to database
   * @param experiment Experiment data to save
   */
  saveExperiment(experiment: CreateExperimentRequest): Observable<ExperimentData> {
    console.log('Saving experiment to database:', experiment);
    
    const payload: ExperimentData = {
      experimentId: experiment.experimentId,
      userId: experiment.userId,
      title: experiment.title,
      level: experiment.level,
      description: experiment.description,
      tags: JSON.stringify(experiment.tags),
      experimentType: experiment.experimentType,
      parameters: JSON.stringify(experiment.parameters),
      reactions: JSON.stringify(experiment.reactions),
      phenomena: JSON.stringify(experiment.phenomena),
      isPublic: experiment.isPublic || false
    };

    return this.http.post<ExperimentData>(
      `${this.apiBase}/api/experiments`,
      payload
    ).pipe(
      tap(response => console.log('Experiment saved successfully:', response)),
      catchError(error => {
        console.error('Error saving experiment:', error);
        // Return a fallback response for offline mode
        return of({
          ...payload,
          id: Date.now(), // Temporary ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      })
    );
  }

  /**
   * Get user's experiments from database
   * @param userId User ID
   */
  getUserExperiments(userId: number): Observable<ExperimentData[]> {
    console.log('Fetching user experiments:', userId);
    
    return this.http.get<ExperimentData[]>(
      `${this.apiBase}/api/experiments/user/${userId}`
    ).pipe(
      tap(response => console.log('User experiments fetched:', response)),
      catchError(error => {
        console.error('Error fetching user experiments:', error);
        // Return empty array for offline mode
        return of([]);
      })
    );
  }

  /**
   * Get all public experiments
   */
  getPublicExperiments(): Observable<ExperimentData[]> {
    console.log('Fetching public experiments');
    
    // Sử dụng endpoint chung và filter public experiments
    return this.http.get<ExperimentData[]>(
      `${this.apiBase}/api/experiments`
    ).pipe(
      tap(response => console.log('All experiments fetched:', response)),
      // Filter chỉ lấy public experiments
      map(experiments => experiments.filter(exp => exp.isPublic)),
      tap(publicExperiments => console.log('Public experiments filtered:', publicExperiments)),
      catchError(error => {
        console.error('Error fetching public experiments:', error);
        return of([]);
      })
    );
  }

  /**
   * Update an existing experiment
   * @param experimentId Database ID of experiment
   * @param experiment Updated experiment data
   */
  updateExperiment(experimentId: number, experiment: Partial<CreateExperimentRequest>): Observable<ExperimentData> {
    console.log('Updating experiment:', experimentId, experiment);
    
    const payload: Partial<ExperimentData> = {};
    
    if (experiment.title) payload.title = experiment.title;
    if (experiment.level) payload.level = experiment.level;
    if (experiment.description) payload.description = experiment.description;
    if (experiment.tags) payload.tags = JSON.stringify(experiment.tags);
    if (experiment.experimentType) payload.experimentType = experiment.experimentType;
    if (experiment.parameters) payload.parameters = JSON.stringify(experiment.parameters);
    if (experiment.reactions) payload.reactions = JSON.stringify(experiment.reactions);
    if (experiment.phenomena) payload.phenomena = JSON.stringify(experiment.phenomena);
    if (experiment.isPublic !== undefined) payload.isPublic = experiment.isPublic;

    return this.http.put<ExperimentData>(
      `${this.apiBase}/api/experiments/${experimentId}`,
      payload
    ).pipe(
      tap(response => console.log('Experiment updated successfully:', response)),
      catchError(error => {
        console.error('Error updating experiment:', error);
        throw error;
      })
    );
  }

  /**
   * Delete an experiment
   * @param experimentId Database ID of experiment
   */
  deleteExperiment(experimentId: number): Observable<any> {
    console.log('Deleting experiment:', experimentId);
    
    return this.http.delete(
      `${this.apiBase}/api/experiments/${experimentId}`
    ).pipe(
      tap(response => console.log('Experiment deleted successfully:', response)),
      catchError(error => {
        console.error('Error deleting experiment:', error);
        throw error;
      })
    );
  }

  /**
   * Save simulation results to database
   * @param result Simulation result data
   */
  saveSimulationResult(result: SaveResultRequest): Observable<SimulationResult> {
    console.log('Saving simulation result:', result);
    
    // Thử gửi raw objects thay vì JSON strings
    const payload = {
      experimentId: result.experimentId,
      userId: result.userId,
      parameters: result.parameters, // Raw object
      results: result.results, // Raw object
      duration: result.duration,
      efficiency: result.efficiency
    };

    console.log('Payload being sent:', payload);

    return this.http.post<SimulationResult>(
      `${this.apiBase}/api/experiments/results`,
      payload
    ).pipe(
      tap(response => console.log('Simulation result saved successfully:', response)),
      catchError(error => {
        console.error('Error saving simulation result:', error);
        
        // If raw objects fail, try with JSON strings as fallback
        console.log('Trying with JSON strings as fallback...');
        const fallbackPayload = {
          experimentId: result.experimentId,
          userId: result.userId,
          parameters: JSON.stringify(result.parameters),
          results: JSON.stringify(result.results),
          duration: result.duration,
          efficiency: result.efficiency
        };
        
        return this.http.post<SimulationResult>(
          `${this.apiBase}/api/experiments/results`,
          fallbackPayload
        ).pipe(
          tap(response => console.log('Fallback save successful:', response)),
          catchError(fallbackError => {
            console.error('Both attempts failed:', fallbackError);
            // Return a fallback response for offline mode
            return of({
              ...fallbackPayload,
              id: Date.now(),
              createdAt: new Date().toISOString()
            });
          })
        );
      })
    );
  }

  /**
   * Get simulation results for an experiment
   * @param experimentId Frontend experiment ID
   * @param userId User ID
   */
  getSimulationResults(experimentId: string, userId: number): Observable<SimulationResult[]> {
    console.log('Fetching simulation results:', experimentId, userId);
    
    return this.http.get<SimulationResult[]>(
      `${this.apiBase}/api/experiments/results/${experimentId}/${userId}`
    ).pipe(
      tap(response => console.log('Simulation results fetched:', response)),
      catchError(error => {
        console.error('Error fetching simulation results:', error);
        return of([]);
      })
    );
  }

  /**
   * Search experiments by criteria
   * @param query Search query
   * @param level Education level filter
   * @param type Experiment type filter
   * @param userId User ID (optional, for including user's private experiments)
   */
  searchExperiments(query?: string, level?: string, type?: string, userId?: number): Observable<ExperimentData[]> {
    console.log('Searching experiments:', { query, level, type, userId });
    
    let url = `${this.apiBase}/api/experiments/search?`;
    const params = new URLSearchParams();
    
    if (query) params.append('query', query);
    if (level && level !== 'Tất cả') params.append('level', level);
    if (type) params.append('type', type);
    if (userId) params.append('userId', userId.toString());
    
    return this.http.get<ExperimentData[]>(`${url}${params.toString()}`).pipe(
      tap(response => console.log('Search results:', response)),
      catchError(error => {
        console.error('Error searching experiments:', error);
        return of([]);
      })
    );
  }

  /**
   * Convert database experiment to frontend format
   * @param dbExperiment Database experiment data
   */
  convertToFrontendExperiment(dbExperiment: ExperimentData): any {
    try {
      return {
        id: dbExperiment.experimentId,
        title: dbExperiment.title,
        level: dbExperiment.level,
        desc: dbExperiment.description,
        tags: JSON.parse(dbExperiment.tags),
        simulation: JSON.parse(dbExperiment.parameters)
      };
    } catch (error) {
      console.error('Error converting database experiment:', error);
      return null;
    }
  }

  /**
   * Test database connection
   */
  testConnection(): Observable<any> {
    console.log('Testing database connection');
    
    // Test với endpoint đơn giản nhất
    return this.http.get(`${this.apiBase}/api/experiments`).pipe(
      tap(response => console.log('Database connection test successful:', response)),
      catchError(error => {
        console.error('Database connection test failed:', error);
        // Trả về lỗi để component biết là offline mode
        return throwError(() => new Error('Backend endpoints not available - running in offline mode'));
      })
    );
  }

  /**
   * Get experiment statistics for user
   * @param userId User ID
   */
  getUserStats(userId: number): Observable<any> {
    console.log('Fetching user statistics:', userId);
    
    return this.http.get(`${this.apiBase}/api/experiments/stats/${userId}`).pipe(
      tap(response => console.log('User stats fetched:', response)),
      catchError(error => {
        console.error('Error fetching user stats:', error);
        return of({
          totalExperiments: 0,
          totalSimulations: 0,
          averageEfficiency: 0,
          favoriteType: 'N/A'
        });
      })
    );
  }
}