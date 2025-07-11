import React, { useState } from 'react';
import { Shield, Search, CheckCircle, AlertCircle, Clock, Link } from 'lucide-react';
import { mockDrugs, mockTransactions } from '../data/mockData';

const BlockchainVerification: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleVerify = (drugId: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setSelectedDrug(drugId);
      setIsScanning(false);
    }, 2000);
  };

  const simulateQRScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const randomDrug = mockDrugs[Math.floor(Math.random() * mockDrugs.length)];
      setSelectedDrug(randomDrug.id);
      setSearchQuery(randomDrug.batchId);
      setIsScanning(false);
    }, 3000);
  };

  const filteredDrugs = mockDrugs.filter(drug =>
    drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drug.batchId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDrugData = mockDrugs.find(drug => drug.id === selectedDrug);
  const drugTransactions = mockTransactions.filter(tx => tx.drugId === selectedDrug);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Blockchain Drug Verification</h2>
        
        {/* Search and QR Scanner */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by drug name or batch ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={simulateQRScan}
            disabled={isScanning}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isScanning ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                <span>Simulate QR Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Drug List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredDrugs.map((drug) => (
            <div key={drug.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{drug.name}</h3>
                <div className={`p-1 rounded-full ${
                  drug.status === 'verified' ? 'bg-green-100' : 
                  drug.status === 'expired' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  {drug.status === 'verified' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Batch: {drug.batchId}</p>
              <p className="text-sm text-gray-600 mb-3">{drug.manufacturer}</p>
              <button
                onClick={() => handleVerify(drug.id)}
                disabled={isScanning}
                className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 text-sm font-medium"
              >
                {isScanning && selectedDrug === drug.id ? 'Verifying...' : 'Verify on Blockchain'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Results */}
      {selectedDrugData && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Results</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Drug Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  selectedDrugData.status === 'verified' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {selectedDrugData.status === 'verified' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedDrugData.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{selectedDrugData.status}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Batch ID</p>
                  <p className="font-medium">{selectedDrugData.batchId}</p>
                </div>
                <div>
                  <p className="text-gray-600">Manufacturer</p>
                  <p className="font-medium">{selectedDrugData.manufacturer}</p>
                </div>
                <div>
                  <p className="text-gray-600">Expiry Date</p>
                  <p className="font-medium">{new Date(selectedDrugData.expiryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Current Location</p>
                  <p className="font-medium">{selectedDrugData.location}</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Blockchain Hash</p>
                <p className="font-mono text-xs text-gray-800 break-all">{selectedDrugData.blockchainHash}</p>
              </div>
            </div>

            {/* Transaction History */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Transaction History</h4>
              <div className="space-y-3">
                {drugTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`p-1 rounded-full ${
                        transaction.verified ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {transaction.type === 'manufacture' && <Clock className="h-4 w-4 text-blue-600" />}
                        {transaction.type === 'shipment' && <Link className="h-4 w-4 text-orange-600" />}
                        {transaction.type === 'delivery' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {transaction.type === 'verification' && <Shield className="h-4 w-4 text-purple-600" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 capitalize">{transaction.type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{transaction.from} → {transaction.to}</p>
                      <p className="text-xs text-gray-500 font-mono">{transaction.hash.substring(0, 20)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainVerification;