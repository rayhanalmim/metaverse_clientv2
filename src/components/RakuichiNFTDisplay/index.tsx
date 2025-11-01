import React, { useState, useEffect } from 'react';
import { useRakuichiNFTs, RakuichiNFT } from '../../hooks/useRakuichiNFTs';
import './styles.css';

interface RakuichiNFTDisplayProps {
  buildingId: string | number;
  onClose?: () => void;
}

const RakuichiNFTDisplay: React.FC<RakuichiNFTDisplayProps> = ({ buildingId, onClose }) => {
  console.log(`[RakuichiNFTDisplay] Component initialized for building ${buildingId}`);

  const {
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
  } = useRakuichiNFTs();

  const [showNFTSelector, setShowNFTSelector] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<RakuichiNFT | null>(null);
  const [displayedNFTs, setDisplayedNFTs] = useState<RakuichiNFT[]>([]);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  console.log('selected nft :', selectedNFT, nfts);

  useEffect(() => {
    console.log(`[RakuichiNFTDisplay] Connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
    console.log(`[RakuichiNFTDisplay] Account address: ${accountAddress || 'None'}`);
    console.log(`[RakuichiNFTDisplay] Chain ID: ${chainId || 'Unknown'}`);
    console.log(`[RakuichiNFTDisplay] NFTs loaded: ${nfts.length}`);
  }, [isConnected, accountAddress, chainId, nfts]);

  // Handle NFT selection
  const handleSelectNFT = (nft: RakuichiNFT) => {
    console.log('[RakuichiNFTDisplay] Selected NFT:', nft);
    setSelectedNFT(nft);
    setShowNFTSelector(false);
    
    // Add NFT to displayed NFTs
    if (!displayedNFTs.some(item => item.id === nft.id)) {
      console.log('[RakuichiNFTDisplay] Adding NFT to displayed list:', nft.metadata.name);
      setDisplayedNFTs([...displayedNFTs, nft]);
    } else {
      console.log('[RakuichiNFTDisplay] NFT already in displayed list:', nft.metadata.name);
    }
  };

  // Handle NFT removal
  const handleRemoveNFT = (nftId: string) => {
    console.log(`[RakuichiNFTDisplay] Removing NFT with ID: ${nftId}`);
    setDisplayedNFTs(displayedNFTs.filter(nft => nft.id !== nftId));
    
    if (selectedNFT && selectedNFT.id === nftId) {
      console.log('[RakuichiNFTDisplay] Clearing selected NFT');
      setSelectedNFT(null);
    }
    
    console.log(`[RakuichiNFTDisplay] Remaining displayed NFTs: ${displayedNFTs.length - 1}`);
  };

  // Add a function to toggle debug info
  const toggleDebugInfo = () => {
    console.log(`[RakuichiNFTDisplay] Toggling debug info: ${!showDebugInfo}`);
    setShowDebugInfo(!showDebugInfo);
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    console.log('[RakuichiNFTDisplay] Attempting to connect wallet...');
    try {
      await connectWallet();
      console.log('[RakuichiNFTDisplay] Wallet connection initiated');
    } catch (err) {
      console.error('[RakuichiNFTDisplay] Wallet connection error:', err);
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    console.log('[RakuichiNFTDisplay] Disconnecting wallet');
    disconnectWallet();
  };

  // Handle network switching
  const handleSwitchNetwork = (chainId: string) => {
    console.log(`[RakuichiNFTDisplay] Switching to network: ${chainId}`);
    switchNetwork(chainId);
  };

  // Handle NFT selector toggle
  const handleToggleNFTSelector = () => {
    console.log(`[RakuichiNFTDisplay] Toggling NFT selector: ${!showNFTSelector}`);
    setShowNFTSelector(!showNFTSelector);
    
    if (!showNFTSelector && isConnected) {
      console.log('[RakuichiNFTDisplay] Refreshing NFT list');
      fetchAllNFTs();
    }
  };

  // Get network name
  const getNetworkName = (id: number | null) => {
    if (id === 56) return 'BSC Mainnet';
    if (id === 97) return 'BSC Testnet';
    if (id === 80001) return 'Mumbai Testnet';
    if (id === 11155111) return 'Sepolia Testnet';
    return 'Unknown Network';
  };

  return (
    <div className="rakuichi-nft-display">
      <div className="rakuichi-nft-header">
        <h2>Rakuichi Rakuza NFT Display</h2>
        <div className="rakuichi-header-actions">
          <button 
            className="rakuichi-debug-button" 
            onClick={toggleDebugInfo}
          >
            {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
          </button>
          {onClose && (
            <button className="rakuichi-close-button" onClick={() => {
              console.log('[RakuichiNFTDisplay] Closing display');
              onClose();
            }}>×</button>
          )}
        </div>
      </div>

      <div className="rakuichi-nft-content">
        {!isConnected ? (
          <div className="rakuichi-connect-section">
            <p>Connect your wallet to display your Rakuichi Rakuza NFTs</p>
            <button
              className="rakuichi-connect-button"
              onClick={handleConnectWallet}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        ) : (
          <div className="rakuichi-connected-section">
            <div className="rakuichi-wallet-info">
              <div>
                <strong>Wallet:</strong> {accountAddress.substring(0, 6)}...{accountAddress.substring(accountAddress.length - 4)}
              </div>
              <div>
                <strong>Network:</strong> {getNetworkName(chainId)}
              </div>
              <div className="rakuichi-actions">
                <button
                  className="rakuichi-network-button"
                  onClick={() => handleSwitchNetwork('56')}
                >
                  Switch to BSC Mainnet
                </button>
                <button
                  className="rakuichi-network-button"
                  onClick={() => handleSwitchNetwork('97')}
                >
                  Switch to BSC Testnet
                </button>
                <button
                  className="rakuichi-network-button"
                  onClick={() => handleSwitchNetwork('80001')}
                >
                  Switch to Mumbai
                </button>
                <button
                  className="rakuichi-network-button"
                  onClick={() => handleSwitchNetwork('11155111')}
                >
                  Switch to Sepolia
                </button>
                <button
                  className="rakuichi-disconnect-button"
                  onClick={handleDisconnectWallet}
                >
                  Disconnect
                </button>
              </div>
            </div>

            <div className="rakuichi-nft-section">
              {isLoading ? (
                <div className="rakuichi-loading">Loading your NFTs...</div>
              ) : nfts.length === 0 ? (
                <div className="rakuichi-no-nfts">
                  <p>No Rakuichi Rakuza NFTs found in your wallet.</p>
                  <p>You need to purchase NFTs from the Rakuichi Rakuza platform first.</p>
                </div>
              ) : (
                <div className="rakuichi-nft-management">
                  <div className="rakuichi-displayed-nfts">
                    <h3>NFTs Displayed in Building {buildingId}</h3>
                    {displayedNFTs.length === 0 ? (
                      <p>No NFTs currently displayed. Select an NFT to display.</p>
                    ) : (
                      <div className="rakuichi-nft-grid">
                        {displayedNFTs.map(nft => (
                          <div key={nft.id} className="rakuichi-nft-card">
                            <h4>{nft.metadata.name}</h4>
                            {nft.metadata.image && (
                              <img 
                                src={nft.metadata.image} 
                                alt={nft.metadata.name} 
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  // Try fallback URLs if available
                                  if (nft.metadata.imageUrls && nft.metadata.imageUrls.length > 1) {
                                    const currentSrc = target.src;
                                    const currentIndex = nft.metadata.imageUrls.indexOf(currentSrc);
                                    const nextIndex = currentIndex + 1;
                                    
                                    if (nextIndex < nft.metadata.imageUrls.length) {
                                      console.log(`Trying fallback image URL ${nextIndex + 1}/${nft.metadata.imageUrls.length}`);
                                      target.src = nft.metadata.imageUrls[nextIndex];
                                      return;
                                    }
                                  }
                                  // Final fallback
                                  target.src = 'https://via.placeholder.com/150?text=No+Image';
                                }}
                              />
                            )}
                            <div className="rakuichi-nft-info">
                              <p className="rakuichi-nft-type">{nft.contractType}</p>
                              <button 
                                className="rakuichi-remove-button"
                                onClick={() => handleRemoveNFT(nft.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rakuichi-nft-selector-section">
                    <button
                      className="rakuichi-select-button"
                      onClick={handleToggleNFTSelector}
                    >
                      {showNFTSelector ? 'Hide NFT Selector' : 'Select NFT to Display'}
                    </button>

                    {showNFTSelector && (
                      <div className="rakuichi-nft-selector">
                        <h3>Select an NFT to Display</h3>
                        <div className="rakuichi-nft-grid">
                          {nfts.map(nft => (
                            <div 
                              key={nft.id} 
                              className={`rakuichi-nft-card ${displayedNFTs.some(item => item.id === nft.id) ? 'rakuichi-selected' : ''}`}
                              onClick={() => handleSelectNFT(nft)}
                            >
                              <h4>{nft.metadata.name}</h4>
                              {nft.metadata.image && (
                              <img 
                                src={nft.metadata.image} 
                                alt={nft.metadata.name} 
                                className="rakuichi-nft-image"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  // Try fallback URLs if available
                                  if (nft.metadata.imageUrls && nft.metadata.imageUrls.length > 1) {
                                    const currentSrc = target.src;
                                    const currentIndex = nft.metadata.imageUrls.indexOf(currentSrc);
                                    const nextIndex = currentIndex + 1;
                                    
                                    if (nextIndex < nft.metadata.imageUrls.length) {
                                      console.log(`Trying fallback image URL ${nextIndex + 1}/${nft.metadata.imageUrls.length}`);
                                      target.src = nft.metadata.imageUrls[nextIndex];
                                      return;
                                    }
                                  }
                                  // Final fallback
                                  target.src = 'https://via.placeholder.com/150?text=No+Image';
                                }}
                              />
                            )}
                              <p className="rakuichi-nft-type">{nft.contractType}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {showDebugInfo && (
        <div className="rakuichi-debug-info">
          <h4>Debug Information</h4>
          <div className="debug-details">
            <div><strong>Wallet connected:</strong> {isConnected ? 'Yes' : 'No'}</div>
            <div><strong>Address:</strong> {accountAddress || 'None'}</div>
            <div><strong>Network:</strong> {getNetworkName(chainId)} (ID: {chainId})</div>
            <div><strong>NFTs found:</strong> {nfts.length}</div>
            <div><strong>NFTs displayed:</strong> {displayedNFTs.length}</div>
            <div><strong>Building ID:</strong> {buildingId}</div>
            <div><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
            <div><strong>Error:</strong> {error || 'None'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RakuichiNFTDisplay;