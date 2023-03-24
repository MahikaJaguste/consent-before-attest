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
