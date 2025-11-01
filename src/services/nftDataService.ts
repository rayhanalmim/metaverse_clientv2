import { ethers } from 'ethers';
import NFTABI from '../data/NFT.json';
import walletService, { WALLET_EVENTS } from './walletService';

// Contract addresses for Rakuichi Rakuza platform NFTs
interface PlatformContracts {
  LANDS: string;
  HOMES: string;
  ITEMS: string;
}

interface NetworkContracts {
  BSC: PlatformContracts;
  MUMBAI: PlatformContracts;
}

// NFT metadata interface
interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface RakuichiNFT {
  id: string;
  tokenAddress: string;
  tokenId: string;
  metadata: NFTMetadata;
  contractType: 'LANDS' | 'HOMES' | 'ITEMS';
  chainId: number;
}

// Update the PLATFORM_CONTRACTS with correct addresses
const PLATFORM_CONTRACTS: NetworkContracts = {
  BSC: {
    LANDS: '0xb5a6af64439b302ad28d480b8819ca922b8e31de',
    HOMES: '0xe81bd02c9407cf4b624f339db78ca221992341c9',
    ITEMS: '0xe27159d81679bcc60a33d2578338e096db6dc428',
  },
  MUMBAI: {
    LANDS: '0x3ef6b21b697a5e1d6b9e9c3d570a217500b86299',
    HOMES: '0xfc94871be1e9d39d157bf03302c409d3e42fd774',
    ITEMS: '0x11ba62d27d35f8a458d7aaeca273f898819ea785',
  }
};

// Global state to cache NFT data
let cachedNFTs: RakuichiNFT[] = [];
let lastFetchAddress: string | null = null;
let lastFetchChainId: number | null = null;
let isLoadingNFTs = false;

class NFTDataService {
  // Singleton instance
  private static instance: NFTDataService;

  // Event listeners
  private walletConnectedListener: EventListener;
  private chainChangedListener: EventListener;
  private accountChangedListener: EventListener;

  // Constructor
  private constructor() {
    // Set up wallet event listeners
    this.walletConnectedListener = () => {
      this.clearCache();
    };

    this.chainChangedListener = () => {
      this.clearCache();
    };

    this.accountChangedListener = () => {
      this.clearCache();
    };

    // Add event listeners
    walletService.addEventListener(WALLET_EVENTS.CONNECTED, this.walletConnectedListener);
    walletService.addEventListener(WALLET_EVENTS.CHAIN_CHANGED, this.chainChangedListener);
    walletService.addEventListener(WALLET_EVENTS.ACCOUNT_CHANGED, this.accountChangedListener);
  }

  // Get singleton instance
  public static getInstance(): NFTDataService {
    if (!NFTDataService.instance) {
      NFTDataService.instance = new NFTDataService();
    }
    return NFTDataService.instance;
  }

  // Clear the NFT cache
  private clearCache(): void {
    cachedNFTs = [];
    lastFetchAddress = null;
    lastFetchChainId = null;
  }

  // Check if wallet is connected - performs a more thorough check
  public isWalletConnected(): boolean {
    // First check our service status
    if (walletService.isConnected && walletService.accountAddress) {
      return true;
    }
    
    // Then check if ethereum is available and has accounts
    if (window.ethereum) {
      try {
        // Don't await this, just check if accounts exist in ethereum object
        const accounts = window.ethereum.selectedAddress || 
                         window.ethereum._state?.accounts?.[0];
        if (accounts) {
          console.log('NFT service: Detected MetaMask connection:', accounts);
          return true;
        }
      } catch (e) {
        console.error('Error checking ethereum connection:', e);
      }
    }
    
    return false;
  }

  // Get connected account address with fallback to ethereum object
  public getConnectedAddress(): string | null {
    if (walletService.accountAddress) {
      return walletService.accountAddress;
    }
    
    // Try to get it directly from ethereum if available
    if (window.ethereum) {
      return window.ethereum.selectedAddress || 
             window.ethereum._state?.accounts?.[0] || 
             null;
    }
    
    return null;
  }

  // Get current chain ID with fallback
  public getCurrentChainId(): number | null {
    if (walletService.chainId) {
      return walletService.chainId;
    }
    
    // Try to get it directly from ethereum if available
    if (window.ethereum && window.ethereum.chainId) {
      return parseInt(window.ethereum.chainId, 16);
    }
    
    return null;
  }

  // Connect wallet - triggers the wallet to connect if needed
  public async connectWallet(): Promise<string | null> {
    // First check if we already have an address
    const currentAddress = this.getConnectedAddress();
    if (currentAddress) {
      console.log('NFT service: Using existing wallet connection:', currentAddress);
      return currentAddress;
    }
    
    // If wallet is not connected but ethereum is available, try to connect
    if (window.ethereum) {
      try {
        console.log('NFT service: Requesting MetaMask accounts...');
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts && accounts.length > 0) {
          console.log('NFT service: Connected to:', accounts[0]);
          return accounts[0];
        }
      } catch (e) {
        console.error('Error connecting to wallet:', e);
      }
    }
    
    console.log('NFT service: No wallet connected, returning null');
    return null;
  }

  // Add this method before the fetchNFTsFromContract method
  private async resolveIPFSUrl(tokenURI: string): Promise<string> {
    const ipfsGateways = [
      'https://ipfs.io/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://dweb.link/ipfs/',
      'https://gateway.pinata.cloud/ipfs/'
    ];

    // If not an IPFS URL, return as-is
    if (!tokenURI.startsWith('ipfs://')) {
      return tokenURI;
    }

    // Remove 'ipfs://' prefix
    const ipfsHash = tokenURI.replace('ipfs://', '');

    // Try each gateway
    for (const gateway of ipfsGateways) {
      const resolvedUrl = `${gateway}${ipfsHash}`;
      try {
        const response = await fetch(resolvedUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5-second timeout
        });
        
        if (response.ok) {
          console.log(`Successfully resolved IPFS URL via ${gateway}`);
          return resolvedUrl;
        }
      } catch (error) {
        console.warn(`Gateway ${gateway} failed for ${ipfsHash}:`, error);
      }
    }

    // Fallback to original IPFS.io gateway if all fail
    return tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }

  // Modify the fetchNFTsFromContract method to use resolveIPFSUrl
  private async fetchNFTsFromContract(
    contractAddress: string, 
    contractType: 'LANDS' | 'HOMES' | 'ITEMS',
    accountAddress: string,
    chainId: number
  ): Promise<RakuichiNFT[]> {
    if (!accountAddress || !window.ethereum) return [];
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, NFTABI, provider);
      
      // Get balance of user's NFTs
      const balance = await contract.balanceOf(accountAddress);
      
      if (balance.eq(0)) return [];
      
      const nftsFromContract: RakuichiNFT[] = [];
      
      // Loop through each NFT and get its metadata
      for (let i = 0; i < balance.toNumber(); i++) {
        try {
          // Get token ID
          const tokenId = await contract.tokenOfOwnerByIndex(accountAddress, i);
          
          // Get token URI
          let tokenURI = await contract.tokenURI(tokenId);
          
          // Resolve IPFS URL using multiple gateways
          tokenURI = await this.resolveIPFSUrl(tokenURI);
          
          // Fetch metadata
          let metadata;
          try {
            const response = await fetch(tokenURI, {
              signal: AbortSignal.timeout(10000) // 10-second timeout
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            metadata = await response.json();
          } catch (metadataError) {
            console.error('Error fetching metadata:', metadataError);
            metadata = { 
              name: `NFT #${tokenId.toString()}`, 
              description: 'Metadata unavailable', 
              image: '' 
            };
          }
          
          nftsFromContract.push({
            id: `${contractAddress}-${tokenId.toString()}`,
            tokenAddress: contractAddress,
            tokenId: tokenId.toString(),
            metadata,
            contractType,
            chainId
          });
        } catch (err) {
          console.error('Error processing NFT:', err);
        }
      }
      
      return nftsFromContract;
    } catch (err) {
      console.error('Error fetching NFTs from contract:', err);
      return [];
    }
  }

  // Status check for loading state
  public isLoading(): boolean {
    return isLoadingNFTs;
  }

  // Fetch all NFTs for the connected account
  public async fetchAllNFTs(): Promise<RakuichiNFT[]> {
    const address = this.getConnectedAddress();
    const chainId = this.getCurrentChainId();
    
    // Return cached results if available for same address and chain
    if (cachedNFTs.length > 0 && address === lastFetchAddress && chainId === lastFetchChainId) {
      return cachedNFTs;
    }
    
    // If wallet is not connected, just return empty array without triggering connection
    if (!address || !chainId) {
      console.log('NFT service: Wallet not connected or chainId not available');
      return [];
    }
    
    isLoadingNFTs = true;
    
    try {
      // Determine which network we're on
      const network = chainId === 97 ? 'BSC' : 
                     chainId === 80001 ? 'MUMBAI' : null;
      
      if (!network) {
        isLoadingNFTs = false;
        return [];
      }
      
      // Get contract addresses for the current network
      const networkKey = network as keyof typeof PLATFORM_CONTRACTS;
      if (!PLATFORM_CONTRACTS[networkKey]) {
        isLoadingNFTs = false;
        return [];
      }
      
      const contracts = PLATFORM_CONTRACTS[networkKey];
      
      // Create promises for parallel fetching
      const fetchPromises = [
        this.fetchNFTsFromContract(contracts.LANDS, 'LANDS', address, chainId),
        this.fetchNFTsFromContract(contracts.HOMES, 'HOMES', address, chainId),
        this.fetchNFTsFromContract(contracts.ITEMS, 'ITEMS', address, chainId)
      ];
      
      // Wait for all promises
      const results = await Promise.allSettled(fetchPromises);
      
      // Process results
      const allNFTs: RakuichiNFT[] = [];
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          allNFTs.push(...result.value);
        }
      });
      
      // Update cache
      cachedNFTs = allNFTs;
      lastFetchAddress = address;
      lastFetchChainId = chainId;
      
      isLoadingNFTs = false;
      return allNFTs;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      isLoadingNFTs = false;
      return [];
    }
  }
}

export default NFTDataService.getInstance(); 