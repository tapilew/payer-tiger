// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract PayerRouter {

    address public owner;

    struct Payee {
        string handle;   // Original string, stored for reference
        address payee;   // On-chain address
    }

    mapping(bytes32 => Payee) public payees;

    constructor() {
        owner = msg.sender;
    }

    function toBytes32(string memory source) public pure returns (bytes32 result) {
        require(bytes(source).length <= 32, "Handle too long");
        assembly {
            result := mload(add(source, 32))
        }
    }

    function addPayee(string calldata _handle, address _payee) external {
        require(_payee != address(0), "Address is null");

        bytes32 handleHash = toBytes32(_handle);
        require(payees[handleHash].payee == address(0), "Already exists");

        payees[handleHash] = Payee({
            handle: _handle,
            payee: _payee
        });
    }

    function getPayee(string calldata _handle) external view returns (address) {
        bytes32 handleHash = toBytes32(_handle);
        address resolved = payees[handleHash].payee;
        require(resolved != address(0), "Handle not found");
        return resolved;
    }
}
