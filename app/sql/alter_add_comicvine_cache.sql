-- Migration: Add ComicVine API response cache table
-- Usage: mysql -u root -p < app/sql/alter_add_comicvine_cache.sql
--
-- Purpose: Cache API responses to comply with ComicVine Terms of Use
-- which require minimizing duplicate requests (200 requests/hour limit)

USE comicdb;

CREATE TABLE IF NOT EXISTS cv_cache (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cache_key VARCHAR(255) NOT NULL,
  response_data MEDIUMTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cv_cache_key (cache_key),
  KEY idx_cv_cache_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
