var express = require('express'),
   bodyParser = require('body-parser'),
   app = express(),
   execPhp = require('exec-php');

// Tell Express to use this module -- This is middleware
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// Middleware
app.use('/views', express.static(__dirname + "/views"));
app.use('/build/css', express.static(__dirname + "/build/css"));
app.use('/build/fonts', express.static(__dirname + "/build/fonts"));
app.use('/build/js', express.static(__dirname + "/build/js"));

// Sends a PHP bridge result, or a 500 JSON error if the bridge failed or returned empty
function sendPhpResult(res, err, result) {
   if (err) {
      console.error('PHP bridge error:', err);
      return res.status(500).json({ error: 'PHP error', detail: String(err) });
   }
   if (result == null || result === '') {
      return res.status(500).json({ error: 'Empty response from PHP' });
   }
   res.send(result);
}

function callPhp(res, methodName, args) {
   execPhp(__dirname + '/api.php', function (error, php) {
      if (error) {
         return sendPhpResult(res, error, null);
      }
      if (!php || typeof php[methodName] !== 'function') {
         return res.status(500).json({ error: 'Missing PHP method', method: methodName });
      }
      php[methodName].apply(php, args.concat(function (err, result) {
         sendPhpResult(res, err, result);
      }));
   });
}

app.get('/', function (req, res) {
   res.sendFile(__dirname + "/index.html");
});

// VERB
// GET    - read
// POST   - create
// PUT    - update
// DELETE - delete

app.get('/list', function (req, res) {
   console.log("LIST")
   callPhp(res, 'grablist', []);
});

app.get('/list/:id', function (req, res) {
   console.log("LIST ID", req.params.id);
   callPhp(res, 'grabseries', [req.params.id]);
});

app.get('/issues/:id', function (req, res) {
   console.log(req.params.id);
   callPhp(res, 'grabissues', [req.params.id]);
});

app.get('/issue/:id', function (req, res) {
   console.log(req.params.id);
   callPhp(res, 'grabissue', [req.params.id]);
});

app.get('/admin', function (req, res) {
   res.sendFile(__dirname + "/admin.html");
});

app.get('/title/:id', function (req, res) {
   console.log("The ID", req.params.id);
   callPhp(res, 'grabtitle', [req.params.id]);
});

// Title CRUD
app.post('/title', function (req, res) {
   console.log('CREATE TITLE', req.body);
   callPhp(res, 'createtitle', [req.body.name]);
});

app.put('/title/:id', function (req, res) {
   console.log('UPDATE TITLE', req.params.id, req.body);
   callPhp(res, 'updatetitle', [req.params.id, req.body.name]);
});

app.delete('/title/:id', function (req, res) {
   console.log('DELETE TITLE', req.params.id);
   callPhp(res, 'deletetitle', [req.params.id]);
});

// Series CRUD
app.get('/series', function (req, res) {
   console.log('GET SERIES LIST', req.query);
   callPhp(res, 'grabserieslist', [JSON.stringify(req.query)]);
});

app.get('/series/:id', function (req, res) {
   console.log('GET SERIES', req.params.id);
   callPhp(res, 'grabseriebyid', [req.params.id]);
});

app.get('/series/:id/grid', function (req, res) {
   console.log('GET SERIES GRID', req.params.id);
   callPhp(res, 'grabseriesgrid', [req.params.id]);
});

app.get('/series/:id/missing', function (req, res) {
   console.log('GET SERIES MISSING SLOTS', req.params.id);
   callPhp(res, 'grabseriesmissing', [req.params.id]);
});

app.post('/series', function (req, res) {
   console.log('CREATE SERIES', req.body);
   callPhp(res, 'createseries', [JSON.stringify(req.body)]);
});

app.put('/series/:id', function (req, res) {
   console.log('UPDATE SERIES', req.params.id, req.body);
   callPhp(res, 'updateseries', [req.params.id, JSON.stringify(req.body)]);
});

app.delete('/series/:id', function (req, res) {
   console.log('DELETE SERIES', req.params.id);
   callPhp(res, 'deleteseries', [req.params.id]);
});

// Issue CRUD
app.get('/issues', function (req, res) {
   console.log('GET ISSUES LIST', req.query);
   callPhp(res, 'grabissueslist', [JSON.stringify(req.query)]);
});

app.get('/issue/:id/raw', function (req, res) {
   console.log('GET ISSUE RAW', req.params.id);
   callPhp(res, 'grabissueraw', [req.params.id]);
});

app.post('/issue', function (req, res) {
   console.log('CREATE ISSUE', req.body);
   callPhp(res, 'createissue', [JSON.stringify(req.body)]);
});

app.put('/issue/:id', function (req, res) {
   console.log('UPDATE ISSUE', req.params.id, req.body);
   callPhp(res, 'updateissue', [req.params.id, JSON.stringify(req.body)]);
});

app.delete('/issue/:id', function (req, res) {
   console.log('DELETE ISSUE', req.params.id);
   callPhp(res, 'deleteissue', [req.params.id]);
});

// Publisher
app.get('/publishers', function (req, res) {
   console.log('GET PUBLISHERS');
   callPhp(res, 'grabpublishers', []);
});

app.get('/dashboard', function (req, res) {
   console.log('GET DASHBOARD');
   callPhp(res, 'grabdashboard', []);
});

// Series Type
app.get('/series-types', function (req, res) {
   console.log('GET SERIES TYPES');
   callPhp(res, 'grabseriestypes', []);
});

app.get('/publisher/:id', function (req, res) {
   console.log('GET PUBLISHER', req.params.id);
   callPhp(res, 'grabpublisher', [req.params.id]);
});

app.post('/publisher', function (req, res) {
   console.log('CREATE PUBLISHER', req.body);
   callPhp(res, 'createpublisher', [JSON.stringify(req.body)]);
});

app.put('/publisher/:id', function (req, res) {
   console.log('UPDATE PUBLISHER', req.params.id, req.body);
   callPhp(res, 'updatepublisher', [req.params.id, JSON.stringify(req.body)]);
});

app.delete('/publisher/:id', function (req, res) {
   console.log('DELETE PUBLISHER', req.params.id);
   callPhp(res, 'deletepublisher', [req.params.id]);
});

// CSV Import (preview only)
app.post('/import/csv/preview', function (req, res) {
   console.log('CSV IMPORT PREVIEW');
   callPhp(res, 'previewcsvimport', [JSON.stringify(req.body)]);
});

app.post('/import/csv/commit', function (req, res) {
   console.log('CSV IMPORT COMMIT');
   callPhp(res, 'commitcsvimport', [JSON.stringify(req.body)]);
});

app.get('/import/csv/skipped/:runId', function (req, res) {
   console.log('CSV IMPORT SKIPPED ROWS', req.params.runId, req.query);
   callPhp(res, 'grabcsvimportskippedrows', [req.params.runId, String(req.query.limit || '500')]);
});

app.get('/import/csv/runs', function (req, res) {
   console.log('CSV IMPORT RUNS', req.query);
   callPhp(res, 'grabcsvimportruns', [String(req.query.limit || '50')]);
});

app.get('/import/csv/skipped/:runId/export', function (req, res) {
   console.log('CSV IMPORT SKIPPED ROWS EXPORT', req.params.runId, req.query);
   const safeRunId = String(req.params.runId || 'import-run').replace(/[^a-zA-Z0-9_-]/g, '_');
   res.setHeader('Content-Type', 'text/csv; charset=utf-8');
   res.setHeader('Content-Disposition', `attachment; filename="${safeRunId}-skipped-rows.csv"`);
   callPhp(res, 'grabcsvimportskippedrowscsv', [req.params.runId, String(req.query.limit || '2000')]);
});

// Error-handling middleware — must have 4 params so Express treats it as error handler
app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
   console.error('Unhandled error:', err);
   res.status(500).json({ error: 'Internal server error' });
});

app.listen('3000', function () {
   console.log("Listening on port 3000");
});
