const fs = require('fs')
const path = require('path')
const { topProducts } = require('./products.cjs')

const metadataPath = path.join(__dirname, `../../public/product-images/products.json`)
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

console.log('old metadata:', metadata)

const gtinTable = [
    topProducts({ range: '90', region: 77 }).map(product => product.gtin),
    topProducts({ range: '30', region: 77 }).map(product => product.gtin),
    topProducts({ range: '7', region: 77 }).map(product => product.gtin),
    topProducts({ range: '90', region: 78 }).map(product => product.gtin),
    topProducts({ range: '30', region: 78 }).map(product => product.gtin),
]

const sortedGtins = []
for (let i = 0; i < gtinTable[0].length; i++) {
    for (let gtins of gtinTable) {
        if (gtins[i] && !sortedGtins.includes(gtins[i])) {
            sortedGtins.push(gtins[i])
        }
    }
}

let i = 0
fs.mkdirSync(path.join(__dirname, `../../public/product-images-tmp`))
const newMetadata = {}
Object.keys(metadata).forEach(currentGtin => {
    const newGtin = sortedGtins[i]
    newMetadata[newGtin] = metadata[currentGtin]
    console.log('rename', currentGtin, '->', newGtin)
    fs.renameSync(
        path.join(__dirname, `../../public/product-images/${currentGtin}.svg`),
        path.join(__dirname, `../../public/product-images-tmp/${newGtin}.svg`))
    i++
})
fs.rmSync(path.join(__dirname, `../../public/product-images`), { recursive: true, force: true })
fs.renameSync(
    path.join(__dirname, `../../public/product-images-tmp`),
    path.join(__dirname, `../../public/product-images`))

fs.writeFileSync(metadataPath, JSON.stringify(newMetadata, null, 2), 'utf8')
console.log('new metadata:', newMetadata)
