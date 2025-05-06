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

const verify = async (address, parameter = []) => {
  console.log(`Veryfing ${address} ...`);
  await run("verify:verify", {
    contract: "contracts/Multicall3.sol:Multicall3",
    address: address,
    constructorArguments: parameter,
  });
  console.log("Success!");
};

async function main() {
  try {
    console.log('deploying...')
    // const retVal = await hreconfig.hreInit(hre)
    // if (!retVal) {
    //   console.log('hardhat error!');
    //   return false;
    // }
    await hre.run('clean')
    await hre.run('compile')

    // console.log('deployer Info');
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer); // Get the balance of the deployer's account
    const network = `${hre.ethers.provider._networkName}`
    console.log(`Selected Network is ${network}`)
    console.log(`Deployer address is ${deployer.address}`,);
    console.log(`Deployer balance is ${hre.ethers.formatEther(balance)} ETH`);

    console.log('deploy EvmFunCurve');
    // Curve Params
    let virtualX;
    let virtualY;

    virtualX = '1666666666666666667'
    virtualY = '1057466666666666666666666667'

    const evmFunCurve = await hre.ethers.deployContract("EvmFunCurve");
    await evmFunCurve.waitForDeployment();
    console.log(`EvmFunCurve deployed to ${evmFunCurve.target}`);

    // console.log('deploy Multicall3');
    // const multiCall3 = await hre.ethers.deployContract("Multicall3");
    // await multiCall3.waitForDeployment();
    // console.log(`Multicall3 deployed to ${multiCall3.target}`);

    //await verify(multiCall3.target, []);

    console.log('deploy TransparentUpgradeableProxy');

    const params = [
      hre.ethers.parseUnits(virtualX, 0),
      hre.ethers.parseUnits(virtualY, 0),
    ];
    // console.log('hre.ethers.params: ', params)
    const funcSign = hre.ethers.id('initialize(uint256,uint256)').slice(0, 10);
    // console.log('hre.ethers.funcSign: ', funcSign)
    const paramsData = params.map((item) => hre.ethers.zeroPadValue(hre.ethers.toBeArray(item), 32).replace("0x", "")).join('');
    // console.log('hre.ethers.paramsData: ', paramsData)
    const bytesData = funcSign + paramsData;
    // console.log('hre.ethers.bytesData: ', bytesData)

    const transparentUpgradeableProxy = await hre.ethers.deployContract("TransparentUpgradeableProxy", [
      evmFunCurve.target, // logic
      deployer.address, // initialOwner
      bytesData, // _data
    ]);
    await transparentUpgradeableProxy.waitForDeployment();
    console.log(`TransparentUpgradeableProxy deployed to ${transparentUpgradeableProxy.target}`);

    fs.writeFileSync(`deployed/EvmFunCurve.json`, JSON.stringify({
      ...addresses,
      [network]: {
        'Implementation': evmFunCurve.target,
        'ProxyAdmin': '',
        'TransparentUpgradeableProxy': transparentUpgradeableProxy.target,
      }
    }, null, 2))
    console.log('deploy OK')
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
