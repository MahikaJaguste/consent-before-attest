import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { GetOutboxDocuments } from "../firebase/crudAttestations";
import { IAttestation } from "../types";

/**
 * An example component using the attestation station
 */
export function Outbox() {

  const { address } = useAccount();
  const [docs, setDocs] = useState<IAttestation[]>([]);

  async function getDocs(address: string) {
    const docs_ = await GetOutboxDocuments(address);
    setDocs(docs_);
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
          </div>
        )
      })}
    </div>
  );
}
