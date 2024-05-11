const express = require('express');
const url = require('url')
const qs = require('querystring');
const { receiveMessageOnPort } = require('worker_threads');
const router = express.Router();




require('dotenv').config()

async function getImages(headline) {
  const gridLimit = 4;
  let query = headline.title.split(/\W+/).Length>1?headline.title.split(/\W+/).join(","):headline.title
  

  const options = createFlickrPhotoSearchOptions(query,gridLimit);
  const url = `https://${options.hostname}${options.path}`   
  
  const response = await fetch(url)
  const data = await response.json()
  photoData = []
  let photo;
  for (let i=0; i < gridLimit; i++) {
      photo = data.photos.photo[i];        
      
      t_url = `http://farm${photo.farm}.static.flickr.com/${photo.server}/${photo.id}_${photo.secret}_z.jpg`;
      p_url = `http://www.flickr.com/photos/${photo.owner}/${photo.id}`;
      
   
      
      photoData.push({
        id:photo.id,
        fullUrl:p_url,
        altText:photo.title,
        thumbUrl:t_url,        
      })
      
  }
  headline['photoData'] = photoData  
  return headline
} 

async function getHeadlines(query,number){
  const key = process.env.NEWSAPI_API_KEY  
  const url = `https://newsapi.org/v2/top-headlines?q=${query}&apiKey=${key}&pageSize=${number}&nojsoncallback=1` 
  
  try{
    const response = await fetch(url)
    let data = await response.json()    
    let payload = Object.values(data.articles)
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
  `&safe_search=${flickr.safesearch}`  
  options.path+=str
  return options
}

/* GET home page. */
router.get("/full", async function(req, res) {
  
  const query = req.query['query']    
  let q = query.split(/\W+/).length>1?query.split(/\W+/):query;
  q = q.join('+')  
  let number = req.query['number']
  let headlines = await getHeadlines(q,number)

  try{   
    headlines = await Promise.all(headlines.map(async (h)=>{
      h = await getImages(h);
      return h
    }))  
  }catch(err){
    console.log(err)
  }
  footer = `The number of requests (vs views) made to this web application is: ${res.locals.counter}`

  res.render("news",{ title:"Search for news and get some photos related to that headline",footer:footer,news:headlines })
})

module.exports = router;
