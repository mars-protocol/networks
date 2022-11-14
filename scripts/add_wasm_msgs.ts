import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { createMerkleTree } from "./merkle_tree";
import { GenesisState, Msg, VestingPosition } from "./types";

const CHAIN_ID = "ares-1";

// The developer multisig
// This should be a Cosmos SDK native multisig created off-chain
const DEPLOYER = "mars15mwq8jc7sf0r8hu6phahfsmqg3fagt7ysyd3un";

// Contract addresses are derived determinictically from code id and instance id, which we can
// predict beforehand.
const CONTRACTS = {
  VESTING: "mars14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9smxjtde",
  AIRDROP: "mars1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrqhnhf0l",
  DELEGATOR: "mars17p9rzwnnfxcjp32un9ug7yhhzgtkhvl9jfksztgw5uh69wac2pgs0gfvxm",
  VESTING_OWNER: "mars1ghd753shjuwexxywmgs4xz7x2q732vcnkm6h2pyv9s6ah3hylvrqn7y4x6",
  APOLLO: "mars1xt4ahzz2x8hpkc0tk6ekte9x6crw4w6u0r67cyt3kz9syh24pd7sqrzfx3",
};

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
      permission: "OnlyAddress",
      address: DEPLOYER,
    },
  },
});

// Store airdrop contract code
// code id: 2
const airdropWasm = fs.readFileSync(
  path.resolve(__dirname, `../${CHAIN_ID}/contracts/mars_airdrop.wasm`)
);
msgs.push({
  store_code: {
    sender: DEPLOYER,
    wasm_byte_code: airdropWasm.toString("base64"),
    instantiate_permission: {
      permission: "OnlyAddress",
      address: DEPLOYER,
    },
  },
});

// Store delegator contract code
// code id: 3
const delegatorWasm = fs.readFileSync(
  path.resolve(__dirname, `../${CHAIN_ID}/contracts/mars_delegator.wasm`)
);
msgs.push({
  store_code: {
    sender: DEPLOYER,
    wasm_byte_code: delegatorWasm.toString("base64"),
    instantiate_permission: {
      permission: "OnlyAddress",
      address: DEPLOYER,
    },
  },
});

// Store multisig contract code
// code id: 4
const cw3Wasm = fs.readFileSync(
  path.resolve(__dirname, `../${CHAIN_ID}/contracts/cw3_fixed_multisig.wasm`)
);
msgs.push({
  store_code: {
    sender: DEPLOYER,
    wasm_byte_code: cw3Wasm.toString("base64"),
    instantiate_permission: {
      permission: "Everybody",
      address: null,
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
        start_time: 1661990400,
        cliff: 31536000,
        duration: 94694400,
      },
    },
    funds: [],
  },
});

// Instantiate airdrop contract
const { root, totalAmount } = createMerkleTree(CHAIN_ID);
msgs.push({
  instantiate_contract: {
    sender: DEPLOYER,
    admin: DEPLOYER,
    code_id: 2,
    label: "mars-airdrop",
    msg: {
      merkle_root: root.toString("hex"),
    },
    funds: [
      {
        denom: "umars",
        amount: totalAmount.toString(),
      },
    ],
  },
});

// Tnstantiate delegator contract
msgs.push({
  instantiate_contract: {
    sender: DEPLOYER,
    admin: DEPLOYER,
    code_id: 3,
    label: "mars-delegator",
    msg: {
      bond_denom: "umars",
      ending_time: 1672531199, // 2022-12-31 23:59:59 UTC
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
    code_id: 4,
    label: "mars-vesting-owner",
    msg: {
      voters: [
        {
          addr: "mars15qf8yzfjymddkwp8mnmxyqd9fhedhxnxwy4hpf",
          weight: 1,
        },
        {
          addr: "mars149j66kcxshy823u6llukn4rm9xqxntu2x59n6z",
          weight: 1,
        },
        {
          addr: "mars1wny49dmcp8we5hqxjs06t0z3hkyrvf9mz2zhqk",
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
    code_id: 4,
    label: "apollo-warchest",
    msg: {
      voters: [
        {
          addr: "mars1z926ax906k0ycsuckele6x5hh66e2m4m09whw6",
          weight: 1,
        },
      ],
      threshold: {
        absolute_count: {
          weight: 1,
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
