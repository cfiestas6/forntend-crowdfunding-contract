import { ethers } from "./ethers-5.2.esm.min.js";
import {abi, contractAddress} from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

// Connect
async function connect(){
    if(hasMetamask()){
        try {
            await window.ethereum.request({method: "eth_requestAccounts"});
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected";
    } else {
        connectButton.innerHTML = "Metamask not found";
    }
}
// Fund
async function fund(){
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}...`);
    if(hasMetamask()){
        // Provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Signer
        const signer = provider.getSigner();
        // Contract
        const contract = new ethers.Contract(contractAddress, abi, signer);

        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });

            // Listen for the transaction to finish
            await listenForTransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
        console.log(`Contract funded with ${ethAmount}ETH!`);
    }
}


// Console.log Balance
async function getBalance() {
    if (hasMetamask()) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

// Withdraw
async function withdraw(){
    if (hasMetamask()){
        console.log(`Withdrawing...`);
        // Provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Signer
        const signer = provider.getSigner();
        // Contract
        const contract = new ethers.Contract(contractAddress, abi, signer);

        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error);
        }
    }
}

function listenForTransactionMine(transactionResponse, provider){
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations.`);
        })
        resolve();
    });
}

function hasMetamask(){
    return typeof window.ethereum !== "undefined";
}
    