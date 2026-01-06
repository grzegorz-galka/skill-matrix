-- Create employee_skill_grade junction table
CREATE TABLE employee_skill_grade (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    skill_grade_id BIGINT NOT NULL,
    years_of_experience INTEGER,
    last_used_date DATE,
    certified BOOLEAN NOT NULL DEFAULT FALSE,
    employee_comment TEXT,
    reviewed_by_employee_id BIGINT,
    reviewer_comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_skill_grade_employee
        FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_skill_grade_skill_grade
        FOREIGN KEY (skill_grade_id) REFERENCES skill_grade(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_skill_grade_reviewer
        FOREIGN KEY (reviewed_by_employee_id) REFERENCES employee(id) ON DELETE SET NULL,
    CONSTRAINT uk_employee_skill_grade
        UNIQUE (employee_id, skill_grade_id),
    CONSTRAINT chk_years_of_experience
        CHECK (years_of_experience >= 0)
);

-- Create indexes
CREATE INDEX idx_employee_skill_grade_employee ON employee_skill_grade(employee_id);
CREATE INDEX idx_employee_skill_grade_skill_grade ON employee_skill_grade(skill_grade_id);
CREATE INDEX idx_employee_skill_grade_reviewer ON employee_skill_grade(reviewed_by_employee_id);
CREATE INDEX idx_employee_skill_grade_certified ON employee_skill_grade(certified);

-- Add comment to table
COMMENT ON TABLE employee_skill_grade IS 'Maps employees to their skill grades with additional assessment information';
