import { useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import {
  createValue,
  createKey,
} from "@eth-optimism/atst";

import { AddDocument_AutoID } from "../firebase/crudAttestations";
import { TextField } from "@mui/material";
import { Button } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {CircularProgress} from "@mui/material";
import { Card, CardContent } from "@mui/material";

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
    window.location.reload();
  }

  return (

    <Card sx={{ minWidth: 275, marginLeft: 40, marginRight: 40 }} elevation={10}>
    <CardContent>
      <div style={{textAlign: "center", }}>
      <h2>Attestoooooor</h2>
      &nbsp;
      <TextField
        onChange={(e) => setAboutAddress(e.target.value)}
        value={aboutAddress}
        id="filled-basic"
        label="Address"
        variant="standard"
        size="small"
        fullWidth={true}
      />
      <br />
      <br />
      <TextField
        onChange={(e) => setAttestKey(e.target.value)}
        value={attestKey}
        id="filled-basic"
        label="Attest Key"
        variant="standard"
        size="small"
        fullWidth={true}
      />
      <br />
      <br />
      <TextField
        onChange={(e) => setAttestValue(e.target.value)}
        value={attestValue}
        id="filled-basic"
        label="Attest Value"
        variant="standard"
        size="small"
        fullWidth={true}
      />
      <br />
      <br />
      <br />
      <Button style={{textTransform: 'none'}} variant="outlined" hidden={isLoading} color="success" onClick={() => initiateAttestation()}>
        <AddCircleOutlineIcon/> &nbsp; Create
			</Button>
      {isLoading && <span>
          <CircularProgress size="small"/>
        </span>
      }
      </div>
    </CardContent>
  </Card>
  );
}