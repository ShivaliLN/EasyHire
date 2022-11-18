// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

/**
 * @title EasyHire
 * @author Shivali Sharma @ Chainlink Fall Hackathon 2022
 **/

contract EasyHire is VRFConsumerBaseV2, ConfirmedOwner {
  address payable ownerEasyHire;
  uint256 public registrationId;
  mapping(address => bool) public taskerRegistered;

  event ProfileCreated(address Tasker);
  event Withdrawal(uint256 amount, uint256 when);
  event RequestSent(uint256 requestId, uint32 numWords);
  event RequestFulfilled(uint256 requestId, uint256[] randomWords);

  struct RequestStatus {
    bool fulfilled; // whether the request has been successfully fulfilled
    bool exists; // whether a requestId exists
    uint256[] randomWords;
  }
  mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus */
  VRFCoordinatorV2Interface COORDINATOR;

  // Your subscription ID.
  uint64 s_subscriptionId;

  // past requests Id.
  uint256[] public requestIds;
  uint256 public lastRequestId;

  bytes32 keyHash =
    0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f; //Mumbai Testnet

  uint32 callbackGasLimit = 100000;

  // The default is 3, but you can set this higher.
  uint16 requestConfirmations = 3;

  // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
  uint32 numWords = 1;

  //Mumbai Testnet - 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
  constructor(address _owner, uint64 subscriptionId)
    payable
    VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
    ConfirmedOwner(msg.sender)
  {
    ownerEasyHire = payable(_owner);
    COORDINATOR = VRFCoordinatorV2Interface(
      0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
    );
    s_subscriptionId = subscriptionId;
  }

  function register() public payable returns (uint256 _registrationId) {
    require(msg.value >= .0001 ether, "Not enough matic sent");
    require(taskerRegistered[msg.sender] == false, "Tasker already registered");
    taskerRegistered[msg.sender] = true;
    ++registrationId;
    emit ProfileCreated(msg.sender);
    return registrationId;
  }

  function withdraw() public {
    require(msg.sender == ownerEasyHire, "You aren't the owner");
    emit Withdrawal(address(this).balance, block.timestamp);
    ownerEasyHire.transfer(address(this).balance);
  }

  // Assumes the subscription is funded sufficiently.
  function requestRandomWords() external onlyOwner returns (uint256 requestId) {
    // Will revert if subscription is not set and funded.
    requestId = COORDINATOR.requestRandomWords(
      keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );
    s_requests[requestId] = RequestStatus({
      randomWords: new uint256[](0),
      exists: true,
      fulfilled: false
    });
    requestIds.push(requestId);
    lastRequestId = requestId;
    emit RequestSent(requestId, numWords);
    return requestId;
  }

  function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords)
    internal
    override
  {
    require(s_requests[_requestId].exists, "request not found");
    s_requests[_requestId].fulfilled = true;
    s_requests[_requestId].randomWords = _randomWords;
    emit RequestFulfilled(_requestId, _randomWords);
  }

  function getRequestStatus(uint256 _requestId)
    external
    view
    returns (bool fulfilled, uint256[] memory randomWords)
  {
    require(s_requests[_requestId].exists, "request not found");
    RequestStatus memory request = s_requests[_requestId];
    return (request.fulfilled, request.randomWords);
  }

  function getOTP(uint256 _requestId)
    external
    view
    returns (uint256 randomWords)
  {
    require(msg.sender == ownerEasyHire, "You aren't the owner");
    require(s_requests[_requestId].exists, "request not found");
    RequestStatus memory request = s_requests[_requestId];
    uint256 otp = request.randomWords[0] % 10000;
    return (otp);
  }
}
