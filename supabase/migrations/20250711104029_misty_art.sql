/*
  # MedChain Database Schema

  1. New Tables
    - `medicines`
      - `id` (uuid, primary key)
      - `name` (text)
      - `batch_id` (text, unique)
      - `manufacturer` (text)
      - `quantity` (integer)
      - `expiry_date` (date)
      - `location` (text)
      - `status` (text)
      - `blockchain_hash` (text)
      - `qr_code` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `locations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `type` (text)
      - `created_at` (timestamp)
    
    - `alerts`
      - `id` (uuid, primary key)
      - `type` (text)
      - `medicine_id` (uuid, foreign key)
      - `message` (text)
      - `severity` (text)
      - `is_resolved` (boolean)
      - `created_at` (timestamp)
    
    - `reorders`
      - `id` (uuid, primary key)
      - `medicine_id` (uuid, foreign key)
      - `quantity` (integer)
      - `status` (text)
      - `supplier` (text)
      - `expected_delivery` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
</sql>

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  batch_id text UNIQUE NOT NULL,
  manufacturer text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  expiry_date date,
  location text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'low_stock', 'out_of_stock')),
  blockchain_hash text,
  qr_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  address text,
  type text NOT NULL CHECK (type IN ('hospital', 'clinic', 'pharmacy', 'warehouse')),
  created_at timestamptz DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('expiry', 'low_stock', 'out_of_stock', 'quality')),
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE,
  message text NOT NULL,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create reorders table
CREATE TABLE IF NOT EXISTS reorders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'shipped', 'delivered', 'cancelled')),
  supplier text,
  expected_delivery date,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reorders ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can read medicines" ON medicines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert medicines" ON medicines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update medicines" ON medicines FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete medicines" ON medicines FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read locations" ON locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert locations" ON locations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update locations" ON locations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read alerts" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert alerts" ON alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update alerts" ON alerts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read reorders" ON reorders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert reorders" ON reorders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update reorders" ON reorders FOR UPDATE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_location ON medicines(location);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry_date ON medicines(expiry_date);
CREATE INDEX IF NOT EXISTS idx_medicines_status ON medicines(status);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for medicines table
CREATE TRIGGER update_medicines_updated_at 
    BEFORE UPDATE ON medicines 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();