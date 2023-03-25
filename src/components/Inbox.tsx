import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { GetInboxDocuments, DeleteDocument, AddSignature } from "../firebase/crudAttestations";
import { IAttestation } from "../types";
import * as ethers from "ethers";
import { DataGrid, GridRowParams } from "@mui/x-data-grid";
import { Button, IconButton, Alert } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { CONTRACT_ADDRESS } from "../types";

export function Inbox() {

	const { address } = useAccount();
	const [docs, setDocs] = useState<IAttestation[]>([]);
	const [notifications, setNotifications] = useState<any[]>([]);

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
			["address", "address", "address", "bytes32", "bytes"],
			[CONTRACT_ADDRESS, doc.creator, doc.about, doc.key_bytes, doc.value_bytes]
		);

		const signature = await signMessageAsync({
			message: ethers.utils.arrayify(messageHash),
		});

		await AddSignature(doc.docId, signature);

		alert("Attestation approved successfully!")
		window.location.reload();

	}

	async function handleDelete(docId: string) {
		await DeleteDocument(docId);
		alert("Attestation deleted successfully!")
		window.location.reload();
	}

	useEffect(() => {
		if(address) {
		getDocs(address);
		}
	}, [address])

	const inboxColumns = [
		{ field: "creator", headerName: "Creator", width: 450 },
		{ field: "key", headerName: "Key", width: 200 },
		{ field: "value", headerName: "Value", width: 500 },
		{
			field: "approve",
			headerName: "",
			sortable: false,
			width: 150,
			renderCell: ({ row }: Partial<GridRowParams>) =>
				<Button style={{textTransform: 'none'}} variant="outlined" color="success" onClick={() => handleApprove(row)}>
					<CheckIcon/> &nbsp; Approve
				</Button>,
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

	return (
		<div>
		<h2 style={{textAlign: "center", }}>Approve these attestations about you!</h2>

		<div style={{ height: 400, width: '100%' }}>
			<DataGrid
				rows={docs.map((doc) => {
					return {
						...doc,
						id: doc.docId
					}})}
				columns={inboxColumns}
			/>
		</div>
		</div>
	);
}
