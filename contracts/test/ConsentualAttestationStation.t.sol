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

// contract ConsentualAttestationStationTest is ConsentualAttestationStation_Initializer {
//     event AttestationCreated(
//         address indexed creator,
//         address indexed about,
//         bytes32 indexed key,
//         bytes val
//     );

//     function test_attest_individual() external {
//         ConsentualAttestationStation attestationStation = new ConsentualAttestationStation();

//         vm.expectEmit(true, true, true, true);
//         emit AttestationCreated(
//             alice_attestor,
//             bob,
//             bytes32("foo"),
//             bytes("bar")
//         );

//         vm.prank(alice_attestor);
//         attestationStation.attest({
//             _about: bob,
//             _key: bytes32("foo"),
//             _val: bytes("bar"),
//             _signature: getSignature(
//                 address(attestationStation),
//                 alice_attestor,
//                 bob,
//                 bytes32("foo"),
//                 bytes("bar"),
//                 bobPrivateKey
//             )
//         });

//         assertEq(
//             attestationStation.getAttestation(
//                 alice_attestor,
//                 bob,
//                 bytes32("foo")
//             ),
//             "bar"
//         );

//         vm.expectRevert("ConsentualAttestationStation: Invalid consent");
//         attestationStation.attest({
//             _about: bob,
//             _key: bytes32("foo"),
//             _val: bytes("bar"),
//             _signature: getSignature(
//                 address(attestationStation),
//                 alice_attestor,
//                 bob,
//                 bytes32("foo"),
//                 bytes("bar"),
//                 alicePrivateKey
//             )
//         });

//     }
// }

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

    function test_attest_single() external {
        ConsentualAttestationStation attestationStation = new ConsentualAttestationStation();

        ConsentualAttestationStation.AttestationData[]
            memory attestationDataArr = new ConsentualAttestationStation.AttestationData[](
                1
            );

        // alice is going to attest about bob
        ConsentualAttestationStation.AttestationData
            memory attestationData = ConsentualAttestationStation.AttestationData({
                about: bob,
                key: bytes32("test-key:string"),
                val: bytes("test-value"),
                signature: getSignature(
					address(attestationStation),
                    alice_attestor,
                    bob,
                    bytes32("test-key:string"),
                    bytes("test-value"),
                    bobPrivateKey
                )
            });

        // assert the attestation starts empty
        assertEq(
            attestationStation.getAttestation(
                alice_attestor,
                attestationData.about,
                attestationData.key
            ),
            ""
        );

        // make attestation
        vm.prank(alice_attestor);
        attestationDataArr[0] = attestationData;
        attestationStation.attest(attestationDataArr);

        // assert the attestation is there
        assertEq(
            attestationStation.getAttestation(
                alice_attestor,
                attestationData.about,
                attestationData.key
            ),
            attestationData.val
        );

        bytes memory new_val = bytes("new updated value");
        // make a new attestations to same about and key
        attestationData = ConsentualAttestationStation.AttestationData({
            about: attestationData.about,
            key: attestationData.key,
            val: new_val,
            signature: getSignature(
                address(attestationStation),
                alice_attestor,
                bob,
                bytes32("test-key:string"),
                new_val,
                bobPrivateKey
            )
        });

        vm.prank(alice_attestor);
        attestationDataArr[0] = attestationData;
        attestationStation.attest(attestationDataArr);

        // assert the attestation is updated
        assertEq(
            attestationStation.getAttestation(
                alice_attestor,
                attestationData.about,
                attestationData.key
            ),
            attestationData.val
        );

        attestationData = ConsentualAttestationStation.AttestationData({
            about: attestationData.about,
            key: attestationData.key,
            val: new_val,
            signature: getSignature(
                address(attestationStation),
                alice_attestor,
                bob,
                bytes32("test-key:string"),
                new_val,
                alicePrivateKey
            )
        });
        attestationDataArr[0] = attestationData;
        vm.expectRevert("ConsentualAttestationStation: Invalid consent");
        attestationStation.attest(attestationDataArr);
    }

    function test_attest_bulk() external {
        ConsentualAttestationStation attestationStation = new ConsentualAttestationStation();

        vm.prank(alice_attestor);

        ConsentualAttestationStation.AttestationData[]
            memory attestationData = new ConsentualAttestationStation.AttestationData[](
                3
            );
        attestationData[0] = ConsentualAttestationStation.AttestationData({
            about: bob,
            key: bytes32("test-key:string"),
            val: bytes("test-value"),
            signature: getSignature(
                address(attestationStation),
                alice_attestor,
                bob,
                bytes32("test-key:string"),
                bytes("test-value"),
                bobPrivateKey
            )
        });

        attestationData[1] = ConsentualAttestationStation.AttestationData({
            about: bob,
            key: bytes32("test-key2"),
            val: bytes("test-value2"),
            signature: getSignature(
                address(attestationStation),
                alice_attestor,
                bob,
                bytes32("test-key2"),
                bytes("test-value2"),
                bobPrivateKey
            )
        });

        attestationData[2] = ConsentualAttestationStation.AttestationData({
            about: sally,
            key: bytes32("test-key:string"),
            val: bytes("test-value3"),
            signature: getSignature(
                address(attestationStation),
                alice_attestor,
                sally,
                bytes32("test-key:string"),
                bytes("test-value3"),
                sallyPrivateKey
            )
        });

        attestationStation.attest(attestationData);

        // assert the attestations are there
        assertEq(
            attestationStation.getAttestation(
                alice_attestor,
                attestationData[0].about,
                attestationData[0].key
            ),
            attestationData[0].val
        );
        assertEq(
            attestationStation.getAttestation(
                alice_attestor,
                attestationData[1].about,
                attestationData[1].key
            ),
            attestationData[1].val
        );
        assertEq(
            attestationStation.getAttestation(
                alice_attestor,
                attestationData[2].about,
                attestationData[2].key
            ),
            attestationData[2].val
        );
    }

    function test_fail_attest_bulk() external {
        ConsentualAttestationStation attestationStation = new ConsentualAttestationStation();

        vm.prank(alice_attestor);

        ConsentualAttestationStation.AttestationData[]
            memory attestationData = new ConsentualAttestationStation.AttestationData[](
                3
            );
        attestationData[0] = ConsentualAttestationStation.AttestationData({
            about: bob,
            key: bytes32("test-key:string"),
            val: bytes("test-value"),
            signature: getSignature(
                address(attestationStation),
                alice_attestor,
                bob,
                bytes32("test-key:string"),
                bytes("test-value"),
                bobPrivateKey
            )
        });

        attestationData[1] = ConsentualAttestationStation.AttestationData({
            about: bob,
            key: bytes32("test-key2"),
            val: bytes("test-value2"),
            signature: getSignature(
                address(attestationStation),
                alice_attestor,
                bob,
                bytes32("test-key2"),
                bytes("test-value2"),
                sallyPrivateKey
            )
        });

        attestationData[2] = ConsentualAttestationStation.AttestationData({
            about: sally,
            key: bytes32("test-key:string"),
            val: bytes("test-value3"),
            signature: getSignature(
				address(attestationStation),
                alice_attestor,
                sally,
                bytes32("test-key:string"),
                bytes("test-value3"),
                bobPrivateKey
            )
        });

        vm.expectRevert("ConsentualAttestationStation: Invalid consent");
        attestationStation.attest(attestationData);
    }
}