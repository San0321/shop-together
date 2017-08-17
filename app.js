var express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('port', (process.env.PORT || 5000) , function(){
  console.log("The Server is Running.");
});

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');
/*
app.use('/webhook', function(req, res, next) {
  req.request = request;
  next(); 
})
*/
  
const index = require('./routes/index');
const webhook = require('./routes/webhook');
//const add = require('./routes/add');

app.use('/', index);
app.use('/webhook', webhook);
//app.use('/add'. add);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});