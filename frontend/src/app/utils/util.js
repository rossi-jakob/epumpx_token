import Config from "@/app/config/config";
import axios from 'axios'
import { toast } from "react-toastify";

export const spliceAdress = (str, num = 0) => {
    if (str.length <= num) return str;
    if (num > 0) return str.slice(0, num - 1) + "..";
    return str.slice(0, 6) + "..." + str.slice(-4);
};

export const getApolloData = async (token = "0x0000000000000000000000000000000000000000") => {
    token = token.length > 42 ? token.slice(0, 42) : token
    if (isValidAddress(token)) {
        const tradeQuery = `query {
            trades(first: 1000, orderBy: blockTimestamp, orderDirection: desc, where:{token:"${token}", amount_gt: 0}) {
                id
                trader
                isBuy
                token
                amount
                eth
                blockTimestamp
                transactionHash
                address
            }
            balances(first: 20, orderBy: amount, orderDirection: desc, where:{token:"${token}" amount_gt: 0}) {
                token
                account
                amount
                address
            }
            buys(first: 1, orderBy:blockTimestamp, orderDirection:desc) {
                token
                buyer
                eth
                blockTimestamp
                transactionHash
                address
            }
            curveCreateds(first: 1, orderBy:blockTimestamp, orderDirection:desc) {
                token
                creator
                blockTimestamp
                transactionHash
                address
            }
            currentKingOfTheHills(first: 1) {
                token
                address
            }
        }`

        try {
            const response = await axios.post(Config.GRAPHQL_URL, {
                query: tradeQuery
            })
            // console.log("getApolloData ", response.data.data)
            return response.data.data
        } catch (error) {
            return {}
        }
    }
}

export const toastConfig = {
    style: {
        fontFamily: "Inter",
        fontSize: "20px",
        textTransform: "uppercase",
        borderColor: "black",
        borderWidth: "2px",
        borderRadius: "0px",
    }
}

export function getDefaultGas() {
    return Config.DEFAULT_GAS
}

export function formatNumber(num) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    } else {
        return num.toFixed(2);
    }
}

export const isValidAddress = (addr) => {
    const regex = /^(0x)?[0-9a-fA-F]{40}$/;
    return regex.test(addr);
};

export const timeAgo = (timestamp) => {
    let seconds = Math.floor((new Date() - timestamp) / 1000);
    seconds = seconds < 0 ? 0 : seconds
    let interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
}

export const copyAddress = (tokenAddr) => {
    if (navigator?.clipboard) {
        navigator.clipboard.writeText(tokenAddr);
        toast.success(`Copied the token address! 👌`, toastConfig)
    } else {
        toast.error(`Failed to copy the token address! 😒`, toastConfig)
    }
};

export const convertNumberFormat = (input, fixed) => {
    if (input >= 1000)
        return (Number(input) / 1000).toFixed(fixed).replace(/\.?0+$/, '').toString() + "k";
    else
        return Number(input).toFixed(fixed).replace(/\.?0+$/, '').toString();
}