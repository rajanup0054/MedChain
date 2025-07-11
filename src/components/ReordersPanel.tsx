import React from 'react';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useReorders } from '../hooks/useSupabase';

const ReordersPanel: React.FC = () => {
  const { reorders, loading, updateReorderStatus } = useReorders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'ordered':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'ordered':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (reorderId: string, newStatus: string) => {
    try {
      await updateReorderStatus(reorderId, newStatus as any);
    } catch (error) {
      console.error('Error updating reorder status:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Reorders</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {reorders.length} total
        </span>
      </div>

      {reorders.length === 0 ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No reorders found</p>
          <p className="text-sm text-gray-400">Reorders will appear here when created</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reorders.map((reorder) => (
            <div key={reorder.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(reorder.status)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {reorder.medicines?.name || 'Unknown Medicine'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Batch: {reorder.medicines?.batch_id || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {reorder.quantity.toLocaleString()} units
                    </p>
                    {reorder.supplier && (
                      <p className="text-sm text-gray-600">
                        Supplier: {reorder.supplier}
                      </p>
                    )}
                    {reorder.expected_delivery && (
                      <p className="text-sm text-gray-600">
                        Expected: {new Date(reorder.expected_delivery).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(reorder.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reorder.status)}`}>
                    {reorder.status}
                  </span>
                  {reorder.status !== 'delivered' && reorder.status !== 'cancelled' && (
                    <select
                      value={reorder.status}
                      onChange={(e) => handleStatusUpdate(reorder.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="ordered">Ordered</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReordersPanel;