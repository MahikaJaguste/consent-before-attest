import {
	collection,
	addDoc,
	getDocs,
	query,
	where,
	doc,
	getDoc,
	updateDoc,
} from "firebase/firestore";
import db from "./config";
import { StatusEnum } from "../types";

const collectionName = "attestations";
const ref = collection(db, collectionName);

export async function AddDocument_AutoID(
	creator: string,
	about: string,
	key: string,
	value: string,
	value_bytes: string,
) {
	await addDoc(ref, {
		creator: creator.toLowerCase(),
		about: about.toLowerCase(),
		key,
		value,
		value_bytes,
		createdAt: new Date(),
		updatedAt: new Date(),
		status: StatusEnum.PreSign,
	})
		.then(() => {
			console.log("Data saved successfully.");
		})
		.catch((err) => {
			console.log(err);
			alert("Error: " + err);
		});
}

export async function GetInboxDocuments(address: string) {
	const q = query(
		ref,
		where("about", "==", address.toLowerCase()),
		where("status", "==", StatusEnum.PreSign),
	);

	let result: {
		creator: string;
		about: string;
		key: string;
		value: string;
		value_bytes: string;
		createdAt: Date;
		updatedAt: Date;
		status: StatusEnum;
		docId: string;
	}[] = [];

	const querySnapshot = await getDocs(q);
	// console.log(querySnapshot)
	querySnapshot.forEach((doc) => {
		const data = doc.data();
		result.push({
			creator: data.creator,
			about: data.about,
			key: data.key,
			value: data.value,
			value_bytes: data.value_bytes,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
			status: data.status,
			docId: doc.id,
		});
	});

	return result;
}

export async function GetOutboxDocuments(address: string) {
	const q = query(
		ref,
		where("about", "==", address.toLowerCase()),
		where("status", "==", StatusEnum.Signed),
	);

	let result: {
		creator: string;
		about: string;
		key: string;
		value: string;
		value_bytes: string;
		createdAt: Date;
		updatedAt: Date;
		status: StatusEnum;
		signature: string;
		docId: string;
	}[] = [];

	const querySnapshot = await getDocs(q);
	// console.log(querySnapshot)
	querySnapshot.forEach((doc) => {
		const data = doc.data();
		result.push({
			creator: data.creator,
			about: data.about,
			key: data.key,
			value: data.value,
			value_bytes: data.value_bytes,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
			status: data.status,
			signature: data.signature,
			docId: doc.id,
		});
	});

	return result;
}

export async function GetSentTxns(address: string) {
	const q1 = query(
		ref,
		where("about", "==", address.toLowerCase()),
		where("status", "==", StatusEnum.TransactionSent),
	);

	const q2 = query(
		ref,
		where("creator", "==", address.toLowerCase()),
		where("status", "==", StatusEnum.TransactionSent),
	);

	let result: {
		creator: string;
		about: string;
		key: string;
		value: string;
		value_bytes: string;
		createdAt: Date;
		updatedAt: Date;
		status: StatusEnum;
		signature: string;
		txnHash: string;
		docId: string;
	}[] = [];

	const querySnapshot1 = await getDocs(q1);
	const querySnapshot2 = await getDocs(q2);

	const querySnapshot = [...querySnapshot1.docs, ...querySnapshot2.docs];

	querySnapshot.forEach((doc) => {
		const data = doc.data();
		result.push({
			creator: data.creator,
			about: data.about,
			key: data.key,
			value: data.value,
			value_bytes: data.value_bytes,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
			status: data.status,
			signature: data.signature,
			txnHash: data.txnHash,
			docId: doc.id,
		});
	});

	// remove duplicate docId elements from result
	result = result.filter(
		(thing, index, self) =>
			index === self.findIndex((t) => t.docId === thing.docId),
	);

	return result;
}

export async function AddSignature(docId: string, signature: string) {
	const docRef = doc(db, "uid", docId);

	await updateDoc(docRef, {
		signature: signature,
		status: StatusEnum.Signed,
		updatedAt: new Date(),
	});
}

export async function AddTxnHash(docId: string, txnHash: string) {
	const docRef = doc(db, "uid", docId);

	await updateDoc(docRef, {
		txnHash: txnHash,
		status: StatusEnum.TransactionSent,
		updatedAt: new Date(),
	});
}
