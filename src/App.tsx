import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BlockchainVerification from './components/BlockchainVerification';
import NLPInterface from './components/NLPInterface';
import LocationsView from './components/LocationsView';
import RegisterDrug from './components/RegisterDrug';
import VerifyDrug from './components/VerifyDrug';
import AiAssistant from './components/AiAssistant';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'blockchain':
        return <BlockchainVerification />;
      case 'register':
        return <RegisterDrug />;
      case 'verify':
        return <VerifyDrug />;
      case 'ai':
        return <AiAssistant />;
      case 'nlp':
        return <NLPInterface />;
      case 'locations':
        return <LocationsView />;
      case 'analytics':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
            <p className="text-gray-600">Advanced analytics and reporting features coming soon...</p>
          </div>
        );
      case 'inventory':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory Management</h2>
            <p className="text-gray-600">Advanced inventory management features coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">System configuration and preferences coming soon...</p>
          </div>
        );
      case 'help':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Help & Support</h2>
            <p className="text-gray-600">Documentation and support resources coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;