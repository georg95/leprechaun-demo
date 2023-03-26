import { parse } from 'csv-parse'
import { parse as parseSync } from 'csv-parse/sync'
import fs from 'fs'

const OUT_DIR = 'data/sorted'

const shopsMap = {}
const salesData = {}
const shopsCsv = parseSync(fs.readFileSync('./data/Справочник торговых точек.csv', 'utf8'), { columns: true })
shopsCsv.forEach(shop => {
    if (!shop.postal_code) {
        return
    }
    shopsMap[shop.id_sp_] = shop

    if (!salesData[shop.region_code]) {
        salesData[shop.region_code] = {}
    }
})


const salesFields = ['gtin', 'price', 'cnt']
const gtinIndex = salesFields.indexOf('gtin')
const priceIndex = salesFields.indexOf('price')
const cntIndex = salesFields.indexOf('cnt')
function mergeSales(salesData) {
    const merged = {}
    salesData.slice(1).forEach(sale => {
        const gtin = sale[gtinIndex]
        if (!merged[gtin]) {
            merged[gtin] = {sum: 0, count: 0}
        }
        const price = Number(sale[priceIndex])
        const count = Number(sale[cntIndex])
        if (!price || !count) {
            return // плохие данные
        }
        merged[gtin].sum += price * count
        merged[gtin].count += count
    })
    return [salesData.slice(0, 1)].concat(Object.keys(merged).map(gtin => {
        const row = []
        row[gtinIndex] = gtin
        row[priceIndex] = Math.round(merged[gtin].sum / merged[gtin].count)
        row[cntIndex] = merged[gtin].count
        return row
    }))
}

fs.createReadStream('./data/Данные о выводе товаров из оборота с 2021-11-22 по 2022-11-21 один производитель.csv', 'utf8')
  .pipe(parse({ columns: true }))
  .on('data', function (operation) {
    if (operation.type_operation !== 'Продажа конечному потребителю в точке продаж') {
        return
    }
    const shop = shopsMap[operation.id_sp_]
    if (!shop) {
        return
    }
    if (!salesData[shop.region_code][operation.dt]) {
        salesData[shop.region_code][operation.dt] = [salesFields.join(',')]
    }

    salesData[shop.region_code][operation.dt]
        .push(salesFields.map(field => operation[field]))
  })
  .on('end', () => {
    console.log('parse complete')
    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR)
    }
    for (let region in salesData) {
        const regionDir = `${OUT_DIR}/${region}`
        if (!fs.existsSync(regionDir)) {
            fs.mkdirSync(regionDir)
        }
        for (let date in salesData[region]) {
            fs.writeFileSync(`${regionDir}/${date}.csv`,
                mergeSales(salesData[region][date])
                    .map(row => row.join(',')).join('\n'), 'utf8')
        }
    }
  })