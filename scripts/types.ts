export interface GenesisState {
  app_state: {
    auth: {
      accounts: object[];
    };
    bank: {
      balances: {
        address: string;
        coins: Coin[];
      }[];
    };
    distribution: {
      fee_pool: {
        community_pool: Coin[];
      };
    };
    wasm: {
      gen_msgs: Msg[];
    };
  };
}

export type Msg = MsgStoreCode | MsgInstantiateContract | MsgExecuteContract;

export type MsgStoreCode = {
  store_code: {
    sender: string;
    wasm_byte_code: string;
    instantiate_permission: {
      permission: string;
      address: string | null;
      addresses: string[];
    };
  };
};

export type MsgInstantiateContract = {
  instantiate_contract: {
    sender: string;
    admin: string;
    code_id: number;
    label: string;
    msg: object;
    funds: Coin[];
  };
};

export type MsgExecuteContract = {
  execute_contract: {
    sender: string;
    contract: string;
    msg: object;
    funds: Coin[];
  };
};

export type Coin = {
  denom: string;
  amount: string;
};

export type Accounts = {
  deployer_multisig_signers: string[];
  vesting_multisig_signers: string[];
  apollo_multisig_signers: string[];
  validators: string[];
  vesting_recipients: string[];
  faucet?: string;
};

export type AirdropUser = {
  address: string;
  amount: number;
};

export type AirdropPosition = {
  address: string;
  amount: string;
};

export type VestingPosition = {
  address: string;
  amount: string;
  schedule: {
    start_time: number;
    cliff: number;
    duration: number;
  };
};
