-- Add level column to skill_grade table
-- Level represents proficiency level: 1=Beginner to 5=Expert
ALTER TABLE skill_grade ADD COLUMN level INTEGER NOT NULL DEFAULT 1;

-- Add constraint to ensure level is between 1 and 5
ALTER TABLE skill_grade ADD CONSTRAINT chk_skill_grade_level CHECK (level >= 1 AND level <= 5);
