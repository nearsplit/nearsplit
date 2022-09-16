import { NearBindgen, near, call, view, initialize, UnorderedMap } from 'near-sdk-js';

export type Split = {
  totalShares: bigint;
  shares: UnorderedMap;
};

@NearBindgen({})
export class SplitContract {
  split: Split = null;

  @initialize({})
  init({ split }: { split: Split }) {
    this.split = split;
  }

  @view({}) // This method is read-only and can be called for free
  get_split(): Split {
    return this.split;
  }

  /**
   * processes the incoming payment
   */
  @call({ payableFunction: true })
  pay(): string {
    const amount: bigint = near.attachedDeposit() as bigint;
    const { totalShares, shares } = this.split;
    let paid: bigint = BigInt(0);

    for (const account in shares) {
      const accountShares = shares[account];
      const toPay = accountShares / totalShares * amount;

      const promise = near.promiseBatchCreate(account);
      near.promiseBatchActionTransfer(promise, toPay);
      paid += amount;
    }

    return paid.toString();
  }
}
