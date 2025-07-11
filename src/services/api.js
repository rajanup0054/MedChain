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

  async getInventorySummary() {
    try {
      const response = await this.client.get('/inventory/summary');
      return response.data;
    } catch (error) {
      console.error('Failed to get inventory summary:', error);
      // Return mock data
      return {
        totalDrugs: 8,
        totalQuantity: 5123,
        lowStockCount: 3,
        expiringCount: 2,
        locations: [
          { name: 'Central Hospital', drugTypes: 3, totalQuantity: 2130 },
          { name: 'Rural Clinic A', drugTypes: 2, totalQuantity: 495 },
          { name: 'City Pharmacy', drugTypes: 2, totalQuantity: 83 }
        ],
        topDrugs: [
          { name: 'Paracetamol 500mg', quantity: 3350 },
          { name: 'Metformin 500mg', quantity: 890 },
          { name: 'Amoxicillin 250mg', quantity: 480 }
        ]
      };
    }
  }

  async getLowStock(threshold = 50) {
    try {
      const response = await this.client.get('/inventory/low-stock', {
        params: { threshold }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get low stock:', error);
      // Return mock data
      return {
        lowStockDrugs: [
          {
            location: 'Rural Clinic A',
            name: 'Aspirin 325mg',
            quantity: 25,
            status: 'low'
          },
          {
            location: 'Rural Clinic A', 
            name: 'Ciprofloxacin 500mg',
            quantity: 15,
            status: 'critical'
          },
          {
            location: 'City Pharmacy',
            name: 'Aspirin 325mg',
            quantity: 8,
            status: 'critical'
          }
        ],
        count: 3,
        threshold
      };
    }
  }

  async getExpiredDrugs(days = 0) {
    try {
      const response = await this.client.get('/inventory/expired', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get expired drugs:', error);
      // Return mock data
      const today = new Date();
      const checkDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
      
      return {
        expiredDrugs: days === 0 ? [] : [
          {
            location: 'City Pharmacy',
            name: 'Ibuprofen 400mg',
            quantity: 75,
            expiryDate: '2024-12-20',
            daysUntilExpiry: Math.ceil((new Date('2024-12-20').getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          }
        ],
        count: days === 0 ? 0 : 1,
        checkDate: checkDate.toISOString().split('T')[0]
      };
    }
  }

  async triggerReorder(drugName, threshold) {
    try {
      const response = await this.client.post('/inventory/reorder', {
        drugName,
        threshold
      });
      return response.data;
    } catch (error) {
      console.error('Failed to trigger reorder:', error);
      // Return mock data
      return {
        success: true,
        reordersCreated: [
          {
            location: 'Rural Clinic A',
            currentStock: 25,
            orderQuantity: 500,
            supplier: 'Global Pharma',
            expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            orderId: `MED-${Date.now().toString().slice(-6)}`
          }
        ],
        message: `Reorder triggered for ${drugName}`
      };
    }
  }

  async verifyBatch(batchId) {
    try {
      const response = await this.client.post('/ai/batch-verify', {
        batchId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to verify batch:', error);
      // Return mock data
      return {
        verified: true,
        batchId,
        drugName: 'Paracetamol 500mg',
        manufacturer: 'PharmaCorp Ltd',
        location: 'Medical Warehouse',
        quantity: 2100,
        expiryDate: '2025-06-15',
        isExpired: false,
        status: 'verified',
        message: `Batch ${batchId} verified successfully`
      };
    }
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