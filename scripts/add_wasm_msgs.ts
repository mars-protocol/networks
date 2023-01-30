import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { CHAIN_ID, CONTRACTS, DEPLOYER } from "./constants";
import { GenesisState, Msg, VestingPosition } from "./types";

const msgs: Msg[] = [];

// Store vesting contract code
// code id: 1
const vestingWasm = fs.readFileSync(
  path.resolve(__dirname, `../${CHAIN_ID}/contracts/mars_vesting.wasm`)
);
msgs.push({
  store_code: {
    sender: DEPLOYER,
    wasm_byte_code: vestingWasm.toString("base64"),
    instantiate_permission: {
      permission: "AnyOfAddresses",
      address: "",
      addresses: [DEPLOYER],
    },
  },
});

// Store delegator contract code
// code id: 2
const delegatorWasm = fs.readFileSync(
  path.resolve(__dirname, `../${CHAIN_ID}/contracts/mars_delegator.wasm`)
);
msgs.push({
  store_code: {
    sender: DEPLOYER,
    wasm_byte_code: delegatorWasm.toString("base64"),
    instantiate_permission: {
      permission: "AnyOfAddresses",
      address: "",
      addresses: [DEPLOYER],
    },
  },
});

// Store multisig contract code
// code id: 3
const cw3Wasm = fs.readFileSync(
  path.resolve(__dirname, `../${CHAIN_ID}/contracts/cw3_fixed_multisig.wasm`)
);
msgs.push({
  store_code: {
    sender: DEPLOYER,
    wasm_byte_code: cw3Wasm.toString("base64"),
    instantiate_permission: {
      permission: "AnyOfAddresses",
      address: "",
      addresses: [DEPLOYER],
    },
  },
});

// Instantiate vesting contract
msgs.push({
  instantiate_contract: {
    sender: DEPLOYER,
    admin: DEPLOYER,
    code_id: 1,
    label: "mars-vesting",
    msg: {
      owner: CONTRACTS.VESTING_OWNER,
      unlock_schedule: {
        start_time: 1661990400, // September 1, 2022 12:00:00 AM
        cliff: 31536000, // 1 year
        duration: 94694400, // 3 years
      },
    },
    funds: [],
  },
});

// Tnstantiate delegator contract
msgs.push({
  instantiate_contract: {
    sender: DEPLOYER,
    admin: DEPLOYER,
    code_id: 2,
    label: "mars-delegator",
    msg: {
      bond_denom: "umars",
      ending_time: 1677628800, // March 1, 2023 12:00:00 AM - 1 month after launch
    },
    funds: [
      {
        denom: "umars",
        amount: "50000000000000",
      },
    ],
  },
});

// Instantiate the owner multisig contract
//
// This multisig will be set as the owner of the vesting contract, which has the ability to create
// or terminate vesting positions.
msgs.push({
  instantiate_contract: {
    sender: DEPLOYER,
    admin: CONTRACTS.VESTING_OWNER,
    code_id: 3,
    label: "mars-vesting-owner",
    msg: {
      voters: [
        {
          addr: "mars15qf8yzfjymddkwp8mnmxyqd9fhedhxnxwy4hpf",
          weight: 1,
        },
        {
          addr: "mars17fej0e67gnc0wsan246wpuc6tepgp5peq7zca0",
          weight: 1,
        },
        {
          addr: "mars1rkxzg6hjv98qu7js592hwh3czej2eng28fu3dc",
          weight: 1,
        },
      ],
      threshold: {
        absolute_count: {
          weight: 2,
        },
      },
      max_voting_period: {
        time: 604800, // 7 days
      },
    },
    funds: [],
  },
});

// Instantiate Apollo Warchest multisig contract
//
// Apollo Warchest held MARS tokens on Terra Classic, thus is eligible for an airdrop.
// Since contracts cannot claim airdrops, we pre-assign the appropriate coin balances to the
msgs.push({
  instantiate_contract: {
    sender: DEPLOYER,
    admin: CONTRACTS.APOLLO,
    code_id: 3,
    label: "apollo-warchest",
    msg: {
      voters: [
        {
          addr: "mars1w4yv8uvc0neqhxwqsg0qm0axlt8wcms4hxwmd4",
          weight: 1,
        },
        {
          addr: "mars1jssn7m7u06jwe6ckzgxwsqs4uqlmyljfuffwkq",
          weight: 1,
        },
        {
          addr: "mars18kmnpjw6mj7juw6wmnzdyaa8e2tg9h3m49wx8j",
          weight: 1,
        },
        {
          addr: "mars18fsecpmq5tuq59k3ezkrrdt6gyvr30lxdd956y",
          weight: 1,
        },
        {
          addr: "mars18h47lm65q0r02gcuxe6vslk8u5ftgrl9m9ps7n",
          weight: 1,
        },
        {
          addr: "mars1q4sc87yuf9s2x6r8tqafhu646u34t30puamn42",
          weight: 1,
        },
        {
          addr: "mars16u56nw6rhdt5wc63ammgdn565q6t825mc7rq7g",
          weight: 1,
        },
      ],
      threshold: {
        absolute_count: {
          weight: 4,
        },
      },
      max_voting_period: {
        time: 604800, // 7 days
      },
    },
    funds: [],
  },
});

// Create vesting positions
const vestingPositions: VestingPosition[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `../${CHAIN_ID}/data/vesting.json`), "utf8")
);
for (const position of vestingPositions) {
  msgs.push({
    execute_contract: {
      sender: CONTRACTS.VESTING_OWNER,
      contract: CONTRACTS.VESTING,
      msg: {
        create_position: {
          user: position.address,
          vest_schedule: position.schedule,
        },
      },
      funds: [
        {
          denom: "umars",
          amount: position.amount,
        },
      ],
    },
  });
}

// Load the current genesis state and overwrite the wasm messages
const genesisPath = path.resolve(os.homedir(), ".mars/config/genesis.json");
const genesisState: GenesisState = JSON.parse(fs.readFileSync(genesisPath, "utf8"));
genesisState.app_state.wasm.gen_msgs = msgs;
fs.writeFileSync(genesisPath, JSON.stringify(genesisState, null, 2));
