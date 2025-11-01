import React, { useState } from 'react';
import Modal from 'react-modal';
import './style.css';
import { RakuichiNFT } from 'src/hooks/useRakuichiNFTs';
import RakuichiNFTDisplay from '../RakuichiNFTDisplay';
import Web3 from 'web3';
import { toast } from 'react-toastify';
import { AbiItem } from 'web3-utils';

type NFTDebugModalProps = {
  isOpen: boolean;
  buildingId: string | number;
  showNFTDisplay: boolean;
  setShowNFTDisplay: (show: boolean) => void;
};

// Contract addresses from README.md
const CONTRACT_ADDRESSES = {
  BSC: {
    CHAIN_ID: 97, // BSC Testnet
    OVE: '0xddd249b862a6c4acee4d343fc15818755178f893',
    LANDS: '0xb5a6af64439b302ad28d480b8819ca922b8e31de',
    HOMES: '0xe81bd02c9407cf4b624f339db78ca221992341c9',
    ITEMS: '0xe27159d81679bcc60a33d2578338e096db6dc428',
    MKP: '0xee35f20D954C65D846924497c6385aa9eC5F7e43'
  },
  POLYGON: {
    CHAIN_ID: 80001, // Mumbai Testnet
    OVE: '0x99018433ace261d5736840145396df49d6415630',
    LANDS: '0x3ef6b21b697a5e1d6b9e9c3d570a217500b86299',
    HOMES: '0xfc94871be1e9d39d157bf03302c409d3e42fd774',
    ITEMS: '0x11ba62d27d35f8a458d7aaeca273f898819ea785',
    MKP: '0x64286e715637394E88A336f7687Cc71d64dd1A3E'
  }
};

// Sample image URLs for each NFT type
const NFT_IMAGES = {
  LANDS: 'https://res.cloudinary.com/dq9yrj7c9/image/upload/v1753510922/tomoebb_A_cool_psychedelic_depiction_of_the_handsome_General_Od_e1f6b7b8-07eb-41f9-a7f8-df81e7f70bb1_c9to9o.png',
  HOMES: 'https://res.cloudinary.com/dq9yrj7c9/image/upload/v1753511366/2_d8ggtb.png',
  ITEMS: 'https://res.cloudinary.com/dq9yrj7c9/image/upload/v1753510922/tomoebb_A_cool_psychedelic_depiction_of_the_handsome_General_Od_e1f6b7b8-07eb-41f9-a7f8-df81e7f70bb1_c9to9o.png'
};

// NFT contract ABI (minimal for mintTo function)
const NFT_ABI: AbiItem[] = [
  {
    inputs: [
      {name: '_to', type: 'address'},
      {name: '_uri', type: 'string'},
      {name: '_royaltyRecipient', type: 'address'},
      {name: '_royaltyBps', type: 'uint256'},
      {name: '_charityRecipient', type: 'address'},
      {name: '_charityBps', type: 'uint256'}
    ],
    name: 'mintTo',
    outputs: [{name: '', type: 'uint256'}],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

const NFTDebugModal: React.FC<NFTDebugModalProps> = ({
  isOpen,
  buildingId,
  showNFTDisplay,
  setShowNFTDisplay
}) => {
  console.log('[NFTDebugModal] Rendering with buildingId:', buildingId);
  const [isMinting, setIsMinting] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<'BSC' | 'POLYGON'>('BSC');
  const [selectedContract, setSelectedContract] = useState<'LANDS' | 'HOMES' | 'ITEMS'>('LANDS');
  const [customTokenId, setCustomTokenId] = useState<string>('1000');

  const handleToggleDisplay = () => {
    console.log('[NFTDebugModal] Toggling NFT display visibility');
    setShowNFTDisplay(!showNFTDisplay);
  };

  // Get the chain network name based on chainId
  const getNetworkFromChainId = (chainId: number): 'BSC' | 'POLYGON' | null => {
    if (chainId === CONTRACT_ADDRESSES.BSC.CHAIN_ID) return 'BSC';
    if (chainId === CONTRACT_ADDRESSES.POLYGON.CHAIN_ID) return 'POLYGON';
    return null;
  };

  // Switch network in MetaMask
  const switchNetwork = async (networkType: 'BSC' | 'POLYGON') => {
    if (!window.ethereum) return;
    
    try {
      const targetChainId = CONTRACT_ADDRESSES[networkType].CHAIN_ID;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      setCurrentNetwork(networkType);
      console.log(`[NFTDebugModal] Switched to ${networkType} network`);
    } catch (err: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        try {
          if (networkType === 'BSC') {
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
            setCurrentNetwork('BSC');
          } else if (networkType === 'POLYGON') {
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
                  rpcUrls: [
                    'https://rpc-mumbai.maticvigil.com/',
                    'https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbacb8c0'
                  ],
                  blockExplorerUrls: ['https://mumbai.polygonscan.com']
                }
              ]
            });
            setCurrentNetwork('POLYGON');
          }
        } catch (addError) {
          console.error('[NFTDebugModal] Error adding chain to MetaMask:', addError);
          toast.error('Failed to add network to wallet');
        }
      } else {
        console.error('[NFTDebugModal] Error switching chain:', err);
        toast.error('Failed to switch network');
      }
    }
  };

  // Create a JSON metadata object with proper image URLs
  const createMetadata = (tokenId: string) => {
    return {
      name: `NFT #${tokenId}`,
      description: `A ${selectedContract.toLowerCase()} NFT for testing purposes`,
      image: NFT_IMAGES[selectedContract],
      attributes: [
        {
          'trait_type': 'Type',
          value: selectedContract
        }
      ]
    };
  };

  // Create a metadata URI from JSON object (using base64 encoding)
  const createMetadataUri = (metadata: any) => {
    const jsonString = JSON.stringify(metadata);
    const base64 = btoa(jsonString);
    return `data:application/json;base64,${base64}`;
  };

  const handleTestMint = async () => {
    try {
      if (!window.ethereum) {
        console.error('[NFTDebugModal] No wallet provider found');
        toast.error('No wallet provider found. Please install MetaMask.');
        return;
      }
      
      setIsMinting(true);
      console.log('[NFTDebugModal] Requesting account access');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      
      console.log(`[NFTDebugModal] Connected account: ${account}`);
      
      // Get current chain ID
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);
      console.log(`[NFTDebugModal] Current chain ID: ${chainId}`);
      
      // Determine which network we're on
      const network = getNetworkFromChainId(chainId);
      if (!network) {
        toast.error('Please switch to BSC Testnet or Mumbai Testnet');
        setIsMinting(false);
        return;
      }
      
      setCurrentNetwork(network);
      console.log(`[NFTDebugModal] Detected network: ${network}`);
      
      // Choose the contract based on the selected network and contract type
      const contractAddress = CONTRACT_ADDRESSES[network][selectedContract];
      console.log(`[NFTDebugModal] Creating contract instance for ${selectedContract} at ${contractAddress}`);
      const nftContract = new web3.eth.Contract(NFT_ABI, contractAddress);
      
      // Create metadata with the proper image URL
      const metadata = createMetadata(customTokenId);
      const metadataUri = createMetadataUri(metadata);
      
      console.log('[NFTDebugModal] Metadata for NFT:', metadata);
      console.log(`[NFTDebugModal] Attempting to mint ${selectedContract} NFT to ${account} with URI: ${metadataUri}`);
      
      const tx = await nftContract.methods.mintTo(
        account,
        metadataUri,
        account,
        0,
        account,
        0
      ).send({ from: account });
      
      console.log(`[NFTDebugModal] Transaction hash: ${tx.transactionHash}`);
      console.log('[NFTDebugModal] NFT minted successfully!');
      toast.success(`${selectedContract} NFT minted successfully! Reload to see it in your collection.`);
      
    } catch (error) {
      console.error('[NFTDebugModal] Minting failed:', error);
      toast.error('Failed to mint NFT. You might not be the contract owner.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <>
      <Modal
        className="nft-debug-modal"
        overlayClassName="nft-debug-modal-overlay"
        isOpen={isOpen}
      >
        <div className="nft-debug-buttons">
          <div className="nft-debug-button" onClick={handleToggleDisplay}>
            <div className="nft-debug-icon">📊</div>
            <div className="nft-debug-text">
              {showNFTDisplay ? 'Hide NFT Debug' : 'Show NFT Debug'}
            </div>
          </div>
          
          <div className="nft-network-selector">
            <div className="nft-network-label">Network:</div>
            <div className="nft-network-buttons">
              <button
                className={`nft-network-button ${currentNetwork === 'BSC' ? 'active' : ''}`}
                onClick={() => switchNetwork('BSC')}
              >
                BSC Testnet
              </button>
              <button
                className={`nft-network-button ${currentNetwork === 'POLYGON' ? 'active' : ''}`}
                onClick={() => switchNetwork('POLYGON')}
              >
                Mumbai Testnet
              </button>
            </div>
          </div>
          
          <div className="nft-contract-selector">
            <div className="nft-contract-label">Contract:</div>
            <div className="nft-contract-buttons">
              <button
                className={`nft-contract-button ${selectedContract === 'LANDS' ? 'active' : ''}`}
                onClick={() => setSelectedContract('LANDS')}
              >
                LANDS
              </button>
              <button
                className={`nft-contract-button ${selectedContract === 'HOMES' ? 'active' : ''}`}
                onClick={() => setSelectedContract('HOMES')}
              >
                HOMES
              </button>
              <button
                className={`nft-contract-button ${selectedContract === 'ITEMS' ? 'active' : ''}`}
                onClick={() => setSelectedContract('ITEMS')}
              >
                ITEMS
              </button>
            </div>
          </div>
          
          <div className="nft-tokenid-selector">
            <div className="nft-tokenid-label">Token ID:</div>
            <input 
              type="text" 
              className="nft-tokenid-input"
              value={customTokenId}
              onChange={(e) => setCustomTokenId(e.target.value)}
              placeholder="Enter Token ID"
            />
          </div>
          
          <div 
            className={`nft-debug-button nft-mint-button ${isMinting ? 'nft-button-disabled' : ''}`} 
            onClick={!isMinting ? handleTestMint : undefined}
          >
            <div className="nft-debug-icon">🪙</div>
            <div className="nft-debug-text">
              {isMinting ? 'Minting...' : `Mint ${selectedContract} NFT`}
            </div>
          </div>
        </div>
      </Modal>

      {/* NFT Debug Display */}
      {showNFTDisplay && buildingId && (
        <Modal
          className="nft-display-container-modal"
          overlayClassName="nft-display-overlay"
          isOpen={showNFTDisplay}
          onRequestClose={() => setShowNFTDisplay(false)}
        >
          <RakuichiNFTDisplay 
            buildingId={buildingId} 
            onClose={() => {
              console.log('[NFTDebugModal] Closing RakuichiNFTDisplay');
              setShowNFTDisplay(false);
            }} 
          />
        </Modal>
      )}
    </>
  );
};

export default NFTDebugModal; 