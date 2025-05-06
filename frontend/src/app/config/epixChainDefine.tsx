import {
  Chain,
} from '@rainbow-me/rainbowkit';

const epixTestnet = {
  id: 1917,
  name: 'Epix Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'EPIX',
    symbol: 'EPIX',
  },
  rpcUrls: {
    default: { http: ['https://evmrpc.testnet.epix.zone/'] },
    public: { http: ['https://evmrpc.testnet.epix.zone/'] },
  },
  blockExplorers: {
    default: {
      name: 'EpixScan',
      url: 'https://testscan.epix.zone',
    },
  },
  contracts: {
    multicall3: {
      address: '0xA14F6e211C01354d9a18290592d344d28cE0A5a2',
      //blockCreated: 238315,
      //blockCreated: 235990,
    },
  },
} as const satisfies Chain;

export default epixTestnet;

// const blast = {
//   id: 81457,
//   name: 'Blast',
//   network: 'Blast',
//   //iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
//   //iconBackground: '#fff',
//   nativeCurrency: { name: 'Blast', symbol: 'ETH', decimals: 18 },
//   rpcUrls: {
//     default: { http: ['https://rpc.blast.io'] },
//     public: { http: ['https://rpc.blast.io'] },
//   },
//   blockExplorers: {
//     default: { name: 'BlastScan', url: 'https://blastscan.io' },
//   },
//   contracts: { // https://www.multicall3.com/deployments
//     multicall3: {
//       address: '0xcA11bde05977b3631167028862bE2a173976CA11',
//       blockCreated: 88189,
//     },
//   },
// } as const satisfies Chain;
