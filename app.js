'use strict';
if(process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}
//=============================================================================
/**
 * dependencies
 */
//=============================================================================
const
  express = require('express'),
  bParser = require('body-parser'),
  encodeURL = require('urlencode'),
  http = require('http'),
  app = express(),
  server = http.createServer(app);
//=============================================================================
/**
 * variables
 */
//=============================================================================
const
  PORT = process.env.PORT,
  ENV = process.env.NODE_ENV || 'development',
  OPERATION_NAME = process.env.OPERATION_NAME,
  SERVICE_VERSION = process.env.SERVICE_VERSION,
  SECURITY_APPNAME = process.env.SECURITY_APPNAME,
  GLOBAL_ID = process.env.GLOBAL_ID,
  RESPONSE_DATA_FORMAT = process.env.RESPONSE_DATA_FORMAT;
//=============================================================================
/**
 * config
 */
//=============================================================================
if(ENV != 'production') {
  app.use(require('morgan')('dev'));
  require('clarify');
}
//=============================================================================
/**
 * middleware pipeline
 */
//=============================================================================
app.use(bParser.json());
app.use(bParser.urlencoded({extended: true}));
//=============================================================================
/**
 * routes
 */
//=============================================================================
app.get('/test', (req, res) => res.status(200).json('ok'));
//=============================================================================
/**
 * bind server
 */
//=============================================================================
server.listen(PORT, () => {
  console.log(`Ebay Search Server up on port:${server.address().port} in ${ENV} mode`);
});
//=============================================================================
