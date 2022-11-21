import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Accounts, GenesisState } from "./types";

const CHAIN_ID = "ares-1";

const accounts: Accounts = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `../${CHAIN_ID}/data/accounts.json`), "utf8")
);
const allAccounts = [
  ...accounts.deployer_multisig_signers,
  ...accounts.vesting_multisig_signers,
  ...accounts.apollo_multisig_signers,
  ...accounts.validators,
  ...accounts.vesting_recipients,
];
if (!!accounts.faucet) {
  allAccounts.push(accounts.faucet);
}

allAccounts.sort();

const genAccounts = allAccounts.map((address) => ({
  "@type": "/cosmos.auth.v1beta1.BaseAccount",
  address,
  pub_key: null,
  account_number: "0",
  sequence: "0",
}));

const genesisPath = path.resolve(os.homedir(), ".mars/config/genesis.json");
const genesisState: GenesisState = JSON.parse(fs.readFileSync(genesisPath, "utf8"));
genesisState.app_state.auth.accounts.push(...genAccounts);
fs.writeFileSync(genesisPath, JSON.stringify(genesisState, null, 2));
