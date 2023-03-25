import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { GetOutboxDocuments, DeleteDocument, AddTxnHash } from "../firebase/crudAttestations";
import { IAttestation, StatusEnum } from "../types";
import { useWaitForTransaction } from "wagmi";
import { consentualAttestationStationABI } from "../generated";
import { ethers } from "ethers";
import { useSigner } from "wagmi";
import { parseString } from "@eth-optimism/atst";

const RPC_URL = "http://localhost:8545";
const CONTRACT_ADDRESS = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";

export function Outbox() {

	const { address } = useAccount();
	const [docs, setDocs] = useState<IAttestation[]>([]);
	const { data: signer, isError, isLoading } = useSigner();
	const [isLoadingDocId, setIsLoadingDocId] = useState<string | undefined>(undefined);

	async function getDocs(address: string) {
		const docs_ = await GetOutboxDocuments(address);
		setDocs(docs_);
	}

	async function handleAttest(doc: IAttestation) {
		if(doc.creator !== address){
			alert("You can only attest to documents you created")
			return
		}
		if(doc.status !== StatusEnum.Signed || !doc.signature) {
			alert("You can only attest to signed documents")
			return
		}

		let contract: ethers.Contract | undefined;
		const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
		if(signer){
			contract = new ethers.Contract(CONTRACT_ADDRESS, consentualAttestationStationABI, signer);
		}
		if(!contract) return;

		const tx = await contract.attest(doc.about, doc.key_bytes, doc.value_bytes, doc.signature);
		const tx_ = await tx.wait();

		await AddTxnHash(doc.docId, tx.hash);
		alert("Attestation sent successfully!")
		window.location.reload();
	}

	// const getAttestationStatus = async (txHash: string) => {

		// const a = await contract.attestations(doc.creator, doc.about, doc.key_bytes)
		// console.log(a)
		// console.log(parseString(a))

		// const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
		// const receipt = await provider.getTransactionReceipt(txHash);
		// console.log(receipt)
		// if(receipt?.status === 1) {
		// 	return true;
		// }
		// return false;
	// }

	useEffect(() => {
		if(address) {
			getDocs(address);
		}
		// getAttestationStatus("0xb9219af83662bc85023a608b06ecb28b2789fb8b643843dcf9a7bbbc70e50a47")
	}, [address])

	return (
		<div>
		<h2>Outbox - You made these attestations about others!</h2>
		{docs.map((doc) => {
			return (
			<div key={doc.docId}>
				<p>About - {doc.about} :: Key - {doc.key} :: Value - {doc.value} :: Status - {doc.status}</p>
				<button
				disabled={doc.status !== StatusEnum.Signed}
				onClick={() => {
					handleAttest(doc)
				}}
				>Attest</button>
				{isLoadingDocId === doc.docId && <p>Attesting...</p>}
			</div>
			)
		})}

		</div>
	);
}