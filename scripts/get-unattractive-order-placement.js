const getUnattractiveOrderPlacement = require('./_common/get-unattractive-order-placement').getUnattractiveOrderPlacement

console.info('Note: parameters exepcted are : baseUrl, exchangeName, token, symbol, side')

const arguments = process.argv.slice(2)
getUnattractiveOrderPlacement.apply(this, arguments)
    .then(orderPlacement => {
        console.info({orderPlacement:orderPlacement})
    })
    .catch(error => {
        console.error(`Error in getUnattractiveOrderPlacement(${JSON.stringify(arguments)})`)
        console.trace(error)
        process.exit(1)
    })