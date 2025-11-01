import React, { useEffect, useState } from 'react';
import { useNFTDisplay } from '../../hooks/useNFTDisplay';
import { toast } from 'react-toastify';
import './styles.css';

interface NFTDisplayProps {
  buildingId: string | number;
}

export const NFTDisplay: React.FC<NFTDisplayProps> = ({ buildingId }) => {
  const [open, setOpen] = useState(false);
  const [displayedNFT, setDisplayedNFT] = useState<any>(null);
  
  const {
    connectWallet,
    accountAddress,
    userNFTs,
    selectedNFT,
    isVerifying,
    isDisplaying,
    selectNFT,
    displayNFT,
    removeNFTDisplay,
    handleDisconnect,
    switchNetwork,
    chainID
  } = useNFTDisplay({ buildingId });

  console.log('all nfts:', userNFTs);

  useEffect(() => {
    // Check if there's already an NFT displayed in this building
    const fetchDisplayedNFT = async () => {
      try {
        console.log(`[NFTDisplay] Fetching displayed NFT for building ${buildingId}`);
        const response = await fetch(`/api/nft/display/${buildingId.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`NFTDisplay Fetched displayed NFT data: ${data}`);
          if (data && data.length > 0) {
            setDisplayedNFT(data[0]);
            console.log(`NFTDisplay Set displayed NFT: ${data[0]}`);
          } else {
            console.log(`[NFTDisplay] No NFT currently displayed in building ${buildingId}`);
          }
        } else {
          console.error(`[NFTDisplay] Failed to fetch displayed NFT: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('[NFTDisplay] Error fetching displayed NFT:', error);
      }
    };

    if (buildingId) {
      fetchDisplayedNFT();
    }
  }, [buildingId]);

  const handleOpenDialog = () => {
    if (!accountAddress) {
      console.log('[NFTDisplay] No wallet connected, attempting to connect...');
      connectWallet().catch(error => {
        console.error('[NFTDisplay] Failed to connect wallet:', error);
        toast.error('Failed to connect wallet. Please try again.');
      });
    } else {
      console.log('[NFTDisplay] Opening NFT selection dialog with address:', accountAddress);
      setOpen(true);
    }
  };

  const handleCloseDialog = () => {
    console.log('[NFTDisplay] Closing NFT selection dialog');
    setOpen(false);
  };

  const handleSelectNFT = async (nft: any) => {
    console.log('[NFTDisplay] Selecting NFT:', nft);
    const success = await selectNFT(nft);
    console.log(`[NFTDisplay] NFT selection ${success ? 'succeeded' : 'failed'}`);
    if (success) {
      handleCloseDialog();
      console.log(`[NFTDisplay] Displaying NFT in building ${buildingId}:`, nft);
      const displaySuccess = await displayNFT(buildingId, nft);
      console.log(`[NFTDisplay] Display NFT ${displaySuccess ? 'succeeded' : 'failed'}`);
      if (displaySuccess) {
        setDisplayedNFT({
          nft: nft
        });
        console.log('[NFTDisplay] Updated displayed NFT in state');
      }
    }
  };

  const handleRemoveNFT = async () => {
    console.log(`[NFTDisplay] Removing NFT display from building ${buildingId}`);
    const success = await removeNFTDisplay(buildingId);
    console.log(`[NFTDisplay] Remove NFT display ${success ? 'succeeded' : 'failed'}`);
    if (success) {
      setDisplayedNFT(null);
      console.log('[NFTDisplay] Cleared displayed NFT from state');
    }
  };

  const handleSwitchNetwork = (chainId: string) => {
    console.log(`[NFTDisplay] Switching network to chain ID: ${chainId}`);
    switchNetwork(chainId);
  };

  return (
    <div className="nft-display-container">
      <h2 className="nft-display-title">Rakuichi Rakuza NFT Display</h2>

      {!accountAddress ? (
        <button 
          className="nft-connect-button"
          onClick={handleOpenDialog}
        >
          Connect Wallet to Display Rakuichi Rakuza NFTs
        </button>
      ) : (
        <>
          <div className="nft-wallet-info">
            <p>
              Connected: {accountAddress.substring(0, 6)}...{accountAddress.substring(accountAddress.length - 4)}
            </p>
            <button 
              className="nft-disconnect-button"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </div>

          {displayedNFT ? (
            <div className="nft-card">
              <h3>{displayedNFT.nft.metadata.name}</h3>
              {displayedNFT.nft.metadata.image && (
                <img 
                  src={displayedNFT.nft.metadata.image} 
                  alt={displayedNFT.nft.metadata.name}
                  className="nft-image"
                />
              )}
              <p className="nft-description">{displayedNFT.nft.metadata.description}</p>
              <button 
                className="nft-remove-button"
                onClick={handleRemoveNFT}
              >
                Remove NFT
              </button>
            </div>
          ) : (
            <button 
              className="nft-select-button"
              onClick={handleOpenDialog}
            >
              Select Rakuichi Rakuza NFT to Display
            </button>
          )}
        </>
      )}

      {open && (
        <div className="nft-modal-overlay">
          <div className="nft-modal">
            <div className="nft-modal-header">
              <h3>Select a Rakuichi Rakuza NFT to Display</h3>
              <button className="nft-modal-close" onClick={handleCloseDialog}>×</button>
            </div>
            <div className="nft-modal-content">
              <div className="nft-network-selector">
                <p>
                  Network: {chainID === 97 ? 'Binance Smart Chain Testnet' : 'Mumbai Testnet'}
                </p>
                <div className="nft-network-buttons">
                  <button 
                    className="nft-network-button"
                    onClick={() => handleSwitchNetwork('97')}
                  >
                    Switch to BSC
                  </button>
                  <button 
                    className="nft-network-button"
                    onClick={() => handleSwitchNetwork('80001')}
                  >
                    Switch to Mumbai
                  </button>
                </div>
              </div>

              {isVerifying ? (
                <div className="nft-loading">
                  <span className="nft-loading-spinner"></span>
                </div>
              ) : userNFTs.length > 0 ? (
                <div className="nft-grid">
                  {userNFTs.map((nft) => (
                    <div className="nft-grid-item" key={`${nft.tokenAddress}-${nft.tokenId}`}>
                      <div className="nft-grid-card">
                        <h4>{nft.metadata.name}</h4>
                        {nft.metadata.image && (
                          <img 
                            src={nft.metadata.image} 
                            alt={nft.metadata.name}
                            className="nft-grid-image"
                          />
                        )}
                        <p className="nft-grid-description">{nft.metadata.description}</p>
                        <button 
                          className="nft-select-button"
                          onClick={() => handleSelectNFT(nft)}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="nft-no-nfts">
                  No Rakuichi Rakuza NFTs found in your wallet. You need to purchase NFTs from the Rakuichi Rakuza platform first.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTDisplay;