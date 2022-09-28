import type { SplitSerial } from '../../contract/src/contract';
import { Worker, NearAccount, NEAR } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';

const bint50 = BigInt(50).toString(10);
const bint100 = BigInt(100).toString(10);
const bint150 = BigInt(150).toString(10);

const testSplitAccountBob = 'testsplitbob.test';
const testSplitAccountFob = 'testsplitfob.test';
const testSplitAccountMob = 'testsplitmob.test';

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;
  const contract = await root.createSubAccount('near-split');
  const anteater = await root.createSubAccount('anteater');
  // Get wasm file path from package.json test script in folder above
  await contract.deploy(
    process.argv[2],
  );

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, contract, anteater };
});

test.afterEach(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test('getting split panics if split not initialized', async (t) => {
  const { contract } = t.context.accounts;
  await t.throwsAsync(contract.view('get_split', { message: 'This split has not been created yet!' }));
});

test('init the split', async (t) => {
  const { root, contract } = t.context.accounts;
  const testSplit: SplitSerial = {
    totalShares: bint150,
    shares: {
      [testSplitAccountBob]: bint50,
      [testSplitAccountFob]: bint50,
      [testSplitAccountMob]: bint50,
    },
  };

  await root.call(contract, 'init', { split: testSplit });
  const split: SplitSerial = await contract.view('get_split', {});
  t.is(split.totalShares, bint150);
  t.is(split.shares[testSplitAccountBob], bint50);
  t.is(split.shares[testSplitAccountFob], bint50);
  t.is(split.shares[testSplitAccountMob], bint50);
});

test('pay', async (t) => {
  const { root, contract, anteater } = t.context.accounts;
  const testSplit: SplitSerial = {
    totalShares: bint150,
    shares: {
      [testSplitAccountBob]: bint50,
      [testSplitAccountFob]: bint50,
      [testSplitAccountMob]: bint50,
    },
  };

  await root.call(contract, 'init', { split: testSplit });
  const twoNear = NEAR.parse('2 N').toString();
  const biTwoNear = BigInt(twoNear);
  const paymentResult = await anteater.call(contract, 'pay', {}, {
    attachedDeposit: twoNear,
    gas: BigInt('32000000000000'),
  });
  const biResult = BigInt(paymentResult as string);
  t.true(biResult >= biTwoNear - BigInt(10) && biResult <= biTwoNear);
});
