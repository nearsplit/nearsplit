import React, { Fragment, useCallback, useEffect, useState } from "react";
import { providers, utils } from "near-api-js";
import type {
  AccountView,
} from "near-api-js/lib/providers/provider";
import type { Account } from "../core/near/interfaces";
import { useWalletSelector } from "../core/near/WalletSelectorContext";

const Content: React.FC = () => {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getAccount = useCallback(async (): Promise<Account | null> => {
    if (!accountId) {
      return null;
    }

    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    return provider
      .query<AccountView>({
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      })
      .then((data) => ({
        ...data,
        account_id: accountId,
      }));
  }, [accountId, selector.options]);

  useEffect(() => {
    if (!accountId) {
      return setAccount(null);
    }

    setLoading(true);

    getAccount().then((nextAccount) => {
      setAccount(nextAccount);
      setLoading(false);
    });
  }, [accountId, getAccount]);

  const handleSignIn = () => {
    modal.show();
  };

  const handleSignOut = async () => {
    const wallet = await selector.wallet();

    wallet.signOut().catch((err) => {
      console.log("Failed to sign out");
      console.error(err);
    });
  };

  const handleSwitchWallet = () => {
    modal.show();
  };

  const handleSwitchAccount = () => {
    const currentIndex = accounts.findIndex((x) => x.accountId === accountId);
    const nextIndex = currentIndex < accounts.length - 1 ? currentIndex + 1 : 0;

    const nextAccountId = accounts[nextIndex].accountId;

    selector.setActiveAccount(nextAccountId);

    alert("Switched account to " + nextAccountId);
  };

  const handleVerifyOwner = async () => {
    const wallet = await selector.wallet();
    try {
      const owner = await wallet.verifyOwner({
        message: "test message for verification",
      });

      if (owner) {
        alert(`Signature for verification: ${JSON.stringify(owner)}`);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      alert(message);
    }
  };

  if (loading) {
    return null;
  }

  if (!account) {
    return (
      <Fragment>
        <div>
          <button onClick={handleSignIn}>Log in</button>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div>
        <p>{accountId}</p>
        <button onClick={handleSignOut}>Log out</button>
        <button onClick={handleSwitchWallet}>Switch Wallet</button>
        <button onClick={handleVerifyOwner}>Verify Owner</button>
        {accounts.length > 1 && (
          <button onClick={handleSwitchAccount}>Switch Account</button>
        )}
      </div>
    </Fragment>
  );
};

export default Content;
