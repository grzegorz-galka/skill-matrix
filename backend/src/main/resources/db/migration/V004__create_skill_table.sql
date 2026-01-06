-- Create skill table
CREATE TABLE skill (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    skill_profile_id BIGINT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skill_skill_profile
        FOREIGN KEY (skill_profile_id) REFERENCES skill_profile(id) ON DELETE RESTRICT
);

-- Create indexes
CREATE INDEX idx_skill_name ON skill(name);
CREATE INDEX idx_skill_skill_profile ON skill(skill_profile_id);

-- Add comment to table
COMMENT ON TABLE skill IS 'Stores individual skills grouped by skill profiles';
