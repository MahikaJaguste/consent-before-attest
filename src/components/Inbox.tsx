import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { GetInboxDocuments } from "../firebase/crudAttestations";
import { IAttestation } from "../types";

/**
 * An example component using the attestation station
 */
export function Inbox() {

  const { address } = useAccount();
  const [docs, setDocs] = useState<IAttestation[]>([]);

  // useSignMessage from wagmi
  const { signMessage } = useSignMessage({
    onSuccess: (signature) => {
      console.log("signature", signature);
    }
  });

  async function getDocs(address: string) {
    const docs_ = await GetInboxDocuments(address);
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
            <button onClick={() => {
              signMessage({
                message: doc.docId,
              });
            }}>Sign</button>
          </div>
        )
      })}
    </div>
  );
}
