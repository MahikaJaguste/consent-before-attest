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

export const RPC_URL = "http://localhost:8545";
export const CONTRACT_ADDRESS = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";
