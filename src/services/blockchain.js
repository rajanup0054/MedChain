import { ethers } from 'ethers';
import DrugRegisterABI from '../../contracts/DrugRegister.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xD4763eD0b2AC82A5fF322715869743C28a98aB52'; // Fallback for demo

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
  }

  async connectWallet() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Always create contract instance (use fallback if needed)
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DrugRegisterABI.abi,
        this.signer
      );
      
      this.isConnected = true;
      
      // Get account info
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      
      return {
        address,
        balance: ethers.formatEther(balance),
        network: await this.provider.getNetwork()
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async registerDrug(name, batchId, manufacturer) {
    try {
      if (!this.contract) {
        // Try to reconnect and initialize contract
        await this.connectWallet();
        if (!this.contract) {
          throw new Error('Contract not initialized. Please connect wallet first.');
        }
      }

      // Check if we're on the right network (optional)
      const network = await this.provider.getNetwork();
      console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);

      const tx = await this.contract.registerDrug(name, batchId, manufacturer);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to register drug:', error);
      throw error;
    }
  }

  async getDrug(batchId) {
    try {
      if (!this.contract) {
        await this.connectWallet();
        if (!this.contract) {
          throw new Error('Contract not initialized. Please connect wallet first.');
        }
      }

      const result = await this.contract.getDrug(batchId);
      
      if (!result.exists) {
        return null;
      }

      return {
        name: result.name,
        batchId: result.batchId,
        manufacturer: result.manufacturer,
        timestamp: new Date(Number(result.timestamp) * 1000),
        registeredBy: result.registeredBy,
        exists: result.exists
      };
    } catch (error) {
      console.error('Failed to get drug:', error);
      throw error;
    }
  }

  async verifyDrug(batchId) {
    try {
      if (!this.contract) {
        await this.connectWallet();
        if (!this.contract) {
          throw new Error('Contract not initialized. Please connect wallet first.');
        }
      }

      const tx = await this.contract.verifyDrug(batchId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to verify drug:', error);
      throw error;
    }
  }

  async isDrugRegistered(batchId) {
    try {
      if (!this.contract) {
        await this.connectWallet();
        if (!this.contract) {
          throw new Error('Contract not initialized. Please connect wallet first.');
        }
      }

      return await this.contract.isDrugRegistered(batchId);
    } catch (error) {
      console.error('Failed to check drug registration:', error);
      throw error;
    }
  }

  async getWalletInfo() {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      const network = await this.provider.getNetwork();

      return {
        address,
        balance: ethers.formatEther(balance),
        network: {
          name: network.name,
          chainId: network.chainId
        }
      };
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      throw error;
    }
  }

  // Listen for account changes
  setupEventListeners() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          // Reconnect with new account
          this.connectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        // Reload the page when chain changes
        window.location.reload();
      });
    }
  }

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
  }
  
  // Add method to check contract status
  getContractStatus() {
    return {
      isConnected: this.isConnected,
      hasContract: !!this.contract,
      contractAddress: CONTRACT_ADDRESS,
      hasProvider: !!this.provider,
      hasSigner: !!this.signer
    };
  }
  
  // Add method to manually initialize contract
  async initializeContract() {
    try {
      if (!this.signer) {
        await this.connectWallet();
      }
      
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DrugRegisterABI.abi,
        this.signer
      );
      
      return true;
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      return false;
    }
  }
}

export default new BlockchainService();