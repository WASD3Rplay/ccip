export const chainMapping = new Map<string, string>([
  ["0x1", "Ethereum Mainnet"],
  ["0x3", "Ropsten Testnet"],
  ["0x4", "Rinkeby Testnet"],
  ["0x5", "Goerli Testnet"],
  ["0x89", "Polygon (Matic) Mainnet"],
  ["0x13881", "Polygon (Matic) Mumbai Testnet"],
  ["0xa860", "Optimism Mainnet"],
  ["0x1a4", "Optimism Goerli"],
  ["0xaa36a7", "Ethereum Sepolia"],
]);

export const chainLinkMapping = new Map<string, string>([
  ["Ethereum Sepolia", "16015286601757825753"],
  ["Optimism Goerli", "2664363617261496610"],
  ["Polygon (Matic) Mumbai Testnet", "12532609583862916517"],
]);
export const chains = [
  "Ethereum Sepolia",
  "Optimism Goerli",
  "Polygon (Matic) Mumbai Testnet",
];
export const tokens = ["LINK", "CCIP-BnM", "CCIP-LnM"];
export const tokenMapping = new Map<string, string>([
  ["LINK", "0x779877A7B0D9E8603169DdbD7836e478b4624789"],
  ["CCIP-BnM", "0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05"],
  ["CCIP-LnM", "0x466D489b6d36E7E3b824ef491C225F5830E81cC1"],
]);
