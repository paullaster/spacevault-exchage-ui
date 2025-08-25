import { ethers } from 'ethers';

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;

export async function connectWallet(): Promise<{ address: string; chainId: number }> {
    if ((window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum);
        // request accounts
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        return { address, chainId: Number(network.chainId) };
    } else {
        // no wallet installed
        throw new Error('No injected wallet found (MetaMask).');
    }
}

export async function getBalance(address: string) {
    if (!provider) provider = new ethers.BrowserProvider((window as any).ethereum ?? ethers.getDefaultProvider());
    const bal = await provider.getBalance(address);
    return ethers.formatEther(bal);
}

export async function sendNativeTransfer(to: string, amountEth: string) {
    if (!signer) throw new Error('Wallet not connected');
    const tx = await signer.sendTransaction({ to, value: ethers.parseEther(amountEth) });
    return tx.wait(); // wait for confirmation
}


/* --------------------------
   ERC-20 interactions
--------------------------- */

// Minimal ERC20 ABI
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

/** Instantiate an ERC20 contract */
function getERC20Contract(tokenAddress: string) {
    if (!signer) throw new Error('Wallet not connected');
    return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
}

/** Get ERC20 balance */
export async function getERC20Balance(tokenAddress: string, account: string) {
    const contract = getERC20Contract(tokenAddress);
    const [bal, decimals, symbol] = await Promise.all([
        contract.balanceOf(account),
        contract.decimals(),
        contract.symbol()
    ]);
    return {
        balance: ethers.formatUnits(bal, decimals),
        symbol
    };
}

/** Send ERC20 transfer */
export async function sendERC20(tokenAddress: string, to: string, amount: string) {
    const contract = getERC20Contract(tokenAddress);
    const decimals = await contract.decimals();
    const tx = await contract.transfer(to, ethers.parseUnits(amount, decimals));
    return tx.wait();
}

/** Approve spender for ERC20 */
export async function approveERC20(tokenAddress: string, spender: string, amount: string) {
    const contract = getERC20Contract(tokenAddress);
    const decimals = await contract.decimals();
    const tx = await contract.approve(spender, ethers.parseUnits(amount, decimals));
    return tx.wait();
}

/** Check allowance */
export async function getERC20Allowance(tokenAddress: string, owner: string, spender: string) {
    const contract = getERC20Contract(tokenAddress);
    const decimals = await contract.decimals();
    const allowance = await contract.allowance(owner, spender);
    return ethers.formatUnits(allowance, decimals);
}