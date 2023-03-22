// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {Semver} from "../../node_modules/@eth-optimism/contracts-bedrock/contracts/universal/Semver.sol";

/**
 * @title AttestationStation
 * @author Optimism Collective
 * @author Gitcoin
 * @notice Where attestations live.
 * @dev This contract is originally from the Optimism monorepo.
 *       https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-periphery/contracts/universal/op-nft/AttestationStation.sol
 */
contract ConsentualAttestationStation is Semver {
    /**
     * @notice Struct representing data that is being attested.
     *
     * @custom:field about Address for which the attestation is about.
     * @custom:field key   A bytes32 key for the attestation.
     * @custom:field val   The attestation as arbitrary bytes.
     */
    struct AttestationData {
        address about;
        bytes32 key;
        bytes val;
        bytes signature;
    }

    /**
     * @notice Maps addresses to attestations. Creator => About => Key => Value.
     */
    mapping(address => mapping(address => mapping(bytes32 => bytes)))
        public attestations;

    /**
     * @notice Emitted when Attestation is created.
     *
     * @param creator Address that made the attestation.
     * @param about   Address attestation is about.
     * @param key     Key of the attestation.
     * @param val     Value of the attestation.
     */
    event AttestationCreated(
        address indexed creator,
        address indexed about,
        bytes32 indexed key,
        bytes val
    );

    /**
     * @custom:semver 1.1.0
     */
    constructor() Semver(1, 1, 0) {}

    function getMessageHash(
        address _about,
        bytes32 _key,
        bytes memory _val
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(msg.sender, _about, _key, _val));
    }

    function getEthSignedMessageHash(
        bytes32 _messageHash
    ) public pure returns (bytes32) {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }

    function splitSignature(
        bytes memory sig
    ) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }

    function recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function verifyConsent(
        address _about,
        bytes32 _key,
        bytes memory _val,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 messageHash = getMessageHash(_about, _key, _val);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        return recoverSigner(ethSignedMessageHash, signature) == _about;
    }

    /**
     * @notice Allows anyone to create an attestation.
     *
     * @param _about Address that the attestation is about.
     * @param _key   A key used to namespace the attestation.
     * @param _val   An arbitrary value stored as part of the attestation.
     */
    function attest(
        address _about,
        bytes32 _key,
        bytes memory _val,
        bytes memory _signature
    ) public {
        require(verifyConsent(_about, _key, _val, _signature), "ConsentualAttestationStation: Invalid consent");
        attestations[msg.sender][_about][_key] = _val;

        emit AttestationCreated(msg.sender, _about, _key, _val);
    }

    /**
     * @notice Allows anyone to create attestations.
     *
     * @param _attestations An array of attestation data.
     */
    function attest(AttestationData[] calldata _attestations) external {
        uint256 length = _attestations.length;
        for (uint256 i = 0; i < length; ) {
            AttestationData memory attestation = _attestations[i];

            attest(attestation.about, attestation.key, attestation.val, attestation.signature);

            unchecked {
                ++i;
            }
        }
    }
}
