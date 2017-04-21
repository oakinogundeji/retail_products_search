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
  request = require('superagent'),
  encodeURL = require('urlencode'),
  SEM3 = require('semantics3-node'),
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
  BASE_SEARCH_URL = process.env.BASE_SEARCH_URL,
  OPERATION_NAME = process.env.OPERATION_NAME,
  SERVICE_VERSION = process.env.SERVICE_VERSION,
  SECURITY_APPNAME = process.env.SECURITY_APPNAME,
  GLOBAL_ID = process.env.GLOBAL_ID,
  RESPONSE_DATA_FORMAT = process.env.RESPONSE_DATA_FORMAT,
  PAGE_PAGINATION = process.env.PAGE_PAGINATION,
  SEM3_KEY = process.env.SEM3_KEY,
  SEM3_SECRET = process.env.SEM3_SECRET,
  SEM3_SERVICE = SEM3(SEM3_KEY, SEM3_SECRET);
let searchURL = BASE_SEARCH_URL +'?OPERATION-NAME='+ OPERATION_NAME
  +'&SERVICE-VERSION='+ SERVICE_VERSION
  +'&SECURITY-APPNAME='+ SECURITY_APPNAME
  +'&GLOBAL-ID='+ GLOBAL_ID
  +'&RESPONSE-DATA-FORMAT=' + RESPONSE_DATA_FORMAT
  +'&REST-PAYLOAD';
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
 * helper functions
 */
//=============================================================================
function searchResponseHandler(root) {
  const items = root.findItemsByKeywordsResponse[0].searchResult[0].item || [];
  console.log('response from ebay...');
  return console.log(items);
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

app.get('/searchebay', (req, res) => {
  const item = encodeURL(req.query.item);
  searchURL += '&keywords=' + item +'&paginationInput.entriesPerPage=' + PAGE_PAGINATION;
  console.log(`search URL: ${searchURL}`);
  request
    .get(searchURL)
    .end(function (err, resp) {
      if(err) {
        console.log('ebay error...');
        console.error(err);
        return res.status(500).json(err);
      } else {
        console.log('ebay response body');
        if(resp.body.errorMessage) {
          console.log(resp.body.errorMessage.error[0]);
        }
        if(resp.body.findItemsByKeywordsResponse) {
          console.log(resp.body.findItemsByKeywordsResponse.errorMessage.error[0]);
        }
        console.log(resp.body);
        console.log('resp');
        console.log(resp.text);
        const data = JSON.parse(resp.text);
        return res.status(200).json(data.findItemsByKeywordsResponse[0].searchResult[0].item[0].primaryCategory[0].categoryName[0]);
      }
    });
});

app.get('/searchSEM3', (req, res) => {
  const
    endpoint = 'products',
    method = 'GET',
    queryObj = {search: ''},
    item = req.query.item;
  queryObj.search = item;
  const queryObjStr = JSON.stringify(queryObj);
  console.log('queryObjStr');
  console.log(queryObjStr);
  return SEM3_SERVICE.run_query(endpoint, queryObjStr, method, (err, products) => {
    if(err) {
      console.error(err);
      return res.status(500).json({error: err});
    } else {
      console.log('products:');
      console.log(products);
      const
        productsObj = JSON.parse(products),
        sampleItem = productsObj.results[0],
        brand = sampleItem.brand,
        category = sampleItem.category;
      return res.status(200).json({brand, category});
    }
  });

});
//=============================================================================
/**
 * bind server
 */
//=============================================================================
server.listen(PORT, () => {
  console.log(`Product Search Server up on port:${server.address().port} in ${ENV} mode`);
});
//=============================================================================
