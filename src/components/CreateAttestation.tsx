import { useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import {
  createValue,
  createKey,
} from "@eth-optimism/atst";

import { AddDocument_AutoID } from "../firebase/crudAttestations";


export function CreateAttestation() {

  const { address } = useAccount();

  const [aboutAddress, setAboutAddress] = useState("");
  const [attestKey, setAttestKey] = useState("");
  const [attestValue, setAttestValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const initiateAttestation = async () => {
    setIsLoading(true);
    const { success, error } = await AddDocument_AutoID(
      address!,
      aboutAddress,
      attestKey,
      createKey(attestKey),
      attestValue,
      createValue(attestValue)
    )
    setIsLoading(false);
    if (success) {
      alert("Attestation initiated successfully");
    } else {
      alert("Error is initiating attestation: " + error);
    }
  }

  return (
    <div>
      <h2>Attestoooooor</h2>
      <input
        onChange={(e) => setAboutAddress(e.target.value)}
        value={aboutAddress}
      />
      <input
        onChange={(e) => setAttestKey(e.target.value)}
        value={attestKey}
      />
      <input
        onChange={(e) => setAttestValue(e.target.value)}
        value={attestValue}
      />
      <button onClick={() => initiateAttestation()}>
        Attest
      </button>
      {isLoading && <span>
          Initiating attestion...{" "}
        </span>
      }
    </div>
  );
}
