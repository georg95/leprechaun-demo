const express = require('express')
const cors = require('cors')
const { getProduct, topProducts } = require('./products.cjs')

const app = express()
app.use(cors())

app.get('/product', function(req, res) {
  console.log(req.path, req.query)
  res.send(JSON.stringify(getProduct(req.query)))
})

app.get('/top', function(req, res) {
  console.log(req.path, req.query)
  res.send(JSON.stringify(topProducts(req.query)))
})

app.listen(1234)