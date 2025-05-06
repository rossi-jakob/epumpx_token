const socket = require("socket.io");
const Chat = require("../models/Chat")
const User = require("../models/User")
const { sleep } = require("./index")
const axios = require('axios')
const { queryUrl } = require("../config/config")

var io = null;
var clients = [];

var nowChatting = {}

exports.startWebSocketServer = (server, connectDone, disconnectDone) => {
    io = socket(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", async (socket) => {
        socket.on('JOIN', async (tokenAddress) => {
            console.log('JOIN', tokenAddress)
            socket.join(tokenAddress)

            socket.on("NEW_COMMENT", async (address, tokenAddress, comment, filePath, timestamp) => {
                console.log(`New comment! User=${address}`, tokenAddress, comment, filePath);
                if (nowChatting[address] && nowChatting[address][tokenAddress]) return

                nowChatting[address] = { [tokenAddress]: true }

                const _chat = await Chat.findOne({ address, tokenAddress, comment, timestamp })
                if (!_chat)
                    await Chat.create({
                        address,
                        tokenAddress,
                        comment,
                        filePath,
                        timestamp
                    })

                const allChats = await Chat.find({ tokenAddress }).sort({ timestamp: -1 })
                io.to(tokenAddress).emit('ALL_CHATS', allChats)
                nowChatting[address][tokenAddress] = false
            });

        })

        socket.on('CONNECTED', async (address, tokenAddress) => {
            if (address && tokenAddress) {
                socket.user = address
                console.log(`Connected websocket! User=${address}`, tokenAddress);

                if (connectDone) connectDone(socket)
            }
        })

        socket.on('GET_ALL_CHATS', async (tokenAddress) => {
            console.log("GET_ALL_CHATS", tokenAddress)
            if (tokenAddress) {

                const allChats = await Chat.find({ tokenAddress }).sort({ timestamp: -1 })
                socket.emit('ALL_CHATS', allChats)

                if (connectDone) connectDone(socket)
            }
        })

        socket.on('GET_TG_LOGIN', async (tgID) => {
            console.log("GET_TG_LOGIN", tgID)
            if (tgID) {

                const tgLoginInfo = await User.find({ tgID }).sort({ timestamp: -1 })
                console.log("tg from db=======================", tgLoginInfo)
                socket.emit('TG_LOGIN', tgLoginInfo)

                if (connectDone) connectDone(socket)
            }
        })

        socket.on("SUBSCRIBE", async (_tokenAddress, _interval) => {
            console.log("Subscribing...", _tokenAddress, _interval)
            try {
                let cnt = 0;
                const BLOCK_QUERY = `query {
                    _meta {
                        block {
                            number
                        }
                    }
                }`
                let lastBN = (await axios.post(queryUrl, {
                    query: BLOCK_QUERY
                }))?.data?.data?._meta?.block?.number
                let from = lastBN;
                let to = lastBN;

                while (cnt < 1000) {
                    let lastBN = (await axios.post(queryUrl, {
                        query: BLOCK_QUERY
                    }))?.data?.data?._meta?.block?.number
                    console.log("lastBN: ", lastBN)
                    to = lastBN;
                    if (to > from) {
                        console.log('from, to: ', cnt, from, to)
                        let PRICE_QUERY = `query {
                            trades(first: 1000, orderBy: blockTimestamp, orderDirection: desc, where:{token:"${_tokenAddress.toLowerCase()}", blockNumber_gt: ${from}, blockNumber_lte: ${to}}) {
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
                        }`;
                        const response = await axios.post(queryUrl, {
                            query: PRICE_QUERY
                        })
                        if (response.data && response.data.data && response.data.data.trades.length > 0) {
                            const prices = response.data.data.trades
                            console.log('prices: ', prices)
                            let volumeUsd = 0
                            try {
                                const lowPrice = prices.reduce((low, item) => Math.min(low, item.priceInUSD), Infinity);
                                const highPrice = prices.reduce((high, item) => Math.max(high, item.priceInUSD), -Infinity);
                                prices.map((item) => {
                                    if (item.priceInUSD && item.price && item.eth)
                                        volumeUsd += (Number(item.priceInUSD) / Number(item.price)) * (Number(item.eth) / 1_000_000_000 / 1_000_000_000)
                                })
                                const newData = {
                                    startTimestampSeconds: Number(prices[0].blockTimestamp) * 1000,
                                    low: Number(lowPrice) / 1_000_000_000_000,
                                    high: Number(highPrice) / 1_000_000_000_000,
                                    open: Number(prices[prices.length - 1].priceInUSD) / 1_000_000_000_000,
                                    close: Number(prices[0].priceInUSD) / 1_000_000_000_000,
                                    volumeUsd
                                }
                                console.log('socket.connected:', socket.connected);
                                if (socket.connected) {
                                    // console.log('PRICE_DATA:', newData);
                                    socket.emit("PRICE_DATA", newData)
                                    // console.log('PRICE_DATA_OK');
                                }
                            } catch (error) {
                                console.log('async next err:', error);
                            }
                        }
                        cnt++;
                        from = to;
                    }

                    await sleep(2000)
                }
            } catch (error) {
                console.log(error)
            }
        })

        socket.on("disconnect", () => {
            const address = socket.user ? socket.user : "UNKNOWN_USER"
            console.log(`Disconnected websocket! user=${address}`);
        });
    });
};

exports.getWebSocketClientList = () => {
    return clients;
};

exports.getIO = () => {
    return io;
};
