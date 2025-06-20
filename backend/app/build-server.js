const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const api = require('./api');

module.exports = (cb) => {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(bodyParser.json({}));
  app.use(morgan('[:date[iso]] :method :url :status :response-time ms - :res[content-length]'));

  // Serve static files from the Angular app's src folder
  app.use(express.static(path.join(__dirname, '../../frontend/src')));

  // API routes
  app.use('/api', api);

  // Redirect /api/ to the WelcomePageComponent
  app.get('/api', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/index.html'));
  });

  // Catch-all route to serve Angular's index.html for unmatched routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/index.html'));
  });

  const server = app.listen(process.env.PORT || 9428, () => cb && cb(server));
};
