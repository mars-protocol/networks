import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { addressTerraToMars } from "./bech32";
import { CHAIN_ID, CONTRACTS, DEPLOYER } from "./constants";
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

const accounts: Accounts = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `../${CHAIN_ID}/data/accounts.json`), "utf8")
);

const balances: Balance[] = [];

// faucet gets 100,000 MARS
if (!!accounts.faucet) {
  balances.push({
    address: accounts.faucet,
    coins: coins(100_000_000_000),
  });
}

// each validator gets 1 MARS
for (const validator of accounts.validators) {
  balances.push({
    address: validator,
    coins: coins(1_000_000),
  });
}

// vesting owner gets 10,000,000 MARS
balances.push({
  address: CONTRACTS.VESTING_OWNER,
  coins: coins(10_000_000_000_000),
});

// apollo warchest gets 399263941331 umars
balances.push({
  address: CONTRACTS.APOLLO,
  coins: coins(399_263_941_331),
});

// the deployer needs to have the delegator amount
const delegatorAmount = 50_000_000_000_000;
balances.push({
  address: DEPLOYER,
  coins: coins(delegatorAmount),
});

// the vesting contract owner needs to have the total vesting amount
const positions: VestingPosition[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `../${CHAIN_ID}/data/vesting.json`), "utf8")
);
const totalVestingAmount = positions.reduce((a, b) => a + Number(b.amount), 0);
const index = balances.findIndex((balance) => balance.address === CONTRACTS.VESTING_OWNER);
const currentAmount = Number(balances[index]!.coins[0]!.amount);
balances[index]!.coins[0]!.amount = (currentAmount + totalVestingAmount).toString();

// airdrop recipients
const users: AirdropUser[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `../${CHAIN_ID}/data/airdrop.json`), "utf8")
);
for (const user of users) {
  balances.push({
    address: addressTerraToMars(user.address),
    coins: coins(user.amount),
  });
}

// all the rest goes to community pool
const total = balances.reduce((a, b) => a + Number(b.coins[0]!.amount), 0);
const communityPool = 1_000_000_000_000_000 - total;
balances.push({
  address: "mars1jv65s3grqf6v6jl3dp4t6c9t9rk99cd86za9uy", // distribution module account
  coins: coins(communityPool),
});

// sort balances by amount descendingly
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
