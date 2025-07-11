import React, { useState } from 'react';
import { Search, Shield, CheckCircle, AlertCircle, Clock, User, Calendar } from 'lucide-react';
import blockchainService from '../services/blockchain';

const VerifyDrug: React.FC = () => {
  const [batchId, setBatchId] = useState('');
  const [drugInfo, setDrugInfo] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);

  const handleConnectWallet = async () => {
    try {
      await blockchainService.connectWallet();
      setWalletConnected(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleVerifyDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId.trim()) return;

    setIsVerifying(true);
    setError(null);
    setDrugInfo(null);

    try {
      if (!blockchainService.isConnected) {
        await blockchainService.connectWallet();
        setWalletConnected(true);
      }

      const drug = await blockchainService.getDrug(batchId.trim());
      
      if (drug) {
        setDrugInfo(drug);
        // Also call verify function to log the verification
        await blockchainService.verifyDrug(batchId.trim());
      } else {
        setError('Drug not found on blockchain. Please check the batch ID.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify drug');
    } finally {
      setIsVerifying(false);
    }
  };

  const quickVerifyExamples = [
    { batchId: 'PC-2024-001', name: 'Paracetamol 500mg' },
    { batchId: 'ML-2024-045', name: 'Amoxicillin 250mg' },
    { batchId: 'HT-2024-128', name: 'Ibuprofen 400mg' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Verify Drug Authenticity</h2>
        
        {/* Wallet Connection Status */}
        {!walletConnected && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800">Wallet not connected</span>
              </div>
              <button
                onClick={handleConnectWallet}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerifyDrug} className="mb-6">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="Enter batch ID (e.g., PC-2024-001)"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={!batchId.trim() || isVerifying}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Verify Examples */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Quick verify examples:</p>
          <div className="flex flex-wrap gap-2">
            {quickVerifyExamples.map((example) => (
              <button
                key={example.batchId}
                onClick={() => setBatchId(example.batchId)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                {example.batchId} - {example.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Drug Information Display */}
        {drugInfo && (
          <div className="bg-green-50 rounded-lg border border-green-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-900">Drug Verified Successfully</h3>
                <p className="text-green-700">This drug is authentic and registered on the blockchain</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drug Name</label>
                  <p className="text-lg font-semibold text-gray-900">{drugInfo.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
                  <p className="font-mono text-gray-900">{drugInfo.batchId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <p className="text-gray-900">{drugInfo.manufacturer}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                    <p className="text-gray-900">{drugInfo.timestamp.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Time</label>
                    <p className="text-gray-900">{drugInfo.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registered By</label>
                    <p className="font-mono text-sm text-gray-900">
                      {drugInfo.registeredBy.substring(0, 6)}...{drugInfo.registeredBy.substring(38)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
              <h4 className="font-medium text-gray-900 mb-2">Blockchain Verification</h4>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">
                  This drug has been verified on the Ethereum blockchain and is authentic.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-3">How Drug Verification Works</h3>
        <div className="space-y-3 text-blue-800">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-medium text-blue-900 mt-0.5">
              1
            </div>
            <p>Enter the batch ID found on the drug packaging or QR code</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-medium text-blue-900 mt-0.5">
              2
            </div>
            <p>The system queries the Ethereum blockchain for drug registration data</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-medium text-blue-900 mt-0.5">
              3
            </div>
            <p>Verification results show authenticity, manufacturer details, and registration history</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-blue-700">
          <strong>Security:</strong> All drug data is stored immutably on the blockchain, 
          making it impossible to counterfeit or tamper with registration records.
        </p>
      </div>
    </div>
  );
};

export default VerifyDrug;