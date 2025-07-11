import React, { useState } from 'react';
import { Plus, Wallet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import blockchainService from '../services/blockchain';

const RegisterDrug: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    batchId: '',
    manufacturer: ''
  });
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [contractStatus, setContractStatus] = useState<any>(null);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const info = await blockchainService.connectWallet();
      setWalletInfo(info);
      setContractStatus(blockchainService.getContractStatus());
      blockchainService.setupEventListeners();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setError(null);
    setRegistrationResult(null);

    try {
      // Check contract status before proceeding
      const status = blockchainService.getContractStatus();
      console.log('Contract status:', status);
      
      if (!status.hasContract) {
        console.log('Initializing contract...');
        const initialized = await blockchainService.initializeContract();
        if (!initialized) {
          throw new Error('Failed to initialize smart contract. Please check your network connection.');
        }
      }

      const result = await blockchainService.registerDrug(
        formData.name,
        formData.batchId,
        formData.manufacturer
      );
      
      setRegistrationResult(result);
      setFormData({ name: '', batchId: '', manufacturer: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to register drug');
    } finally {
      setIsRegistering(false);
    }
  };

  const isFormValid = formData.name && formData.batchId && formData.manufacturer;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Register Drug on Blockchain</h2>
        
        {/* Wallet Connection */}
        <div className="mb-6">
          {!walletInfo ? (
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <Wallet className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-4">
                Connect your MetaMask wallet to register drugs on the blockchain
              </p>
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                {isConnecting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    <span>Connect MetaMask</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Wallet Connected</p>
                  <p className="text-sm text-green-700">
                    {walletInfo.address.substring(0, 6)}...{walletInfo.address.substring(38)}
                  </p>
                  <p className="text-sm text-green-700">
                    Balance: {parseFloat(walletInfo.balance).toFixed(4)} ETH
                  </p>
                  {contractStatus && (
                    <p className="text-xs text-green-600 mt-1">
                      Contract: {contractStatus.hasContract ? '✅ Ready' : '❌ Not initialized'}
                      {contractStatus.contractAddress && (
                        <span className="ml-2">({contractStatus.contractAddress.substring(0, 8)}...)</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Registration Form */}
        {walletInfo && (
          <form onSubmit={handleRegisterDrug} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Drug Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Paracetamol 500mg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-1">
                Batch ID *
              </label>
              <input
                type="text"
                id="batchId"
                name="batchId"
                value={formData.batchId}
                onChange={handleInputChange}
                placeholder="e.g., PC-2024-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer *
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="e.g., PharmaCorp Ltd"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isRegistering}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isRegistering ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Registering on Blockchain...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Register Drug</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Success Display */}
        {registrationResult && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="font-medium text-green-900">Drug Registered Successfully!</p>
            </div>
            <div className="text-sm text-green-800 space-y-1">
              <p><strong>Transaction Hash:</strong> {registrationResult.transactionHash}</p>
              <p><strong>Block Number:</strong> {registrationResult.blockNumber}</p>
              <p><strong>Gas Used:</strong> {registrationResult.gasUsed}</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-3">How to Register Drugs</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Connect your MetaMask wallet to the Ethereum network</li>
          <li>Ensure you have sufficient ETH for gas fees</li>
          <li>Make sure you're connected to the correct network (Sepolia testnet recommended)</li>
          <li>Fill in the drug details (name, batch ID, manufacturer)</li>
          <li>Click "Register Drug" and confirm the transaction in MetaMask</li>
          <li>Wait for blockchain confirmation (usually 1-2 minutes)</li>
        </ol>
        <p className="mt-4 text-sm text-blue-700">
          <strong>Note:</strong> Each drug registration creates a permanent, immutable record on the blockchain
          that can be verified by anyone in the supply chain.
        </p>
        <p className="mt-2 text-sm text-blue-700">
          <strong>Troubleshooting:</strong> If you see "Contract not initialized", try refreshing the page and reconnecting your wallet.
        </p>
      </div>
    </div>
  );
};

export default RegisterDrug;