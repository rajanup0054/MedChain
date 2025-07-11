import { Drug, InventoryLocation, DemandForecast, BlockchainTransaction, NLPCommand } from '../types';

export const mockDrugs: Drug[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    manufacturer: 'PharmaCorp Ltd',
    batchId: 'PC-2024-001',
    expiryDate: '2025-12-31',
    quantity: 1250,
    location: 'Central Hospital',
    status: 'verified',
    blockchainHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    qrCode: 'QR-PC-2024-001'
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    manufacturer: 'MediLab Inc',
    batchId: 'ML-2024-045',
    expiryDate: '2025-08-15',
    quantity: 480,
    location: 'Rural Clinic A',
    status: 'verified',
    blockchainHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    qrCode: 'QR-ML-2024-045'
  },
  {
    id: '3',
    name: 'Ibuprofen 400mg',
    manufacturer: 'HealthTech Solutions',
    batchId: 'HT-2024-128',
    expiryDate: '2024-12-20',
    quantity: 75,
    location: 'City Pharmacy',
    status: 'verified',
    blockchainHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    qrCode: 'QR-HT-2024-128'
  },
  {
    id: '4',
    name: 'Aspirin 325mg',
    manufacturer: 'Global Pharma',
    batchId: 'GP-2024-089',
    expiryDate: '2026-01-10',
    quantity: 25,
    location: 'Rural Clinic B',
    status: 'verified',
    blockchainHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    qrCode: 'QR-GP-2024-089'
  },
  {
    id: '5',
    name: 'Metformin 500mg',
    manufacturer: 'DiabetesCare Ltd',
    batchId: 'DC-2024-156',
    expiryDate: '2025-11-28',
    quantity: 890,
    location: 'Regional Hospital',
    status: 'verified',
    blockchainHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    qrCode: 'QR-DC-2024-156'
  },
  {
    id: '6',
    name: 'Ciprofloxacin 500mg',
    manufacturer: 'AntiBio Labs',
    batchId: 'AB-2024-067',
    expiryDate: '2024-12-25',
    quantity: 15,
    location: 'Rural Clinic A',
    status: 'verified',
    blockchainHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
    qrCode: 'QR-AB-2024-067'
  },
  {
    id: '7',
    name: 'Paracetamol 500mg',
    manufacturer: 'PharmaCorp Ltd',
    batchId: 'PC-2023-123',
    expiryDate: '2025-06-15',
    quantity: 2100,
    location: 'Medical Warehouse',
    status: 'verified',
    blockchainHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    qrCode: 'QR-PC-2023-123'
  },
  {
    id: '8',
    name: 'Aspirin 325mg',
    manufacturer: 'Global Pharma',
    batchId: 'GP-2024-089',
    expiryDate: '2024-12-31',
    quantity: 8,
    location: 'City Pharmacy',
    status: 'verified',
    blockchainHash: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    qrCode: 'QR-GP-2024-089'
  }
];

export const mockLocations: InventoryLocation[] = [
  {
    id: '1',
    name: 'Central Hospital',
    address: '123 Medical Center Blvd, Capital City',
    type: 'hospital',
    totalDrugs: 2840,
    lowStockAlerts: 3
  },
  {
    id: '2',
    name: 'Rural Clinic A',
    address: '456 Village Road, Rural District',
    type: 'clinic',
    totalDrugs: 680,
    lowStockAlerts: 8
  },
  {
    id: '3',
    name: 'City Pharmacy',
    address: '789 Main Street, Downtown',
    type: 'pharmacy',
    totalDrugs: 1520,
    lowStockAlerts: 2
  },
  {
    id: '4',
    name: 'Regional Hospital',
    address: '321 Healthcare Ave, Regional Hub',
    type: 'hospital',
    totalDrugs: 4200,
    lowStockAlerts: 1
  },
  {
    id: '5',
    name: 'Medical Warehouse',
    address: '654 Supply Chain Dr, Industrial Zone',
    type: 'warehouse',
    totalDrugs: 12500,
    lowStockAlerts: 0
  }
];

export const mockForecasts: DemandForecast[] = [
  {
    drugName: 'Paracetamol 500mg',
    location: 'Central Hospital',
    currentStock: 1250,
    predictedDemand: 1800,
    daysUntilStockout: 18,
    confidence: 0.92,
    trend: 'increasing'
  },
  {
    drugName: 'Amoxicillin 250mg',
    location: 'Rural Clinic A',
    currentStock: 480,
    predictedDemand: 320,
    daysUntilStockout: 45,
    confidence: 0.87,
    trend: 'stable'
  },
  {
    drugName: 'Aspirin 325mg',
    location: 'Rural Clinic B',
    currentStock: 25,
    predictedDemand: 180,
    daysUntilStockout: 4,
    confidence: 0.95,
    trend: 'increasing'
  },
  {
    drugName: 'Metformin 500mg',
    location: 'Regional Hospital',
    currentStock: 890,
    predictedDemand: 650,
    daysUntilStockout: 41,
    confidence: 0.89,
    trend: 'decreasing'
  }
];

export const mockTransactions: BlockchainTransaction[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00Z',
    type: 'manufacture',
    drugId: '1',
    drugName: 'Paracetamol 500mg',
    from: 'PharmaCorp Manufacturing',
    to: 'Distribution Center',
    hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    verified: true
  },
  {
    id: '2',
    timestamp: '2024-01-16T14:45:00Z',
    type: 'shipment',
    drugId: '1',
    drugName: 'Paracetamol 500mg',
    from: 'Distribution Center',
    to: 'Central Hospital',
    hash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    verified: true
  },
  {
    id: '3',
    timestamp: '2024-01-17T09:15:00Z',
    type: 'delivery',
    drugId: '2',
    drugName: 'Amoxicillin 250mg',
    from: 'MediLab Distribution',
    to: 'Rural Clinic A',
    hash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    verified: true
  },
  {
    id: '4',
    timestamp: '2024-01-18T16:20:00Z',
    type: 'verification',
    drugId: '4',
    drugName: 'Aspirin 325mg',
    from: 'QR Scanner',
    to: 'Rural Clinic B',
    hash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    verified: true
  }
];

export const mockNLPCommands: NLPCommand[] = [
  {
    id: '1',
    timestamp: '2024-01-18T10:15:00Z',
    input: 'Check stock for paracetamol',
    command: 'check_stock',
    response: 'Current stock: 1,250 units of Paracetamol 500mg at Central Hospital. Status: Normal levels.',
    confidence: 0.95
  },
  {
    id: '2',
    timestamp: '2024-01-18T11:30:00Z',
    input: 'Reorder aspirin we are running low',
    command: 'reorder',
    response: 'Reorder request submitted for Aspirin 325mg. Recommended quantity: 500 units. Expected delivery: 3-5 days.',
    confidence: 0.88
  },
  {
    id: '3',
    timestamp: '2024-01-18T14:45:00Z',
    input: 'Report shortage of amoxicillin in rural clinic',
    command: 'report_shortage',
    response: 'Shortage report logged for Amoxicillin 250mg at Rural Clinic A. Priority: High. Nearest supply: Regional Hospital (480 units available).',
    confidence: 0.92
  }
];