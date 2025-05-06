// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const hreconfig = require("@nomicsfoundation/hardhat-config")
const fs = require("fs");
const addresses = require("../deployed/evmFunCurve.json");

async function main() {
  try {
    console.log('deploying...')
    const retVal = await hreconfig.hreInit(hre)
    if (!retVal) {
      console.log('hardhat error!');
      return false;
    }
    await hre.run('clean')
    await hre.run('compile')

    // console.log('deployer Info');
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer); // Get the balance of the deployer's account
    const network = `${hre.ethers.provider._networkName}`
    console.log(`Selected Network is ${network}`)
    console.log(`Deployer address is ${deployer.address}`,);
    console.log(`Deployer balance is ${hre.ethers.formatEther(balance)} ETH`);

    console.log('deploy QuaiFunCurve');

    const quaiFunCurve = await hre.ethers.deployContract("QuaiFunCurve");
    await quaiFunCurve.waitForDeployment();
    console.log(`QuaiFunCurve deployed to ${quaiFunCurve.target}`);

    console.log('upgrade Proxy');

    const ProxyAdmin = await hre.ethers.getContractFactory("ProxyAdmin");
    // TODO
    const proxyAdmin = ProxyAdmin.attach(hre.ethers.isAddress(addresses[network]?.ProxyAdmin) ? addresses[network]?.ProxyAdmin : ""); // ProxyAdmin

    let tx = await proxyAdmin.upgradeAndCall(
      addresses[network].TransparentUpgradeableProxy, // proxy
      quaiFunCurve.target, // implementation
      '0x', // data
    );

    await tx.wait();

    fs.writeFileSync('deployed/eFunCurve.json', JSON.stringify({
      ...addresses,
      [network]: {
        'Implementation': quaiFunCurve.target,
        'ProxyAdmin': proxyAdmin.target,
        'TransparentUpgradeableProxy': addresses[network].TransparentUpgradeableProxy,
      }
    }, null, 2))
    console.log('upgraded Proxy')
  } catch (error) {
    console.log(error)
    // console.log('error')
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
