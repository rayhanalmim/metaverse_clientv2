import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useMetaMask } from '../useMetamaskProvider';
import { toast } from 'react-toastify';
import { BNB_CHAIN_ID, MUMBAI_CHAIN_ID } from 'src/config';
import { IStoreItemData } from '../../interfaces/property';

interface NFTDisplayProps {
  buildingId?: string | number; // The ID of the building where NFTs will be displayed
}

interface NFTData {
  id: string;
  tokenAddress: string;
  tokenId: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  chainId: number;
}

export const useNFTDisplay = ({ buildingId }: NFTDisplayProps = {}) => {
  console.log('[useNFTDisplay] Initializing hook with buildingId:', buildingId);
  
  const [userNFTs, setUserNFTs] = useState<NFTData[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisplaying, setIsDisplaying] = useState(false);
  
  // Use the existing MetaMask integration
  const {
    connectWallet,
    accountAddress,
    chainID,
    switchNetwork,
    handleDisconnect
  } = useMetaMask();

  // Fetch user's NFTs when wallet is connected
  useEffect(() => {
    console.log('[useNFTDisplay] Wallet state changed:', { 
      connected: !!accountAddress, 
      address: accountAddress,
      chainId: chainID 
    });
    
    if (accountAddress) {
      fetchUserNFTs();
    } else {
      console.log('[useNFTDisplay] No wallet connected, clearing NFT state');
      setUserNFTs([]);
      setSelectedNFT(null);
    }
  }, [accountAddress, chainID]);

  // Fetch user NFTs from backend
  const fetchUserNFTs = async () => {
    console.log('[useNFTDisplay] Fetching NFTs for address:', accountAddress);
    
    try {
      // Using the chain ID to determine which network to query
      const chainParam = chainID === parseInt(MUMBAI_CHAIN_ID, 16) 
        ? MUMBAI_CHAIN_ID 
        : BNB_CHAIN_ID;
      
      console.log(`[useNFTDisplay] Using chain parameter: ${chainParam}`);
      
      // Call the backend API to get NFTs for the connected wallet
      const response = await fetch(`/api/nft/my-nft-list?chain_id=${chainParam}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        console.error(`[useNFTDisplay] API error: ${response.status} ${response.statusText}`);
        throw new Error('Failed to fetch NFTs');
      }
      
      const data = await response.json();
      console.log(`[useNFTDisplay] Fetched ${data.length} NFTs:`, data);
      setUserNFTs(data);
    } catch (error) {
      console.error('[useNFTDisplay] Error fetching NFTs:', error);
      toast.error('Failed to fetch your NFTs. Please try again.');
    }
  };

  // Verify ownership of the selected NFT
  const verifyOwnership = async (nft: NFTData): Promise<boolean> => {
    console.log('[useNFTDisplay] Verifying ownership of NFT:', nft);
    
    if (!accountAddress) {
      console.error('[useNFTDisplay] Cannot verify ownership: No wallet connected');
      toast.error('Please connect your wallet first');
      return false;
    }

    setIsVerifying(true);
    try {
      console.log('[useNFTDisplay] Sending verification request to API');
      // Call backend API to verify ownership
      const response = await fetch('/api/nft/verify-ownership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          // Using quotes to keep API compatibility while avoiding linter errors
          'token_address': nft.tokenAddress,
          'token_id': nft.tokenId,
          'chain_id': chainID.toString(),
          'owner_address': accountAddress
        })
      });

      if (!response.ok) {
        console.error(`[useNFTDisplay] API error during verification: ${response.status} ${response.statusText}`);
        throw new Error('Ownership verification failed');
      }

      const { verified } = await response.json();
      console.log(`[useNFTDisplay] Ownership verification result: ${verified}`);
      return verified;
    } catch (error) {
      console.error('[useNFTDisplay] Error verifying ownership:', error);
      toast.error('Failed to verify NFT ownership');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  // Select an NFT to display
  const selectNFT = async (nft: NFTData) => {
    console.log('[useNFTDisplay] Selecting NFT:', nft);
    try {
      const isOwned = await verifyOwnership(nft);
      if (isOwned) {
        console.log('[useNFTDisplay] NFT ownership verified, setting as selected');
        setSelectedNFT(nft);
        setIsDisplaying(true);
        toast.success('NFT selected for display');
        return true;
      } else {
        console.error('[useNFTDisplay] NFT ownership verification failed');
        toast.error('You do not own this NFT');
        return false;
      }
    } catch (error) {
      console.error('[useNFTDisplay] Error selecting NFT:', error);
      toast.error('Failed to select NFT');
      return false;
    }
  };

  // Display NFT in the building
  const displayNFT = async (buildingId: string | number, nft: NFTData) => {
    console.log(`[useNFTDisplay] Displaying NFT in building ${buildingId}:`, nft);
    
    if (!nft || !buildingId) {
      console.error('[useNFTDisplay] Missing NFT or building ID');
      toast.error('Please select an NFT and a building');
      return false;
    }

    try {
      console.log('[useNFTDisplay] Sending display request to API');
      // Call backend API to save NFT display settings
      const response = await fetch('/api/nft/display', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          // Using quotes to keep API compatibility while avoiding linter errors
          'building_id': buildingId.toString(),
          'token_address': nft.tokenAddress,
          'token_id': nft.tokenId,
          'chain_id': chainID.toString()
        })
      });

      if (!response.ok) {
        console.error(`[useNFTDisplay] API error during display: ${response.status} ${response.statusText}`);
        throw new Error('Failed to display NFT');
      }

      console.log('[useNFTDisplay] NFT successfully displayed in building');
      toast.success('NFT is now displayed in your building');
      return true;
    } catch (error) {
      console.error('[useNFTDisplay] Error displaying NFT:', error);
      toast.error('Failed to display NFT in building');
      return false;
    }
  };

  // Remove NFT from display
  const removeNFTDisplay = async (buildingId: string | number) => {
    console.log(`[useNFTDisplay] Removing NFT display from building ${buildingId}`);
    try {
      const response = await fetch(`/api/nft/display/${buildingId.toString()}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        console.error(`[useNFTDisplay] API error during removal: ${response.status} ${response.statusText}`);
        throw new Error('Failed to remove NFT display');
      }

      console.log('[useNFTDisplay] NFT display successfully removed');
      setSelectedNFT(null);
      setIsDisplaying(false);
      toast.success('NFT removed from display');
      return true;
    } catch (error) {
      console.error('[useNFTDisplay] Error removing NFT display:', error);
      toast.error('Failed to remove NFT from building');
      return false;
    }
  };

  // Wrap the connect wallet function to add logging
  const wrappedConnectWallet = async () => {
    console.log('[useNFTDisplay] Connecting wallet...');
    try {
      await connectWallet();
      console.log('[useNFTDisplay] Wallet connection initiated');
      return true;
    } catch (error) {
      console.error('[useNFTDisplay] Error connecting wallet:', error);
      return false;
    }
  };
  
  // Wrap the disconnect function to add logging
  const wrappedDisconnect = () => {
    console.log('[useNFTDisplay] Disconnecting wallet...');
    handleDisconnect();
  };
  
  // Wrap the switch network function to add logging
  const wrappedSwitchNetwork = (targetChainId: string) => {
    console.log(`[useNFTDisplay] Switching to network: ${targetChainId}`);
    switchNetwork(targetChainId);
  };

  return {
    connectWallet: wrappedConnectWallet,
    accountAddress,
    userNFTs,
    selectedNFT,
    isVerifying,
    isDisplaying,
    selectNFT,
    displayNFT,
    removeNFTDisplay,
    handleDisconnect: wrappedDisconnect,
    switchNetwork: wrappedSwitchNetwork,
    chainID
  };
};

export default useNFTDisplay; 