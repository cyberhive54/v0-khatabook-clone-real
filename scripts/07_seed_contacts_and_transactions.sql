-- Seed data for contacts and transactions
-- This file adds 10 realistic contacts with profile pictures and 5-8 transactions each

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM transactions;
-- DELETE FROM contacts;

-- Insert 10 contacts with profile pictures
INSERT INTO contacts (id, name, email, phone, address, notes, profile_pic, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Rajesh Kumar', 'rajesh@example.com', '+91-9876543210', '123 MG Road, Bangalore', 'Regular customer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Priya Singh', 'priya@example.com', '+91-9876543211', '456 Park Street, Mumbai', 'Supplier', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Amit Patel', 'amit@example.com', '+91-9876543212', '789 Sector 5, Delhi', 'Business partner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Sneha Gupta', 'sneha@example.com', '+91-9876543213', '321 Causeway Bay, Chennai', 'Vendor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Vikram Sharma', 'vikram@example.com', '+91-9876543214', '654 Commercial Street, Pune', 'Client', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'Anjali Desai', 'anjali@example.com', '+91-9876543215', '987 Brigade Road, Hyderabad', 'Freelancer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'Rohan Mehta', 'rohan@example.com', '+91-9876543216', '147 Linking Road, Kolkata', 'Contractor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440008', 'Divya Nair', 'divya@example.com', '+91-9876543217', '258 Mount Road, Jaipur', 'Distributor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Divya', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440009', 'Sanjay Verma', 'sanjay@example.com', '+91-9876543218', '369 Connaught Place, Ahmedabad', 'Retailer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjay', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440010', 'Neha Kapoor', 'neha@example.com', '+91-9876543219', '741 Bandra Reclamation, Lucknow', 'Consultant', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha', NOW(), NOW());

-- Insert transactions for Rajesh Kumar
INSERT INTO transactions (id, contact_id, you_give, you_got, description, date, notes, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 5000, NULL, 'Invoice #001 - Office supplies', NOW()::date - INTERVAL '25 days', 'Online transfer', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', NULL, 8500, 'Payment received for services', NOW()::date - INTERVAL '20 days', 'RTGS', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 3200, NULL, 'PO #102 - Stationery', NOW()::date - INTERVAL '15 days', 'Cheque', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', NULL, 12000, 'Monthly retainer', NOW()::date - INTERVAL '8 days', 'Bank transfer', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 2800, NULL, 'Advance payment', NOW()::date - INTERVAL '3 days', 'Cash', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', NULL, 6500, 'Refund issued', NOW()::date - INTERVAL '1 days', 'Online transfer', NOW(), NOW());

-- Insert transactions for Priya Singh
INSERT INTO transactions (id, contact_id, you_give, you_got, description, date, notes, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', NULL, 15000, 'Raw materials delivery', NOW()::date - INTERVAL '23 days', 'Invoice', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 15000, NULL, 'Payment for raw materials', NOW()::date - INTERVAL '18 days', 'RTGS', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', NULL, 7200, 'Spare parts', NOW()::date - INTERVAL '12 days', 'Delivery note', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 7200, NULL, 'Payment for parts', NOW()::date - INTERVAL '10 days', 'Cheque', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', NULL, 9800, 'Additional stock', NOW()::date - INTERVAL '5 days', 'PO', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 9800, NULL, 'Paid in full', NOW()::date - INTERVAL '2 days', 'Bank transfer', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', NULL, 4500, 'Bonus discount', NOW()::date - INTERVAL '1 days', 'Voucher', NOW(), NOW());

-- Insert transactions for Amit Patel
INSERT INTO transactions (id, contact_id, you_give, you_got, description, date, notes, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 11000, NULL, 'Project deposit', NOW()::date - INTERVAL '22 days', 'Online', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', NULL, 22000, 'Project completion payment', NOW()::date - INTERVAL '14 days', 'RTGS', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', 5500, NULL, 'Additional work', NOW()::date - INTERVAL '7 days', 'Cash', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440003', NULL, 2750, 'Partial refund', NOW()::date - INTERVAL '4 days', 'Cheque', NOW(), NOW());

-- Insert transactions for Sneha Gupta
INSERT INTO transactions (id, contact_id, you_give, you_got, description, date, notes, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440004', NULL, 18500, 'Bulk order received', NOW()::date - INTERVAL '20 days', 'LCL shipment', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440004', 18500, NULL, 'Payment processed', NOW()::date - INTERVAL '16 days', 'Wire transfer', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440004', NULL, 6200, 'Discount goods', NOW()::date - INTERVAL '11 days', 'Clearance', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440004', 6200, NULL, 'Settlement payment', NOW()::date - INTERVAL '6 days', 'Online', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440004', NULL, 3100, 'Interest earned', NOW()::date - INTERVAL '2 days', 'Credit', NOW(), NOW());

-- Insert transactions for Vikram Sharma
INSERT INTO transactions (id, contact_id, you_give, you_got, description, date, notes, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440005', 25000, NULL, 'Contract signing bonus', NOW()::date - INTERVAL '24 days', 'Bank transfer', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440005', NULL, 50000, 'Project milestone completion', NOW()::date - INTERVAL '17 days', 'RTGS', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440005', 12500, NULL, 'Expense reimbursement', NOW()::date - INTERVAL '9 days', 'Cheque', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440005', NULL, 30000, 'Final payment', NOW()::date - INTERVAL '3 days', 'Online transfer', NOW(), NOW());

-- Insert transactions for Anjali Desai
INSERT INTO transactions (id, contact_id, you_give, you_got, description, date, notes, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440006', NULL, 8000, 'Freelance project', NOW()::date - INTERVAL '21 days', 'Completed work', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440006', 8000, NULL, 'Payment sent', NOW()::date - INTERVAL '19 days', 'PayPal', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440006', NULL, 12000, 'Extended project', NOW()::date - INTERVAL '13 days', 'Additional work', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440006', 12000, NULL, 'Full settlement', NOW()::date - INTERVAL '8 days', 'Bank transfer', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440006', NULL, 4000, 'Bonus for quality', NOW()::date - INTERVAL '1 days', 'Cash', NOW(), NOW());

-- Insert transactions for Rohan Mehta
INSERT INTO transactions (id, contact_id, you_give, you_got, description, date, notes, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440007', 35000, NULL, 'Construction contract advance', NOW()::date - INTERVAL '26 days', 'Site development', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440007', NULL, 70000, 'Work completion payment', NOW()::date - INTERVAL '19 days', 'RTGS', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440007', 17500, NULL, 'Interim payment', NOW()::date - INTERVAL '12 days', 'Cheque', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440007', NULL, 35000, 'Final invoice', NOW()::date - INTERVAL '6 days', 'Bank transfer', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440007', 8750, NULL, 'Defects rectification', NOW()::date - INTERVAL '1 days', 'Online', NOW(), NOW());

-- Insert transactions for Divya Nair
INSERT INTO transactions (id, contact_id, you_give, you_got, description, date, notes, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440008', NULL, 20000, 'Wholesale purchase', NOW()::date - INTERVAL '23 days', 'Distribution deal', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440008', 20000, NULL, 'Payment cleared', NOW()::date - INTERVAL '20 days', 'Wire transfer', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440008', NULL, 15000, 'Stock replenishment', NOW()::date - INTERVAL '14 days', 'Order', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440008', 15000, NULL, 'Stock payment', NOW()::date - INTERVAL '11 days', 'Cheque', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440008', NULL, 5000, 'Late delivery charges waived', NOW()::date - INTERVAL '5 days', 'Credit memo', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440008', 5000, NULL, 'Goodwill payment', NOW()::date - INTERVAL '2 days', 'Cash', NOW(), NOW());

-- Insert transactions for Sanjay Verma
INSERT INTO transactions (id, contact_id, you_give, you_got, description, date, notes, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440009', NULL, 16000, 'Retail sale', NOW()::date - INTERVAL '22 days', 'POS transaction', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440009', 16000, NULL, 'Payment received', NOW()::date - INTERVAL '18 days', 'Online', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440009', NULL, 8000, 'Return credits', NOW()::date - INTERVAL '10 days', 'Refund', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440009', 8000, NULL, 'Credit adjusted', NOW()::date - INTERVAL '7 days', 'Invoice', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440009', NULL, 4000, 'Seasonal discount', NOW()::date - INTERVAL '3 days', 'Promotion', NOW(), NOW());

-- Insert transactions for Neha Kapoor
INSERT INTO transactions (id, contact_id, you_give, you_got, description, date, notes, created_at, updated_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440010', 40000, NULL, 'Consulting retainer', NOW()::date - INTERVAL '25 days', 'Monthly subscription', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440049', '550e8400-e29b-41d4-a716-446655440010', NULL, 80000, 'Strategy implementation', NOW()::date - INTERVAL '16 days', 'Deliverables', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440010', 20000, NULL, 'Interim payment', NOW()::date - INTERVAL '9 days', 'Progress billing', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440010', NULL, 40000, 'Final consulting fee', NOW()::date - INTERVAL '4 days', 'Project closure', NOW(), NOW()),
  ('650e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440010', 10000, NULL, 'Follow-up support', NOW()::date - INTERVAL '1 days', 'Maintenance', NOW(), NOW());
