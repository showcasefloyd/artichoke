var express = require('express'),
   bodyParser = require('body-parser'),
   app = express(),
   execPhp = require('exec-php');

// Tell Express to use this module -- This is middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.grablist(function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

app.get('/list/:id', function (req, res) {
   console.log("LIST ID", req.params.id);

   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.grabseries(req.params.id, function (err, result, output, printed) {
         sendPhpResult(res, err, result);
      });
   });
});

app.get('/issues/:id', function (req, res) {
   console.log(req.params.id);

   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.grabissues(req.params.id, function (err, result, output, printed) {
         sendPhpResult(res, err, result);
      });
   });
});

app.get('/issue/:id', function (req, res) {
   console.log(req.params.id);

   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.grabissue(req.params.id, function (err, result, output, printed) {
         sendPhpResult(res, err, result);
      });
   });
});

app.get('/admin', function (req, res) {
   res.sendFile(__dirname + "/admin.html");
});

app.get('/title/:id', function (req, res) {
   console.log("The ID", req.params.id);

   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.grabtitle(req.params.id, function (err, result, output, printed) {
         sendPhpResult(res, err, result);
      });
   });
});

// Title CRUD
app.post('/title', function (req, res) {
   console.log('CREATE TITLE', req.body);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.createtitle(req.body.name, function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

app.put('/title/:id', function (req, res) {
   console.log('UPDATE TITLE', req.params.id, req.body);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.updatetitle(req.params.id, req.body.name, function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

app.delete('/title/:id', function (req, res) {
   console.log('DELETE TITLE', req.params.id);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.deletetitle(req.params.id, function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

// Series CRUD
app.get('/series/:id', function (req, res) {
   console.log('GET SERIES', req.params.id);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.grabseriebyid(req.params.id, function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

app.post('/series', function (req, res) {
   console.log('CREATE SERIES', req.body);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.createseries(JSON.stringify(req.body), function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

app.put('/series/:id', function (req, res) {
   console.log('UPDATE SERIES', req.params.id, req.body);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.updateseries(req.params.id, JSON.stringify(req.body), function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

app.delete('/series/:id', function (req, res) {
   console.log('DELETE SERIES', req.params.id);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.deleteseries(req.params.id, function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

// Issue CRUD
app.get('/issue/:id/raw', function (req, res) {
   console.log('GET ISSUE RAW', req.params.id);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.grabissueraw(req.params.id, function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

app.post('/issue', function (req, res) {
   console.log('CREATE ISSUE', req.body);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.createissue(JSON.stringify(req.body), function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

app.put('/issue/:id', function (req, res) {
   console.log('UPDATE ISSUE', req.params.id, req.body);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.updateissue(req.params.id, JSON.stringify(req.body), function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

app.delete('/issue/:id', function (req, res) {
   console.log('DELETE ISSUE', req.params.id);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.deleteissue(req.params.id, function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

// Publisher
app.get('/publishers', function (req, res) {
   console.log('GET PUBLISHERS');
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.grabpublishers(function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

app.get('/publisher/:id', function (req, res) {
   console.log('GET PUBLISHER', req.params.id);
   execPhp(__dirname + '/api.php', function (error, php, data) {
      php.grabpublisher(req.params.id, function (err, result) {
         sendPhpResult(res, err, result);
      });
   });
});

// Error-handling middleware — must have 4 params so Express treats it as error handler
app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
   console.error('Unhandled error:', err);
   res.status(500).json({ error: 'Internal server error' });
});

app.listen('3000', function () {
   console.log("Listening on port 3000");
});
