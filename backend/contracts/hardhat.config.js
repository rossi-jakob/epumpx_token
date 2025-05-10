require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

// Config from environment
const privateKey = process.env.PRIVATE_KEY;
const mnemonicPhrase = process.env.MNEMONIC;
const mnemonicPassword = process.env.MNEMONIC_PASSWORD;

const accounts = privateKey.length === 64 || privateKey.length === 66 ? [privateKey] : {
  mnemonic: mnemonicPhrase,
  path: 'm/44\'/60\'/0\'/0',
  initialIndex: 0,
  count: 1,
  passphrase: mnemonicPassword,
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
    ]
  },
  // defaultNetwork: epix_testnet,
  networks: {
    quai: {
      url: 'https://quai.rpc.com',
      accounts,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/2e84513f6543484b9a140bb3cb7cfef1`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
    bsc_testnet: {
      url: 'https://bsc-testnet-rpc.publicnode.com',
      //url: "https://data-seed-prebsc-2-s2.bnbchain.org:8545",
      chainID:97,
      accounts,
    },
    epix_testnet: {
      url: 'https://evmrpc.testnet.epix.zone/',
      chainID:1917,
      accounts,
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 40000,
  },
  etherscan: {
    apiKey: {
      epix_testnet: "epix"
    },
    customChains: [
      {
        network: "mainnet",
        chainId: 1,
        urls: {
          apiURL: "https://api.etherscan.io/api",
          browserURL: "https://etherscan.io/"
        }
      },
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io/"
        }
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/"
        }
      },
      {
        network: "base_sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/"
        }
      },
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com"
        }
      },
      {
        network: "bsc_testnet",
        chainId: 97,
        urls: {
          apiURL: "https://data-seed-prebsc-2-s2.bnbchain.org:8545",
          browserURL: "https://testnet.bscscan.com"
        }
      },
      {
        network: "epix_testnet",
        chainId: 1917,
        urls: {
          apiURL: "https://testscan.epix.zone/api/",
          browserURL: "https://testscan.epix.zone/"
        }
      },
    ]
  },
};
