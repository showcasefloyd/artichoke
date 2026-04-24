USE comicdb;

SET @db_name = DATABASE();

SET @has_volume = (
  SELECT COUNT(*)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db_name
     AND TABLE_NAME = 'series'
     AND COLUMN_NAME = 'volume'
);
SET @sql = IF(@has_volume = 0, 'ALTER TABLE series ADD COLUMN volume INT NULL AFTER name', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_start_year = (
  SELECT COUNT(*)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db_name
     AND TABLE_NAME = 'series'
     AND COLUMN_NAME = 'start_year'
);
SET @sql = IF(@has_start_year = 0, 'ALTER TABLE series ADD COLUMN start_year INT NULL AFTER volume', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
