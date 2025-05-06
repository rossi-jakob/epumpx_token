const { getOffChainCurveInfo } = require("../utils")
const axios = require('axios')
const { queryUrl } = require("../config/config")

/*
    keyStr: "search string",
    ticket: "CreateTime" || "RecentBscFun" || "MarketCap" || "Replies"
    direction: 0 || 1 // 0 : descending, 1: ascending
    includ: "All"
*/
module.exports.query = async ({ chainId, keyStr, ticket, direction, incld }) => {
    // direction = direction ? 1 : 0
    try {

        let tokenInfoList = await getOffChainCurveInfo();

        return {
            success: true,
            data: tokenInfoList
        }
    } catch (e) {
        console.log(e)
        return { success: false, msg: e.message }
    }

}

module.exports.getPrices = async ({ from, to, interval, token }) => {
    console.log("getPrice : ", from, to, token)
    let feedData = []
    console.log("Getting prices...", from, to, interval, token)
    let priceQuery = `query {
        trades(first: 1000, orderBy: blockTimestamp, orderDirection: asc, where:{blockTimestamp_gte: ${from}, blockTimestamp_lte: ${to}, token:"${token.toLowerCase()}"}) {
            id
            price
            priceInUSD
            amount
            isBuy
            eth
            blockTimestamp
            token
            address
        }
    }`
    try {
        let response = await axios.post(queryUrl, {
            query: priceQuery
        })

        if (response.data && response.data.data && response.data.data.trades.length > 0) {
            let prices = response.data.data.trades
            let deltas = []; let cur = 0
            if (prices.length > 1) prices.shift()
            for (let x = Number(prices[0].blockTimestamp); x <= to; x += interval) {
                let _prices = []
                if (prices[cur] && Number(prices[cur].blockTimestamp) < x + interval) {
                    while (prices[cur] && Number(prices[cur].blockTimestamp) < x + interval) {
                        _prices.push({
                            ...prices[cur],
                            priceInUSD: prices[cur].priceInUSD,
                        })
                        cur++
                    }
                    deltas.push(_prices)
                } else {
                    if (cur > 1) {
                        _prices.push({
                            priceInUSD: prices[cur - 1].priceInUSD,
                            eth: 0,
                            price: prices[cur - 1].price,
                            blockTimestamp: x,
                            token
                        })
                        deltas.push(_prices)
                    }
                }
            }

            if (deltas.length > 0) {
                const firstCandle = deltas[0]
                feedData.push({
                    startTimestampSeconds: (Number(firstCandle[0].blockTimestamp) - interval) * 1000,
                    low: 0,
                    high: Number(firstCandle[0].priceInUSD) / 1_000_000_000_000,
                    open: 0,
                    close: Number(firstCandle[0].priceInUSD) / 1_000_000_000_000,
                    volumeUsd: 0
                });
            }

            for (let i = 0; i < deltas.length; i++) {
                const dprices = deltas[i]
                let volumeUsd = 0
                const lowPrice = dprices.reduce((low, item) => Math.min(low, item.priceInUSD), Infinity);
                const highPrice = dprices.reduce((high, item) => Math.max(high, item.priceInUSD), -Infinity);
                dprices.map((item) => {
                    if (item.priceInUSD && item.price && item.eth)
                        volumeUsd += (Number(item.priceInUSD) / Number(item.price)) * (Number(item.eth) / 1_000_000_000 / 1_000_000_000)
                })
                feedData.push({
                    startTimestampSeconds: /* Math.floor(tokenPrices[0].timestamp / 1000) */ Number(dprices[0].blockTimestamp) * 1000,
                    low: Number(lowPrice) / 1_000_000_000_000,
                    high: Number(highPrice) / 1_000_000_000_000,
                    open: feedData.length > 1 ? feedData[feedData.length - 1].close : Number(dprices[0].priceInUSD) / 1_000_000_000_000,
                    close: dprices && dprices.length > 0 ? Number(dprices[dprices.length - 1].priceInUSD) / 1_000_000_000_000 : 0,
                    volumeUsd
                });
            }
        }
    } catch (err) {
        console.log("Getting barse failed...", err)
    }

    return {
        success: true,
        data: feedData
    }
}

module.exports.uploadLogo = async (fileName) => {
    return { success: true, data: fileName }
}
