var express = require('express'),
   bodyParser = require('body-parser'),
   app = express(),
   execPhp = require('exec-php');

// Tell Express to use this module -- This is middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware
app.use('/views',express.static(__dirname + "/views"));
app.use('/build/css',express.static(__dirname + "/build/css"));
app.use('/build/fonts',express.static(__dirname + "/build/fonts"));
app.use('/build/js',express.static(__dirname + "/build/js"));

var data;

app.get('/', function(req, res) {
   res.sendFile(__dirname + "/index.html");
});

// VERB
// GET    - read
// POST   - create
// PUT    - update
// DELETE - delete

app.get('/list',function(req, res){
   console.log("LIST")

   execPhp(__dirname + '/api.php', function(error, php, data){
      res.send(data);
   });
});

app.get('/list/:id',function(req, res){
   console.log("LIST ID", req.params.id);

   execPhp(__dirname + '/api.php', function(error, php, data){
      php.grabseries(req.params.id, function(err, result, output, printed){
      res.send(result);
      });
   });
});

app.get('/issues/:id',function(req, res){
   console.log(req.params.id);

   execPhp(__dirname + '/api.php', function(error, php, data){
      php.grabissues(req.params.id, function(err,result,output,printed){

         console.log("RESULTS", err,result,output,printed);
         res.send(result);
      });
   });
});

app.get('/issue/:id',function(req, res){
   console.log(req.params.id);

   execPhp(__dirname + '/api.php', function(error, php, data){
      php.grabissue(req.params.id, function(err,result,output,printed){

         console.log("RESULTS", err,result,output,printed);
         res.send(result);
      });
   });
});

app.get('/admin', function(req, res) {
   res.sendFile(__dirname + "/admin.html");
});

app.get('/title/:id',function(req, res){
   console.log("The ID", req.params.id);

   execPhp(__dirname + '/api.php', function(error, php, data){
      php.grabtitle(req.params.id, function(err,result,output,printed){

         console.log("ERR", err);
         console.log("result", result);
         console.log("output", output);
         console.log("printed", printed);

         res.send(result);
      });
   });
});

// Title CRUD
app.post('/title', function(req, res) {
   console.log('CREATE TITLE', req.body);
   execPhp(__dirname + '/api.php', function(error, php, data) {
      php.createtitle(req.body.name, function(err, result) {
         res.send(result);
      });
   });
});

app.put('/title/:id', function(req, res) {
   console.log('UPDATE TITLE', req.params.id, req.body);
   execPhp(__dirname + '/api.php', function(error, php, data) {
      php.updatetitle(req.params.id, req.body.name, function(err, result) {
         res.send(result);
      });
   });
});

app.delete('/title/:id', function(req, res) {
   console.log('DELETE TITLE', req.params.id);
   execPhp(__dirname + '/api.php', function(error, php, data) {
      php.deletetitle(req.params.id, function(err, result) {
         res.send(result);
      });
   });
});

// Series CRUD
app.get('/series/:id', function(req, res) {
   console.log('GET SERIES', req.params.id);
   execPhp(__dirname + '/api.php', function(error, php, data) {
      php.grabseriebyid(req.params.id, function(err, result) {
         res.send(result);
      });
   });
});

app.post('/series', function(req, res) {
   console.log('CREATE SERIES', req.body);
   execPhp(__dirname + '/api.php', function(error, php, data) {
      php.createseries(JSON.stringify(req.body), function(err, result) {
         res.send(result);
      });
   });
});

app.put('/series/:id', function(req, res) {
   console.log('UPDATE SERIES', req.params.id, req.body);
   execPhp(__dirname + '/api.php', function(error, php, data) {
      php.updateseries(req.params.id, JSON.stringify(req.body), function(err, result) {
         res.send(result);
      });
   });
});

app.delete('/series/:id', function(req, res) {
   console.log('DELETE SERIES', req.params.id);
   execPhp(__dirname + '/api.php', function(error, php, data) {
      php.deleteseries(req.params.id, function(err, result) {
         res.send(result);
      });
   });
});

// Issue CRUD
app.post('/issue', function(req, res) {
   console.log('CREATE ISSUE', req.body);
   execPhp(__dirname + '/api.php', function(error, php, data) {
      php.createissue(JSON.stringify(req.body), function(err, result) {
         res.send(result);
      });
   });
});

app.put('/issue/:id', function(req, res) {
   console.log('UPDATE ISSUE', req.params.id, req.body);
   execPhp(__dirname + '/api.php', function(error, php, data) {
      php.updateissue(req.params.id, JSON.stringify(req.body), function(err, result) {
         res.send(result);
      });
   });
});

app.delete('/issue/:id', function(req, res) {
   console.log('DELETE ISSUE', req.params.id);
   execPhp(__dirname + '/api.php', function(error, php, data) {
      php.deleteissue(req.params.id, function(err, result) {
         res.send(result);
      });
   });
});

app.listen('3000',function(){
   console.log("Listening on port 3000");
});
