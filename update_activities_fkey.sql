-- Drop the existing foreign key constraint
ALTER TABLE activities
DROP CONSTRAINT activities_user_id_fkey;

-- Add the new foreign key constraint with ON DELETE CASCADE
ALTER TABLE activities
ADD CONSTRAINT activities_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;
