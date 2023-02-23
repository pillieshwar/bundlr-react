import { ethers } from "ethers";
import { WebBundlr } from "@bundlr-network/client";

// This code has been updated for ethers.js v6
// https://docs.ethers.org/v6-beta/getting-started/
function App() {
	const initialiseBundlr = async () => {
		// Connect to the MetaMask EIP-1193 object.
		// provider used for writing to the blockchain
		const provider = new ethers.BrowserProvider(window.ethereum);
		// signer used for reading from the blockchain
		const signer = await provider.getSigner();

		// link the signer to the provider
		provider.getSigner = () => signer;

		// create the WebBundlr object
		const bundlr = new WebBundlr("https://node1.bundlr.network", "matic", provider);
		await bundlr.ready();
		console.log("bundlr=", bundlr);

		return bundlr; // done!
	};

	console.log(ethers);
	return (
		<div className="App">
			<button type="button" onClick={initialiseBundlr}>
				Initialize Bundlr
			</button>
		</div>
	);
}

export default App;
