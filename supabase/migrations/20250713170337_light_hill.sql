/*
  Sample Data for MedChain
*/

-- Insert sample locations
INSERT INTO locations (name, address, type) VALUES
  ('City Hospital', '123 Main St, Downtown', 'hospital'),
  ('Community Clinic', '456 Oak Ave, Suburbs', 'clinic'),
  ('Emergency Center', '789 Pine Rd, Uptown', 'hospital') -- fixed from 'emergency'
ON CONFLICT (name) DO NOTHING;

-- Insert sample medicines
INSERT INTO medicines (name, batch_id, manufacturer, expiry_date, quantity, location_id, price, description) VALUES
  (
    'Paracetamol 500mg', 'PAR001', 'PharmaCorp', '2024-12-31', 150,
    (SELECT id FROM locations WHERE name = 'City Hospital' LIMIT 1),
    5.99, 'Pain relief and fever reducer'
  ),
  (
    'Amoxicillin 250mg', 'AMX002', 'MediLab', '2024-06-15', 75,
    (SELECT id FROM locations WHERE name = 'Community Clinic' LIMIT 1),
    12.50, 'Antibiotic for bacterial infections'
  ),
  (
    'Ibuprofen 400mg', 'IBU003', 'HealthPlus', '2025-03-20', 200,
    (SELECT id FROM locations WHERE name = 'Emergency Center' LIMIT 1),
    8.75, 'Anti-inflammatory pain reliever'
  ),
  (
    'Aspirin 100mg', 'ASP004', 'CardioMed', '2024-01-30', 25,
    (SELECT id FROM locations WHERE name = 'City Hospital' LIMIT 1),
    3.25, 'Low-dose aspirin for heart health'
  ),
  (
    'Metformin 500mg', 'MET005', 'DiabetesCare', '2024-09-10', 90,
    (SELECT id FROM locations WHERE name = 'Community Clinic' LIMIT 1),
    15.00, 'Diabetes medication'
  )
ON CONFLICT (batch_id) DO NOTHING;

-- Insert sample alerts (with corrected `type`)
INSERT INTO alerts (type, message, medicine_id, is_resolved) VALUES
  (
    'expiry',
    'Medicine expires within 30 days',
    (SELECT id FROM medicines WHERE batch_id = 'ASP004' LIMIT 1),
    false
  ),
  (
    'low_stock',
    'Stock level below minimum threshold',
    (SELECT id FROM medicines WHERE batch_id = 'ASP004' LIMIT 1),
    false
  ),
  (
    'expiry',
    'Medicine expires within 60 days',
    (SELECT id FROM medicines WHERE batch_id = 'AMX002' LIMIT 1),
    false
  ),
  (
    'quality',
    'Routine quality inspection required',
    (SELECT id FROM medicines WHERE batch_id = 'PAR001' LIMIT 1),
    true
  )
ON CONFLICT DO NOTHING;

-- Insert sample reorders
INSERT INTO reorders (medicine_id, quantity, status, supplier, expected_date) VALUES
  (
    (SELECT id FROM medicines WHERE batch_id = 'ASP004' LIMIT 1),
    100, 'pending', 'CardioMed Supplies', '2024-02-15'
  ),
  (
    (SELECT id FROM medicines WHERE batch_id = 'AMX002' LIMIT 1),
    50, 'ordered', 'MediLab Direct', '2024-02-20'
  ),
  (
    (SELECT id FROM medicines WHERE batch_id = 'MET005' LIMIT 1),
    75, 'delivered', 'DiabetesCare Inc', '2024-01-25'
  )
ON CONFLICT DO NOTHING;
