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
import { RPC_URL, CONTRACT_ADDRESS } from "../types";
import LinearProgress from "@mui/material/LinearProgress";

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

    setIsLoadingDocId(doc.docId);
		const tx = await contract['attest(address,bytes32,bytes,bytes)'](doc.about, doc.key_bytes, doc.value_bytes, doc.signature);
		const tx_ = await tx.wait();
    await AddTxnHash(doc.docId, tx.hash);
    alert("Attestation sent successfully!")
    setIsLoadingDocId(undefined);
    window.location.reload();

	}

	async function handleDelete(docId: string) {
		await DeleteDocument(docId);
		alert("Attestation deleted successfully!")
		window.location.reload();
	}

	const outboxColumns = [
		{ field: "about", headerName: "About", width: 450 },
		{ field: "key", headerName: "Key", width: 200 },
		{ field: "value", headerName: "Value", width: 500 },
		{
			field: "attest",
			headerName: "",
			sortable: false,
			width: 150,
			renderCell: ({ row }: Partial<GridRowParams>) =>
			<>
				<Button style={{textTransform: 'none'}} variant="outlined" color="success" hidden={isLoadingDocId === row.docId} disabled={row.status !== StatusEnum.Signed} onClick={() => handleAttest(row)}>
					 Attest &nbsp; <CheckCircleIcon/>
				</Button>
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
		<h2 style={{textAlign: "center", }}>You made these attestations about others!</h2>
    {isLoadingDocId && <LinearProgress color="success"/>}
		<div style={{ height: 400, width: '100%' }}>
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
