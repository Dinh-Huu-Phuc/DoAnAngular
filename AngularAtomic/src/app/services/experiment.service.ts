import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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
  private readonly apiBase = 'https://localhost:7081';

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
    
    return this.http.get<ExperimentData[]>(
      `${this.apiBase}/api/experiments/public`
    ).pipe(
      tap(response => console.log('Public experiments fetched:', response)),
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
    
    const payload: Omit<SimulationResult, 'id' | 'createdAt'> = {
      experimentId: result.experimentId,
      userId: result.userId,
      parameters: JSON.stringify(result.parameters),
      results: JSON.stringify(result.results),
      duration: result.duration,
      efficiency: result.efficiency
    };

    return this.http.post<SimulationResult>(
      `${this.apiBase}/api/experiments/results`,
      payload
    ).pipe(
      tap(response => console.log('Simulation result saved successfully:', response)),
      catchError(error => {
        console.error('Error saving simulation result:', error);
        // Return a fallback response for offline mode
        return of({
          ...payload,
          id: Date.now(),
          createdAt: new Date().toISOString()
        });
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
    
    return this.http.get(`${this.apiBase}/api/experiments/health`).pipe(
      tap(response => console.log('Database connection test successful:', response)),
      catchError(error => {
        console.error('Database connection test failed:', error);
        throw error;
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