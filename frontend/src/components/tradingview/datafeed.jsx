/* eslint-disable no-unused-vars */
// import { getFeedData } from "src/utils/feed";
import Config from "@/app/config/config";
import axios from "@/app/utils/axios";
import Socket from "@/app/utils/socket"

const resValues = {
    // minutes
    1: 1,
    3: 3,
    5: 5,
    15: 10,
    30: 30,
    // hours
    60: 60,
    120: 120,
    240: 240,
    360: 360,
    720: 720,
    // days
    "1D": 1440,
    "3D": 4320,
    "1W": 10080,
    "1M": 43200
};

function parseFullSymbol(fullSymbol) {
    const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
    if (!match) {
        return null;
    }

    return {
        exchange: match[1],
        fromSymbol: match[2],
        toSymbol: match[3],
    };
}

export const configurationData = {
    supported_resolutions: ["1", "5", "15", "30", "45", "60", "120", "240", "1D"],
};

const channelToSubscription = new Map();

let latestBar;
let realtime_callback;
// Chart Methods
// eslint-disable-next-line import/no-anonymous-default-export
const datafeed = (tokenId) => {
    return {
        onReady: (callback) => {
            setTimeout(() => callback(configurationData));
        },
        searchSymbols: async () => {
            // Code here...
        },
        resolveSymbol: async (
            symbolName,
            onSymbolResolvedCallback,
            onResolveErrorCallback
        ) => {
            let symbolInfo = {
                name: symbolName,
                has_intraday: true,
                has_no_volume: false,
                session: "24x7",
                timezone: "Europe/Athens",
                exchange: "Alphas",
                minmov: 0.00000001,
                pricescale: 100000000,
                has_weekly_and_monthly: true,
                volume_precision: 8,
                data_status: "streaming",
                supported_resolutions: configurationData.supported_resolutions,
            };

            onSymbolResolvedCallback(symbolInfo);
        },

        getBars: async (
            symbolInfo,
            resolution,
            periodParams,
            onHistoryCallback,
            onErrorCallback,
            // firstDataRequest
        ) => {
            const { from, to, firstDataRequest } = periodParams;
            
            const resVal = resValues[resolution];
            console.log("from, to, resolution => ", from, to, resVal)
            try {
                let url = `${Config.API_URL}/api/misc/prices`;

                const response = await axios.post(url, {
                    from, to,
                    interval: resVal * 60,
                    token: tokenId
                });
                if (response.status !== 200) {
                    onHistoryCallback([], { noData: false });
                    return;
                }
                // const data = await getFeedData(from, to, resVal, tokenId.toLowerCase())
                const data = response.data.success ? response.data.data : []

                if (!data.length) {
                    onHistoryCallback([], { noData: true });
                }

                let bars = data.map((el) => {
                    // let dd = new Date(el.startTimestampSeconds);
                    return {
                        time: el.startTimestampSeconds, //TradingView requires bar time in ms
                        low: el.low,
                        high: el.high,
                        open: el.open,
                        close: el.close,
                        volume: el.volumeUsd,
                    };
                });
                bars = bars.sort(function (a, b) {
                    if (a.time < b.time) return -1;
                    else if (a.time > b.time) return 1;
                    return 0;
                });

                latestBar = bars[bars.length - 1];
                window.delta = 0;

                onHistoryCallback(bars, { noData: false });
            } catch (error) {
                onErrorCallback(error);
            }
        },
        subscribeBars: (
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscribeUID,
            onResetCacheNeededCallback,
            lastDailyBar
        ) => {
            // console.log (lastDailyBar, symbolInfo, subscribeUID, "EEEE")
            const resVal = resValues[resolution];
            Socket.emit("SUBSCRIBE", tokenId, resVal)
            if (realtime_callback == undefined) {
                Socket.on('PRICE_DATA', (data) => {
                    console.log("Price Data : ", data);
                        const el = data
                        let newBar = {
                            time: el.startTimestampSeconds, //TradingView requires bar time in ms
                            open: el.open,
                            high: el.high,
                            low: el.low,
                            close: el.close,
                            volume: el.volumeUsd,
                        }
                        if (latestBar != undefined) {
                            if( latestBar.time < newBar.time)
                                newBar.open = latestBar.close
                            else
                                newBar.open = latestBar.open
                        }
                        latestBar = newBar
                        onRealtimeCallback(newBar)
                })
            }
        },
        unsubscribeBars: (subscriberUID) => {
            // Code here...
        },
    };
};

export default datafeed;