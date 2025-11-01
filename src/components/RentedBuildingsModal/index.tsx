import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './style.css';
import PropertyRepository from 'src/api/property';
import { toast } from 'react-toastify';
import { useMetaMask } from 'src/hooks/useMetamaskProvider';

interface RentedProperty {
  id: number;
  token_id: number;
  chain_id: string;
  rent_price: string;
  rent_period_days: number;
  rental_status: string;
  is_for_rent: boolean;
  owner: string;
  tenant_wallet: string;
  rent_due_at: string;
  grace_until: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
  };
  username?: string;
}

interface RentedBuildingsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const RentedBuildingsModal: React.FC<RentedBuildingsModalProps> = ({ isOpen, onRequestClose }) => {
  const { accountAddress, onRent } = useMetaMask();
  const [rentedProperties, setRentedProperties] = useState<RentedProperty[]>([]);

  // Initialize rentedProperties as empty array on mount
  useEffect(() => {
    setRentedProperties([]);
  }, []);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch rented properties when modal opens
  useEffect(() => {
    if (isOpen && accountAddress) {
      fetchRentedProperties();
    }
  }, [isOpen, accountAddress]);

  const fetchRentedProperties = async () => {
    if (!accountAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      const response = await PropertyRepository.getTenantRentals(accountAddress);

      if (response.data && response.data.data && response.data.data.data) {
        // API returns nested data structure: response.data.data.data is the array
        setRentedProperties(response.data.data.data);
      } else {
        setRentedProperties([]);
      }
    } catch (error) {
      console.error('Failed to fetch rented properties:', error);
      toast.error('Failed to load your rented properties. Please try again.');
      setRentedProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: string, chainId?: string) => {
    const priceNum = parseFloat(price);

    // Chain configurations
    const chainConfigs = {
      '97': { name: 'BSC', symbol: 'BNB', decimals: 18 },
      '56': { name: 'BSC', symbol: 'BNB', decimals: 18 },
      '80001': { name: 'Mumbai', symbol: 'MATIC', decimals: 18 },
      '137': { name: 'Polygon', symbol: 'MATIC', decimals: 18 },
      '11155111': { name: 'Sepolia', symbol: 'ETH', decimals: 18 },
      '1': { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    };

    const config = chainId ? chainConfigs[chainId] || { name: 'Unknown', symbol: 'ETH', decimals: 18 } : { name: 'Unknown', symbol: 'ETH', decimals: 18 };

    // Convert from wei to readable format
    const value = priceNum / Math.pow(10, config.decimals);

    // Format with appropriate decimal places
    let decimalPlaces = 4;
    if (value >= 1) {
      decimalPlaces = 2;
    } else if (value >= 0.1) {
      decimalPlaces = 3;
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

  const getTimeRemaining = (rentDueAt: string) => {
    if (!rentDueAt) return 'Unknown';

    const dueDate = new Date(parseInt(rentDueAt) * 1000);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Overdue';
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} days, ${diffHours} hours`;
    } else if (diffHours > 0) {
      return `${diffHours} hours, ${diffMinutes} minutes`;
    } else {
      return `${diffMinutes} minutes`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50'; // Green
      case 'late':
        return '#FF9800'; // Orange
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active Rental';
      case 'late':
        return 'Payment Overdue';
      default:
        return status;
    }
  };

  const handlePayRent = async (property: RentedProperty) => {
    if (!accountAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // 1) Trigger MetaMask native payment to owner for total rent amount
      await new Promise<void>((resolve, reject) => {
        onRent(
          {
            price: property.rent_price,
            chainId: property.chain_id,
            owner: property.owner,
          },
          (success: boolean) => {
            if (success) resolve();
            else reject(new Error('Payment failed'));
          },
        );
      });

      // 2) Notify backend to extend due date by one period (default server logic)
      const response = await PropertyRepository.payRent(property.token_id.toString());
      if (response.data) {
        toast.success('Rent paid successfully');
        await fetchRentedProperties();
      } else {
        toast.error('Failed to update rent status');
      }
    } catch (error) {
      console.error('Failed to pay rent:', error);
      toast.error('Failed to pay rent. Please try again.');
    }
  };

  return (
    <Modal
      className="rented-buildings-modal"
      overlayClassName="rented-buildings-modal-overlay"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      ariaHideApp={false}
    >
      <div className="rented-buildings-header">
        <h2>My Rented Buildings</h2>
        <button className="rented-buildings-close-button" onClick={onRequestClose}>
          ×
        </button>
      </div>

      <div className="rented-buildings-content">
        {!accountAddress ? (
          <div className="rented-buildings-connect">
            <p>Please connect your wallet to view your rented buildings</p>
          </div>
        ) : (
          <div className="rented-buildings-connected">
            <div className="rented-buildings-wallet-info">
              <p>
                <strong>Wallet:</strong>{' '}
                {accountAddress.substring(0, 6)}...{accountAddress.substring(accountAddress.length - 4)}
              </p>
            </div>

            {isLoading ? (
              <div className="rented-buildings-loading">
                <div className="rented-buildings-spinner"></div>
                <p>Loading your rented buildings...</p>
              </div>
            ) : !Array.isArray(rentedProperties) || rentedProperties.length === 0 ? (
              <div className="rented-buildings-empty">
                <p>You haven&apos;t rented any buildings yet.</p>
                <p>Visit the House Store to rent your first building!</p>
                <button
                  className="rented-buildings-refresh-button"
                  onClick={fetchRentedProperties}
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div className="rented-buildings-listings">
                <div className="rented-buildings-summary">
                  <h3>Rental Summary</h3>
                  <p>You have <strong>{Array.isArray(rentedProperties) ? rentedProperties.length : 0}</strong> rented building{Array.isArray(rentedProperties) && rentedProperties.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="rented-buildings-grid">
                  {Array.isArray(rentedProperties) && rentedProperties.map((property) => (
                    <div key={property.id} className="rented-buildings-item">
                      <div className="rented-buildings-card">
                        <div className="rented-buildings-image">
                          {property.metadata?.image ? (
                            <img
                              src={property.metadata.image}
                              alt={`Property ${property.token_id}`}
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/200x150?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="rented-buildings-no-image">
                              <span>Property {property.token_id}</span>
                            </div>
                          )}
                        </div>

                        <div className="rented-buildings-info">
                          <h4>Property #{property.token_id}</h4>

                          <div className="rented-buildings-status">
                            <span
                              className="status-indicator"
                              style={{ backgroundColor: getStatusColor(property.rental_status) }}
                            >
                              {getStatusText(property.rental_status)}
                            </span>
                          </div>

                          <div className="rented-buildings-details">
                            <p>
                              <strong>Owner:</strong> {property.username || 'Unknown'}
                            </p>
                            <p>
                              <strong>Total Rent:</strong> {formatPrice(property.rent_price, property.chain_id)}
                            </p>
                            <p>
                              <strong>Time Remaining:</strong> {getTimeRemaining(property.rent_due_at)}
                            </p>
                            <p>
                              <strong>Network:</strong> {getChainName(property.chain_id)}
                            </p>
                          </div>

                          {property.rental_status === 'late' && (
                            <div className="rented-buildings-warning">
                              ⚠️ Your rental payment is overdue. Please pay rent to avoid eviction.
                            </div>
                          )}

                          {property.rental_status === 'late' && (
                            <div className="rented-buildings-actions" style={{ marginTop: '12px' }}>
                              <button
                                className="rented-buildings-refresh-button"
                                onClick={() => handlePayRent(property)}
                              >
                                Pay Rent
                              </button>
                            </div>
                          )}
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

export default RentedBuildingsModal;
