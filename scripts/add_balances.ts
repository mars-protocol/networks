import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Accounts, AirdropUser, Coin, GenesisState, VestingPosition } from "./types";

type Balance = {
  address: string;
  coins: Coin[];
};

function coins(amount: number) {
  return [
    {
      denom: "umars",
      amount: amount.toString(),
    },
  ];
}

const CHAIN_ID = "ares-1";

const accounts: Accounts = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `../${CHAIN_ID}/data/accounts.json`), "utf8")
);

const balances: Balance[] = [];

// faucet gets 100,000 MARS
balances.push({
  address: accounts.faucet!,
  coins: coins(100_000_000_000),
});

// each validator gets 1 MARS
for (const validator of accounts.validators) {
  balances.push({
    address: validator,
    coins: coins(1_000_000),
  });
}

// vesting owner gets 10,000,000 MARS
balances.push({
  address: "mars1ghd753shjuwexxywmgs4xz7x2q732vcnkm6h2pyv9s6ah3hylvrqn7y4x6",
  coins: coins(10_000_000_000_000),
});

// apollo warchest gets 399263941331 umars
balances.push({
  address: "mars1xt4ahzz2x8hpkc0tk6ekte9x6crw4w6u0r67cyt3kz9syh24pd7sqrzfx3",
  coins: coins(399_263_941_331),
});

// the deployer needs to have the total airdrop amount + delegator amount
const users: AirdropUser[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `../${CHAIN_ID}/data/airdrop.json`), "utf8")
);
const totalAirdropAmount = users.reduce((a, b) => a + b.amount, 0);
const delegatorAmount = 50_000_000_000_000;
balances.push({
  address: "mars15mwq8jc7sf0r8hu6phahfsmqg3fagt7ysyd3un",
  coins: coins(totalAirdropAmount + delegatorAmount),
});

// the vesting contract owner needs to have the total vesting amount
const positions: VestingPosition[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `../${CHAIN_ID}/data/vesting.json`), "utf8")
);
const totalVestingAmount = positions.reduce((a, b) => a + Number(b.amount), 0);
const index = balances.findIndex(
  (balance) => balance.address === "mars1ghd753shjuwexxywmgs4xz7x2q732vcnkm6h2pyv9s6ah3hylvrqn7y4x6"
);
const currentAmount = Number(balances[index]!.coins[0]!.amount);
balances[index]!.coins[0]!.amount = (currentAmount + totalVestingAmount).toString();

// all the rest goes to community pool
const total = balances.reduce((a, b) => a + Number(b.coins[0]!.amount), 0);
const communityPool = 1_000_000_000_000_000 - total;
balances.push({
  address: "mars1jv65s3grqf6v6jl3dp4t6c9t9rk99cd86za9uy", // distribution module account
  coins: coins(communityPool),
});

balances.sort((a, b) => {
  const aAmount = Number(a.coins[0]!.amount);
  const bAmount = Number(b.coins[0]!.amount);
  if (aAmount > bAmount) return -1;
  else if (bAmount > aAmount) return 1;
  else {
    if (a.address < b.address) return -1;
    else if (a.address > b.address) return 1;
    else return 0;
  }
});

const genesisPath = path.resolve(os.homedir(), ".mars/config/genesis.json");
const genesisState: GenesisState = JSON.parse(fs.readFileSync(genesisPath, "utf8"));
genesisState.app_state.bank.balances = balances;
genesisState.app_state.distribution.fee_pool.community_pool = coins(communityPool);
fs.writeFileSync(genesisPath, JSON.stringify(genesisState, null, 2));
