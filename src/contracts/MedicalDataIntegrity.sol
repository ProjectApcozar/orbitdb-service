// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MedicalDataIntegrity is Ownable {

    event DataHashUpdated(bytes32 indexed dataHash, uint256 indexed timestamp, address indexed owner, address updatedBy);
    
    event PatientAdded(address indexed patient, uint256 indexed timestamp);
    event DoctorAdded(address indexed doctor, uint256 indexed timestamp);

    event AccessGranted(address indexed patient, address indexed doctor, uint256 indexed timestamp);
    event AccessRevoked(address indexed patient, address indexed doctor, uint256 indexed timestamp);
    event AccessRequested(address indexed patient, address indexed doctor, uint256 indexed timestamp);

    constructor() Ownable(msg.sender) {}

    function updateDataHash(string calldata _orbitCID, address _owner, address _updatedBy) public onlyOwner() {
        bytes32 orbitCIDHash = keccak256(abi.encodePacked(_orbitCID));
        emit DataHashUpdated(orbitCIDHash, block.timestamp, _owner, _updatedBy);
    }

    function addPatient(address _patient) public onlyOwner() {
        emit PatientAdded(_patient, block.timestamp);
    }

    function addDoctor(address _doctor) public onlyOwner() {
        emit DoctorAdded(_doctor, block.timestamp);
    }

    function grantAccess(address _patient, address _doctor) public onlyOwner() {
        emit AccessGranted(_patient, _doctor, block.timestamp);
    }
}