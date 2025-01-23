// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MedicalDataIntegrity is Ownable {

    event DataHashUpdated(bytes32 indexed dataHash, uint256 indexed timestamp, address indexed owner, address updatedBy);
    
    constructor() Ownable(msg.sender) {}

    function updateDataHash(string calldata _orbitCID, address _owner, address _updatedBy) public onlyOwner() {
        bytes32 orbitCIDHash = keccak256(abi.encodePacked(_orbitCID));
        emit DataHashUpdated(orbitCIDHash, block.timestamp, _owner, _updatedBy);
    }
}