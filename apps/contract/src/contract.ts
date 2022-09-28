import { NearBindgen, near, call, view, initialize, UnorderedMap } from 'near-sdk-js';
import Big from 'big.js';

Big.RM = Big.roundDown;
const PRECISION = 32;
Big.PE = PRECISION;

type Shares = {
  [accountId: string]: string;
};

export const GAS_PAY = Big('32e+12').toString();

export type SplitSerial = {
  totalShares: string;
  shares: Shares;
};

export type Split = {
  totalShares: string;
  shares: UnorderedMap;
  totalPaid: string;
};

@NearBindgen({ requireInit: true })
export class SplitContract {
  totalShares: Split['totalShares'] = '0';
  shares: Split['shares'] = new UnorderedMap('near-split-shares');
  totalPaid: Split['totalPaid'] = '0';

  @initialize({})
  init({ split }: { split: SplitSerial }): SplitSerial {
    this.totalShares = split.totalShares;
    this.shares.extend(Object.entries(split.shares));

    return {
      totalShares: this.totalShares,
      shares: Object.fromEntries(this.shares.toArray()) as Shares,
    };
  }

  @view({}) // This method is read-only and can be called for free
  get_split(): SplitSerial {
    return {
      totalShares: this.totalShares,
      shares: Object.fromEntries(this.shares.toArray()) as Shares,
    };
  }

  /**
   * processes the incoming payment
   */
  @call({ payableFunction: true })
  pay(): string {
    const amount: bigint = near.attachedDeposit() as bigint;
    const totalShares = BigInt(this.totalShares);
    let paid: Big = Big('0');

    for (const [account, numberOfShares] of this.shares) {
      const accountShares = BigInt(numberOfShares as string);
      const bAmount = Big(amount.toString(10));
      const bTotalShares = Big(totalShares.toString(10));
      const bAccountShares = Big(accountShares.toString(10));
      const toPay = bAmount.div(bTotalShares).times(bAccountShares).round();

      const promise = near.promiseBatchCreate(account as string);
      near.promiseBatchActionTransfer(promise, BigInt(toPay.toString()));
      paid = paid.plus(toPay);
    }

    this.totalPaid = (BigInt(this.totalPaid) + BigInt(paid.toString())).toString(10);

    return paid.toString();
  }
}
