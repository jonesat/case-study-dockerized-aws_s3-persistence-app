var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {  
  let words = [
    "query - corresponds to Flickr tags",
    "number - max number of results returned",
    'Example:<a href="search.photos/full?query=ragdoll,siamese,cat&number=10">search.photos/full?query=ragdoll,siamese,cat&number=10</a>',
    'Example:<a href="search.news/full?query=russia,war&number=10">search.news/full?query=russia,war&number=10</a>'
  ]
  description = "This app serves a two-fold purpose the first is for you to find pictures of things you are interested in and then provide you with news snippets from the area that photograph was taken in\n\
  The second purpose is for you to find news about topics of interest to you and then supply images related to that."
  footer = `The number of requests (vs views) made to this web application is: ${res.locals.counter}`

  res.render('index', { title: 'Photos and Words', description:description, footer:footer,words: words});
});

module.exports = router;

