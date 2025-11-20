import { ethers } from "hardhat";

async function main() {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const unlockTime = currentTimestampInSeconds + 60;

    const timeCapsule = await ethers.deployContract("TimeCapsule");

    await timeCapsule.waitForDeployment();

    console.log(
        `TimeCapsule deployed to ${timeCapsule.target}`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
