module.exports = {
    allcoin: {
        status: 'broken'
    }, 
    bitso: {
        status: 'working',
        override: {
            has : {
                fetchOrder: true
            }
        }
    }
};