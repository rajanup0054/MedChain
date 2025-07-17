import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, MapPin, Activity, Clock, Plus, Edit, Trash2, Triangle as ExclamationTriangle, Eye, X, Calendar, Building, User, Barcode, DollarSign, FileText } from 'lucide-react';
import { useMedicines, useLocations, useAlerts } from '../hooks/useSupabase';
import { Medicine } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { medicines, loading: medicinesLoading, addMedicine, updateMedicine, deleteMedicine, error: medicinesError } = useMedicines();
  const { locations, error: locationsError } = useLocations();
  const { alerts, error: alertsError } = useAlerts();
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    batch_id: '',
    manufacturer: '',
    quantity: 0,
    expiry_date: '',
    location: '',
    status: 'active' as const
  });

  // Check for any configuration errors
  const hasConfigError = medicinesError?.includes('not configured') || 
                        locationsError?.includes('not configured') || 
                        alertsError?.includes('not configured');

  const hasDatabaseError = medicinesError?.includes('Database tables not found') ||
                          locationsError?.includes('Database tables not found') ||
                          alertsError?.includes('Database tables not found');

  const hasConnectionError = medicinesError?.includes('Cannot connect to Supabase') ||
                            locationsError?.includes('Cannot connect to Supabase') ||
                            alertsError?.includes('Cannot connect to Supabase');

  const totalDrugs = medicines.length;
  const verifiedDrugs = medicines.filter(medicine => medicine.status === 'active').length;
  const expiredDrugs = medicines.filter(medicine => {
    const expiryDate = new Date(medicine.expiry_date);
    return expiryDate < new Date();
  }).length;
  const totalAlerts = alerts.length;
  
  const filteredMedicines = selectedLocation === 'all' 
    ? medicines 
    : medicines.filter(medicine => medicine.location === selectedLocation);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        await updateMedicine(editingMedicine.id, formData);
        setEditingMedicine(null);
      } else {
        await addMedicine(formData);
      }
      setFormData({
        name: '',
        batch_id: '',
        manufacturer: '',
        quantity: 0,
        expiry_date: '',
        location: '',
        status: 'active'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      batch_id: medicine.batch_id,
      manufacturer: medicine.manufacturer,
      quantity: medicine.quantity,
      expiry_date: medicine.expiry_date,
      location: medicine.location,
      status: medicine.status
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      try {
        await deleteMedicine(id);
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  const handleViewDetails = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedMedicine(null);
    setShowDetailsModal(false);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (quantity < 10) return { status: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (quantity < 50) return { status: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (quantity < 100) return { status: 'Moderate', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    return { status: 'Well Stocked', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    
    if (daysUntilExpiry < 0) return { status: 'Expired', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (daysUntilExpiry <= 7) return { status: 'Expires Soon', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (daysUntilExpiry <= 30) return { status: 'Expiring', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'Valid', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  if (medicinesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show configuration error
  if (hasConfigError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6">
        <div className="flex items-center">
          <ExclamationTriangle className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Supabase Configuration Required</h3>
        </div>
        <div className="mt-2">
          <p className="text-red-700">Supabase is not configured. Please set up your environment variables.</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="font-medium text-yellow-800">Configuration Steps:</h4>
            <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
              <li>Create a <code>.env</code> file in your project root</li>
              <li>Add your Supabase URL: <code>VITE_SUPABASE_URL=https://your-project.supabase.co</code></li>
              <li>Add your Supabase anon key: <code>VITE_SUPABASE_ANON_KEY=your-anon-key</code></li>
              <li>Restart your development server</li>
              <li>Run the database migrations in Supabase SQL Editor</li>
            </ol>
            <p className="mt-2 text-sm text-yellow-600">
              See <code>SUPABASE_SETUP.md</code> for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show database setup error
  if (hasDatabaseError) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-md p-6">
        <div className="flex items-center">
          <ExclamationTriangle className="h-5 w-5 text-orange-400 mr-2" />
          <h3 className="text-lg font-medium text-orange-800">Database Setup Required</h3>
        </div>
        <div className="mt-2">
          <p className="text-orange-700">Database tables not found. Please run the database migrations.</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-800">Setup Instructions:</h4>
            <ol className="mt-2 text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Go to your Supabase Dashboard → SQL Editor</li>
              <li>Run the migration: <code>supabase/migrations/create_medicines_schema.sql</code></li>
              <li>Run the sample data: <code>supabase/migrations/insert_sample_data.sql</code></li>
              <li>Refresh this page</li>
            </ol>
            <p className="mt-2 text-sm text-blue-600">
              The migration files are included in your project.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show connection error
  if (hasConnectionError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6">
        <div className="flex items-center">
          <ExclamationTriangle className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Connection Error</h3>
        </div>
        <div className="mt-2">
          <p className="text-red-700">Cannot connect to Supabase. Please check your configuration.</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="font-medium text-yellow-800">Troubleshooting:</h4>
            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
              <li>Check your internet connection</li>
              <li>Verify your Supabase URL and API key are correct</li>
              <li>Make sure your Supabase project is active</li>
              <li>Check browser console for more details</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-900">{totalDrugs.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{verifiedDrugs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{expiredDrugs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{totalAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Medicine Inventory</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location.id} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Medicine</span>
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Medicine Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Batch ID"
                value={formData.batch_id}
                onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="date"
                placeholder="Expiry Date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingMedicine ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMedicine(null);
                    setFormData({
                      name: '',
                      batch_id: '',
                      manufacturer: '',
                      quantity: 0,
                      expiry_date: '',
                      location: '',
                      status: 'active'
                    });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{medicine.name}</div>
                    <div className="text-sm text-gray-500">{medicine.manufacturer}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {medicine.batch_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {medicine.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {medicine.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(medicine.status)}`}>
                      {medicine.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(medicine.expiry_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(medicine)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(medicine)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Medicine"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(medicine.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Medicine"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medicine Details Modal */}
      {showDetailsModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Medicine Stock Details</h2>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Medicine Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedMedicine.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Barcode className="h-4 w-4 mr-1" />
                    Batch: {selectedMedicine.batch_id}
                  </span>
                  <span className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {selectedMedicine.manufacturer}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMedicine.status)}`}>
                    {selectedMedicine.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Stock Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Current Stock */}
                <div className={`p-4 rounded-lg border ${getStockStatus(selectedMedicine.quantity).bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Stock</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedMedicine.quantity.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">units</p>
                    </div>
                    <Package className={`h-8 w-8 ${getStockStatus(selectedMedicine.quantity).color}`} />
                  </div>
                  <div className="mt-2">
                    <span className={`text-sm font-medium ${getStockStatus(selectedMedicine.quantity).color}`}>
                      {getStockStatus(selectedMedicine.quantity).status}
                    </span>
                  </div>
                </div>

                {/* Expiry Status */}
                <div className={`p-4 rounded-lg border ${getExpiryStatus(selectedMedicine.expiry_date).bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expiry Date</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(selectedMedicine.expiry_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getDaysUntilExpiry(selectedMedicine.expiry_date)} days remaining
                      </p>
                    </div>
                    <Calendar className={`h-8 w-8 ${getExpiryStatus(selectedMedicine.expiry_date).color}`} />
                  </div>
                  <div className="mt-2">
                    <span className={`text-sm font-medium ${getExpiryStatus(selectedMedicine.expiry_date).color}`}>
                      {getExpiryStatus(selectedMedicine.expiry_date).status}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="p-4 rounded-lg border bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Location</p>
                      <p className="text-lg font-bold text-gray-900">{selectedMedicine.location}</p>
                      <p className="text-sm text-gray-500">Storage facility</p>
                    </div>
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Product Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medicine Name:</span>
                      <span className="font-medium text-gray-900">{selectedMedicine.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Batch ID:</span>
                      <span className="font-mono text-gray-900">{selectedMedicine.batch_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manufacturer:</span>
                      <span className="font-medium text-gray-900">{selectedMedicine.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMedicine.status)}`}>
                        {selectedMedicine.status.replace('_', ' ')}
                      </span>
                    </div>
                    {selectedMedicine.price && selectedMedicine.price > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="font-medium text-gray-900">${selectedMedicine.price}</span>
                      </div>
                    )}
                    {selectedMedicine.description && (
                      <div>
                        <span className="text-gray-600">Description:</span>
                        <p className="text-gray-900 mt-1">{selectedMedicine.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock Analytics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Stock Analytics
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Quantity:</span>
                      <span className="font-bold text-gray-900">{selectedMedicine.quantity.toLocaleString()} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock Level:</span>
                      <span className={`font-medium ${getStockStatus(selectedMedicine.quantity).color}`}>
                        {getStockStatus(selectedMedicine.quantity).status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Until Expiry:</span>
                      <span className={`font-medium ${getExpiryStatus(selectedMedicine.expiry_date).color}`}>
                        {getDaysUntilExpiry(selectedMedicine.expiry_date)} days
                      </span>
                    </div>
                    {selectedMedicine.price && selectedMedicine.price > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-bold text-green-600">
                          ${(selectedMedicine.quantity * selectedMedicine.price).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-gray-900">
                        {new Date(selectedMedicine.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Added On:</span>
                      <span className="text-gray-900">
                        {new Date(selectedMedicine.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Recommendations */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">📊 Stock Recommendations</h4>
                <div className="space-y-2 text-blue-800">
                  {selectedMedicine.quantity < 10 && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700 font-medium">Critical: Immediate reorder required</span>
                    </div>
                  )}
                  {selectedMedicine.quantity < 50 && selectedMedicine.quantity >= 10 && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-yellow-700 font-medium">Low stock: Consider reordering soon</span>
                    </div>
                  )}
                  {getDaysUntilExpiry(selectedMedicine.expiry_date) <= 30 && getDaysUntilExpiry(selectedMedicine.expiry_date) > 0 && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-orange-700 font-medium">Expiring soon: Use or redistribute first</span>
                    </div>
                  )}
                  {getDaysUntilExpiry(selectedMedicine.expiry_date) < 0 && (
                    <div className="flex items-center space-x-2">
                      <X className="h-4 w-4 text-red-600" />
                      <span className="text-red-700 font-medium">Expired: Remove from circulation immediately</span>
                    </div>
                  )}
                  {selectedMedicine.quantity >= 100 && getDaysUntilExpiry(selectedMedicine.expiry_date) > 30 && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700 font-medium">Optimal stock levels maintained</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    handleEdit(selectedMedicine);
                    closeDetailsModal();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Medicine</span>
                </button>
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-600">
                      {alert.medicines?.name} - {alert.medicines?.location}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;