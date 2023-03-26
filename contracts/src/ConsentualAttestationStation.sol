// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {Semver} from "../../node_modules/@eth-optimism/contracts-bedrock/contracts/universal/Semver.sol";
import "../../node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title AttestationStation
 * @author Optimism Collective
 * @author Gitcoin
 * @notice Where attestations live.
 * @dev This contract is originally from the Optimism monorepo.
 *       https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-periphery/contracts/universal/op-nft/AttestationStation.sol
 */
contract ConsentualAttestationStation is Semver {

	using ECDSA for bytes32;

    /**
     * @notice Struct representing data that is being attested.
     *
     * @custom:field about Address for which the attestation is about.
     * @custom:field key   A bytes32 key for the attestation.
     * @custom:field val   The attestation as arbitrary bytes.
	 * @custom:field signature The signature of the attestation.
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
        private attestations;

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

	/**
	 * @notice Returns the attestation for the given key.
	 *
	 * @param _about Address that the attestation is about.
	 * @param _key   A key used to namespace the attestation.
	 * @return       The attestation as arbitrary bytes.
	 */
	function getAttestation(
		address _creator,
		address _about,
		bytes32 _key
	) public view returns (bytes memory) {
		return attestations[_creator][_about][_key];
	}

	/**
     * @notice Verify signature of attestation.
     *
     * @param _about Address that the attestation is about.
     * @param _key   A key used to namespace the attestation.
     * @param _val   An arbitrary value stored as part of the attestation.
	 * @param _signature The signature of the attestation.
     */
    function verifyConsent(
        address _about,
        bytes32 _key,
        bytes memory _val,
        bytes memory _signature
    ) public view returns (bool) {
		bytes32 messagehash = keccak256(
            abi.encodePacked(address(this), msg.sender, _about, _key, _val)
        );
        address signer = messagehash.toEthSignedMessageHash().recover(
            _signature
        );
		return (signer == _about);
	}

    /**
     * @notice Allows authorised entity to create an attestation.
     *
     * @param _about Address that the attestation is about.
     * @param _key   A key used to namespace the attestation.
     * @param _val   An arbitrary value stored as part of the attestation.
	 * @param _signature The signature of the attestation.
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