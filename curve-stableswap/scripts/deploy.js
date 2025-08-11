const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Token0
  const Token0 = await ethers.getContractFactory("Token0");
  const token0 = await Token0.deploy(
    "USD Coin", // name
    "USDC",     // symbol
    6,          // decimals (USDC has 6 decimals)
    ethers.utils.parseUnits("10000", 6) // 10,000 USDC initial supply
  );
  await token0.deployed();
  console.log("Token0 (USDC) deployed to:", token0.address);

  // Deploy Token1
  const Token1 = await ethers.getContractFactory("Token1");
  const token1 = await Token1.deploy(
    "Tether USD", // name
    "USDT",       // symbol
    6,            // decimals (USDT has 6 decimals)
    ethers.utils.parseUnits("10000", 6) // 10,000 USDT initial supply
  );
  await token1.deployed();
  console.log("Token1 (USDT) deployed to:", token1.address);

  // Deploy LP Token
  const LPToken = await ethers.getContractFactory("LPToken");
  const lpToken = await LPToken.deploy(
    "Curve USDC-USDT LP Token", // name
    "crvUSDCUSDT"               // symbol
  );
  await lpToken.deployed();
  console.log("LP Token deployed to:", lpToken.address);

  // Deploy StableSwap Pool
  const StableSwap = await ethers.getContractFactory("StableSwap");
  const stableSwap = await StableSwap.deploy(
    deployer.address,           // owner
    [token0.address, token1.address], // coins array
    lpToken.address,            // pool token
    100,                        // A parameter (amplification coefficient)
    4000000,                    // fee (0.04% = 4000000 / 10^10)
    5000000000                  // admin fee (50% of trading fees = 5000000000 / 10^10)
  );
  await stableSwap.deployed();
  console.log("StableSwap Pool deployed to:", stableSwap.address);

  // Set the pool as the minter for LP token
  await lpToken.set_minter(stableSwap.address);
  console.log("LP Token minter set to StableSwap Pool");

  // Approve tokens for the pool (optional - for initial liquidity)
  const approveAmount = ethers.utils.parseUnits("5000", 6); // 5000 tokens
  await token0.approve(stableSwap.address, approveAmount);
  await token1.approve(stableSwap.address, approveAmount);
  console.log("Tokens approved for pool");

  console.log("\n=== Deployment Summary ===");
  console.log("Token0 (USDC):", token0.address);
  console.log("Token1 (USDT):", token1.address);
  console.log("LP Token:", lpToken.address);
  console.log("StableSwap Pool:", stableSwap.address);
  console.log("Deployer:", deployer.address);

  // Display token balances
  const token0Balance = await token0.balanceOf(deployer.address);
  const token1Balance = await token1.balanceOf(deployer.address);
  console.log("\n=== Token Balances ===");
  console.log("USDC Balance:", ethers.utils.formatUnits(token0Balance, 6));
  console.log("USDT Balance:", ethers.utils.formatUnits(token1Balance, 6));

  // Save deployment addresses to a file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      token0: token0.address,
      token1: token1.address,
      lpToken: lpToken.address,
      stableSwap: stableSwap.address
    },
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    `deployment-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\nDeployment info saved to deployment-${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });