import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { GetOutboxDocuments, DeleteDocument, AddTxnHash } from "../firebase/crudAttestations";
import { IAttestation, StatusEnum } from "../types";
import { useWaitForTransaction } from "wagmi";
import { consentualAttestationStationABI } from "../generated";
import { ethers } from "ethers";
import { useSigner } from "wagmi";
import { parseString } from "@eth-optimism/atst";
import { DataGrid, GridColDef, GridValueGetterParams, GridRowParams } from "@mui/x-data-grid";
import { Button, IconButton, Alert } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {CircularProgress} from "@mui/material";

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

	async function handleDelete(docId: string) {
		await DeleteDocument(docId);
		alert("Attestation deleted successfully!")
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

	const outboxColumns = [
		{ field: "about", headerName: "About", width: 500 },
		{ field: "key", headerName: "Key", width: 200 },
		{ field: "value", headerName: "Value", width: 500 },
		{
			field: "attest",
			headerName: "",
			sortable: false,
			width: 150,
			renderCell: ({ row }: Partial<GridRowParams>) =>
			<>
				<Button style={{textTransform: 'none'}} variant="outlined" color="success" disabled={row.status !== StatusEnum.Signed} onClick={() => handleAttest(row)}>
					 Attest &nbsp; <CheckCircleIcon/>
				</Button>
				{isLoadingDocId === row.docId && <CircularProgress />}
			</>,
		},
		{
			field: "delete",
			headerName: "",
			sortable: false,
			width: 30,
			renderCell: ({ row }: Partial<GridRowParams>) =>
			<IconButton aria-label="delete" size="small" onClick={() => handleDelete(row.id)}>
				<DeleteIcon fontSize="small" />
			</IconButton>,
		},
	];


	useEffect(() => {
		if(address) {
			getDocs(address);
		}
	}, [address])

	return (
		<div>
		<h2>Outbox - You made these attestations about others!</h2>

		<div style={{ height: 250, width: '100%' }}>
			<DataGrid
				rows={docs.map((doc) => {
					return {
						...doc,
						id: doc.docId
					}})}
				columns={outboxColumns}
			/>
		</div>

		</div>
	);
}