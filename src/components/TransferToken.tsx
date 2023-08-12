import { useEffect, useState } from "react";
import logo from "../logo.svg";
import { ethers } from "ethers";
import erc20abi from "../utils/contractAbi/ERC20.json";
import transfer from "../utils/contractAbi/Transferor.json";
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
  const [toAmount, setToAmount] = useState("");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [selectedToken, setSelectedToken] = useState("LINK");

  async function Connect() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    console.log(accounts);
  }

  async function getBalance(address: string) {
    const erc20 = new ethers.Contract(address, erc20abi, provider);
    const balance = await erc20.balanceOf(account);
    console.log(balance.toString());
    return balance.toString();
  }

  const handleSwap = async (address: string) => {
    const signer = await provider.getSigner();
    const erc20 = new ethers.Contract(address, erc20abi, signer);
    const transferor = new ethers.Contract(
      transfer.address,
      transfer.abi,
      signer
    );
    //transfer your required tokens to transferor contract using ethersjs
    const tx = await erc20.transfer(transferor.address, fromAmount);
    await tx.wait();
    console.log("Transferred from account to contract:", tx.hash);

    //transfer 0.001eth to transferor contract using ethersjs to pay for gas

    const tx1 = await signer.sendTransaction({
      to: transferor.address,
      value: ethers.utils.parseEther("0.001"),
    });
    await tx1.wait();
    console.log("Transferred eth to contract with tx hash:", tx1.hash);
    console.log("selectedChain", selectedChain);
    //call transferTokensPayNative function of transferor contract
    const tx2 = await transferor.transferTokensPayNative(
      chainLinkMapping.get(selectedChain) as string,
      destinationAddress,
      tokenMapping.get(selectedToken) as string,
      fromAmount
    );
    await tx2.wait();
    console.log("Transferred from source chain with tx hash:", tx2.hash);
  };

  useEffect(() => {
    Connect()
      .then(() => {
        window.ethereum.on("chainChanged", (_chainId: string) => {
          window.location.reload();
        });
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

  useEffect(() => {
    async function run() {
      if (window.ethereum) {
        if (selectedToken) {
          setFromAmount(
            await getBalance(tokenMapping.get(selectedToken) as string)
          );
        }
      }
    }
    run();
  }, [selectedToken]);

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
            placeholder="0.00"
            className="flex-1 px-1 py-2 mr-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
          />
          <div className="self-center">⇄</div>
          <input
            type="number"
            placeholder="0.00"
            className="flex-1 px-1 py-2 ml-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            value={toAmount}
            onChange={(e) => setToAmount(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2 text-gray-600">Select Token:</div>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
          >
            {tokens.map((value) => {
              return <option value={value}>{value}</option>;
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
