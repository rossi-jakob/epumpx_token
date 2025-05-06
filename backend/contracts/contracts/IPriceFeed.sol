// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

interface IPriceFeed {
    function latestAnswer() external view returns (int256 answer);
}