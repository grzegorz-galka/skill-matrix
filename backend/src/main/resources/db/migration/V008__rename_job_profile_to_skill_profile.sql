-- V008: Rename Job Profile back to Skill Profile
-- This migration reverses V007 naming conventions

-- Step 1: Drop foreign key constraints that reference job_profile
ALTER TABLE employee_job_profile
    DROP CONSTRAINT IF EXISTS fk_employee_job_profile_job_profile;

ALTER TABLE job_profile_skill
    DROP CONSTRAINT IF EXISTS fk_job_profile_skill_job_profile;

-- Step 2: Rename job_profile table to skill_profile
ALTER TABLE job_profile RENAME TO skill_profile;

-- Step 3: Rename index on skill_profile
ALTER INDEX IF EXISTS idx_job_profile_name RENAME TO idx_skill_profile_name;

-- Step 4: Update table comment
COMMENT ON TABLE skill_profile IS 'Stores skill profile definitions (e.g., Java Developer, Frontend Developer)';

-- Step 5: Rename employee_job_profile table to employee_skill_profile
ALTER TABLE employee_job_profile RENAME TO employee_skill_profile;

-- Step 6: Rename column in employee_skill_profile
ALTER TABLE employee_skill_profile
    RENAME COLUMN job_profile_id TO skill_profile_id;

-- Step 7: Rename constraints in employee_skill_profile
ALTER TABLE employee_skill_profile
    RENAME CONSTRAINT fk_employee_job_profile_employee TO fk_employee_skill_profile_employee;

ALTER TABLE employee_skill_profile
    RENAME CONSTRAINT uk_employee_job_profile TO uk_employee_skill_profile;

-- Step 8: Recreate foreign key for employee_skill_profile -> skill_profile
ALTER TABLE employee_skill_profile
    ADD CONSTRAINT fk_employee_skill_profile_skill_profile
        FOREIGN KEY (skill_profile_id) REFERENCES skill_profile(id) ON DELETE CASCADE;

-- Step 9: Rename indexes in employee_skill_profile
ALTER INDEX IF EXISTS idx_employee_job_profile_employee RENAME TO idx_employee_skill_profile_employee;
ALTER INDEX IF EXISTS idx_employee_job_profile_job_profile RENAME TO idx_employee_skill_profile_skill_profile;

-- Step 10: Update table comment
COMMENT ON TABLE employee_skill_profile IS 'Maps employees to their assigned skill profiles';

-- Step 11: Rename job_profile_skill table to skill_profile_skill
ALTER TABLE job_profile_skill RENAME TO skill_profile_skill;

-- Step 12: Rename column in skill_profile_skill
ALTER TABLE skill_profile_skill
    RENAME COLUMN job_profile_id TO skill_profile_id;

-- Step 13: Rename constraints in skill_profile_skill
ALTER TABLE skill_profile_skill
    RENAME CONSTRAINT fk_job_profile_skill_skill TO fk_skill_profile_skill_skill;

ALTER TABLE skill_profile_skill
    RENAME CONSTRAINT uk_job_profile_skill TO uk_skill_profile_skill;

-- Step 14: Recreate foreign key for skill_profile_skill -> skill_profile
ALTER TABLE skill_profile_skill
    ADD CONSTRAINT fk_skill_profile_skill_skill_profile
        FOREIGN KEY (skill_profile_id) REFERENCES skill_profile(id) ON DELETE CASCADE;

-- Step 15: Rename indexes in skill_profile_skill
ALTER INDEX IF EXISTS idx_job_profile_skill_job_profile RENAME TO idx_skill_profile_skill_skill_profile;
ALTER INDEX IF EXISTS idx_job_profile_skill_skill RENAME TO idx_skill_profile_skill_skill;

-- Step 16: Update table comment
COMMENT ON TABLE skill_profile_skill IS 'Maps skill profiles to their associated skills (many-to-many)';
