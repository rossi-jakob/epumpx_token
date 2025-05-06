const axios = require('axios')
const { getAddress } = require('viem')
const Chat = require("../models/Chat")
const { queryUrl } = require("../config/config")

module.exports.getOffChainCurveInfo = async () => {
    console.log("Getting repliesInfo ...")
    
    try {
        const rlt = await Chat.aggregate([
            {
                $group: {
                    _id: "$tokenAddress",
                    replies: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    address: "$_id",
                    replies: 1
                }
            }
        ]);

        const currentKingQuery = `query {
            currentKingOfTheHills(first: 1) {
                token
                address
            }
        }`

        const response = await axios.post(queryUrl, {
            query: currentKingQuery
        })
        const _currentKing = response.data.data?.currentKingOfTheHills?.length > 0 ?
            response.data.data?.currentKingOfTheHills[0].token : '0x0000000000000000000000000000000000000000';
        const kingReplies = rlt.find(item => _currentKing.toLowerCase() === item.address.toLowerCase())
        if (!kingReplies) {
            rlt.push({
                address: getAddress(_currentKing),
                replies: 0
            })
        }

        console.log("Getting repliesInfo successfully.")

        return rlt
    } catch (e) {
        console.log("Get Curve Information failed: ", e)
        return []
    }
}

exports.sleep = (ms) => new Promise(r => setTimeout(r, ms));