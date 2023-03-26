export enum StatusEnum {
	PreSign = "PreSign",
	Signed = "Signed",
	TransactionSent = "TransactionSent",
}

export interface IAttestation {
	creator: string;
	about: string;
	key: string;
	key_bytes: string;
	value: string;
	value_bytes: string;
	createdAt: Date;
	updatedAt: Date;
	status: StatusEnum;
	signature?: string;
	txnHash?: string;
	docId: string;
}

export const RPC_URL =
	"https://opt-goerli.g.alchemy.com/v2/CINCVJQ2-eybv-8hDPN1TK9dHusFT95u";
export const CONTRACT_ADDRESS = "0x6A91E93d407a6116Aa6b3bd4A2f0779d615F20A3";
