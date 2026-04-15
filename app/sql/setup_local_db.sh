#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SQL_FILE="$ROOT_DIR/app/sql/bootstrap_mysql.sql"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "Missing SQL bootstrap file: $SQL_FILE" >&2
  exit 1
fi

echo "[1/5] Installing MariaDB packages"
sudo apt-get update
sudo apt-get install -y mariadb-server mariadb-client

echo "[2/5] Enabling MariaDB service"
sudo systemctl enable --now mariadb

echo "[3/5] Creating local database and user"
sudo mysql -e "CREATE DATABASE IF NOT EXISTS comicdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'comicdb'@'localhost' IDENTIFIED BY 'comicdb';"
sudo mysql -e "GRANT ALL PRIVILEGES ON comicdb.* TO 'comicdb'@'localhost'; FLUSH PRIVILEGES;"

echo "[4/5] Importing bootstrap schema + seed"
sudo mysql -u root comicdb < "$SQL_FILE"

echo "[5/5] Done"
echo "Local DB ready. App config defaults already point to localhost/comicdb/comicdb."
