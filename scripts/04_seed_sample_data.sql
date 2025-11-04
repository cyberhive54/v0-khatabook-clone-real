-- Seed 5 random contacts and 4-6 transactions per contact

-- Insert 5 random contacts
INSERT INTO contacts (name, phone, email, address, type, notes) VALUES
  ('Rajesh Kumar', '9876543210', 'rajesh@email.com', '123 MG Road, Bangalore', 'customer', 'Regular customer'),
  ('Priya Sharma', '9123456789', 'priya@email.com', '456 Park Street, Mumbai', 'supplier', 'Quality supplier'),
  ('Amit Patel', '8765432109', 'amit@email.com', '789 Commercial Ave, Delhi', 'customer', 'Bulk orders'),
  ('Sneha Gupta', '9988776655', 'sneha@email.com', '321 Business Park, Pune', 'other', 'Occasional business'),
  ('Vikram Singh', '9654321087', 'vikram@email.com', '654 Trade Center, Hyderabad', 'supplier', 'Monthly supplies');

-- Insert 5-6 transactions per contact (25-30 transactions total)
-- Transactions for Rajesh Kumar
INSERT INTO transactions (contact_id, amount, type, date, description, category, notes) 
SELECT 
  (SELECT id FROM contacts WHERE name = 'Rajesh Kumar' LIMIT 1),
  amount, type, date, description, category, notes
FROM (VALUES
  (5000, 'credit', CURRENT_DATE - INTERVAL '30 days', 'Goods sold', 'sales', 'Invoice #001'),
  (3500, 'debit', CURRENT_DATE - INTERVAL '25 days', 'Payment received', 'payment', 'Cheque'),
  (2000, 'credit', CURRENT_DATE - INTERVAL '20 days', 'Additional sale', 'sales', 'Invoice #002'),
  (1500, 'debit', CURRENT_DATE - INTERVAL '15 days', 'Return credit', 'returns', 'Defective items'),
  (4200, 'credit', CURRENT_DATE - INTERVAL '10 days', 'Large order', 'sales', 'Invoice #003'),
  (2800, 'debit', CURRENT_DATE - INTERVAL '5 days', 'Partial payment', 'payment', 'Online transfer')
) AS t(amount, type, date, description, category, notes);

-- Transactions for Priya Sharma
INSERT INTO transactions (contact_id, amount, type, date, description, category, notes)
SELECT 
  (SELECT id FROM contacts WHERE name = 'Priya Sharma' LIMIT 1),
  amount, type, date, description, category, notes
FROM (VALUES
  (8000, 'debit', CURRENT_DATE - INTERVAL '28 days', 'Material purchased', 'purchase', 'PO #001'),
  (8000, 'credit', CURRENT_DATE - INTERVAL '23 days', 'Payment made', 'payment', 'RTGS'),
  (6500, 'debit', CURRENT_DATE - INTERVAL '18 days', 'Supply delivery', 'purchase', 'PO #002'),
  (5000, 'credit', CURRENT_DATE - INTERVAL '12 days', 'Advance paid', 'payment', 'Bank transfer'),
  (7200, 'debit', CURRENT_DATE - INTERVAL '7 days', 'Stock received', 'purchase', 'PO #003'),
  (6500, 'credit', CURRENT_DATE - INTERVAL '2 days', 'Settlement payment', 'payment', 'Cheque')
) AS t(amount, type, date, description, category, notes);

-- Transactions for Amit Patel
INSERT INTO transactions (contact_id, amount, type, date, description, category, notes)
SELECT 
  (SELECT id FROM contacts WHERE name = 'Amit Patel' LIMIT 1),
  amount, type, date, description, category, notes
FROM (VALUES
  (12000, 'credit', CURRENT_DATE - INTERVAL '26 days', 'Bulk order', 'sales', 'Invoice #004'),
  (10000, 'debit', CURRENT_DATE - INTERVAL '21 days', 'Payment received', 'payment', 'Demand draft'),
  (9500, 'credit', CURRENT_DATE - INTERVAL '16 days', 'Follow-up order', 'sales', 'Invoice #005'),
  (15000, 'credit', CURRENT_DATE - INTERVAL '11 days', 'Large bulk sale', 'sales', 'Invoice #006'),
  (9500, 'debit', CURRENT_DATE - INTERVAL '6 days', 'Partial payment', 'payment', 'Online'),
  (12000, 'debit', CURRENT_DATE - INTERVAL '1 days', 'Final settlement', 'payment', 'NEFT')
) AS t(amount, type, date, description, category, notes);

-- Transactions for Sneha Gupta
INSERT INTO transactions (contact_id, amount, type, date, description, category, notes)
SELECT 
  (SELECT id FROM contacts WHERE name = 'Sneha Gupta' LIMIT 1),
  amount, type, date, description, category, notes
FROM (VALUES
  (3000, 'credit', CURRENT_DATE - INTERVAL '24 days', 'Small order', 'sales', 'Invoice #007'),
  (3000, 'debit', CURRENT_DATE - INTERVAL '19 days', 'Payment cleared', 'payment', 'Cash'),
  (2500, 'credit', CURRENT_DATE - INTERVAL '14 days', 'Repeat order', 'sales', 'Invoice #008'),
  (1800, 'debit', CURRENT_DATE - INTERVAL '9 days', 'Discount given', 'discount', 'Special offer')
) AS t(amount, type, date, description, category, notes);

-- Transactions for Vikram Singh
INSERT INTO transactions (contact_id, amount, type, date, description, category, notes)
SELECT 
  (SELECT id FROM contacts WHERE name = 'Vikram Singh' LIMIT 1),
  amount, type, date, description, category, notes
FROM (VALUES
  (11000, 'debit', CURRENT_DATE - INTERVAL '27 days', 'Monthly supplies', 'purchase', 'PO #004'),
  (11000, 'credit', CURRENT_DATE - INTERVAL '22 days', 'Payment issued', 'payment', 'Wire transfer'),
  (9800, 'debit', CURRENT_DATE - INTERVAL '17 days', 'Additional stock', 'purchase', 'PO #005'),
  (8500, 'credit', CURRENT_DATE - INTERVAL '13 days', 'Partial payment', 'payment', 'Check'),
  (10500, 'debit', CURRENT_DATE - INTERVAL '8 days', 'Urgent order', 'purchase', 'PO #006')
) AS t(amount, type, date, description, category, notes);
