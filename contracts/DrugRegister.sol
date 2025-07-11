// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DrugRegister {
    struct Drug {
        string name;
        string batchId;
        string manufacturer;
        uint256 timestamp;
        address registeredBy;
        bool exists;
    }
    
    mapping(string => Drug) private drugs;
    mapping(address => bool) public authorizedRegistrars;
    address public owner;
    
    event DrugRegistered(
        string indexed batchId,
        string name,
        string manufacturer,
        uint256 timestamp,
        address registeredBy
    );
    
    event DrugVerified(
        string indexed batchId,
        address verifiedBy,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedRegistrars[msg.sender] || msg.sender == owner,
            "Not authorized to register drugs"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedRegistrars[msg.sender] = true;
    }
    
    function authorizeRegistrar(address _registrar) external onlyOwner {
        authorizedRegistrars[_registrar] = true;
    }
    
    function revokeRegistrar(address _registrar) external onlyOwner {
        authorizedRegistrars[_registrar] = false;
    }
    
    function registerDrug(
        string memory _name,
        string memory _batchId,
        string memory _manufacturer
    ) external onlyAuthorized {
        require(bytes(_name).length > 0, "Drug name cannot be empty");
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        require(bytes(_manufacturer).length > 0, "Manufacturer cannot be empty");
        require(!drugs[_batchId].exists, "Drug with this batch ID already exists");
        
        drugs[_batchId] = Drug({
            name: _name,
            batchId: _batchId,
            manufacturer: _manufacturer,
            timestamp: block.timestamp,
            registeredBy: msg.sender,
            exists: true
        });
        
        emit DrugRegistered(_batchId, _name, _manufacturer, block.timestamp, msg.sender);
    }
    
    function getDrug(string memory _batchId) 
        external 
        view 
        returns (
            string memory name,
            string memory batchId,
            string memory manufacturer,
            uint256 timestamp,
            address registeredBy,
            bool exists
        ) 
    {
        Drug memory drug = drugs[_batchId];
        return (
            drug.name,
            drug.batchId,
            drug.manufacturer,
            drug.timestamp,
            drug.registeredBy,
            drug.exists
        );
    }
    
    function verifyDrug(string memory _batchId) external {
        require(drugs[_batchId].exists, "Drug not found");
        emit DrugVerified(_batchId, msg.sender, block.timestamp);
    }
    
    function isDrugRegistered(string memory _batchId) external view returns (bool) {
        return drugs[_batchId].exists;
    }
}