import React, { useState } from 'react';
import Modal from 'react-modal';
import './style.css';
import { useRakuichiNFTs } from '../../hooks/useRakuichiNFTs';
import { toast } from 'react-toastify';
import GeneralRepository from 'src/api/general';

interface MyNFTModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const MyNFTModal: React.FC<MyNFTModalProps> = ({ isOpen, onRequestClose }) => {
  const {
    isConnected,
    accountAddress,
    chainId,
    nfts,
    isLoading,
    connectWallet,
    fetchAllNFTs,
    switchNetwork
  } = useRakuichiNFTs();

  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      fetchAllNFTs();
    } catch (err) {
      console.error('Error connecting wallet:', err);
      toast.error('Failed to connect wallet. Please try again.');
    }
  };

  // Handle NFT selection for detail view
  const handleNFTSelect = (nft: any) => {
    setSelectedNFT(nft);
    setShowDetail(true);
  };

  // Add NFT to user collection
  const handleAddToCollection = async () => {
    if (!selectedNFT) return;

    try {
      setIsAddingToCollection(true);
      
      // Prepare NFT metadata as a JSON string
      const nftMetadata = JSON.stringify({
        'token_id': selectedNFT.tokenId,
        name: selectedNFT.metadata.name || `NFT #${selectedNFT.tokenId}`,
        image: selectedNFT.metadata.image,
        'contract_address': selectedNFT.contractAddress,
        'chain_id': selectedNFT.chainId,
        attributes: selectedNFT.metadata.attributes || []
      });

      // Call API to add NFT to user collection
      const res = await GeneralRepository.updateUserNFTMetadata(nftMetadata);
      
      if(res.data.data.success) {
        toast.success('NFT added to your collection!');
      } else {
        toast.error(res.data.data.message);
      }
      setShowDetail(false);
    } catch (error) {
      console.error('Failed to add NFT to collection:', error);
      toast.error('Failed to add NFT to collection. Please try again.');
    } finally {
      setIsAddingToCollection(false);
    }
  };

  // Handle network switching
  const handleSwitchNetwork = (chainId: string) => {
    switchNetwork(chainId);
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
    <>
      <Modal
        className="my-nft-modal"
        overlayClassName="my-nft-modal-overlay"
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        ariaHideApp={false}
      >
        <div className="my-nft-header">
          <h2>My NFT Collection</h2>
          <button className="my-nft-close-button" onClick={onRequestClose}>
            ×
          </button>
        </div>

        <div className="my-nft-content">
          {!isConnected ? (
            <div className="my-nft-connect">
              <p>Connect your wallet to view your NFTs</p>
              <button
                className="my-nft-connect-button"
                onClick={handleConnectWallet}
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div className="my-nft-connected">
              <div className="my-nft-wallet-info">
                <p>
                  <strong>Wallet:</strong>{' '}
                  {accountAddress.substring(0, 6)}...{accountAddress.substring(accountAddress.length - 4)}
                </p>
                <p>
                  <strong>Network:</strong> {getNetworkName(chainId)}
                </p>
                <div className="my-nft-network-buttons">
                  <button
                    className={`my-nft-network-button ${chainId === 56 ? 'active' : ''}`}
                    onClick={() => handleSwitchNetwork('56')}
                  >
                    BSC Mainnet
                  </button>
                  <button
                    className={`my-nft-network-button ${chainId === 97 ? 'active' : ''}`}
                    onClick={() => handleSwitchNetwork('97')}
                  >
                    BSC Testnet
                  </button>
                  <button
                    className={`my-nft-network-button ${chainId === 80001 ? 'active' : ''}`}
                    onClick={() => handleSwitchNetwork('80001')}
                  >
                    Mumbai Testnet
                  </button>
                  <button
                    className={`my-nft-network-button ${chainId === 11155111 ? 'active' : ''}`}
                    onClick={() => handleSwitchNetwork('11155111')}
                  >
                    Sepolia Testnet
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="my-nft-loading">
                  <div className="my-nft-spinner"></div>
                  <p>Loading your NFTs...</p>
                </div>
              ) : nfts.length === 0 ? (
                <div className="my-nft-empty">
                  <p>No NFTs found in your wallet on this network.</p>
                  <button className="my-nft-refresh-button" onClick={fetchAllNFTs}>
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="my-nft-gallery">
                  <h3>Your NFT Collection</h3>
                  <div className="my-nft-grid">
                    {nfts.map((nft) => (
                        <div
                          key={nft.id}
                          className="my-nft-item"
                          onClick={() => handleNFTSelect(nft)}
                        >
                          <div className="my-nft-card">
                            {nft.metadata.image ? (
                              <img
                                src={nft.metadata.image}
                                alt={nft.metadata.name || 'NFT'}
                                className="my-nft-image"
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
                            ) : (
                              <div className="my-nft-no-image">No Image</div>
                            )}
                            <div className="my-nft-info">
                              <h4>{`NFT #${nft.tokenId || ''}`}</h4>
                              <span className="my-nft-type">{nft.contractType}</span>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {selectedNFT && showDetail && (
        <Modal
          className="my-nft-detail"
          overlayClassName="my-nft-detail-overlay"
          isOpen={showDetail}
          onRequestClose={() => setShowDetail(false)}
          ariaHideApp={false}
        >
          <div className="my-nft-detail-header">
            <h3>{selectedNFT.metadata.name || `NFT #${selectedNFT.tokenId}`}</h3>
            <button className="my-nft-detail-close" onClick={() => setShowDetail(false)}>
              ×
            </button>
          </div>
          <div className="my-nft-detail-content">
            <div className="my-nft-detail-image">
              {selectedNFT.metadata.image ? (
                <img
                  src={selectedNFT.metadata.image}
                  alt={selectedNFT.metadata.name || 'NFT'}
                  onError={(e) => {
                    const target = e.currentTarget;
                    // Try fallback URLs if available
                    if (selectedNFT.metadata.imageUrls && selectedNFT.metadata.imageUrls.length > 1) {
                      const currentSrc = target.src;
                      const currentIndex = selectedNFT.metadata.imageUrls.indexOf(currentSrc);
                      const nextIndex = currentIndex + 1;
                      
                      if (nextIndex < selectedNFT.metadata.imageUrls.length) {
                        console.log(`Trying fallback image URL ${nextIndex + 1}/${selectedNFT.metadata.imageUrls.length}`);
                        target.src = selectedNFT.metadata.imageUrls[nextIndex];
                        return;
                      }
                    }
                    // Final fallback
                    target.src = 'https://via.placeholder.com/300?text=No+Image';
                  }}
                />
              ) : (
                <div className="my-nft-no-image large">No Image Available</div>
              )}
            </div>
            <div className="my-nft-detail-info">
              <p>
                <strong>ID:</strong> {selectedNFT.tokenId}
              </p>
              <p>
                <strong>Type:</strong> {selectedNFT.contractType}
              </p>
              <p>
                <strong>Network:</strong> {getNetworkName(selectedNFT.chainId)}
              </p>
              <p className="my-nft-description">
                <strong>Description:</strong>
                <br />
                {selectedNFT.metadata.description || 'No description available'}
              </p>

              {selectedNFT.metadata.attributes && selectedNFT.metadata.attributes.length > 0 && (
                <div className="my-nft-attributes">
                  <strong>Attributes:</strong>
                  <div className="my-nft-attributes-grid">
                    {selectedNFT.metadata.attributes.map((attr: any, index: number) => (
                      <div key={index} className="my-nft-attribute">
                        <span className="attribute-type">{attr.trait_type}</span>
                        <span className="attribute-value">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="my-nft-detail-actions">
              <button 
                className="my-nft-add-to-collection"
                onClick={handleAddToCollection}
                disabled={isAddingToCollection}
              >
                {isAddingToCollection ? 'Adding...' : 'Add to My Collection'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default MyNFTModal;