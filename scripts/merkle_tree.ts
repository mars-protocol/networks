import * as fs from "fs";
import * as path from "path";
import { SHA256 } from "jscrypto/SHA256";
import { Word32Array } from "jscrypto";
import { MerkleTree } from "merkletreejs";
import { AirdropUser } from "./types";

function sha256(data: Buffer): Buffer {
  return Buffer.from(SHA256.hash(new Word32Array(data)).toUint8Array());
}

export function createMerkleTree(chainId: string) {
  const users: AirdropUser[] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, `../${chainId}/data/airdrop.json`), "utf8")
  );
  const leaves = users.map((user) => sha256(Buffer.from(`${user.address}:${user.amount}`, "utf8")));
  const tree = new MerkleTree(leaves, sha256, { sortLeaves: false, sortPairs: true });
  return {
    root: tree.getRoot(),
    totalAmount: users.reduce((a, b) => a + b.amount, 0),
  };
}
