import { ethers } from "./ethers-5.1.esm.min.js";
import { contractAddress, contractABI } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = Connect;
fundButton.onclick = Fund;
balanceButton.onclick = GetBalance;
withdrawButton.onclick = Withdraw;

async function Connect() {
  if (typeof window.ethereum != "undefined") {
    console.log("Metamask wallet found, connecting.....");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("Wallet Connected");
    connectButton.innerHTML = "Connected";
  } else {
    console.log("Install metamask wallet");
  }
}

async function Fund() {
  if (typeof window.ethereum != "undefined") {
    const ethAmount = document.getElementById("ethAmount").value;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
      let transactionResponse = await contract.FundMe({
        value: ethers.utils.parseEther(ethAmount),
      });

      await CheckForBlockConfirmation(transactionResponse, provider);
      console.log(`Funded with ${ethAmount}ETH`);
    } catch (e) {
      console.log(e);
    }
  } else {
    console.log("Install metamask wallet");
  }
}

function CheckForBlockConfirmation(_transactionResponse, _provider) {
  return new Promise((resolve, reject) => {
    _provider.once(_transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Cofirmed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function GetBalance() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const balance = await provider.getBalance(contractAddress);
  console.log(ethers.utils.formatEther(balance));
}

async function Withdraw() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  let transactionResponse = await contract.withdraw();
  CheckForBlockConfirmation(transactionResponse, provider);

  console.log("Funds withdrawn successfully");
}
