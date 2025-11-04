-- Create bills table to support multiple bill attachments per transaction
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  bill_number TEXT,
  bill_date DATE,
  bill_amount DECIMAL(15, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_bills_transaction_id ON bills(transaction_id);

-- Enable RLS for bills
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Allow all operations on bills
CREATE POLICY "Allow all operations on bills" 
  ON bills FOR ALL USING (true);
