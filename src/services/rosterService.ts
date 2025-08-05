import { apiService } from './api';
import {
  RosterGenerationRequest,
  RosterPlan,
  AlgorithmInfo,
  RosterValidationResult,
  RosterStatistics,
  ApiResponse
} from '../types/entities';

export const rosterService = {
  // Generate new roster plan
  generateRosterPlan: async (request: RosterGenerationRequest): Promise<RosterPlan> => {
    const response = await apiService.post<ApiResponse<RosterPlan>>('/roster/generate', request);
    return response.data;
  },

  // Get available optimization algorithms
  getAvailableAlgorithms: async (): Promise<AlgorithmInfo[]> => {
    try {
      const response = await apiService.get<ApiResponse<AlgorithmInfo[]>>('/roster/algorithms');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch algorithms from API, using fallback:', err);
      // Fallback to genetic algorithm if API fails
      return [
        {
          name: 'GENETIC_ALGORITHM',
          description: 'Genetic Algorithm optimizer using tournament selection, uniform crossover, and random mutation',
          supportsParallelProcessing: true,
          defaultParameters: {
            populationSize: 50,
            maxGenerations: 1000,
            mutationRate: 0.1,
            crossoverRate: 0.8,
            eliteRate: 0.1,
            tournamentSize: 5,
            stagnationLimit: 100
          },
          configurableParameters: {
            populationSize: {
              name: 'populationSize',
              description: 'Population size for genetic algorithm',
              type: 'java.lang.Integer',
              defaultValue: 50,
              minValue: 10,
              maxValue: 200
            },
            maxGenerations: {
              name: 'maxGenerations',
              description: 'Maximum number of generations',
              type: 'java.lang.Integer',
              defaultValue: 1000,
              minValue: 100,
              maxValue: 5000
            },
            mutationRate: {
              name: 'mutationRate',
              description: 'Probability of mutation',
              type: 'java.lang.Double',
              defaultValue: 0.1,
              minValue: 0.01,
              maxValue: 0.5
            },
            crossoverRate: {
              name: 'crossoverRate',
              description: 'Probability of crossover',
              type: 'java.lang.Double',
              defaultValue: 0.8,
              minValue: 0.5,
              maxValue: 1.0
            },
            eliteRate: {
              name: 'eliteRate',
              description: 'Percentage of elite chromosomes to keep',
              type: 'java.lang.Double',
              defaultValue: 0.1,
              minValue: 0.05,
              maxValue: 0.3
            },
            tournamentSize: {
              name: 'tournamentSize',
              description: 'Tournament size for selection',
              type: 'java.lang.Integer',
              defaultValue: 5,
              minValue: 2,
              maxValue: 10
            },
            stagnationLimit: {
              name: 'stagnationLimit',
              description: 'Generations without improvement before stopping',
              type: 'java.lang.Integer',
              defaultValue: 100,
              minValue: 50,
              maxValue: 500
            }
          }
        }
      ];
    }
  },

  // Get estimated execution time
  getEstimatedExecutionTime: async (request: RosterGenerationRequest): Promise<number> => {
    const response = await apiService.post<ApiResponse<number>>('/roster/estimate-time', request);
    return response.data;
  },

  // Validate roster plan
  validateRosterPlan: async (rosterPlan: RosterPlan): Promise<RosterValidationResult> => {
    const response = await apiService.post<ApiResponse<RosterValidationResult>>('/roster/validate', rosterPlan);
    return response.data;
  },

  // Get roster statistics
  getRosterStatistics: async (rosterPlan: RosterPlan): Promise<RosterStatistics> => {
    const response = await apiService.post<ApiResponse<RosterStatistics>>('/roster/statistics', rosterPlan);
    return response.data;
  },

  // Get algorithm default parameters
  getAlgorithmParameters: async (algorithmType: string): Promise<{ [key: string]: any }> => {
    try {
      const response = await apiService.get<ApiResponse<{ [key: string]: any }>>(`/roster/algorithms/${algorithmType}/parameters`);
      return response.data;
    } catch (err) {
      console.error(`Failed to fetch parameters for ${algorithmType}, using defaults:`, err);
      // Fallback parameters for genetic algorithm
      if (algorithmType === 'GENETIC_ALGORITHM') {
        return {
          populationSize: 50,
          maxGenerations: 1000,
          mutationRate: 0.1,
          crossoverRate: 0.8,
          eliteRate: 0.1,
          tournamentSize: 5,
          stagnationLimit: 100
        };
      }
      return {};
    }
  },

  // Health check
  healthCheck: async (): Promise<string> => {
    const response = await apiService.get<ApiResponse<string>>('/roster/health');
    return response.data;
  }
};