import { mainnet, bsc, bscTestnet } from "wagmi/chains"
import { http,createConfig } from 'wagmi'
import epixTestnet from './epixChainDefine'

//token = PAWRixwhWhWAYRP0zjDKCu69
const projectId = "49833b3043fb1dc08bcdccf7ab548c31";
//const rpcURL = `https://data-seed-prebsc-2-s2.bnbchain.org:8545`;
const rpcURL = `https://evmrpc.testnet.epix.zone/`;

const MODE:boolean = false; // TODO
let chain : any = MODE ? bsc : epixTestnet // TODO
chain = {
  id: chain.id,
  name: chain.name,
  nativeCurrency: chain.nativeCurrency,
  rpcUrls: {
    default: {
      http: [MODE ?
        'https://silent-quick-paper.base-mainnet.quiknode.pro/960a709e3aa976a19b08a53b4513146ee16adec5/' : // TODO
        // 'https://bnb-testnet.g.alchemy.com/v2/PkSg__OS-7f9zA6VGKy5UDEx1V28aD5-/'] // TODO
        rpcURL]
    },
  },
  blockExplorers: chain.blockExplorers,
  contracts: chain.contracts,
}

//logic contract 0xC4845d8d63Be6b9fe1AEdF060b8E5aC58fcec2A2     "0xC76EbF4c4461De3f88DE62286Eb4400C9B89E769","0x6B84106e33713730B90A7B375572A36985574907" : bsc  "0xC993865C05B1c6b3327b9C50d256A0060f1154d1" : epix
const curve = MODE ? "0x9A132b310eED1D8A15f92491A3026d0cDe773D91" : "0x86E6C00828A647e6A92f3bBDa76239f9cC5AA0a7" // TODO //"0xa76FA4197E7245E8E521006672d6B781BE1AbA08"

// const config = getDefaultConfig?.({
//   appName: 'chain', // TODO
//   projectId: projectId, // TODO
//   chains: [chain],
//   ssr: true,
// });

const wagmiConfig = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(rpcURL),
  },
})

// const epixTestnet = [
//   {
//     blockExplorerUrls: ["https://testscan.epix.zone"],
//     chainId: 168587773,
//     name: "Blast Sepolia",
//     rpcUrls: ["https://blast-sepolia.blockpi.network/v1/rpc/public"],
//     iconUrls: ["https://avatars.githubusercontent.com/u/132543920?v=4"],
//     nativeCurrency: {
//       name: "Epix",
//       symbol: "EPIX",
//       decimals: 18,
//     },
//     networkId: 168587773,
//     contracts: {
//       multicall3: {
//         address: '0xcA11bde05977b3631167028862bE2a173976CA11',
//         //blockCreated: 238315,
//         //blockCreated: 235990,
//       },
//     },
//   },
// ]

// export const wagmiConfig = createConfig({
//   chains: [
//     mainnet,
//     ...epixTestnet.map(getOrMapViemChain),
//   ],
//   client({ chain }) {
//     return createClient({
//       chain,
//       transport: http(rpcURL),
//     });
//   },
// });

const Config = {
  siteTitle: "Chain Fun",
  social: {
    twitter: "https://twitter.com/",
    telegram: "https://t.me/",
  },
  description: "Chain Fun",
  REFETCH_INTERVAL: 10000,
  MAX_UINT256: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  MAX_UINT256_HALF: '65792089237316195423570985008687907853269984665640564039457584007913129639935',
  API_URL: 'http://localhost:5000', // TODO
  GRAPHQL_URL: 'https://api.studio.thegraph.com/query/102185/bit-fun/v0.0.4', // TODO
  RPC_URL: rpcURL,
  PROJECT: 'chain',
  ACTION: true,
  CHAIN: chain,
  RAINBOW_CONFIG: wagmiConfig,
  config: wagmiConfig,
  POLICY_LINK: "https://chain.fun/privacy-policy",
  WETH_DEC: 18,
  DEFAULT_GAS: 0.02, // TODO for multi chains
  CURVE: curve,
  CURVE_VX: "314333333333333333333", // TODO //900 EPIX
  CURVE_VY: "1057466666666666666666666667", // TODO
  CURVE_HARDCAP: 3,
  CURVE_KINGCAP: 1.2,
  CURVE_SWAP_FEE: 0.01,
  CURVE_CREATE_FEE: 0.002,
  CURVE_DEC: 18,
  MULTICALL: '0xA14F6e211C01354d9a18290592d344d28cE0A5a2', //'0xcA11bde05977b3631167028862bE2a173976CA11',//,
  SCAN_LINK: chain.blockExplorers.default.url,
};

export default Config;