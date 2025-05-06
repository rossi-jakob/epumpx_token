// deploy-multicall3.ts
const { createWalletClient, http } = require('viem')
const { privateKeyToAccount } = require('viem/accounts')
const { multicall3Abi, multicall3Bytecode } = require('./multicall3');
const { defineChain } = require('viem')
//import 'dotenv/config'

// Replace with your actual EPIX settings
const epixChain = defineChain({
  id: 1917,
  name: 'EPIX',
  nativeCurrency: { name: 'EPIX', symbol: 'EPIX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc.testnet.epix.zone/'] },
  },
})

const account = privateKeyToAccount(`0xd4100b37babe06c2262013d902a9605292cee27b39bde97bb3b3ca80c4797b44`)

const client = createWalletClient({
  account,
  chain: epixChain,
  transport: http(),
})

async function deploy() {
  const hash = await client.deployContract({
    abi: multicall3Abi,
    bytecode: multicall3Bytecode,
  })

  console.log('Transaction hash:', hash)

  // const receipt = await client.waitForTransactionReceipt({ hash })
  // console.log('✅ Multicall3 deployed at:', receipt.contractAddress)
}

deploy().catch(console.error)