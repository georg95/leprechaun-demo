const express = require('express')
const cors = require('cors')
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { getProduct, getProductV2, topProducts } = require('./products.cjs')

const app = express()
app.use(cors())

app.get('/product', function(req, res) {
  console.log(req.path, req.query)
  res.send(JSON.stringify(getProduct(req.query)))
})

app.get('/product_v2', function(req, res) {
  console.log(req.path, req.query)
  res.send(JSON.stringify(getProductV2(req.query)))
})

app.get('/top', function(req, res) {
  console.log(req.path, req.query)
  res.send(JSON.stringify(topProducts(req.query)))
})

const httpServer = http.createServer(app);
const httpsServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'ssl/privkey1.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/fullchain1.pem')),
}, app)

httpServer.listen(8081, () => {
    console.log('HTTP Server running on port 8081');
})

httpsServer.listen(8444, () => {
    console.log('HTTPS Server running on port 8444');
})
