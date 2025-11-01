import { ethers } from 'ethers';

// Event names
export const WALLET_EVENTS = {
  CONNECTED: 'wallet_connected',
  DISCONNECTED: 'wallet_disconnected',
  CHAIN_CHANGED: 'chain_changed',
  ACCOUNT_CHANGED: 'account_changed'
};

class WalletService {
  private static instance: WalletService;
  private _isConnected = false;
  private _accountAddress: string | null = null;
  private _chainId: number | null = null;
  private _eventTarget: EventTarget;

  private constructor() {
    this._eventTarget = new EventTarget();
    this.setupEventListeners();
    this.checkConnection();
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  private setupEventListeners() {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this._accountAddress = null;
          this._isConnected = false;
          this.dispatchEvent(WALLET_EVENTS.DISCONNECTED, { detail: { reason: 'accountsChanged' } });
        } else {
          const oldAccount = this._accountAddress;
          this._accountAddress = accounts[0];
          this._isConnected = true;
          this.dispatchEvent(WALLET_EVENTS.ACCOUNT_CHANGED, { 
            detail: { 
              oldAccount, 
              newAccount: accounts[0] 
            } 
          });
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        const oldChainId = this._chainId;
        this._chainId = parseInt(chainIdHex, 16);
        this.dispatchEvent(WALLET_EVENTS.CHAIN_CHANGED, { 
          detail: { 
            oldChainId, 
            newChainId: this._chainId 
          } 
        });
      });
    }
  }

  private async checkConnection() {
    if (!window.ethereum) return;

    try {
      // Check if already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        this._accountAddress = accounts[0];
        this._isConnected = true;
      }

      // Get current chain ID
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      this._chainId = parseInt(chainIdHex, 16);
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }

  // Connect wallet
  public async connectWallet(): Promise<string | null> {
    if (!window.ethereum) {
      console.error('MetaMask is not installed');
      return null;
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        this._accountAddress = accounts[0];
        this._isConnected = true;
        this.dispatchEvent(WALLET_EVENTS.CONNECTED, { detail: { account: accounts[0] } });
        return accounts[0];
      }
      return null;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  }

  // Disconnect wallet - MetaMask doesn't have a disconnect method,
  // but we can track disconnection in our app
  public disconnectWallet() {
    this._isConnected = false;
    this._accountAddress = null;
    this.dispatchEvent(WALLET_EVENTS.DISCONNECTED, { detail: { reason: 'manual' } });
  }

  // Switch network
  public async switchNetwork(targetChainId: number): Promise<boolean> {
    if (!window.ethereum || !this._isConnected) return false;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(targetChainId) }],
      });
      return true;
    } catch (err: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        try {
          // BSC Testnet
          if (targetChainId === 97) {
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
            return true;
          }
          // Mumbai Testnet
          else if (targetChainId === 80001) {
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
                    'https://polygon-mumbai.g.alchemy.com/v2/demo'
                  ],
                  blockExplorerUrls: ['https://mumbai.polygonscan.com']
                }
              ]
            });
            return true;
          }
          return false;
        } catch (addError) {
          console.error('Error adding chain to MetaMask:', addError);
          return false;
        }
      }
      console.error('Error switching chain:', err);
      return false;
    }
  }

  // Event handling
  public addEventListener(eventName: string, callback: EventListener) {
    this._eventTarget.addEventListener(eventName, callback);
  }

  public removeEventListener(eventName: string, callback: EventListener) {
    this._eventTarget.removeEventListener(eventName, callback);
  }

  private dispatchEvent(eventName: string, eventData?: CustomEventInit) {
    const event = new CustomEvent(eventName, eventData);
    this._eventTarget.dispatchEvent(event);
  }

  // Getters
  get isConnected(): boolean {
    return this._isConnected;
  }

  get accountAddress(): string | null {
    return this._accountAddress;
  }

  get chainId(): number | null {
    return this._chainId;
  }

  // Check if on a specific network
  public isOnNetwork(networkId: number): boolean {
    return this._chainId === networkId;
  }
}

export default WalletService.getInstance(); 