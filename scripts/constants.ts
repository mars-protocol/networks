export const CHAIN_ID = "mars-1";

// The developer multisig
// This should be a Cosmos SDK native multisig created off-chain
export const DEPLOYER = "mars1skwmcsesjj99hye93smjz88rh0qndhvahewr60";

// Contract addresses are derived determinictically from code id and instance id, which we can
// predict beforehand.
export const CONTRACTS = {
  VESTING: "mars14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9smxjtde",
  DELEGATOR: "mars1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrqhnhf0l",
  VESTING_OWNER: "mars17p9rzwnnfxcjp32un9ug7yhhzgtkhvl9jfksztgw5uh69wac2pgs0gfvxm",
  APOLLO: "mars1unyuj8qnmygvzuex3dwmg9yzt9alhvyeat0uu0jedg2wj33efl5q56gnrn",
};
