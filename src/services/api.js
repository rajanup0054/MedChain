import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

class APIService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        // Return mock data if backend is not available
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          return this.getMockResponse(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  getMockResponse(config) {
    const { method, url } = config;
    
    // Mock responses for different endpoints
    if (method === 'get' && url.includes('/inventory/')) {
      const location = url.split('/').pop();
      return {
        data: {
          location,
          drugs: [
            { name: 'Paracetamol 500mg', quantity: 1250, lastUpdated: new Date().toISOString() },
            { name: 'Amoxicillin 250mg', quantity: 480, lastUpdated: new Date().toISOString() },
            { name: 'Aspirin 325mg', quantity: 25, lastUpdated: new Date().toISOString() }
          ],
          totalItems: 3,
          lastSync: new Date().toISOString()
        }
      };
    }
    
    if (method === 'post' && url.includes('/inventory/update')) {
      return {
        data: {
          success: true,
          message: 'Inventory updated successfully',
          timestamp: new Date().toISOString()
        }
      };
    }
    
    if (method === 'get' && url.includes('/predict-demand')) {
      return {
        data: {
          predictions: [
            { drug: 'Paracetamol 500mg', predicted_demand: 2400, confidence: 0.92, trend: 'increasing' },
            { drug: 'Amoxicillin 250mg', predicted_demand: 1800, confidence: 0.87, trend: 'stable' },
            { drug: 'Aspirin 325mg', predicted_demand: 900, confidence: 0.95, trend: 'decreasing' }
          ],
          generated_at: new Date().toISOString()
        }
      };
    }
    
    return { data: { message: 'Mock response - backend not available' } };
  }

  async updateInventory(location, drugName, quantity) {
    try {
      const response = await this.client.post('/inventory/update', {
        location,
        drugName,
        quantity,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update inventory:', error);
      throw error;
    }
  }

  async getInventory(location) {
    try {
      const response = await this.client.get(`/inventory/${location}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get inventory:', error);
      throw error;
    }
  }

  async getDemandPrediction(location, drugName, days = 30) {
    try {
      const response = await this.client.get('/predict-demand', {
        params: { location, drug: drugName, days }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get demand prediction:', error);
      throw error;
    }
  }

  async getAllInventory() {
    try {
      const response = await this.client.get('/inventory/all');
      return response.data;
    } catch (error) {
      console.error('Failed to get all inventory:', error);
      throw error;
    }
  }

  async getHealthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return { status: 'offline', message: 'Backend not available' };
    }
  }
}

export default new APIService();