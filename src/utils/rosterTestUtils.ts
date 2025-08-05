// Utility functions for testing roster API endpoints
import { rosterService } from '../services/rosterService';

export const testRosterEndpoints = async () => {
  console.log('🧪 Testing Roster API Endpoints...');
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const health = await rosterService.healthCheck();
    console.log('✅ Health check:', health);
  } catch (err) {
    console.error('❌ Health check failed:', err);
  }

  try {
    // Test algorithms endpoint
    console.log('Testing algorithms endpoint...');
    const algorithms = await rosterService.getAvailableAlgorithms();
    console.log('✅ Available algorithms:', algorithms);
    
    if (algorithms.length > 0) {
      // Test algorithm parameters endpoint
      console.log('Testing algorithm parameters endpoint...');
      const params = await rosterService.getAlgorithmParameters(algorithms[0].name);
      console.log('✅ Algorithm parameters:', params);
    }
  } catch (err) {
    console.error('❌ Algorithms test failed:', err);
  }
};

// Example of the JSON format that will be sent to backend
export const showExampleRosterRequest = () => {
  const exampleRequest = {
    "departmentId": 1,
    "startDate": "2025-08-05",
    "endDate": "2025-08-11",
    "algorithmType": "GENETIC_ALGORITHM",
    "algorithmParameters": {
      "populationSize": 50,
      "maxGenerations": 1000,
      "mutationRate": 0.1,
      "crossoverRate": 0.8,
      "eliteRate": 0.1,
      "tournamentSize": 5,
      "stagnationLimit": 100
    },
    "maxExecutionTimeMinutes": 10,
    "enableParallelProcessing": true
  };
  
  console.log('📋 Example Roster Generation Request JSON:');
  console.log(JSON.stringify(exampleRequest, null, 2));
  return exampleRequest;
};

// Function to be called from browser console for debugging
(window as any).testRosterEndpoints = testRosterEndpoints;
(window as any).showExampleRosterRequest = showExampleRosterRequest;
