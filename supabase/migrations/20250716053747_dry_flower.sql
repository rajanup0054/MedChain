/*
  # Create MedChain Database Schema

  1. New Tables
    - `locations`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `address` (text, optional)
      - `type` (text, default 'hospital')
      - `created_at` (timestamp)
    
    - `medicines`
      - `id` (uuid, primary key)
      - `name` (text)
      - `batch_id` (text, unique)
      - `manufacturer` (text)
      - `quantity` (integer, default 0)
      - `expiry_date` (date)
      - `location` (text, default 'unknown')
      - `location_id` (uuid, foreign key to locations)
      - `status` (text, default 'active')
      - `blockchain_hash` (text, optional)
      - `qr_code` (text, optional)
      - `price` (numeric, default 0.00)
      - `description` (text, default '')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `alerts`
      - `id` (uuid, primary key)
      - `type` (text)
      - `message` (text)
      - `medicine_id` (uuid, foreign key to medicines)
      - `severity` (text, default 'medium')
      - `is_resolved` (boolean, default false)
      - `resolved_at` (timestamp, optional)
      - `created_at` (timestamp)
    
    - `reorders`
      - `id` (uuid, primary key)
      - `medicine_id` (uuid, foreign key to medicines)
      - `quantity` (integer)
      - `status` (text, default 'pending')
      - `supplier` (text, optional)
      - `expected_date` (date, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to perform all operations

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize for expiry date and location queries

  4. Triggers
    - Auto-update timestamps on medicine changes
*/

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  address text,
  type text DEFAULT 'hospital',
  created_at timestamptz DEFAULT now()
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  batch_id text UNIQUE NOT NULL,
  manufacturer text NOT NULL,
  expiry_date date NOT NULL,
  quantity integer DEFAULT 0,
  location_id uuid REFERENCES locations(id),
  price numeric(10,2) DEFAULT 0.00,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  location text NOT NULL DEFAULT 'unknown',
  status text DEFAULT 'active',
  blockchain_hash text,
  qr_code text,
  CONSTRAINT medicines_status_check CHECK (status IN ('active', 'expired', 'low_stock', 'out_of_stock'))
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  message text NOT NULL,
  medicine_id uuid REFERENCES medicines(id),
  severity text DEFAULT 'medium',
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create reorders table
CREATE TABLE IF NOT EXISTS reorders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid REFERENCES medicines(id),
  quantity integer NOT NULL,
  status text DEFAULT 'pending',
  supplier text,
  expected_date date,
  created_at timestamptz DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for medicines table
DROP TRIGGER IF EXISTS update_medicines_updated_at ON medicines;
CREATE TRIGGER update_medicines_updated_at
    BEFORE UPDATE ON medicines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_expiry_date ON medicines(expiry_date);
CREATE INDEX IF NOT EXISTS idx_medicines_location_id ON medicines(location_id);
CREATE INDEX IF NOT EXISTS idx_alerts_medicine_id ON alerts(medicine_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_reorders_medicine_id ON reorders(medicine_id);
CREATE INDEX IF NOT EXISTS idx_reorders_status ON reorders(status);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reorders ENABLE ROW LEVEL SECURITY;

-- Create policies for locations
CREATE POLICY "Allow all operations on locations"
  ON locations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for medicines
CREATE POLICY "Allow all operations on medicines"
  ON medicines
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for alerts
CREATE POLICY "Allow all operations on alerts"
  ON alerts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for reorders
CREATE POLICY "Allow all operations on reorders"
  ON reorders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);