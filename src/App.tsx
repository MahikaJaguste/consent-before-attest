import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { CreateAttestation } from "./components/CreateAttestation";
import { Inbox } from "./components/Inbox";
import { Outbox } from "./components/Outbox";
import { ReadAttestation } from "./components/ReadAttestation";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export function App() {
/**
 * Wagmi hook for getting account information
 * @see https://wagmi.sh/docs/hooks/useAccount
 */
const { isConnected } = useAccount();

const [value, setValue] = React.useState(0);

const handleChange = (event: React.SyntheticEvent, newValue: number) => {
	setValue(newValue);
};

return (
	<>

	<div style={{textAlign: "center", }}>
		<Typography ><h1>Consent Before Attest</h1></Typography>
	</div>
	<Card sx={isConnected ? { minWidth: 275, marginLeft: 70, marginRight: 60 } : { minWidth: 275, marginLeft: 80, marginRight: 80}} elevation={0}>
    <CardContent>
		<ConnectButton />
	</CardContent>
	</Card>


	<>
		<br/>
		<hr/>
		<br/>
		<Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered>
			<Tab label="Attest" {...a11yProps(0)} />
			<Tab label="Inbox" {...a11yProps(1)} />
			<Tab label="Outbox" {...a11yProps(2)} />
			<Tab label="Read" {...a11yProps(3)} />
		</Tabs>
		<TabPanel value={value} index={0}>
			<CreateAttestation/>
		</TabPanel>
		<TabPanel value={value} index={1}>
			<Inbox />
		</TabPanel>
		<TabPanel value={value} index={2}>
			<Outbox />
		</TabPanel>
		<TabPanel value={value} index={3}>
			<ReadAttestation />
		</TabPanel>
	</>

	</>
);
}

interface TabPanelProps {
children?: React.ReactNode;
index: number;
value: number;
}

function TabPanel(props: TabPanelProps) {
const { children, value, index, ...other } = props;

return (
	<div
	role="tabpanel"
	hidden={value !== index}
	id={`simple-tabpanel-${index}`}
	aria-labelledby={`simple-tab-${index}`}
	{...other}
	>
	{value === index && (
		<Box sx={{ p: 3 }}>
		<Typography>{children}</Typography>
		</Box>
	)}
	</div>
);
}

function a11yProps(index: number) {
return {
	id: `simple-tab-${index}`,
	'aria-controls': `simple-tabpanel-${index}`,
};
}


