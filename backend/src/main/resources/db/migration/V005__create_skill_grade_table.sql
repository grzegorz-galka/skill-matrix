2-- Create skill_grade table
CREATE TABLE skill_grade (
    id BIGSERIAL PRIMARY KEY,
    skill_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skill_grade_skill
        FOREIGN KEY (skill_id) REFERENCES skill(id) ON DELETE CASCADE,
    CONSTRAINT uk_skill_grade_skill_code
        UNIQUE (skill_id, code)
);

-- Create indexes
CREATE INDEX idx_skill_grade_skill ON skill_grade(skill_id);
CREATE INDEX idx_skill_grade_code ON skill_grade(code);

-- Add comment to table
COMMENT ON TABLE skill_grade IS 'Stores grade levels for each skill (e.g., beginner, intermediate, advanced, expert)';
