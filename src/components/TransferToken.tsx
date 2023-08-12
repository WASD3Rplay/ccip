import { useEffect, useState } from "react";
import logo from "../logo.svg";
import { ethers } from "ethers";
import erc20abi from "../utils/contractAbi/ERC20.json";
import transfer from "../utils/contractAbi/Transferor.json";
import transactionCombiner from "../utils/contractAbi/TransactionCombiner.json";
import {
  chainLinkMapping,
  chains,
  tokenMapping,
  tokens,
  chainMapping,
} from "../utils/contants";

const TransferToken = () => {
  const [provider, setProvider] = useState<any>();
  const [account, setAccount] = useState("");
  const [currentChain, setCurrentChain] = useState("");
  const [fromAmount, setFromAmount] = useState("");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [selectedToken, setSelectedToken] = useState("LINK");

  async function Connect() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      console.log(accounts);
    } else {
      alert("Please install metamask");
    }
  }

  async function getBalance(address: string) {
    const erc20 = new ethers.Contract(address, erc20abi, provider);
    const balance = await erc20.balanceOf(account);
    console.log(balance.toString());
    return balance.toString();
  }

  const handleSwap = async (address: string) => {
    const signer = await provider.getSigner();
    const tcContract = new ethers.Contract(
      transactionCombiner.address,
      transactionCombiner.abi,
      signer
    );
    const erc20 = new ethers.Contract(address, erc20abi, signer);
    //transfer your required tokens to transferor contract using ethersjs
    const tx = await erc20.approve(tcContract.address, fromAmount);
    await tx.wait();
    console.log("Approved erc20 token from account to contract:", tx.hash);

    //transfer 0.001eth to transferor contract using ethersjs to pay for gas as well as to call cross chain transfer
    const tx1 = await tcContract.executeTransactions(
      chainLinkMapping.get(selectedChain) as string,
      destinationAddress,
      tokenMapping.get(selectedToken) as string,
      fromAmount,
      transfer.address,
      { value: ethers.utils.parseEther("0.001") }
    );

    await tx1.wait();
    console.log(
      "Transferred eth to contract and called cross chain transfer with tx hash:",
      tx1.hash
    );
  };
  async function handleTokenChange(value: string) {
    setSelectedToken(value);
    setFromAmount(await getBalance(tokenMapping.get(value) as string));
  }

  useEffect(() => {
    Connect()
      .then(() => {
        window.ethereum
          .request({ method: "eth_chainId" })
          .then((chainId: string) => {
            return setCurrentChain(chainId);
          })
          .catch((err: Error) => {
            console.error("Error getting chain ID:", err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div>
      <nav className="px-20 flex items-center justify-between p-4 bg-blue-500">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-8 mr-4" />
          <span className="text-white font-semibold text-lg">
            Your App Name
          </span>
        </div>
        <button
          onClick={Connect}
          className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
        >
          {account ? account : "Connect Wallet"}
        </button>
      </nav>
      <div className="w-full max-w-md p-4 mt-20 mx-auto bg-white shadow rounded-lg">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-gray-600">From Chain:</div>
          </div>
          <div className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300">
            {account ? chainMapping.get(currentChain) : "Unknown"}
          </div>
          <div className="font-semibold text-gray-600">Destination Chain:</div>

          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
          >
            {chains.map((chain) => {
              return (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              );
            })}
          </select>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter destination address"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
          />
        </div>
        <div className="flex justify-between mb-4">
          <input
            type="number"
            placeholder="Amount to be transferred"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2 text-gray-600">Select Token:</div>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            value={selectedToken}
            onChange={(e) => handleTokenChange(e.target.value)}
          >
            {tokens.map((value) => {
              return (
                <option key={value} value={value}>
                  {value}
                </option>
              );
            })}

            {/* Add more token options */}
          </select>
        </div>

        {account ? (
          <button
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            onClick={() =>
              handleSwap(tokenMapping.get(selectedToken) as string)
            }
          >
            Transfer
          </button>
        ) : (
          <button
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            onClick={Connect}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default TransferToken;
