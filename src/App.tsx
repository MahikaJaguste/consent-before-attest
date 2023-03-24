import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { Attestooooooor } from "./components";
import { CreateAttestation } from "./components/CreateAttestation";
import { Inbox } from "./components/Inbox";
import { Outbox } from "./components/Outbox";

export function App() {
  /**
   * Wagmi hook for getting account information
   * @see https://wagmi.sh/docs/hooks/useAccount
   */
  const { isConnected } = useAccount();

  return (
    <>
      <h1>OP Starter Project</h1>

      {/** @see https://www.rainbowkit.com/docs/connect-button */}
      <ConnectButton />

      {isConnected && (
        <>
          <hr />
          <CreateAttestation />
          {/* <Attestooooooor /> */}
          <hr />
          <Inbox />
          <hr />
          <Outbox />
        </>
      )}
    </>
  );
}
