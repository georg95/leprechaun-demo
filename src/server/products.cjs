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

const SKU_DB = {
    '2F3B4A33FC7E8A61C70E74F958C291DF': 'Костюм «Dri-FIT»',
    '3CBA4607809D119DA4710ED80EC34F8C': 'Костюм «Duo Pink»',
    'E4CBE8BA3DBC3C6E2E85EC808EFCF3F5': 'Костюм «Up Drei»',
    '91EAD5D4A1205DE123B751E9B5322BB8': 'Костюм «Comfort»',
    '95333638A9E567B1BCC0DDAFC91A39A7': 'Костюм «Trapstar»',
    '4CA87881AC2B71D637FBBBB938AAE2F8': 'Костюм «Solday»',
    'E34C40EFE375EE176F6D55C4FDCB9D21': 'Костюм «Better Boozy»',
    '6A4EE9D4447328F9978C552BAE90FDC4': 'Костюм «Sport Track RD»',
    '82679ED6AB16F320FC9566B50CBBA5E7': 'Костюм «PINK Fit»',
    'CDBEA39F10B7940DE5397B73F512EE6F': 'Костюм «Academy07»',
    '06F4CAE6A2764D141E53C3AC8282CD36': 'Костюм «Better Boozy»',
    '5D74B67E1DAC42C7526F27A6BDA73FF6': 'Костюм «Belive in love»',
    'FBBD26D7F689DCFAFA85A2B62833145B': 'Костюм «Let’s go»',
    '289AEBCA82877CB19E7AA33E0E522883': 'Костюм «School-PK»',
    '8770DB897247EF93B1EE66D6585156AB': 'Костюм «Classic 62-97»',
    '19AB58E7A981925E37850D2BFF503CA0': 'Костюм «FC Strike»',
}

function productExtraInfo(gtin, chart) {
    const avgSales = avg(chart.map(({ count }) => count))
    const avgPrice = avg(chart.map(({ price }) => price))
    const tail = Math.min(Math.round(chart.length * 0.85), chart.length - 3)
    const salesBoost = avg(chart.slice(tail).map(({ count }) => count)) / avgSales - 1
    const pricesBoost =  avg(chart.slice(tail).map(({ price }) => price)) / avgPrice - 1
    return {
        chart,
        gtin,
        name: SKU_DB[gtin] || 'Спортивный костюм (женский)',
        avgSales,
        salesBoost,
        pricesBoost,
        avgPrice,
        img: fs.existsSync(path.join(__dirname, `../../public/product-images/${gtin}.svg`)) ? `./product-images/${gtin}.svg` : null,
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
    }).filter(product => product.avgSales > 10)
    // скачки продаж низколиквидных товаров считаем случайными
    
    productsList.sort((a, b) => b.salesBoost - a.salesBoost)
    return productsList.slice(0, 10)
}

module.exports = { getProduct, getProductV2, topProducts }
