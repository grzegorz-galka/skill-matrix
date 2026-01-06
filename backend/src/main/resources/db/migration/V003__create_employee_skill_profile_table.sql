-- Create employee_skill_profile junction table
CREATE TABLE employee_skill_profile (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    skill_profile_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_skill_profile_employee
        FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_skill_profile_skill_profile
        FOREIGN KEY (skill_profile_id) REFERENCES skill_profile(id) ON DELETE CASCADE,
    CONSTRAINT uk_employee_skill_profile
        UNIQUE (employee_id, skill_profile_id)
);

-- Create indexes for foreign keys
CREATE INDEX idx_employee_skill_profile_employee ON employee_skill_profile(employee_id);
CREATE INDEX idx_employee_skill_profile_skill_profile ON employee_skill_profile(skill_profile_id);

-- Add comment to table
COMMENT ON TABLE employee_skill_profile IS 'Maps employees to their assigned skill profiles';
