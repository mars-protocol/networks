# mars-1 contracts

This directory contains wasm contracts that are to be included in mars-1's genesis.

Among these,

- "mars-delegator" and "mars-vesting" are compiled from the [periphery repo][1] at tag [v1.0.0][2] or commit id [`bacbba1`][3].
- "cw3-fixed-multisig" is compiled from [Mars' fork of cw-plus repo][4] at the [v1.0.1-stargate][5] branch or commit id [`54732a4`][6]. Compared to the original cw-plus, this branch has the `staking` and `stargate` features enabled for the contract:

   ```toml
   # contracts/cw3-fixed-multisig/Cargo.toml
   [dependencies]
   cosmwasm-std = { version = "1.1.0", features = ["staking", "stargate"] }
   ```

Contracts are compiled using [workspace-optimizer v0.12.11][7].

## Verify contracts

```bash
$ marsd genesis add-wasm-message list-codes
[
 {
  "code_id": 1,
  "info": {
   "code_hash": "NGTtd1E0KGX/vXsHUM+sW/+5+9rOs9M/kTqpK9N0I9E=",
   "creator": "mars1skwmcsesjj99hye93smjz88rh0qndhvahewr60",
   "instantiate_config": {
    "permission": "AnyOfAddresses",
    "addresses": [
     "mars1skwmcsesjj99hye93smjz88rh0qndhvahewr60"
    ]
   }
  }
 },
 {
  "code_id": 2,
  "info": {
   "code_hash": "olHUZpCXujH2jQuDKvi9BWi8fqa2vTIO6yubWWNvvG4=",
   "creator": "mars1skwmcsesjj99hye93smjz88rh0qndhvahewr60",
   "instantiate_config": {
    "permission": "AnyOfAddresses",
    "addresses": [
     "mars1skwmcsesjj99hye93smjz88rh0qndhvahewr60"
    ]
   }
  }
 },
 {
  "code_id": 3,
  "info": {
   "code_hash": "jmE5PflhlFpyHOPY+WqGs+5EFro4R/eng8uHrbLvF3k=",
   "creator": "mars1skwmcsesjj99hye93smjz88rh0qndhvahewr60",
   "instantiate_config": {
    "permission": "Everybody"
   }
  }
 }
]
```

The code hashes are in base64 encoding. Let's convert them to hex using nodejs REPL:

```bash
$ node
Welcome to Node.js v18.7.0.
Type ".help" for more information.
> const base64ToHex = (x) => Buffer.from(x, 'base64').toString('hex')
undefined
> base64ToHex('NGTtd1E0KGX/vXsHUM+sW/+5+9rOs9M/kTqpK9N0I9E=')
'3464ed7751342865ffbd7b0750cfac5bffb9fbdaceb3d33f913aa92bd37423d1'
> base64ToHex('olHUZpCXujH2jQuDKvi9BWi8fqa2vTIO6yubWWNvvG4=')
'a251d4669097ba31f68d0b832af8bd0568bc7ea6b6bd320eeb2b9b59636fbc6e'
> base64ToHex('jmE5PflhlFpyHOPY+WqGs+5EFro4R/eng8uHrbLvF3k=')
'8e61393df961945a721ce3d8f96a86b3ee4416ba3847f7a783cb87adb2ef1779'
```

These should match the wasm files found in this directory:

```bash
$ sha256sum mars-1/contracts/*.wasm
8e61393df961945a721ce3d8f96a86b3ee4416ba3847f7a783cb87adb2ef1779  mars-1/contracts/cw3_fixed_multisig.wasm
a251d4669097ba31f68d0b832af8bd0568bc7ea6b6bd320eeb2b9b59636fbc6e  mars-1/contracts/mars_delegator.wasm
3464ed7751342865ffbd7b0750cfac5bffb9fbdaceb3d33f913aa92bd37423d1  mars-1/contracts/mars_vesting.wasm
```

[1]: https://github.com/mars-protocol/periphery
[2]: https://github.com/mars-protocol/periphery/tree/v1.0.0
[3]: https://github.com/mars-protocol/periphery/tree/bacbba17a8837e97310e94f299b6b6019ec4c31a
[4]: https://github.com/mars-protocol/cw-plus
[5]: https://github.com/mars-protocol/cw-plus/tree/v1.0.1-stargate
[6]: https://github.com/mars-protocol/cw-plus/tree/54732a44f9673a850e8eb59f3b288b78eefe20ef
[7]: https://github.com/CosmWasm/rust-optimizer/tree/v0.12.11
