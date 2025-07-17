/*
  # Insert Sample Data for MedChain

  This migration adds sample data for testing and demonstration:
  - Sample locations (hospitals, clinics, pharmacies)
  - Sample medicines with realistic data
  - Sample alerts for testing the alert system
  - Sample reorders for testing the reorder system
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
INSERT INTO medicines (
  name, 
  batch_id, 
  manufacturer, 
  expiry_date, 
  quantity, 
  location, 
  location_id, 
  status, 
  blockchain_hash, 
  qr_code,
  price,
  description
) VALUES
  (
    'Paracetamol 500mg', 
    'PC-2024-001', 
    'PharmaCorp Ltd', 
    '2025-12-31', 
    1250, 
    'Central Hospital',
    (SELECT id FROM locations WHERE name = 'Central Hospital'),
    'active',
    '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    'QR-PC-2024-001',
    0.15,
    'Pain relief and fever reducer'
  ),
  (
    'Amoxicillin 250mg', 
    'ML-2024-045', 
    'MediLab Inc', 
    '2025-08-15', 
    480, 
    'Rural Clinic A',
    (SELECT id FROM locations WHERE name = 'Rural Clinic A'),
    'active',
    '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    'QR-ML-2024-045',
    0.25,
    'Antibiotic for bacterial infections'
  ),
  (
    'Ibuprofen 400mg', 
    'HT-2024-128', 
    'HealthTech Solutions', 
    '2024-12-20', 
    75, 
    'City Pharmacy',
    (SELECT id FROM locations WHERE name = 'City Pharmacy'),
    'active',
    '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    'QR-HT-2024-128',
    0.20,
    'Anti-inflammatory pain reliever'
  ),
  (
    'Aspirin 325mg', 
    'GP-2024-089', 
    'Global Pharma', 
    '2026-01-10', 
    25, 
    'Rural Clinic A',
    (SELECT id FROM locations WHERE name = 'Rural Clinic A'),
    'low_stock',
    '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    'QR-GP-2024-089',
    0.10,
    'Pain reliever and blood thinner'
  ),
  (
    'Metformin 500mg', 
    'DC-2024-156', 
    'DiabetesCare Ltd', 
    '2025-11-28', 
    890, 
    'Regional Hospital',
    (SELECT id FROM locations WHERE name = 'Regional Hospital'),
    'active',
    '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    'QR-DC-2024-156',
    0.30,
    'Diabetes medication'
  ),
  (
    'Ciprofloxacin 500mg', 
    'AB-2024-067', 
    'AntiBio Labs', 
    '2024-12-25', 
    15, 
    'Rural Clinic A',
    (SELECT id FROM locations WHERE name = 'Rural Clinic A'),
    'low_stock',
    '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
    'QR-AB-2024-067',
    0.45,
    'Broad-spectrum antibiotic'
  ),
  (
    'Paracetamol 500mg', 
    'PC-2023-123', 
    'PharmaCorp Ltd', 
    '2025-06-15', 
    2100, 
    'Medical Warehouse',
    (SELECT id FROM locations WHERE name = 'Medical Warehouse'),
    'active',
    '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    'QR-PC-2023-123',
    0.15,
    'Pain relief and fever reducer - bulk stock'
  ),
  (
    'Aspirin 325mg', 
    'GP-2024-090', 
    'Global Pharma', 
    '2024-12-31', 
    8, 
    'City Pharmacy',
    (SELECT id FROM locations WHERE name = 'City Pharmacy'),
    'low_stock',
    '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    'QR-GP-2024-090',
    0.10,
    'Pain reliever and blood thinner'
  )
ON CONFLICT (batch_id) DO NOTHING;

-- Insert sample alerts
INSERT INTO alerts (type, message, medicine_id, severity) VALUES
  (
    'low_stock',
    'Aspirin 325mg at Rural Clinic A is running low (25 units remaining)',
    (SELECT id FROM medicines WHERE batch_id = 'GP-2024-089'),
    'medium'
  ),
  (
    'low_stock',
    'Ciprofloxacin 500mg at Rural Clinic A is critically low (15 units remaining)',
    (SELECT id FROM medicines WHERE batch_id = 'AB-2024-067'),
    'high'
  ),
  (
    'expiry',
    'Ibuprofen 400mg (Batch: HT-2024-128) will expire soon',
    (SELECT id FROM medicines WHERE batch_id = 'HT-2024-128'),
    'high'
  ),
  (
    'low_stock',
    'Aspirin 325mg at City Pharmacy is critically low (8 units remaining)',
    (SELECT id FROM medicines WHERE batch_id = 'GP-2024-090'),
    'critical'
  )
ON CONFLICT DO NOTHING;

-- Insert sample reorders
INSERT INTO reorders (medicine_id, quantity, status, supplier, expected_date) VALUES
  (
    (SELECT id FROM medicines WHERE batch_id = 'GP-2024-089'),
    500,
    'pending',
    'Global Pharma',
    CURRENT_DATE + INTERVAL '5 days'
  ),
  (
    (SELECT id FROM medicines WHERE batch_id = 'AB-2024-067'),
    300,
    'ordered',
    'AntiBio Labs',
    CURRENT_DATE + INTERVAL '7 days'
  ),
  (
    (SELECT id FROM medicines WHERE batch_id = 'HT-2024-128'),
    200,
    'shipped',
    'HealthTech Solutions',
    CURRENT_DATE + INTERVAL '2 days'
  )
ON CONFLICT DO NOTHING;