require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-vyper");
require("dotenv").config();

module.exports = {
  vyper: {
    compilers: [
      {
        version: "0.2.8",
      },
      {
        version: "0.3.7",
      },
    ],
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 20000000000, // 20 gwei
    },
    hardhat: {
      chainId: 1337,
    },
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};