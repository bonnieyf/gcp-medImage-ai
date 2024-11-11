const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const storage = new Storage();
const BUCKET_NAME = 'demo-front-end-assets'; // Bucket

// Set environment variable (default to development)
const ENV = process.env.NODE_ENV || 'development';

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  const authenticated = req.session ? req.session.authenticated : false;
  if (authenticated) {
    next();
  } else {
    res.redirect('/signin');
  }
};

// Serve static HTML files
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'signin.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.send('Invalid username or password. <a href="/signin">Try again</a>');
  }
});

app.get('/signout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/signin');
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static assets based on environment
if (ENV === 'development') {
  // In development, serve assets from the local directory
  app.use('/assets', express.static(path.join(__dirname, 'assets')));
} else {
  app.get('/assets/:filename', async (req, res) => {
    const fileName = req.params.filename;

    try {
      const file = storage.bucket(BUCKET_NAME).file(`assets/${fileName}`);
      const stream = file.createReadStream();

      stream.on('error', (error) => {
        res.status(404).send('File not found.');
      });

      // Set appropriate Content-Type header based on file type
      if (fileName.endsWith('.css')) {
        res.set('Content-Type', 'text/css');
      } else if (fileName.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript');
      } else if (fileName.endsWith('.png')) {
        res.set('Content-Type', 'image/png');
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        res.set('Content-Type', 'image/jpeg');
      }

      stream.pipe(res);
    } catch (error) {
      res.status(500).send('Unable to load the resource.');
    }
  });
}

// Start the server
app.listen(8080, () => {
  console.log(`Server is running in ${ENV} mode on http://localhost:8080`);
});

module.exports = app;
