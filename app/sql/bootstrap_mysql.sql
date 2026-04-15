-- Artichoke ComicDB bootstrap schema for local MySQL/MariaDB
-- Usage: mysql -u root -p < app/sql/bootstrap_mysql.sql

CREATE DATABASE IF NOT EXISTS comicdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE comicdb;

CREATE TABLE IF NOT EXISTS titles (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_titles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS series (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  type VARCHAR(100) NULL,
  default_price DECIMAL(10,2) NULL,
  first_issue INT NULL,
  final_issue INT NULL,
  subscribed TINYINT(1) NOT NULL DEFAULT 0,
  comments TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_series_title (title),
  CONSTRAINT fk_series_title FOREIGN KEY (title) REFERENCES titles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS issues (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  series INT UNSIGNED NOT NULL,
  number VARCHAR(64) NOT NULL,
  sort INT NULL,
  printrun VARCHAR(100) NULL,
  quantity INT NULL,
  cover_date DATE NULL,
  location VARCHAR(255) NULL,
  type VARCHAR(100) NULL,
  status TINYINT NULL,
  bkcondition VARCHAR(100) NULL,
  cover_price DECIMAL(10,2) NULL,
  purchase_price DECIMAL(10,2) NULL,
  purchase_date DATE NULL,
  guide_value DECIMAL(10,2) NULL,
  guide VARCHAR(255) NULL,
  issue_value DECIMAL(10,2) NULL,
  comments TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_issues_series (series),
  KEY idx_issues_number (number),
  CONSTRAINT fk_issues_series FOREIGN KEY (series) REFERENCES series(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS publisher (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_publisher_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS print_run (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_print_run_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS location (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_location_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS issue_type (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_issue_type_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS guide (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_guide_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS series_type (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_series_type_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO publisher (name) VALUES
  ('Marvel'),
  ('DC'),
  ('Image');

INSERT IGNORE INTO print_run (name) VALUES
  ('First Printing'),
  ('Second Printing');

INSERT IGNORE INTO location (name) VALUES
  ('Box 1'),
  ('Shelf A');

INSERT IGNORE INTO issue_type (name) VALUES
  ('Regular'),
  ('Annual');

INSERT IGNORE INTO guide (name) VALUES
  ('Overstreet'),
  ('None');

INSERT IGNORE INTO series_type (name) VALUES
  ('Ongoing'),
  ('Limited');

INSERT IGNORE INTO titles (id, name) VALUES
  (1, 'Sample Title');

INSERT IGNORE INTO series (id, title, name, publisher, type, default_price, first_issue, final_issue, subscribed, comments) VALUES
  (1, 1, 'Sample Series', 'Marvel', 'Ongoing', 3.99, 1, 12, 0, 'Bootstrap sample series');

INSERT IGNORE INTO issues (
  id, series, number, sort, printrun, quantity, cover_date, location, type, status,
  bkcondition, cover_price, purchase_price, purchase_date, guide_value, guide, issue_value, comments
) VALUES
  (1, 1, '1', 1, 'First Printing', 1, '2024-01-01', 'Box 1', 'Regular', 0,
   'Near Mint (NM)', 3.99, 3.99, '2024-01-15', 5.00, 'Overstreet', 5.00, 'Bootstrap sample issue');
