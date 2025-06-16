// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract PayerRouter {
    address public owner;

    struct Payee {
        string handle; // Original string, stored for reference
        address payee; // On-chain address
    }

    mapping(bytes32 => Payee) public payees;

    // Event to log successful access for off-chain services to listen to
    event ContentAccessed(
        bytes32 indexed contentId,
        address indexed payer,
        address indexed creator,
        uint256 amount
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    function toBytes32(
        string memory source
    ) public pure returns (bytes32 result) {
        require(bytes(source).length <= 32, "Handle too long");
        assembly {
            result := mload(add(source, 32))
        }
    }

    function addPayee(string calldata _handle, address _payee) external {
        require(_payee != address(0), "Address is null");

        bytes32 handleHash = toBytes32(_handle);
        require(payees[handleHash].payee == address(0), "Already exists");

        payees[handleHash] = Payee({handle: _handle, payee: _payee});
    }

    function getPayee(string calldata _handle) external view returns (address) {
        bytes32 handleHash = toBytes32(_handle);
        address resolved = payees[handleHash].payee;
        require(resolved != address(0), "Handle not found");
        return resolved;
    }

    function updatePayee(
        string calldata _handle,
        address _newPayee
    ) external onlyOwner {
        bytes32 handleHash = toBytes32(_handle);
        address currentPayee = payees[handleHash].payee;
        require(currentPayee != address(0), "Handle not found");
        require(msg.sender == currentPayee, "Not authorized to update"); // Security check
        require(_newPayee != address(0), "New address is null");

        payees[handleHash].payee = _newPayee;
    }

    function payAndLogAccess(
        bytes32 contentId,
        string calldata creatorHandle,
        address token,
        uint256 amount
    ) external {
        // 1. Resolve creator's address from their handle
        bytes32 handleHash = toBytes32(creatorHandle);
        address creatorAddress = payees[handleHash].payee;
        require(creatorAddress != address(0), "PayerRouter: Creator not found");

        // 2. Securely pull the payment from the user to the creator
        // This will fail if the user has not approved the funds first.
        IERC20(token).transferFrom(msg.sender, creatorAddress, amount);

        // 3. Log the access event on-chain for transparency and tracking
        emit ContentAccessed(contentId, msg.sender, creatorAddress, amount);
    }
}
