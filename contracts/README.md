# Smart Contract Deployment Guide

## Prerequisites
1. Install MetaMask browser extension
2. Get test ETH from Sepolia faucet: https://sepoliafaucet.com/
3. Access Remix IDE: https://remix.ethereum.org/

## Deployment Steps

### 1. Deploy on Remix + Sepolia Testnet

1. **Open Remix IDE**
   - Go to https://remix.ethereum.org/
   - Create new file: `DrugRegister.sol`
   - Copy the contract code from `DrugRegister.sol`

2. **Compile Contract**
   - Go to "Solidity Compiler" tab
   - Select compiler version: 0.8.19+
   - Click "Compile DrugRegister.sol"

3. **Deploy Contract**
   - Go to "Deploy & Run Transactions" tab
   - Environment: "Injected Provider - MetaMask"
   - Make sure MetaMask is connected to Sepolia testnet
   - Select contract: "DrugRegister"
   - Click "Deploy"
   - Confirm transaction in MetaMask

4. **Get Contract Address**
   - After deployment, copy the contract address
   - Update `VITE_CONTRACT_ADDRESS` in your `.env` file

### 2. Local Development with Ganache

1. **Install Ganache**
   ```bash
   npm install -g ganache-cli
   ```

2. **Start Ganache**
   ```bash
   ganache-cli --deterministic --accounts 10 --host 0.0.0.0 --port 8545
   ```

3. **Deploy to Ganache**
   - In Remix, change environment to "Web3 Provider"
   - Connect to http://localhost:8545
   - Deploy the contract

### 3. Contract Interaction

The contract provides these main functions:

- `registerDrug(name, batchId, manufacturer)`: Register a new drug
- `getDrug(batchId)`: Get drug information
- `verifyDrug(batchId)`: Verify a drug exists
- `isDrugRegistered(batchId)`: Check if drug is registered

### 4. Frontend Integration

Update your `.env` file:
```
VITE_CONTRACT_ADDRESS=0x_your_deployed_contract_address
VITE_GEMINI_API_KEY=your_gemini_api_key
```

The frontend will automatically connect to MetaMask and interact with your deployed contract.