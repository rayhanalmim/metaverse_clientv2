import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

// Import NFT contract ABIs 
import NFTABI from '../../data/NFT.json';

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

const PLATFORM_CONTRACTS: NetworkContracts = {
  BSC: {
    LANDS: '0xb5a6af64439b302ad28d480b8819ca922b8e31de', // BSC Mainnet LANDS contract address
    HOMES: '0xA0cE5B679e0FD22391963436eb92eF68d3fAbA28', // BSC Mainnet HOMES contract address
    ITEMS: '0xe27159d81679bcc60a33d2578338e096db6dc428', // BSC Mainnet ITEMS contract address
  },
  MUMBAI: {
    LANDS: '0x3ef6b21b697a5e1d6b9e9c3d570a217500b86299', // Polygon Mumbai LANDS contract address
    HOMES: '0xfc94871be1e9d39d157bf03302c409d3e42fd774', // Polygon Mumbai HOMES contract address
    ITEMS: '0x11ba62d27d35f8a458d7aaeca273f898819ea785', // Polygon Mumbai ITEMS contract address
  }
};

interface NFTMetadata {
  imageUrls?: string[];
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

export const useRakuichiNFTs = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState<string>('');
  const [chainId, setChainId] = useState<number | null>(null);
  const [nfts, setNfts] = useState<RakuichiNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // IPFS gateway fallbacks for better reliability
  const IPFS_GATEWAYS = [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
    'https://ipfs.infura.io/ipfs/'
  ];

  // Function to convert IPFS URLs with fallback gateways
  const convertIPFSUrl = (url: string): string[] => {
    if (!url.startsWith('ipfs://')) {
      return [url];
    }
    
    const hash = url.replace('ipfs://', '');
    return IPFS_GATEWAYS.map(gateway => gateway + hash);
  };

  // Function to try fetching from multiple IPFS gateways
  const fetchWithIPFSFallback = async (url: string): Promise<Response> => {
    const urls = convertIPFSUrl(url);
    
    for (let i = 0; i < urls.length; i++) {
      try {
        console.log(`Trying IPFS gateway ${i + 1}/${urls.length}: ${urls[i]}`);
        const response = await fetch(urls[i]);
        if (response.ok) {
          console.log(`Successfully fetched from gateway ${i + 1}: ${urls[i]}`);
          return response;
        }
        console.log(`Gateway ${i + 1} failed with status: ${response.status}`);
      } catch (error) {
        console.log(`Gateway ${i + 1} failed with error:`, error);
        if (i === urls.length - 1) {
          throw error;
        }
      }
    }
    
    throw new Error('All IPFS gateways failed');
  };

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        toast.error('MetaMask is not installed. Please install it to continue.');
        return;
      }

      setIsLoading(true);
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        // Get the connected account
        setAccountAddress(accounts[0]);
        setIsConnected(true);
        
        // Get the current chain ID
        const chainIdHex = await window.ethereum.request({ 
          method: 'eth_chainId' 
        });
        
        setChainId(parseInt(chainIdHex, 16));

        toast.success('Wallet connected successfully!');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      toast.error(err.message || 'Failed to connect wallet');
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccountAddress('');
    setIsConnected(false);
    setNfts([]);
    toast.info('Wallet disconnected');
  }, []);

  // Function to fetch NFTs from a contract
  const fetchNFTsFromContract = useCallback(async (
    contractAddress: string, 
    contractType: 'LANDS' | 'HOMES' | 'ITEMS'
  ) => {
    if (!accountAddress || !window.ethereum) return [];
    
    console.log(`Attempting to fetch NFTs from contract: ${contractAddress} of type ${contractType}`);
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Check if provider is ready and network is accessible
      try {
        const network = await provider.getNetwork();
        console.log(`Connected to network: ${network.name} (${network.chainId})`);
      } catch (networkError) {
        console.error('Network error:', networkError);
        toast.error('Cannot connect to the selected network. Please check your network configuration.');
        return [];
      }
      
      // Create contract instance with error handling
      let contract;
      try {
        contract = new ethers.Contract(
          contractAddress,
          NFTABI,
          provider
        );
        
        // Test if contract is accessible with a simple call
        const symbol = await contract.symbol();
        console.log(`Contract ${contractAddress} symbol: ${symbol}`);
      } catch (contractError) {
        console.error(`Contract error for ${contractAddress}:`, contractError);
        // Don't show error toast for every contract - would be too noisy
        return [];
      }
      
      // Get balance of user's NFTs for this contract
      let balance;
      try {
        balance = await contract.balanceOf(accountAddress);
        console.log(`NFT balance for ${contractType}: ${balance.toString()}`);
      } catch (balanceError) {
        console.error(`Error getting NFT balance for ${contractAddress}:`, balanceError);
        // This error is important enough to notify the user
        toast.error(`Cannot read NFT balance. The contract at ${contractAddress.substring(0, 6)}... might be invalid.`);
        return [];
      }
      
      // If no NFTs, return empty array
      if (balance.eq(0)) {
        console.log(`No ${contractType} NFTs owned by this wallet`);
        return [];
      }
      
      const nftsFromContract: RakuichiNFT[] = [];
      
      // Loop through each NFT and get its metadata
      for (let i = 0; i < balance.toNumber(); i++) {
        try {
          console.log(`Processing NFT ${i+1} of ${balance.toString()} from ${contractType}`);
          
          // Get token ID with error handling
          const tokenId = await contract.tokenOfOwnerByIndex(accountAddress, i)
            .catch((err: any) => {
              console.error(`Error getting token ID at index ${i}:`, err);
              return null;
            });
          
          if (tokenId === null) continue;
          console.log(`Found token ID: ${tokenId.toString()}`);
          
          // Get token URI with error handling
          let tokenURI = await contract.tokenURI(tokenId)
            .catch((err: any) => {
              console.error(`Error getting token URI for ID ${tokenId}:`, err);
              return null;
            });
          
          if (tokenURI === null) continue;
          console.log(`Token URI for ${tokenId}: ${tokenURI}`);
          
          // Some contracts return IPFS URLs, so we need to handle that
          if (tokenURI.startsWith('ipfs://')) {
            tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
            console.log(`Converted IPFS URL: ${tokenURI}`);
          }
          
          // Fetch metadata with error handling
          let metadata;
          try {
            console.log(`Fetching metadata from ${tokenURI}`);
            const response = await fetchWithIPFSFallback(tokenURI);
            metadata = await response.json();
            
            // Convert IPFS URLs in image field if present and get the best working URL
            if (metadata.image && metadata.image.startsWith('ipfs://')) {
              const imageUrls = convertIPFSUrl(metadata.image);
              metadata.image = imageUrls[0]; // Use the first gateway as default
              console.log(`Converted metadata image IPFS URL: ${metadata.image}`);
              
              // Store all possible URLs for fallback in components
              metadata.imageUrls = imageUrls;
            }
            
            console.log(`Metadata fetched successfully for ${tokenId}:`, metadata);
          } catch (metadataError) {
            console.error(`Error fetching metadata for token ${tokenId}:`, metadataError);
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
            chainId: chainId || 0
          });
          console.log(`Added ${contractType} NFT to list: ${metadata.name}`);
        } catch (err) {
          console.error(`Error processing NFT ${i} from contract ${contractAddress}:`, err);
          // Continue to next NFT
        }
      }
      
      console.log(`Successfully fetched ${nftsFromContract.length} NFTs from ${contractType} contract`);
      return nftsFromContract;
    } catch (err) {
      console.error(`Error fetching NFTs from contract ${contractAddress}:`, err);
      return [];
    }
  }, [accountAddress, chainId]);

  // Add a fallback method to fetch NFTs using direct API calls

  // First, add a method to fetch NFTs directly from an API endpoint
  const fetchNFTsFromAPI = useCallback(async () => {
    if (!accountAddress || !chainId) return [];

    console.log(`Attempting to fetch NFTs via API for address: ${accountAddress}`);
    
    try {
      // Chain IDs in hex format
      const chainIdHex = chainId.toString(16);
      
      // First try to fetch from the backend API
      try {
        console.log('Attempting to fetch from backend API...');
        const response = await fetch(`/api/nft/my-nft-list?chain_id=${chainId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`API returned ${data.length} NFTs:`, data);
          
          // Convert backend format to our format
          const nfts: RakuichiNFT[] = data.map((nft: any) => {
            // Determine contract type based on token address
            let contractType: 'LANDS' | 'HOMES' | 'ITEMS' = 'ITEMS';
            const networkKey = (chainId === 56 || chainId === 97 ? 'BSC' : 
                             chainId === 80001 ? 'MUMBAI' : 
                             chainId === 11155111 ? 'SEPOLIA' : null) as keyof typeof PLATFORM_CONTRACTS;
            
            if (networkKey && PLATFORM_CONTRACTS[networkKey]) {
              const contracts = PLATFORM_CONTRACTS[networkKey];
              if (nft.token_address.toLowerCase() === contracts.LANDS.toLowerCase()) {
                contractType = 'LANDS';
              } else if (nft.token_address.toLowerCase() === contracts.HOMES.toLowerCase()) {
                contractType = 'HOMES';
              }
            }
            
            return {
              id: `${nft.token_address}-${nft.token_id}`,
              tokenAddress: nft.token_address,
              tokenId: nft.token_id,
              metadata: typeof nft.metadata === 'string' ? JSON.parse(nft.metadata) : nft.metadata,
              contractType,
              chainId
            };
          });
          
          return nfts;
        }
      } catch (backendError) {
        console.error('Error fetching from backend API:', backendError);
      }
      
      // If that fails, try the manual scan as fallback
      return [];
    } catch (error) {
      console.error('Error in API fallback method:', error);
      return [];
    }
  }, [accountAddress, chainId]);

  // Update the fetchAllNFTs function to use the API method as fallback
  const fetchAllNFTs = useCallback(async () => {
    if (!accountAddress || !chainId) {
      console.log('Cannot fetch NFTs: No wallet connected or chain ID unavailable');
      setNfts([]);
      return;
    }
    
    console.log(`Fetching NFTs for wallet ${accountAddress} on chain ID ${chainId}`);
    setIsLoading(true);
    setError(null);
    
    try {
      // First try the contract-based approach
      const contractBasedNFTs = await fetchContractBasedNFTs();
      
      // If we got NFTs, use them
      if (contractBasedNFTs.length > 0) {
        console.log(`Found ${contractBasedNFTs.length} NFTs via contract calls`);
        setNfts(contractBasedNFTs);
        toast.success(`Found ${contractBasedNFTs.length} Rakuichi Rakuza NFTs in your wallet`);
      } else {
        // Otherwise try the API-based approach
        console.log('No NFTs found via contract calls, trying API fallback...');
        const apiBasedNFTs = await fetchNFTsFromAPI();
        
        if (apiBasedNFTs.length > 0) {
          console.log(`Found ${apiBasedNFTs.length} NFTs via API calls`);
          setNfts(apiBasedNFTs);
          toast.success(`Found ${apiBasedNFTs.length} Rakuichi Rakuza NFTs in your wallet`);
        } else {
          console.log('No NFTs found via either method');
          setNfts([]);
          toast.info('No Rakuichi Rakuza NFTs found in your wallet');
        }
      }
    } catch (err: any) {
      console.error('Error fetching NFTs:', err);
      setError(err.message || 'Failed to fetch NFTs');
      toast.error('Failed to fetch NFTs: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [accountAddress, chainId, fetchNFTsFromAPI]);

  // Create a separate function for the contract-based NFT fetching approach
  const fetchContractBasedNFTs = useCallback(async () => {
    try {
      // Determine which network we're on
      const network = chainId === 56 ? 'BSC' :
                     chainId === 97 ? 'BSC' : 
                     chainId === 80001 ? 'MUMBAI' : null;
      
      console.log(`Detected network: ${network}`);
      
      if (!network) {
        toast.error('Unsupported network. Please switch to BSC mainnet, BSC testnet, or Mumbai testnet.');
        return [];
      }
      
      // Get contract addresses for the current network with type checking
      const networkKey = network as keyof typeof PLATFORM_CONTRACTS;
      // Check if the network exists in our config
      if (!PLATFORM_CONTRACTS[networkKey]) {
        toast.error(`No Rakuichi Rakuza contracts configured for ${network} network`);
        return [];
      }
      
      const contracts = PLATFORM_CONTRACTS[networkKey];
      console.log(`Using contracts for ${network}:`, contracts);
      
      // Create promise array for parallel fetching
      const fetchPromises = [];
      
      // Add promise for LANDS NFTs if the contract address is available
      if (contracts.LANDS) {
        console.log(`Adding LANDS contract to fetch queue: ${contracts.LANDS}`);
        fetchPromises.push(fetchNFTsFromContract(contracts.LANDS, 'LANDS'));
      }
      
      // Add promise for HOMES NFTs if the contract address is available
      if (contracts.HOMES) {
        console.log(`Adding HOMES contract to fetch queue: ${contracts.HOMES}`);
        fetchPromises.push(fetchNFTsFromContract(contracts.HOMES, 'HOMES'));
      }
      
      // Add promise for ITEMS NFTs if the contract address is available
      if (contracts.ITEMS) {
        console.log(`Adding ITEMS contract to fetch queue: ${contracts.ITEMS}`);
        fetchPromises.push(fetchNFTsFromContract(contracts.ITEMS, 'ITEMS'));
      }
      
      console.log(`Starting to fetch NFTs from ${fetchPromises.length} contracts`);
      
      // Wait for all promises to settle (not just resolve)
      const results = await Promise.allSettled(fetchPromises);
      
      // Process results, including any that failed
      const allNFTs: RakuichiNFT[] = [];
      let errorCount = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`Contract fetch #${index+1} succeeded with ${result.value.length} NFTs`);
          allNFTs.push(...result.value);
        } else {
          console.error(`Contract fetch #${index+1} failed:`, result.reason);
          errorCount++;
        }
      });
      
      console.log(`Fetch complete: Found ${allNFTs.length} NFTs with ${errorCount} errors`);
      
      if (errorCount > 0) {
        toast.warning(`Some NFT data couldn't be loaded (${errorCount} errors)`);
      }
      
      return allNFTs;
    } catch (error) {
      console.error('Error in contract-based NFT fetching:', error);
      return [];
    }
  }, [accountAddress, chainId, fetchNFTsFromContract]);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId: string) => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(parseInt(targetChainId)) }],
      });
    } catch (err: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        try {
          // BSC Mainnet
          if (targetChainId === '56') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x38', // 56 in hex
                  chainName: 'Binance Smart Chain',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18
                  },
                  rpcUrls: ['https://bsc-dataseed.binance.org/'],
                  blockExplorerUrls: ['https://bscscan.com']
                }
              ]
            });
          }
          // BSC Testnet
          else if (targetChainId === '97') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x61', // 97 in hex
                  chainName: 'Binance Smart Chain Testnet',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18
                  },
                  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                  blockExplorerUrls: ['https://testnet.bscscan.com']
                }
              ]
            });
          }
          // Mumbai Testnet
          else if (targetChainId === '80001') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13881', // 80001 in hex
                  chainName: 'Mumbai Testnet',
                  nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                  },
                  // Use reliable RPC URLs for Mumbai testnet
                  rpcUrls: [
                    'https://rpc-mumbai.maticvigil.com/',
                    'https://polygon-mumbai.g.alchemy.com/v2/demo',
                    'https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbacb8c0' // Public Infura key
                  ],
                  blockExplorerUrls: ['https://mumbai.polygonscan.com']
                }
              ]
            });
          }
        } catch (addError) {
          console.error('Error adding chain to MetaMask:', addError);
        }
      } else {
        console.error('Error switching chain:', err);
      }
    }
  }, []);

  // Setup event listeners for account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setAccountAddress('');
          setIsConnected(false);
          setNfts([]);
        } else if (accounts[0] !== accountAddress) {
          // User switched accounts
          setAccountAddress(accounts[0]);
          setIsConnected(true);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch((err: Error) => {
          console.error('Error checking accounts:', err);
        });

      // Get current chain ID
      window.ethereum
        .request({ method: 'eth_chainId' })
        .then((chainIdHex: string) => {
          setChainId(parseInt(chainIdHex, 16));
        })
        .catch((err: Error) => {
          console.error('Error getting chain ID:', err);
        });

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [accountAddress]);

  // Fetch NFTs when account or chain changes
  useEffect(() => {
    if (accountAddress && chainId) {
      fetchAllNFTs();
    }
  }, [accountAddress, chainId, fetchAllNFTs]);

  return {
    isConnected,
    accountAddress,
    chainId,
    nfts,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    fetchAllNFTs,
    switchNetwork
  };
};

export default useRakuichiNFTs;