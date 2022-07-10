import { useEffect, useState } from "react";
import { ethers } from 'ethers';


const contractAddress = "0x000000000000000000";
const network = 'rinkeby' // use rinkeby testnet
const provider = ethers.getDefaultProvider(network)
const abi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "string", "name": "name", "type": "string" }], "name": "NameChanged", "type": "event" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }], "name": "setName", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
const { ethereum } = window;


function App() {

  const [balance, setBalance] = useState("Loading...")
  const [currentAccount, setCurrentAccount] = useState(null);
  const [transferBalance, setTransferBalance] = useState()
  const [transferAddress, setTransferAddress] = useState()
  const [name, setName] = useState("")
  const [nameInfo, setNameInfo] = useState("")

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  const getName = async () => {
    let provider = ethers.getDefaultProvider(network)
    const erc20 = new ethers.Contract(contractAddress, abi, provider)
    const nameInf = await erc20.name()
    setNameInfo(nameInf)
    console.log("Contract Name: ", nameInf)
  }

  const submitName = async () => {
    let provider = ethers.getDefaultProvider(network)
    const privateKey = "########################################";
    let wallet = new ethers.Wallet(privateKey, provider)
    const learnToken = new ethers.Contract(contractAddress, abi, wallet)
    console.log("name ", name)

    learnToken.on("NameChanged", (newName) => {
      console.log("New Name: ", newName);
    });

    const createReceipt = await learnToken.setName(name);
    await createReceipt.wait();

    console.log(`Tx hash: ${createReceipt.hash}`);

  }

  function transferETH() {

    let provider = ethers.getDefaultProvider(network)
    let privateKey = '## private key'
    let wallet = new ethers.Wallet(privateKey, provider)
    let receiverAddress = transferAddress
    let amountInEther = transferBalance
    let tx = {
      to: receiverAddress,
      value: ethers.utils.parseEther(amountInEther)
    }
    // Send a transaction
    wallet.sendTransaction(tx)
      .then((txObj) => {
        console.log('txHash', txObj.hash)
      })

  }

  const checkWalletIsConnected = async () => {
    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);

      provider.getBalance(account).then((balance) => {
        // convert a currency unit from wei to ether
        const balanceInEth = ethers.utils.formatEther(balance)
        setBalance(`${balanceInEth} ETH`)
      })

    } else {
      console.log("No authorized account found");
    }
  }


  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="App">
      <header className="App-header">

        {currentAccount ?
          <div>
            <h2>Ethereum</h2>
            <br />
            Connected Account: {currentAccount}
            <br /><br />
            Balance: {balance}
            <br /><br />
            ETH Transfer Address: <input type="text" value={transferAddress} onChange={e => setTransferAddress(e.target.value)} />
            <br />
            ETH Transfer Balance: <input type="number" value={transferBalance} onChange={e => setTransferBalance(e.target.value)} />
            <br />
            <input type="button" value="Transfer" onClick={transferETH} />
            <br /><br />
            <h2>Smart Contract</h2>
            <br /><br />
            <input type="button" value="Get Name" onClick={getName} />   Contract Name is:  {nameInfo}
            <br /><br /><br />
            <input type="text" value={name} name="name" onChange={e => setName(e.target.value)} />
            <br /><br />
            <input type="button" value="Submit Name" onClick={submitName} />
          </div>
          : connectWalletButton()
        }
      </header>
    </div>
  );
}

export default App;
