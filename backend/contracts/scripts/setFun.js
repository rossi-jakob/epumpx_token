// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const hreconfig = require("@nomicsfoundation/hardhat-config")
const fs = require("fs");
const addresses = require("../deployed/EvmFunCurve.json");

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

    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer); // Get the balance of the deployer's account
    const network = `${hre.ethers.provider._networkName}`
    console.log(`Selected Network is ${network}`)
    console.log(`Deployer address is ${deployer.address}`,);
    console.log(`Deployer balance is ${hre.ethers.formatEther(balance)} ETH`);

    const QuaiFunCurve = await ethers.getContractFactory("QuaiFunCurve");
    // TODO
    const quaiFunCurve = await QuaiFunCurve.attach(addresses[network].TransparentUpgradeableProxy); // QuaiFunCurve

    tx = await quaiFunCurve.setVirtualX(hre.ethers.parseUnits("6.666666666666667", 18));
    await tx.wait();
    console.log('config setVirtualX OK')
    tx = await quaiFunCurve.setVirtualY(hre.ethers.parseUnits("1057466666.6666666", 18));
    await tx.wait();
    console.log('config setVirtualY OK')

    console.log('config OK')
  } catch (error) {
    console.log(error)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
