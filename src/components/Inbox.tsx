import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { GetInboxDocuments, AddSignature } from "../firebase/crudAttestations";
import { IAttestation } from "../types";
import * as ethers from "ethers";

export function Inbox() {

	const { address } = useAccount();
	const [docs, setDocs] = useState<IAttestation[]>([]);

	// useSignMessage from wagmi
	const { signMessageAsync } = useSignMessage();

	async function getDocs(address: string) {
		const docs_ = await GetInboxDocuments(address);
		setDocs(docs_);
	}

	async function handleApprove(doc: IAttestation) {
		if(doc.about !== address){
			alert("You can only approve attestations about yourself")
			return
		}

		const messageHash = ethers.utils.solidityKeccak256(
			["address", "address", "bytes32", "bytes"],
			[doc.creator, doc.about, doc.key_bytes, doc.value_bytes]
		);

		const signature = await signMessageAsync({
			message: ethers.utils.arrayify(messageHash),
		});

		await AddSignature(doc.docId, signature);
		alert("Attestation approved successfully!")

	}

	useEffect(() => {
		if(address) {
		getDocs(address);
		}
	}, [address])

	return (
		<div>
		<h2>Attestoooooor</h2>
		{docs.map((doc) => {
			return (
			<div key={doc.docId}>
				<p>{doc.about} :: {doc.key} :: {doc.value} :: {doc.status}</p>
				<button onClick={() => {
					handleApprove(doc)
				}}>Approve</button>
			</div>
			)
		})}
		</div>
	);
}
