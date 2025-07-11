# MedChain - Healthcare Supply Chain Integrity Platform

A comprehensive blockchain-powered platform for healthcare supply chain integrity, drug authenticity verification, and AI-driven inventory management.

## 🚀 Features

### 🔗 Blockchain Integration
- **Ethereum Smart Contracts**: Immutable drug registration and verification
- **MetaMask Integration**: Secure wallet connectivity for blockchain transactions
- **Drug Traceability**: Complete supply chain transparency from manufacturer to patient

### 🤖 AI-Powered Analytics
- **Gemini Pro Integration**: Advanced AI assistant for supply chain optimization
- **Demand Forecasting**: Predictive analytics for inventory management
- **Natural Language Processing**: Voice and chat interface for rural health workers

### 📊 Comprehensive Dashboard
- **Real-time Inventory Tracking**: Multi-location inventory management
- **Blockchain Verification**: QR code scanning and batch ID verification
- **Analytics & Reporting**: Advanced charts and insights

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Ethers.js** for blockchain interaction
- **Vite** for development and building

### Backend
- **FastAPI** (Python) for REST API
- **SQLite** for local database
- **Google Generative AI** (Gemini Pro) for AI features

### Blockchain
- **Solidity** smart contracts
- **Ethereum** network (Sepolia testnet)
- **MetaMask** for wallet integration

## 📁 Project Structure

```
medchain/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── services/          # API and blockchain services
│   ├── types/             # TypeScript type definitions
│   └── data/              # Mock data and constants
├── backend/               # FastAPI backend
│   ├── main.py           # Main application file
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Backend container config
├── contracts/            # Solidity smart contracts
│   ├── DrugRegister.sol  # Main drug registration contract
│   ├── DrugRegister.json # Contract ABI
│   └── README.md         # Deployment instructions
├── docker-compose.yml    # Multi-container setup
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MetaMask browser extension
- Gemini API key (optional, for AI features)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd medchain

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 2. Environment Setup

Create `.env` files:

**Frontend (.env):**
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_BACKEND_URL=http://localhost:8000
```

**Backend (backend/.env):**
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///./medchain.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Deploy Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create new file: `DrugRegister.sol`
3. Copy contract code from `contracts/DrugRegister.sol`
4. Compile with Solidity 0.8.19+
5. Deploy to Sepolia testnet via MetaMask
6. Copy contract address to `.env` file

### 4. Start Development Servers

**Option A: Manual Start**
```bash
# Terminal 1: Start backend
cd backend
python main.py

# Terminal 2: Start frontend
npm run dev
```

**Option B: Docker Compose**
```bash
# Start all services
docker-compose up --build
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Configuration

### Gemini AI Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to environment variables
3. AI features will use mock responses if key is not provided

### MetaMask Setup
1. Install MetaMask extension
2. Switch to Sepolia testnet
3. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
4. Connect wallet in the application

### Backend API Endpoints

- `GET /health` - Health check
- `POST /inventory/update` - Update inventory
- `GET /inventory/{location}` - Get inventory by location
- `GET /predict-demand` - Get demand predictions
- `POST /ai/chat` - Chat with AI assistant

## 🧪 Testing

### Smart Contract Testing
```bash
# Deploy to local Ganache
ganache-cli --deterministic --accounts 10

# Test contract functions in Remix
```

### API Testing
```bash
# Test backend endpoints
curl http://localhost:8000/health
curl http://localhost:8000/inventory/all
```

## 🚀 Deployment

### Production Deployment
1. **Frontend**: Deploy to Vercel, Netlify, or similar
2. **Backend**: Deploy to Railway, Heroku, or cloud provider
3. **Smart Contract**: Deploy to Ethereum mainnet
4. **Database**: Use PostgreSQL or MongoDB for production

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review API documentation at `/docs` endpoint

## 🔮 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-chain blockchain support
- [ ] IoT device integration
- [ ] Advanced AI models for demand prediction
- [ ] Real-time notifications system#   M e d C h a i n  
 