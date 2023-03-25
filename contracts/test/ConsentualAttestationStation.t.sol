//SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

/* Testing utilities */
import {Test} from "../lib/forge-std/src/Test.sol";
import {ConsentualAttestationStation} from "../src/ConsentualAttestationStation.sol";

contract ConsentualAttestationStation_Initializer is Test {

    uint256 internal alicePrivateKey;
    uint256 internal bobPrivateKey;
    uint256 internal sallyPrivateKey;

    address internal alice_attestor;
    address internal bob;
    address internal sally;

    function setUp() public {

        alicePrivateKey = 0xA11CE;
        bobPrivateKey = 0xB0B;
        sallyPrivateKey = 0x5A117;

        alice_attestor = vm.addr(alicePrivateKey);
        bob = vm.addr(bobPrivateKey);
        sally = vm.addr(sallyPrivateKey);

        // Give alice some ETH
        vm.deal(alice_attestor, 1 ether);

        vm.label(alice_attestor, "alice_attestor");
        vm.label(bob, "bob");
        vm.label(sally, "sally");
    }

    function getSignature(
        address _contractAddress,
        address _creator,
        address _about,
        bytes32 _key,
        bytes memory _val,
        uint256 _privateKey
    ) public pure returns (bytes memory) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(_contractAddress, _creator, _about, _key, _val)
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_privateKey, digest);
        return abi.encodePacked(r, s, v);
    }
}

contract ConsentualAttestationStationTest is ConsentualAttestationStation_Initializer {
    event AttestationCreated(
        address indexed creator,
        address indexed about,
        bytes32 indexed key,
        bytes val
    );

    function test_attest_individual() external {
        ConsentualAttestationStation attestationStation = new ConsentualAttestationStation();

        vm.expectEmit(true, true, true, true);
        emit AttestationCreated(
            alice_attestor,
            bob,
            bytes32("foo"),
            bytes("bar")
        );

        vm.prank(alice_attestor);
        attestationStation.attest({
            _about: bob,
            _key: bytes32("foo"),
            _val: bytes("bar"),
            _signature: getSignature(
                address(attestationStation),
                alice_attestor,
                bob,
                bytes32("foo"),
                bytes("bar"),
                bobPrivateKey
            )
        });

        assertEq(
            attestationStation.getAttestation(
                alice_attestor,
                bob,
                bytes32("foo")
            ),
            "bar"
        );

        vm.expectRevert("ConsentualAttestationStation: Invalid consent");
        attestationStation.attest({
            _about: bob,
            _key: bytes32("foo"),
            _val: bytes("bar"),
            _signature: getSignature(
                address(attestationStation),
                alice_attestor,
                bob,
                bytes32("foo"),
                bytes("bar"),
                alicePrivateKey
            )
        });

    }
}
