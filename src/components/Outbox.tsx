import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { GetOutboxDocuments, AddTxnHash } from "../firebase/crudAttestations";
import { IAttestation, StatusEnum } from "../types";
import {
parseString,
createValue,
createKey,
} from "@eth-optimism/atst";
import { useWaitForTransaction } from "wagmi";

export function Outbox() {

	const { address } = useAccount();
	const [docs, setDocs] = useState<IAttestation[]>([]);

	const [creator, setCreator] = useState("0x");
	const [about, setAbout] = useState("0x");
	const [key, setKey] = useState("0x");
	const [value, setValue] = useState("0x");

	async function getDocs(address: string) {
		const docs_ = await GetOutboxDocuments(address);
		setDocs(docs_);
	}

	async function handleAttest(doc: IAttestation) {
		if(doc.creator !== address){
			alert("You can only attest to documents you created")
			return
		}
		if(doc.status !== StatusEnum.Signed) {
			alert("You can only attest to signed documents")
			return
		}
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
				<button
				onClick={() => {
					handleAttest(doc)
				}}
				>Attest</button>
			</div>
			)
		})}
		</div>
	);
}
