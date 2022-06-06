const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const app = express();
const cors = require ('cors');
const helmet = require('helmet')
const expressRateLimit = require('express-rate-limit');
const bodyParser = require('body-parser')
const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');
const {sequelize, Sequelize} = require('./models/index');
const pg = require('pg');


async function syncDb() {
  await sequelize.sync();
}

//Syncronize database
syncDb();

//Set up environment variables access
dotenv.config({path:".env"});

const apiRequestLimiter = expressRateLimit({
  windowMs: 5 * 60 * 1000, //request window : 5 minutes
  max: 10000, //max requests that can be sent by each ip address in the request window (1000 requests in 15 minutes)
  message: "Too much requests !"
});

//Limit requests
app.use(apiRequestLimiter);

//Allow CORS request
app.use(cors({
    origin:['http://localhost:3001','http://127.0.0.1:3000'],
    credentials:true
}));

//Set up helmet for security headers
app.use(helmet());

 app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, multipart/form-data, JSON');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Cross-Origin-Embedder-Policy', '*');
    res.setHeader('Cross-Origin-Resource-Policy', '*');
    next();
  });

  app.use(express.json());

  app.use('/api/',postRoutes);
  app.use('/api/',userRoutes);
  app.use('/images/', express.static(path.join(__dirname, 'images')));
  app.use('/images/default/', express.static(path.join(__dirname, 'default')));

module.exports = app;