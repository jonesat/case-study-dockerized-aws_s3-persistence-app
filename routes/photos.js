const express = require('express');
const url = require('url')
const qs = require('querystring');
const { receiveMessageOnPort } = require('worker_threads');
const router = express.Router();


// ##################################################
// tokenize search input and rebuild as csv string using text.split(/\W+/) to guard http requests
// ##################################################


require('dotenv').config()
async function parseAndCreatePage(rsp,query) {
  
  photoData = []
  let country,photo,news;
  for (let i=0; i < rsp.photos.perpage; i++) {
      photo = rsp.photos.photo[i];        
      // Something goes wrong in here if there is a null packet. Need to pause and retry if an error.
      t_url = `http://farm${photo.farm}.static.flickr.com/${photo.server}/${photo.id}_${photo.secret}_z.jpg`;
      p_url = `http://www.flickr.com/photos/${photo.owner}/${photo.id}`;
      
      country = await getCountry(photo.longitude,photo.latitude)
      news = await getHeadlines(country)
      photoData.push({
        id:photo.id,
        fullUrl:p_url,
        altText:photo.title,
        thumbUrl:t_url,
        news:news,
        country:country.toUpperCase()
      })
      
  }
  return photoData
} 

async function getCountry(longitude,latitude){
  const key = process.env.MAPQUEST_API_KEY  
  const url =`https://www.mapquestapi.com/geocoding/v1/reverse?key=${key}&location=${longitude},${latitude}&includeRoadMetadata=true&includeNearestIntersection=true`
  try{
    const response = await fetch(url)
    const data = await response.json()
    const resultsData = data.results[0]
    const locationData = resultsData.locations[0]
    // const country = locationData.adminArea1
    if (typeof locationData ==="object" && locationData.adminArea1!==""){
      return locationData.adminArea1.toLowerCase();
    } else{
      return "us"
    }
  }catch(err){
    console.log(err)
  }
 
}


async function getHeadlines(country){
  const key = process.env.NEWSAPI_API_KEY  
  const pageSize = 4;
  const url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${key}&pageSize=${pageSize}`
  
  try{
    const response = await fetch(url)
    let data = await response.json()    
    let payload = Object.values(data.articles).slice(0,4)
    
    return payload    
  }catch(err){
    console.log(err)
  }


}


const flickr = {
  method: 'flickr.photos.search',
  api_key: process.env.FLICKER_API_KEY,
  format: 'json',
  media: "photos",
  nojsoncallback:1,
  safesearch:1
}

function createFlickrPhotoSearchOptions(query,number){
  let options = {
      hostname: 'api.flickr.com',
      port: 443,
      path: '/services/rest/?',
      method: 'GET'
  }

  const str = `method=${flickr.method}`+
  `&api_key=${flickr.api_key}`+
  `&tags=${query}`+
  `&per_page=${number}`+
  `&format=${flickr.format}`+
  `&media=${flickr.media}`+
  `&nojsoncallback=${flickr.nojsoncallback}`+
  `&safe_search=${flickr.safesearch}`+
  `&has_geo=1`+
  `&extras=geo`
  options.path+=str
  return options
}

/* GET home page. */
router.get("/full", async function(req, res) {
    const query = req.query    
    const options = createFlickrPhotoSearchOptions(query['query'], query['number']);
    const url = `https://${options.hostname}${options.path}`        
    const response = await fetch(url)
    const data = await response.json()
    photoData = await parseAndCreatePage(data,query)
    footer = `The number of requests (vs views) made to this web application is: ${res.locals.counter}`

    res.render("photos",{ title:"Search for photos and get some news for that region",footer:footer,photos:photoData })
})

module.exports = router;
