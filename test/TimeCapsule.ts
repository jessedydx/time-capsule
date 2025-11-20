import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("TimeCapsule", function () {
    async function deployTimeCapsuleFixture() {
        const [owner, otherAccount] = await hre.ethers.getSigners();

        const TimeCapsule = await hre.ethers.getContractFactory("TimeCapsule");
        const timeCapsule = await TimeCapsule.deploy();

        return { timeCapsule, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            const { timeCapsule } = await loadFixture(deployTimeCapsuleFixture);
            expect(await timeCapsule.getAddress()).to.be.properAddress;
        });
    });

    describe("Capsules", function () {
        it("Should create a capsule", async function () {
            const { timeCapsule, owner } = await loadFixture(deployTimeCapsuleFixture);

            const unlockTime = Math.floor(Date.now() / 1000) + 60; // 1 minute in future
            const message = "Hello Future";

            await expect(timeCapsule.createCapsule(message, unlockTime))
                .to.emit(timeCapsule, "CapsuleCreated")
                .withArgs(0, owner.address, unlockTime);

            const capsule = await timeCapsule.getCapsule(0);
            expect(capsule.message).to.equal(message);
            expect(capsule.creator).to.equal(owner.address);
        });

        it("Should fail if unlock time is in the past", async function () {
            const { timeCapsule } = await loadFixture(deployTimeCapsuleFixture);
            const unlockTime = Math.floor(Date.now() / 1000) - 60; // 1 minute in past

            await expect(timeCapsule.createCapsule("Fail", unlockTime)).to.be.revertedWith(
                "Unlock time must be in the future"
            );
        });

        it("Should track user capsules", async function () {
            const { timeCapsule, owner } = await loadFixture(deployTimeCapsuleFixture);
            const unlockTime = Math.floor(Date.now() / 1000) + 60;

            await timeCapsule.createCapsule("Cap 1", unlockTime);
            await timeCapsule.createCapsule("Cap 2", unlockTime);

            const userCapsules = await timeCapsule.getUserCapsules(owner.address);
            expect(userCapsules.length).to.equal(2);
            expect(userCapsules[0]).to.equal(0);
            expect(userCapsules[1]).to.equal(1);
        });
    });
});
