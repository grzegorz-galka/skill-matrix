-- V007: Rename Skill Profile to Job Profile and restructure relationships
-- This migration:
-- 1. Renames skill_profile table to job_profile
-- 2. Renames employee_skill_profile table to employee_job_profile
-- 3. Creates job_profile_skill junction table (many-to-many)
-- 4. Migrates existing skill.skill_profile_id relationships to job_profile_skill
-- 5. Drops skill.skill_profile_id column

-- Step 1: Drop foreign key constraints that reference skill_profile
ALTER TABLE employee_skill_profile
    DROP CONSTRAINT IF EXISTS fk_employee_skill_profile_skill_profile;

ALTER TABLE skill
    DROP CONSTRAINT IF EXISTS fk_skill_skill_profile;

-- Step 2: Rename skill_profile table to job_profile
ALTER TABLE skill_profile RENAME TO job_profile;

-- Step 3: Rename index on job_profile
ALTER INDEX IF EXISTS idx_skill_profile_name RENAME TO idx_job_profile_name;

-- Step 4: Update table comment
COMMENT ON TABLE job_profile IS 'Stores job profile definitions (e.g., Java Developer, Frontend Developer)';

-- Step 5: Rename employee_skill_profile table to employee_job_profile
ALTER TABLE employee_skill_profile RENAME TO employee_job_profile;

-- Step 6: Rename column in employee_job_profile
ALTER TABLE employee_job_profile
    RENAME COLUMN skill_profile_id TO job_profile_id;

-- Step 7: Rename constraints in employee_job_profile
ALTER TABLE employee_job_profile
    RENAME CONSTRAINT fk_employee_skill_profile_employee TO fk_employee_job_profile_employee;

ALTER TABLE employee_job_profile
    RENAME CONSTRAINT uk_employee_skill_profile TO uk_employee_job_profile;

-- Step 8: Recreate foreign key for employee_job_profile -> job_profile
ALTER TABLE employee_job_profile
    ADD CONSTRAINT fk_employee_job_profile_job_profile
        FOREIGN KEY (job_profile_id) REFERENCES job_profile(id) ON DELETE CASCADE;

-- Step 9: Rename indexes in employee_job_profile
ALTER INDEX IF EXISTS idx_employee_skill_profile_employee RENAME TO idx_employee_job_profile_employee;
ALTER INDEX IF EXISTS idx_employee_skill_profile_skill_profile RENAME TO idx_employee_job_profile_job_profile;

-- Step 10: Update table comment
COMMENT ON TABLE employee_job_profile IS 'Maps employees to their assigned job profiles';

-- Step 11: Create job_profile_skill junction table (many-to-many relationship)
CREATE TABLE job_profile_skill (
    id BIGSERIAL PRIMARY KEY,
    job_profile_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_profile_skill_job_profile
        FOREIGN KEY (job_profile_id) REFERENCES job_profile(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_profile_skill_skill
        FOREIGN KEY (skill_id) REFERENCES skill(id) ON DELETE CASCADE,
    CONSTRAINT uk_job_profile_skill
        UNIQUE (job_profile_id, skill_id)
);

-- Step 12: Create indexes for job_profile_skill
CREATE INDEX idx_job_profile_skill_job_profile ON job_profile_skill(job_profile_id);
CREATE INDEX idx_job_profile_skill_skill ON job_profile_skill(skill_id);

-- Step 13: Add comment
COMMENT ON TABLE job_profile_skill IS 'Maps job profiles to their associated skills (many-to-many)';

-- Step 14: Migrate existing data from skill.skill_profile_id to job_profile_skill
-- This preserves all existing Skill -> SkillProfile relationships
INSERT INTO job_profile_skill (job_profile_id, skill_id, created_at)
SELECT skill_profile_id, id, CURRENT_TIMESTAMP
FROM skill
WHERE skill_profile_id IS NOT NULL;

-- Step 15: Drop the skill_profile_id column from skill table
ALTER TABLE skill DROP COLUMN skill_profile_id;

-- Step 16: Drop the old index
DROP INDEX IF EXISTS idx_skill_skill_profile;
