# Summary
The web application that I call “Photos and Words” is a crude extension of in-class activities that attempts to combine the Flickr API with the NEWSAPI API via the MapQuest reverse geocoding API.
This application will allow a user to search for images of something they are interested in and then show them news articles relating to the area that the photographs were taken in. 
Or alternatively if a user is seeking news several images are pulled using the Flickr API that have tags relevant to the headline of a pulled news article. 
This mashup provides opportunities to explore a wider scope regarding the thing of interest enabling a deeper level of immersion in the standard netizen doomscrolling experience

I used node.js, express and express-generator with handlebars to create this web application.
This application is dockerized and was run on an aws ec2 instance running ubuntu. It additionally made use of an AWS s3 bucket to have a persistent visit counter.
