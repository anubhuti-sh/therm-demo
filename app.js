require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

// mongodb config
require('./config/db');

// require routes
const indexRoute = require('./src/routes/index');

// Initializing express app
const app = express();

// Adds helmet middleware
app.use(helmet());

// Etag disable
app.set('etag', false);

// Body Parser Configuration
app.use(bodyParser.json({ // to support JSON-encoded bodies
  limit: '1mb',
}));

app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  limit: '1mb',
  extended: true,
}));

// Using CORS
app.use(cors());

// eslint-disable-next-line new-cap
const limiter = new rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 50, // limit each IP to 100 requests per windowMs
  delayMs: 0, // disable delaying - full speed until the max limit is reached
});

//  apply to all requests
app.use(limiter);

app.use(bodyParser.urlencoded({ extended: false }));

// Router Initialization
app.get('/v1', (req, res) => {
  res.status(200).json({
    msg: 'Welcome to unity therm',
  });
});
app.use('/v1/', indexRoute);

module.exports = app;
