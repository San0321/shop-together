var express = require('express');
var router = express.Router();

// Get to the Homepage
router.get('/', function(request, response) {
 // response.render('pages/index');
});

router.post('/', function(request, response) {

});

module.exports = router;