// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ITokenTransferor} from "./ITokenTransferor.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";

contract TransactionCombiner {
    function executeTransactions(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount,
        address _tokenTransferorAddress
    ) external payable {
        IERC20 erc20Token = IERC20(_token);
        ITokenTransferor transferor = ITokenTransferor(_tokenTransferorAddress);

        // Transfer Ether
        require(msg.value > 0, "Ether value must be greater than 0");
        payable(_tokenTransferorAddress).transfer(msg.value);

        // Transfer ERC20 tokens
        require(
            erc20Token.transferFrom(
                msg.sender,
                _tokenTransferorAddress,
                _amount
            ),
            "ERC20 transfer failed"
        );

        // Call another contract's function
        require(
            transferor.transferTokensPayNative(
                _destinationChainSelector,
                _receiver,
                _token,
                _amount
            ) != bytes32(0),
            "Cross chain transfer failed"
        );
    }

    receive() external payable {} // Accept Ether
}
