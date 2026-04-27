-- Migration: Add ComicVine ID columns for external API integration
-- Usage: mysql -u root -p < app/sql/alter_add_comicvine_ids.sql

USE comicdb;

SET @db_name = DATABASE();

-- Add cv_volume_id to series table
SET @has_cv_volume_id = (
  SELECT COUNT(*)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db_name
     AND TABLE_NAME = 'series'
     AND COLUMN_NAME = 'cv_volume_id'
);
SET @sql = IF(@has_cv_volume_id = 0, 'ALTER TABLE series ADD COLUMN cv_volume_id INT UNSIGNED NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add cv_issue_id to issues table
SET @has_cv_issue_id = (
  SELECT COUNT(*)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db_name
     AND TABLE_NAME = 'issues'
     AND COLUMN_NAME = 'cv_issue_id'
);
SET @sql = IF(@has_cv_issue_id = 0, 'ALTER TABLE issues ADD COLUMN cv_issue_id INT UNSIGNED NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on cv_volume_id for lookups
SET @has_cv_volume_idx = (
  SELECT COUNT(*)
    FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = @db_name
     AND TABLE_NAME = 'series'
     AND INDEX_NAME = 'idx_series_cv_volume_id'
);
SET @sql = IF(@has_cv_volume_idx = 0, 'CREATE INDEX idx_series_cv_volume_id ON series(cv_volume_id)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on cv_issue_id for lookups
SET @has_cv_issue_idx = (
  SELECT COUNT(*)
    FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = @db_name
     AND TABLE_NAME = 'issues'
     AND INDEX_NAME = 'idx_issues_cv_issue_id'
);
SET @sql = IF(@has_cv_issue_idx = 0, 'CREATE INDEX idx_issues_cv_issue_id ON issues(cv_issue_id)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
