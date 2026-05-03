# Artichoke — History & Misc Notes

## Requirements

1. A user can browse all titles, series and issues in a collection
2. A user can see metadata about any issue
3. A user can see a photo of the cover with the metadata
4. An admin can add and remove titles, series and issues
5. An admin needs to be authenticated

### Dependencies
**Node, NPM, Webpack 5, TypeScript, React, Bootstrap 5, SASS, Express, PHP (ComicDB)**

## Install (non-Docker)

- Install JavaScript dependencies: `npm install`
- Install PHP dependencies: `composer install`
- Development: `npm run dev-client` (webpack-dev-server) + `npm run dev-server` (Express backend)

> This application relies on PHP and PEAR packages. Use Composer to satisfy those requirements.

## CSV Import Workflow (Admin)

Use `/admin` → **Import** to load CSV data into Artichoke.

1. Upload a CSV file and run **Preview Mapping**
2. Adjust column mappings if needed and re-run validation
3. Choose an import mode:
   - `dry-run`: validate and log skipped rows only
   - `create-only`: insert only missing records, skip existing issues
   - `upsert`: insert missing records and update matched issues
4. Click **Commit Import**

Each run is persisted with a `runId` in `import_runs`. Invalid rows are stored in `import_skipped_rows` and can be reloaded/exported from the Import panel for cleanup.

## Update Log

### April 2026
Convert home page into Miller Columns (To Do)

### July 2017
`npm run dev-client` and then `npm run wp`

### June 2017
Webpack-Dev-Server working. To run use NPM scripts.

`npm run dev-client` and `npm run dev-server`

### May 2017
The project now requires Webpack to compile the JavaScript. All configurations can be found in `webpack.config.js` in the project root.
