import React from 'react';
import { MapPin, Building, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { mockLocations } from '../data/mockData';

const LocationsView: React.FC = () => {
  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital': return <Building className="h-5 w-5 text-blue-600" />;
      case 'clinic': return <Users className="h-5 w-5 text-green-600" />;
      case 'pharmacy': return <MapPin className="h-5 w-5 text-purple-600" />;
      case 'warehouse': return <Building className="h-5 w-5 text-orange-600" />;
      default: return <Building className="h-5 w-5 text-gray-600" />;
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'bg-blue-100 text-blue-800';
      case 'clinic': return 'bg-green-100 text-green-800';
      case 'pharmacy': return 'bg-purple-100 text-purple-800';
      case 'warehouse': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Location Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockLocations.map((location) => (
            <div key={location.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getLocationTypeIcon(location.type)}
                  <h3 className="font-semibold text-gray-900">{location.name}</h3>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLocationTypeColor(location.type)}`}>
                  {location.type}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{location.address}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{location.totalDrugs.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Drugs</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{location.lowStockAlerts}</p>
                  <p className="text-sm text-gray-600">Low Stock</p>
                </div>
              </div>
              
              {location.lowStockAlerts > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      {location.lowStockAlerts} low stock alert{location.lowStockAlerts > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  View Details
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                  Manage Stock
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Location Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {mockLocations.reduce((sum, loc) => sum + loc.totalDrugs, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Inventory</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Building className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {mockLocations.filter(loc => loc.type === 'hospital').length}
            </p>
            <p className="text-sm text-gray-600">Hospitals</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {mockLocations.filter(loc => loc.type === 'clinic').length}
            </p>
            <p className="text-sm text-gray-600">Clinics</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">
              {mockLocations.reduce((sum, loc) => sum + loc.lowStockAlerts, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationsView;