// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract MyMagicNumAttack {
    constructor() {
        assembly {
            /*
            // run time code
            PUSH1 0x2a  // value, 42 decimal
            PUSH1 0x00  // offset
            MSTORE      // offset, value => save word (32 bytes) to memory
            PUSH1 0x20  // size
            PUSH1 0x00  // offset
            RETURN      // offset, size => halt execution, return data (32 bytes here) from memory
            */

            // this will store 32 bytes (decimal) word into memory, with runtime code at lower bytes
            mstore(0, 0x602a60005260206000f3)
            // this will return 10 lower bytes
            return(0x16, 0x0a)
        }
    }
}
