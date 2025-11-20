// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TimeCapsule {
    struct Capsule {
        address creator;
        string message;
        uint256 unlockTime;
        uint256 id;
    }

    // Mapping from capsule ID to Capsule
    mapping(uint256 => Capsule) public capsules;
    
    // Mapping from user address to list of capsule IDs they created
    mapping(address => uint256[]) public userCapsules;

    uint256 public nextCapsuleId;

    event CapsuleCreated(uint256 indexed id, address indexed creator, uint256 unlockTime);

    function createCapsule(string memory _message, uint256 _unlockTime) public returns (uint256) {
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");
        require(bytes(_message).length > 0, "Message cannot be empty");

        uint256 capsuleId = nextCapsuleId;
        
        capsules[capsuleId] = Capsule({
            creator: msg.sender,
            message: _message,
            unlockTime: _unlockTime,
            id: capsuleId
        });

        userCapsules[msg.sender].push(capsuleId);
        
        emit CapsuleCreated(capsuleId, msg.sender, _unlockTime);
        
        nextCapsuleId++;
        return capsuleId;
    }

    function getCapsule(uint256 _id) public view returns (Capsule memory) {
        // Note: Data is visible on-chain. This function returns it regardless of time.
        // The frontend is responsible for hiding it if locked, or we could restrict here.
        // For MVP, we return everything.
        return capsules[_id];
    }

    function getUserCapsules(address _user) public view returns (uint256[] memory) {
        return userCapsules[_user];
    }
}
