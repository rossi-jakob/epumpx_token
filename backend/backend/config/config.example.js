const mode = 1; // mainnet: 1, testnet: 0

const curveAddress = {
    "mainnet": "0x0000000000000000000000000000000000000000",
    "sepolia": "0x0000000000000000000000000000000000000000"
};
const multicallAddress = {
    "mainnet": "0x0000000000000000000000000000000000000000",
    "sepolia": "0x0000000000000000000000000000000000000000"
};
const rpcUrl = {
    "mainnet": "https://mainnet.rpc",
    "sepolia": "https://sepolia.rpc"
};
const queryUrl = {
    "mainnet": "https://mainnet.query",
    "sepolia": "https://sepolia.query"
};

module.exports = {
    url: "mongodb://xxx.com:port/dbname",
    mainPort: 'port',
    curveAddress: mode ? curveAddress.mainnet : curveAddress.sepolia,
    multicallAddress: mode ? multicallAddress.mainnet : multicallAddress.sepolia,
    rpcUrl: mode ? rpcUrl.mainnet : rpcUrl.sepolia,
    queryUrl: mode ? queryUrl.mainnet : queryUrl.sepolia
}
