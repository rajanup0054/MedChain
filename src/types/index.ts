export interface Drug {
  id: string;
  name: string;
  manufacturer: string;
  batchId: string;
  expiryDate: string;
  quantity: number;
  location: string;
  status: 'verified' | 'pending' | 'expired' | 'counterfeit';
  blockchainHash: string;
  qrCode: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  address: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'warehouse';
  totalDrugs: number;
  lowStockAlerts: number;
}

export interface DemandForecast {
  drugName: string;
  location: string;
  currentStock: number;
  predictedDemand: number;
  daysUntilStockout: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface BlockchainTransaction {
  id: string;
  timestamp: string;
  type: 'manufacture' | 'shipment' | 'delivery' | 'verification';
  drugId: string;
  drugName: string;
  from: string;
  to: string;
  hash: string;
  verified: boolean;
}

export interface NLPCommand {
  id: string;
  timestamp: string;
  input: string;
  command: 'check_stock' | 'reorder' | 'report_shortage' | 'verify_drug';
  response: string;
  confidence: number;
}