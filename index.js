require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const shortid = require('shortid');
const url = require('url');
const mongoose= require('mongoose');
// Basic Configuration
const port = process.env.PORT || 3000;
const connectstring= process.env.MONGO_URI;
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(connectstring, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a URL schema
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String},
  shortUrl: { type: String},
});

const Url = mongoose.model('Url', urlSchema);

// Create short URL
app.get("/",(req,res)=>{
  res.sendFile(process.cwd()+"/views/index.html")
})
app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }
  // Generate a unique short code
  const shortUrl = shortid.generate();

  // Create and save URL in database
  const newUrl = new Url({ originalUrl: url, shortUrl });
  await newUrl.save();

  // Return the shortened URL
  res.json({ original_url:`${url}`, short_url: `${shortUrl}` });
});

// Redirect to original URL
app.get('/api/shorturl/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  console.log('Short URL:', shortUrl);
  // Find the original URL associated with the short code
  try {
    const urlEntry = await Url.findOne({ shortUrl: shortUrl });

  if (urlEntry) {
    // Redirect to the original URL
    res.redirect(urlEntry.originalUrl);
  } else {
    res.status(404).json({ error: 'URL not found' });
  } 
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
 
});
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
