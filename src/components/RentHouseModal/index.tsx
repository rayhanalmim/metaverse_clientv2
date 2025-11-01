import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './style.css';
import PropertyRepository from 'src/api/property';
import { toast } from 'react-toastify';
import { useMetaMask } from 'src/hooks/useMetamaskProvider';

interface RentalListing {
  id: number;
  token_id: number;
  chain_id: string;
  rent_price: string;
  rent_period_days: number;
  rental_status: string;
  is_for_rent: boolean;
  username?: string;
  owner?: string;
  tenant_wallet?: string;
  rent_due_at?: number;
  grace_until?: number;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
}

interface RentHouseModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const RentHouseModal: React.FC<RentHouseModalProps> = ({ isOpen, onRequestClose }) => {
  const { accountAddress, onRent } = useMetaMask();
  const [rentalListings, setRentalListings] = useState<RentalListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState<RentalListing | null>(null);
  const [isAcceptingRent, setIsAcceptingRent] = useState(false);

  // Fetch rental listings when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRentalListings();
    }
  }, [isOpen]);

  const fetchRentalListings = async () => {
    try {
      setIsLoading(true);
      const response = await PropertyRepository.getRentalListings();

      console.log('API Response:', response);
      console.log('Response data:', response.data);

      // Handle nested response format: response.data.data.data
      let listings = [];
      if (response.data && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        // Backend wraps response in: { success, message, data: [...] }
        listings = response.data.data.data;
        console.log('Found listings in response.data.data.data:', listings.length, 'items');
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Direct array in response.data.data
        listings = response.data.data;
        console.log('Found listings in response.data.data:', listings.length, 'items');
      } else if (response.data && Array.isArray(response.data)) {
        // Direct array in response.data
        listings = response.data;
        console.log('Found listings in response.data:', listings.length, 'items');
      } else {
        console.warn('Unexpected response structure:', response.data);
        listings = [];
      }

      // Ensure listings is always an array
      if (!Array.isArray(listings)) {
        console.warn('Final listings is not an array:', listings);
        listings = [];
      }

      setRentalListings(listings);
      console.log(`Loaded ${listings.length} houses from rental store`);
    } catch (error) {
      console.error('Failed to fetch rental listings:', error);
      toast.error('Failed to load houses from store. Please try again.');
      setRentalListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRent = async (listing: RentalListing) => {
    console.log('[RentHouseModal] Rent Now clicked for listing:', {
      id: listing.id,
      // eslint-disable-next-line camelcase
      token_id: listing.token_id,
      owner: listing.owner,
      // eslint-disable-next-line camelcase
      chain_id: listing.chain_id,
      price: listing.rent_price,
    });
    if (!accountAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Prevent owner from renting their own property
    if (listing.owner.toLowerCase() === accountAddress.toLowerCase()) {
      toast.error('You cannot rent your own property');
      return;
    }

    try {
      setIsAcceptingRent(true);
      setSelectedListing(listing);

      // Process payment through MetaMask (directly, no availability check)
      const paymentSuccess = await processRentalPayment(listing);
      if (!paymentSuccess) throw new Error('Payment was cancelled or failed');

      // Confirm rental in backend only if payment was successful
      const response = await PropertyRepository.acceptRent(listing.token_id.toString());
      if (response.data && response.data.data) {
        toast.success('Successfully rented the property! 🎉');
        fetchRentalListings();
        onRequestClose();
      } else {
        toast.error(response.data?.message || 'Failed to confirm rental');
      }
    } catch (error) {
      console.error('Failed to accept rent:', error);
      toast.error(error.message || 'Failed to rent property. Please try again.');
    } finally {
      setIsAcceptingRent(false);
      setSelectedListing(null);
    }
  };

  const processRentalPayment = async (listing: RentalListing): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        // Create payment data for the rental transaction
        const rentalData = {
          id: listing.id,
          listingId: listing.id,
          price: listing.rent_price,
          tokenId: listing.token_id,
          chainId: listing.chain_id,
          owner: listing.owner, // Add owner address for payment
        };
        console.log('[RentHouseModal] Calling onRent with data:', rentalData);

        // Use MetaMask to process the rental payment
        // This will trigger MetaMask popup and handle the transaction
        onRent(rentalData, (success: boolean) => {
          if (success) {
            console.log('Rental payment completed successfully');
            resolve(true);
          } else {
            console.error('Rental payment failed');
            resolve(false);
          }
        });
      } catch (error) {
        console.error('Rental payment error:', error);
        resolve(false);
      }
    });
  };

  const formatPrice = (price: string, chainId?: string) => {
    const priceNum = parseFloat(price);

    // Chain configurations
    const chainConfigs = {
      '97': { name: 'BSC', symbol: 'BNB', decimals: 18 }, // BSC Testnet
      '56': { name: 'BSC', symbol: 'BNB', decimals: 18 }, // BSC Mainnet
      '80001': { name: 'Mumbai', symbol: 'MATIC', decimals: 18 }, // Polygon Mumbai
      '137': { name: 'Polygon', symbol: 'MATIC', decimals: 18 }, // Polygon Mainnet
      '11155111': { name: 'Sepolia', symbol: 'ETH', decimals: 18 }, // Ethereum Sepolia
      '1': { name: 'Ethereum', symbol: 'ETH', decimals: 18 }, // Ethereum Mainnet
    };

    // Default to ETH if chain not found
    const config = chainId ? chainConfigs[chainId] || { name: 'Unknown', symbol: 'ETH', decimals: 18 } : { name: 'Unknown', symbol: 'ETH', decimals: 18 };

    // Convert from wei to readable format
    const value = priceNum / Math.pow(10, config.decimals);

    // Format with appropriate decimal places
    let decimalPlaces = 4;
    if (value >= 1) {
      decimalPlaces = 2; // For values >= 1, show 2 decimal places
    } else if (value >= 0.1) {
      decimalPlaces = 3; // For values >= 0.1, show 3 decimal places
    }

    return `${value.toFixed(decimalPlaces)} ${config.symbol}`;
  };

  const getChainName = (chainId: string) => {
    const chainNames = {
      '97': 'BSC Testnet',
      '56': 'BSC Mainnet',
      '80001': 'Polygon Mumbai',
      '137': 'Polygon Mainnet',
      '11155111': 'Ethereum Sepolia',
      '1': 'Ethereum Mainnet',
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };


  return (
    <Modal
      className="rent-house-modal"
      overlayClassName="rent-house-modal-overlay"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      ariaHideApp={false}
    >
      <div className="rent-house-header">
        <h2>Rent a Building</h2>
        <button className="rent-house-close-button" onClick={onRequestClose}>
          ×
        </button>
      </div>

      <div className="rent-house-content">
        {!accountAddress ? (
          <div className="rent-house-connect">
            <p>Please connect your wallet to view and rent buildings</p>
            <div className="rent-house-wallet-info">
              <p>Connected wallet: Not connected</p>
            </div>
          </div>
        ) : (
          <div className="rent-house-connected">
            <div className="rent-house-wallet-info">
              <p>
                <strong>Wallet:</strong>{' '}
                {accountAddress.substring(0, 6)}...{accountAddress.substring(accountAddress.length - 4)}
              </p>
            </div>

            {isLoading ? (
              <div className="rent-house-loading">
                <div className="rent-house-spinner"></div>
                <p style={{fontSize: '16px', fontWeight: 'bold'}}>Browsing our house collection...</p>
              </div>
            ) : rentalListings.length === 0 ? (
              <div className="rent-house-empty">
                <p>Our store is currently empty.</p>
                <p>New houses are being listed regularly!</p>
                <button className="rent-house-refresh-button" onClick={fetchRentalListings}>
                  Check for New Listings
                </button>
              </div>
            ) : (
              <div className="rent-house-listings">
                <h3>Available Buildings for Rent</h3>
                <div className="rent-house-grid">
                  {Array.isArray(rentalListings) && rentalListings.map((listing) => (
                    <div key={listing.id} className="rent-house-item">
                      <div className="rent-house-card">
                        {/* <div className="rent-house-image">
                          {listing.metadata?.image ? (
                            <img
                              src={listing.metadata.image}
                              alt={`Property ${listing.token_id}`}
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/200x150?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="rent-house-no-image">
                              <span>Property {listing.token_id}</span>
                            </div>
                          )}
                        </div> */}

                        <div className="rent-house-info">
                          <h4>Property #{listing.token_id}</h4>
                          <div className="rent-house-details">
                            <p>
                              <strong>Owner:</strong> {listing.username || 'Unknown'}
                              {listing.owner.toLowerCase() === accountAddress?.toLowerCase() && (
                                <span style={{ color: '#ffc000', fontSize: '12px', marginLeft: '8px' }}>
                                  (Your Property)
                                </span>
                              )}
                            </p>
                            <p>
                              <strong>Price:</strong> {formatPrice(listing.rent_price, listing.chain_id)}
                            </p>
                            <p>
                              <strong>Period:</strong> {listing.rent_period_days} days
                            </p>
                            <p>
                              <strong>Network:</strong> {getChainName(listing.chain_id)}
                            </p>
                          </div>

                          <div className="rent-house-actions">
                            <button
                              className="rent-house-accept-button"
                              onClick={() => handleAcceptRent(listing)}
                              disabled={
                                (isAcceptingRent && selectedListing?.id === listing.id) ||
                                listing.owner.toLowerCase() === accountAddress?.toLowerCase()
                              }
                            >
                              {listing.owner.toLowerCase() === accountAddress?.toLowerCase()
                                ? 'Your Property'
                                : isAcceptingRent && selectedListing?.id === listing.id
                                ? 'Renting...'
                                : 'Rent Now'}
                            </button>
                          </div>
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
  );
};

export default RentHouseModal;
