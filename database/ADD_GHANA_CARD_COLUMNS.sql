-- Add Ghana Card verification columns to users table
-- Run this in your Supabase SQL Editor

-- Add columns for Ghana Card data
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ghana_card_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(20),
ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

-- Add index for quick Ghana Card lookups
CREATE INDEX IF NOT EXISTS idx_users_ghana_card ON users(ghana_card_number);

-- Add comment for documentation
COMMENT ON COLUMN users.ghana_card_number IS 'Ghana Card number in format GHA-XXXXXXXXX-X';
COMMENT ON COLUMN users.date_of_birth IS 'Date of birth from Ghana Card in DD/MM/YYYY format';
COMMENT ON COLUMN users.gender IS 'Gender from Ghana Card (Male/Female)';

-- Optional: Add constraint to ensure Ghana Card number format is valid
ALTER TABLE users 
ADD CONSTRAINT check_ghana_card_format 
CHECK (ghana_card_number IS NULL OR ghana_card_number ~ '^GHA-[0-9]{9}-[0-9]$');

-- Update existing users to have NULL values (already the default)
-- No action needed

-- Success message
SELECT 'Ghana Card columns added successfully!' as status;
