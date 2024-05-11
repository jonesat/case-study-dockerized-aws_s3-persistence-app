var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const AWS = require("aws-sdk");
require("dotenv").config();

const indexRouter = require('./routes/index');
const photosRouter = require('./routes/photos');
const newsRouter = require('./routes/news');

var app = express();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: "ap-southeast-2",
});


const s3 = new AWS.S3();

async function uploadJsonToS3(bucketName,label,payload) {
  const params = {
    Bucket: bucketName,
    Key: label,
    Body: JSON.stringify(payload), // Convert JSON to string
    ContentType: "application/json", // Set content type
  };

  try {
    await s3.putObject(params).promise();
    console.log("JSON file uploaded successfully.");
    console.log(`Updated visit counter to: ${jsonData.visitCount}`)  
  } catch (err) {
    console.error("Error uploading JSON file:", err);
  }
}

async function getObjectFromS3(bucketName,label) {
  const params = {
    Bucket: bucketName,
    Key: label,
  };

  try {
    const data = await s3.getObject(params).promise();    
    let parsedData = JSON.parse(data.Body.toString("utf-8"));
    return parsedData
  } catch (err) {
    console.error("Error:", err);
  }
}

async function updatecounter(bucketName,objectKey,jsonData){
  
  jsonData = await getObjectFromS3(bucketName,objectKey);  
  jsonData.visitCount++
  await uploadJsonToS3(bucketName,objectKey,jsonData)
  return jsonData
}

const bucketName = "s3";
const objectKey ="persistent_counter.json"
let jsonData = {
  appName:'docker',
  visitCount:0
}
let initliaseCounter = (async ()=> {
  s3.headObject({Bucket:bucketName,Key:objectKey}, async function(err,data) {
    if(err) {
      console.log(err)
      await uploadJsonToS3(bucketName,objectKey,jsonData)
      console.log("Initialised counter");
    } else {
      jsonData = await getObjectFromS3(bucketName,objectKey)
    }
  })
})

initliaseCounter();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req,res,next) => {
  try{
    jsonData = await updatecounter(bucketName,objectKey,jsonData)
    res.locals.counter = jsonData.visitCount
    next()
  } catch(err){
    next(err)
  }
  
});

app.use('/', indexRouter);
app.use('/search.photos', photosRouter);
app.use('/search.news',newsRouter)

// catch 404 and forward to error handler
app.use(async function(req, res, next) {
  
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
