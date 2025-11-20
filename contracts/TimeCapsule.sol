// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TimeCapsule {
    struct Capsule {
        address creator;
        string message;
        uint256 unlockTime;
        uint256 id;
        address[] recipients;
        bool isPublic;
    }

    // Mapping from capsule ID to Capsule
    mapping(uint256 => Capsule) public capsules;
    
    // Mapping from user address to list of capsule IDs they created
    mapping(address => uint256[]) public userCapsules;
    
    // Mapping from recipient address to list of capsule IDs sent to them
    mapping(address => uint256[]) public recipientCapsules;

    uint256 public nextCapsuleId;
    uint256 public constant MAX_RECIPIENTS = 5;

    event CapsuleCreated(
        uint256 indexed id, 
        address indexed creator, 
        uint256 unlockTime,
        bool isPublic,
        uint256 recipientCount
    );

    function createCapsule(
        string memory _message, 
        uint256 _unlockTime,
        address[] memory _recipients,
        bool _isPublic
    ) public returns (uint256) {
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");
        require(bytes(_message).length > 0, "Message cannot be empty");
        
        // Validate recipients for private capsules
        if (!_isPublic) {
            require(_recipients.length > 0, "Private capsules must have at least one recipient");
            require(_recipients.length <= MAX_RECIPIENTS, "Maximum 5 recipients allowed");
            
            // Validate no duplicate recipients
            for (uint256 i = 0; i < _recipients.length; i++) {
                require(_recipients[i] != address(0), "Invalid recipient address");
                for (uint256 j = i + 1; j < _recipients.length; j++) {
                    require(_recipients[i] != _recipients[j], "Duplicate recipients not allowed");
                }
            }
        }

        uint256 capsuleId = nextCapsuleId;
        
        capsules[capsuleId] = Capsule({
            creator: msg.sender,
            message: _message,
            unlockTime: _unlockTime,
            id: capsuleId,
            recipients: _recipients,
            isPublic: _isPublic
        });

        userCapsules[msg.sender].push(capsuleId);
        
        // Track capsules for recipients
        if (!_isPublic) {
            for (uint256 i = 0; i < _recipients.length; i++) {
                recipientCapsules[_recipients[i]].push(capsuleId);
            }
        }
        
        emit CapsuleCreated(capsuleId, msg.sender, _unlockTime, _isPublic, _recipients.length);
        
        nextCapsuleId++;
        return capsuleId;
    }

    function getCapsule(uint256 _id) public view returns (Capsule memory) {
        return capsules[_id];
    }

    function getUserCapsules(address _user) public view returns (uint256[] memory) {
        return userCapsules[_user];
    }
    
    function getRecipientCapsules(address _user) public view returns (uint256[] memory) {
        return recipientCapsules[_user];
    }
    
    function isRecipient(uint256 _capsuleId, address _user) public view returns (bool) {
        Capsule memory capsule = capsules[_capsuleId];
        
        // Public capsules are accessible to everyone
        if (capsule.isPublic) {
            return true;
        }
        
        // Creator can always access
        if (capsule.creator == _user) {
            return true;
        }
        
        // Check if user is in recipients list
        for (uint256 i = 0; i < capsule.recipients.length; i++) {
            if (capsule.recipients[i] == _user) {
                return true;
            }
        }
        
        return false;
    }
}

