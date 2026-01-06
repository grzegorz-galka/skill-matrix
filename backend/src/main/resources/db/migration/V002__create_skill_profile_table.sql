-- Create skill_profile table
CREATE TABLE skill_profile (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for faster lookups
CREATE INDEX idx_skill_profile_name ON skill_profile(name);

-- Add comment to table
COMMENT ON TABLE skill_profile IS 'Stores skill profile definitions (e.g., Java Developer, Frontend Developer)';
