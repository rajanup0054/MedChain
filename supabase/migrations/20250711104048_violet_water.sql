/*
  # Insert Sample Data

  1. Sample Locations
  2. Sample Medicines
  3. Sample Alerts
*/

-- Insert sample locations
INSERT INTO locations (name, address, type) VALUES
('Central Hospital', '123 Medical Center Blvd, Capital City', 'hospital'),
('Rural Clinic A', '456 Village Road, Rural District', 'clinic'),
('City Pharmacy', '789 Main Street, Downtown', 'pharmacy'),
('Regional Hospital', '321 Healthcare Ave, Regional Hub', 'hospital'),
('Medical Warehouse', '654 Supply Chain Dr, Industrial Zone', 'warehouse')
ON CONFLICT (name) DO NOTHING;

-- Insert sample medicines
INSERT INTO medicines (name, batch_id, manufacturer, quantity, expiry_date, location, status, blockchain_hash, qr_code) VALUES
('Paracetamol 500mg', 'PC-2024-001', 'PharmaCorp Ltd', 1250, '2025-12-31', 'Central Hospital', 'active', '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', 'QR-PC-2024-001'),
('Amoxicillin 250mg', 'ML-2024-045', 'MediLab Inc', 480, '2025-08-15', 'Rural Clinic A', 'active', '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c', 'QR-ML-2024-045'),
('Ibuprofen 400mg', 'HT-2024-128', 'HealthTech Solutions', 75, '2024-12-20', 'City Pharmacy', 'active', '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d', 'QR-HT-2024-128'),
('Aspirin 325mg', 'GP-2024-089', 'Global Pharma', 25, '2026-01-10', 'Rural Clinic A', 'low_stock', '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e', 'QR-GP-2024-089'),
('Metformin 500mg', 'DC-2024-156', 'DiabetesCare Ltd', 890, '2025-11-28', 'Regional Hospital', 'active', '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f', 'QR-DC-2024-156'),
('Ciprofloxacin 500mg', 'AB-2024-067', 'AntiBio Labs', 15, '2024-12-25', 'Rural Clinic A', 'low_stock', '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a', 'QR-AB-2024-067'),
('Paracetamol 500mg', 'PC-2023-123', 'PharmaCorp Ltd', 2100, '2025-06-15', 'Medical Warehouse', 'active', '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b', 'QR-PC-2023-123'),
('Aspirin 325mg', 'GP-2024-090', 'Global Pharma', 8, '2024-12-31', 'City Pharmacy', 'low_stock', '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c', 'QR-GP-2024-090')
ON CONFLICT (batch_id) DO NOTHING;

-- Insert sample alerts
INSERT INTO alerts (type, medicine_id, message, severity) 
SELECT 
  'low_stock',
  m.id,
  'Stock level is critically low for ' || m.name || ' at ' || m.location,
  CASE 
    WHEN m.quantity < 10 THEN 'critical'
    WHEN m.quantity < 25 THEN 'high'
    ELSE 'medium'
  END
FROM medicines m 
WHERE m.quantity < 50;

-- Insert expiry alerts for medicines expiring soon
INSERT INTO alerts (type, medicine_id, message, severity)
SELECT 
  'expiry',
  m.id,
  m.name || ' (Batch: ' || m.batch_id || ') will expire on ' || m.expiry_date::text,
  CASE 
    WHEN m.expiry_date <= CURRENT_DATE THEN 'critical'
    WHEN m.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'high'
    ELSE 'medium'
  END
FROM medicines m 
WHERE m.expiry_date <= CURRENT_DATE + INTERVAL '60 days';