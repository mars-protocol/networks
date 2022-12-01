import { bech32 } from "bech32";

export function addressTerraToMars(terraAddr: string) {
  const { prefix, words } = bech32.decode(terraAddr);
  if (prefix !== "terra") {
    throw "Only terra address is accepted";
  }
  return bech32.encode("mars", words);
}
