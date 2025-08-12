import { Wallet } from "../wallet";
import { AuthButton } from "../auth-button";

export default function WalletPage() {
  return (
    <div>
      Hello Wallet
      <Wallet />
      <AuthButton />
    </div>
  );
}
