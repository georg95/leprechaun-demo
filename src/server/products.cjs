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

function getShopsChart(dateRange) {
    // TODO
    const shopsCount = [6,8,20,9,10,15,17,16,23,28,22,21,22,27,22,33,26,26,29,25,22,20,23,24,18,21,17,16,17,21,19,19,20,26,23,32,32,38,24,41,33,33,39,44,57,48,35,39,47,50,47,63,47,46,45,48,54,46,47,45,52,44,38,45,47,61,46,40,46,53,42,43,50,47,37,42,45,46,49,52,37,43,37,42,37,39,59,38,37,38,36,55,49,54,59,42,46,56,69,53,71,63,63,40,66,56,67,72,91,56,56,65,57,69,80,77,47,54,48,62,51,67,76,53,49,46,45,49,49,50,27,24,35,31,39,53,47,33,26,27,32,55,76,64,63,64,62,57,66,95,86,55,63,52,55,73,85,77,61,39,50,53,59,52,50,45,32,33,42,52,78,71,41,67,56,70,78,96,90,61]
    const shopsChart = []
    for (let i = 0; i < dateRange.length; i++) {
        shopsChart.push({
            date: dateRange[i],
            shops: shopsCount[shopsCount.length - dateRange.length + i]
        })
    }
    return shopsChart
}

const SKU_DB = {
    '2F3B4A33FC7E8A61C70E74F958C291DF': 'Костюм «Dri-FIT»'
}

function productExtraInfo(gtin, chart, dateRange) {
    const avgSales = avg(chart.map(({ count }) => count))
    const tail = Math.min(Math.round(chart.length * 0.85), chart.length - 3)
    const salesBoost = avg(chart.slice(tail).map(({ count }) => count)) / avgSales - 1
    return {
        chart,
        shops: getShopsChart(dateRange),
        gtin,
        name: SKU_DB[gtin] || 'Спортивный костюм (женский)',
        avgSales,
        salesBoost,
        avgPrice: avg(chart.map(({ price }) => price)),
        img: fs.existsSync(path.join(__dirname, `../../public/product-images/${gtin}.svg`)) ? `./product-images/${gtin}.svg` : null,
    }
}

function fillGaps(chart, dateRange) {
    let lastPrice = chart.find(point => point).price
    for (let i = 0; i < chart.length; i++) {
        if (!chart[i]) {
            chart[i] = { count: 0, date: dateRange[i], price: lastPrice };
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

    return productExtraInfo(gtin, chart, dateRange)
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
        return productExtraInfo(product.gtin, product.chart, dateRange)
    }).filter(product => product.avgSales > 10)
    // скачки продаж низколиквидных товаров считаем случайными
    
    productsList.sort((a, b) => b.salesBoost - a.salesBoost)
    return productsList.slice(0, 10)
}

module.exports = { getProduct, topProducts }
