var express = require('express');
var router = express.Router();

// Get to the Homepage
router.get('/', function(request, response) {
  response.render('pages/index');
});

module.exports = router;