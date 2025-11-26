const hre = require("hardhat");
const fs = require("fs");
const addresses = require("../deployed/EPumpXCurve.json");

async function main() {
  try {
    console.log("=== EPumpXCurve Deployment Script ===");

    await hre.run("clean");
    await hre.run("compile");

    // ------------------------------------------------------------
    // Signer Info
    // ------------------------------------------------------------
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer);
    const network = hre.network.name;

    console.log(`Network: ${network}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

    // ------------------------------------------------------------
    // Deploy EPumpXCurve (Implementation)
    // ------------------------------------------------------------
    console.log("Deploying EPumpXCurve...");
    const epumpXCurve = await hre.ethers.deployContract("EPumpXCurve");
    await epumpXCurve.waitForDeployment();
    console.log(`EPumpXCurve deployed at: ${epumpXCurve.target}\n`);

    // Verify implementation
    console.log("Waiting 10 seconds before verifying...");
    await new Promise((r) => setTimeout(r, 10000));

    console.log("Verifying EPumpXCurve...");
    try {
      await hre.run("verify:verify", {
        address: epumpXCurve.target,
        constructorArguments: [],
      });
      console.log("✓ Verified EPumpXCurve\n");
    } catch (e) {
      console.log("⚠ Verification failed:", e.message, "\n");
    }

    // ------------------------------------------------------------
    // Encode initializer data for Proxy
    // ------------------------------------------------------------
    console.log("Encoding initializer calldata...");

    const virtualX = "314333333333333333333";
    const virtualY = "1057466666666666666666666667";

    const iface = new hre.ethers.Interface([
      "function initialize(uint256 virtualX,uint256 virtualY)"
    ]);

    const initCalldata = iface.encodeFunctionData("initialize", [
      hre.ethers.parseUnits(virtualX, 0),
      hre.ethers.parseUnits(virtualY, 0),
    ]);

    console.log("Initializer calldata:", initCalldata, "\n");

    // ------------------------------------------------------------
    // Deploy TransparentUpgradeableProxy
    // ------------------------------------------------------------
    console.log("Deploying TransparentUpgradeableProxy...");
    const proxy = await hre.ethers.deployContract(
      "TransparentUpgradeableProxy",
      [
        epumpXCurve.target,  // implementation
        deployer.address,    // admin
        initCalldata,        // encoded data
      ]
    );

    await proxy.waitForDeployment();
    console.log(`Proxy deployed at: ${proxy.target}\n`);

    // ------------------------------------------------------------
    // Save Deployment JSON
    // ------------------------------------------------------------
    const updated = {
      ...addresses,
      [network]: {
        Implementation: epumpXCurve.target,
        ProxyAdmin: deployer.address,
        TransparentUpgradeableProxy: proxy.target,
      },
    };

    fs.writeFileSync(
      `deployed/EPumpXCurve.json`,
      JSON.stringify(updated, null, 2)
    );

    console.log("✓ Deployment saved to deployed/EPumpXCurve.json\n");
    console.log("=== Deployment Completed Successfully ===");

  } catch (err) {
    console.error("Deployment Failed:", err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
