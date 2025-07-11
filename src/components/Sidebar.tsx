import React from 'react';
import { 
  LayoutDashboard, 
  Shield, 
  MessageSquare, 
  MapPin, 
  Settings, 
  HelpCircle,
  TrendingUp,
  Package,
  Plus,
  Search,
  Sparkles,
  AlertTriangle,
  ShoppingCart
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'blockchain', label: 'Blockchain Verification', icon: Shield },
    { id: 'register', label: 'Register Drug', icon: Plus },
    { id: 'verify', label: 'Verify Drug', icon: Search },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
    { id: 'nlp', label: 'NLP Assistant', icon: MessageSquare },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'reorders', label: 'Reorders', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;