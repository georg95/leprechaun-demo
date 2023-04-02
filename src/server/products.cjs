const fs = require('fs')
const path = require('path')
const { parse: parseSync } = require('csv-parse/sync')
const moment = require('moment')

const DATE = '2022-11-21'

function getRange(startDate, endDate) {
    let fromDate = moment(startDate)
    let toDate = moment(endDate)
    let diff = toDate.diff(fromDate, 'day')
    let range = []
    for (let i = 0; i < diff; i++) {
      range.push(moment(startDate).add(i, 'day').format('YYYY-MM-DD'))
    }
    return range
  }


function sum(array) {
    return array.reduce((a, b) => a + b, 0)
}

function avg(array) {
    return sum(array) / array.length
}

const metadataPath = path.join(__dirname, `../../public/product-images/products.json`)
const SKU_DB = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

function productExtraInfo(gtin, chart) {
    const avgSales = avg(chart.map(({ count }) => count))
    const avgPrice = avg(chart.map(({ price }) => price))
    const avgShops = avg(chart.map(({ shops }) => shops))
    const tail = Math.min(Math.round(chart.length * 0.85), chart.length - 3)
    const salesBoostCount = avg(chart.slice(tail).map(({ count }) => count)) / avgSales - 1
    const pricesBoost =  avg(chart.slice(tail).map(({ price }) => price)) / avgPrice - 1
    const shopsBoost = Math.round(avg(chart.slice(tail).map(({ shops }) => shops)) - avgShops)
    const salesBoostRevenue = Math.round(avgPrice * (pricesBoost + 1) * avgSales * salesBoostCount)
    const salesBoostPercentage = Math.round((pricesBoost + 1) * salesBoostCount * 100)
    const totalRevenue = sum(chart.map(({ price, count }) => price * count))
    const avgRevenue = totalRevenue / chart.length
    return {
        chart,
        gtin,
        name: SKU_DB[gtin] || 'Вода питьевая негазированная 0,5',
        salesBoostRevenue,
        salesBoostPercentage,
        pricesBoost,
        salesBoostCount,
        shopsBoost,
        avgPrice: Math.round(avgPrice),
        totalRevenue: Math.round(totalRevenue),
        avgRevenue: Math.round(avgRevenue),
        avgShops: Math.round(avgShops),
        avgSalesPerShop: Math.round(sum(chart.map(({ count }) => count)) / avgShops),
        img: SKU_DB[gtin] ? `./product-images/${gtin}.svg` : null,
    }
}

function fillGaps(chart, dateRange) {
    let lastPrice = chart.find(point => point).price
    for (let i = 0; i < chart.length; i++) {
        if (!chart[i]) {
            chart[i] = {
                count: 0,
                shops: 0,
                date: dateRange[i],
                price: lastPrice
            };
        } else {
            lastPrice = chart[i].price
        }
    }
}

function getProduct({ gtin, region, range }) {
    const dateRange = getRange(moment(DATE).add(-(Number(range) || 30), 'days'), DATE)

    const chart = []
    dateRange.forEach((date, i) => {
        const filename = path.join(__dirname, `../../data/sorted/${region}/${date}.csv`)
        if (!fs.existsSync(filename)) {
            console.error('missing', filename)
            return
        }
        const shopsCsv = parseSync(fs.readFileSync(filename, 'utf8'), { columns: true })
        const productDaySale = shopsCsv.find((sales) => sales.gtin === gtin)
        if (!productDaySale) {
            return
        }
        const { price, cnt } = productDaySale;
        chart[i] = { price: Number(price), count: Number(cnt), date }
    })

    fillGaps(chart, dateRange)

    return productExtraInfo(gtin, chart)
}

function getProductV2({ gtin, region, range }) {
    const dateRange = getRange(moment(DATE).add(-(Number(range) || 30), 'days'), DATE)
    const filename = path.join(__dirname, `../../data/sorted/products/${Number(region)}_${gtin}.csv`)
    if (!fs.existsSync(filename)) {
        return {error: `no ${filename} found`}
    }
    const productCsv = parseSync(fs.readFileSync(filename, 'utf8'), { columns: true })
    const productStatsByDate = {}
    productCsv.forEach((row) => {
        productStatsByDate[row.dt] = row
    })
    const chart = []
    dateRange.forEach((date, i) => {
        const productDaySale = productStatsByDate[date]
        if (!productDaySale) {
            return
        }
        const { mean_price, count_cnt, count_unique_id_sp } = productDaySale;
        chart[i] = {
            date,
            price: Number(mean_price),
            count: Number(count_cnt),
            shops: Number(count_unique_id_sp),
        }
    })

    fillGaps(chart, dateRange)

    return productExtraInfo(gtin, chart)
}

function topProducts({ region, range }) {
    const dateRange = getRange(moment(DATE).add(-(Number(range) || 30), 'days'), DATE)

    const products = {}
    dateRange.forEach((date, i) => {
        const filename = path.join(__dirname, `../../data/sorted/${region}/${date}.csv`)
        if (!fs.existsSync(filename)) {
            console.error('missing', filename)
            return
        }
        const shopsCsv = parseSync(fs.readFileSync(filename, 'utf8'), { columns: true })
        shopsCsv.forEach(({ gtin, price, cnt }) => {
            if(!products[gtin]) {
                products[gtin] = { chart: [], gtin }
            }
            products[gtin].chart[i] = { price: Number(price), count: Number(cnt), date }
        })
    })
    const productsList = Object.values(products).map(product => {
        fillGaps(product.chart, dateRange)
        return productExtraInfo(product.gtin, product.chart)
    })
    
    productsList.sort((a, b) =>
        b.salesBoostRevenue -
        a.salesBoostRevenue)
    return productsList.slice(0, 15)
}

module.exports = { getProduct, getProductV2, topProducts }
