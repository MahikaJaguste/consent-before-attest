import { useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import {
  createKey,
  parseString,
} from "@eth-optimism/atst";
import { LinearProgress, TextField } from "@mui/material";
import { Button } from "@mui/material";
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import { Card, CardContent } from "@mui/material";
import { RPC_URL, CONTRACT_ADDRESS } from "../types";
import { ethers } from "ethers";
import { consentualAttestationStationABI } from "../generated";

export function ReadAttestation() {

  const { address } = useAccount();

  const [creatorAddress, setCreatorAddress] = useState("");
  const [aboutAddress, setAboutAddress] = useState("");
  const [attestKey, setAttestKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attestValue, setAttestValue] = useState("");


  const readAttestation = async () => {
    if(!aboutAddress || !attestKey || !creatorAddress || aboutAddress === "" || attestKey === "" || creatorAddress === "") {
      alert("Please fill all the fields");
      return;
    }
    setIsLoading(true);
    let contract: ethers.Contract | undefined;
		const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
		if(provider){
			contract = new ethers.Contract(CONTRACT_ADDRESS, consentualAttestationStationABI, provider);
		}
		if(!contract) return;
    const attestValue_ = await contract.getAttestation(creatorAddress, aboutAddress, createKey(attestKey));
    setAttestValue(parseString(attestValue_));
    setIsLoading(false);
  }

  return (

    <Card sx={{ minWidth: 275, marginLeft: 40, marginRight: 40 }} elevation={10}>
    <CardContent>
      <div style={{textAlign: "center", }}>
      <h2>Fetch any attestation!</h2>
      &nbsp;
      <TextField
        onChange={(e) => setCreatorAddress(e.target.value)}
        value={creatorAddress}
        id="filled-basic"
        label="Creator Address"
        variant="standard"
        size="small"
        fullWidth={true}
      />
      <br />
      <br />
      <TextField
        onChange={(e) => setAboutAddress(e.target.value)}
        value={aboutAddress}
        id="filled-basic"
        label="About Address"
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
      <br />
      <Button style={{textTransform: 'none'}} variant="outlined" hidden={isLoading} color="success" onClick={() => readAttestation()}>
        <ImportContactsIcon/> &nbsp; Read
			</Button>
      <br />
      <br />
      {isLoading && <span>
          <LinearProgress color="success"/>
        </span>
      }
      <br />
      <div>Attest value: {attestValue}</div>
      </div>
    </CardContent>
  </Card>
  );
}