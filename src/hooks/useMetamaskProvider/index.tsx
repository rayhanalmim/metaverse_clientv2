import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import auth from 'src/api/auth';
import { toast } from 'react-toastify';
import token, { tokenMumbai } from 'src/api/token';
import { setNetworkId, useAuth } from '../useAuth';
import { BigNumber, ethers } from 'ethers';
import {
  BNB_CHAIN_ID,
  DEEP_LINK,
  MUMBAI_CHAIN_ID,
  NFT_CONTRACT_MARKET,
  NFT_ETH_CONTRACT_MARKET,
  NFT_ETH_OVE,
  NFT_OVE,
} from 'src/config';
import CMCCoin from 'src/data/CMCcoin.json';
import Market from 'src/data/Marketplace.json';
import property from 'src/api/property';
import { isMobile } from 'react-device-detect';
import login from 'src/api/login';
import { binanceParams, msgMap, mumbaiParams } from 'src/constant/constant';
import { IStoreItemData } from '../../interfaces/property';

declare global {
  interface Window {
    ethereum: any;
  }
}

type TMetamaskContext = {
  connectWallet: () => Promise<void>;
  accountAddress: string;
  getBalance: (account: string, chain: string | number) => Promise<void>;
  accountBalance: string;
  chainID: number;
  formatPrice: (price: string) => string;
  comparePrice: (price: string) => boolean;
  onApprove: (item: Partial<IStoreItemData>) => Promise<void>;
  onBuy: (item: Partial<IStoreItemData>, cb: (item: IStoreItemData) => void) => Promise<void>;
  onRent: (rentalData: any, cb: (data: any) => void) => Promise<void>;
  isLoading: boolean;
  handleDisconnect: () => void;
  switchNetwork: (chain: string) => void;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const MetamaskContext = createContext<TMetamaskContext>();

let userActive;

export const MetaMaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const { user, getUser, resetNFT } = useAuth();
  const [chainID, setChainId] = useState<number | null>(null);
  const [allowanceNum, setAllowanceNum] = useState<Partial<BigNumber>>(null);
  const [originBalance, setOriginBalance] = useState<Partial<BigNumber>>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { ethereum } = window;

  const _gasLimit = {
    approveOVE: '0x10f42', // 33358 in dec
    approveNFT: '0x10f42', // 69442 in dec
    buy: '0x32323', // 205603 in dec
  };

  const detectMetamask = () => {
    if (!ethereum) return;
    const provider = new ethers.providers.Web3Provider(ethereum);

    const signer = provider.getSigner();

    const getBalance = async (account: string, chain) => {
      if (!account) return;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (`${chain}` === BNB_CHAIN_ID) {
        const res = await token.getAccountToken(account);
        setOriginBalance(ethers.BigNumber.from(res.data.result));
        const ove = ethers.utils.formatUnits(ethers.BigNumber.from(res.data.result), 18);
        setAccountBalance(ove);
        return;
      }
      const res = await tokenMumbai.getAccountToken(account);
      setOriginBalance(ethers.BigNumber.from(res.data.result));
      const ove = ethers.utils.formatUnits(ethers.BigNumber.from(res.data.result), 18);
      setAccountBalance(ove);
    };

    const checkConnected = async () => {
      if (!user || !user.wallet_address) {
        setAccountAddress('');
        setIsConnected(false);
        setAccountBalance('');
        setNetworkId(`${BNB_CHAIN_ID}`);
        return;
      }
      const [account] = await ethereum.request({ method: 'eth_accounts' });
      if (account && user.wallet_address.toLowerCase() === account.toLowerCase()) {
        setAccountAddress(account);
        setIsConnected(true);
        const { chainId } = await provider.getNetwork();
        setChainId(chainId);
        setNetworkId(chainId);
        getBalance(account, chainId);
        allow(account);
        console.log(`You're connected to: ${account}, ${chainId}`);
      } else {
        setAccountAddress('');
        setIsConnected(false);
        setAccountBalance('');
        setNetworkId(BNB_CHAIN_ID);
        console.log('Metamask is not connected');
      }
    };

    const handleAccountChange = () => {
      ethereum.on('accountsChanged', async function (accounts) {
        const network = await provider.getNetwork();
        if (
          accounts[0] &&
          userActive &&
          userActive.wallet_address &&
          userActive.wallet_address.toLowerCase() !== accounts[0].toLowerCase()
        ) {
          alert(
            'Wallet address has changed. To not affect the process, please leave the room and reload the page.',
          );
        }
        if (accounts && accounts[0] && user && user.wallet_address) {
          if (user.wallet_address.toLowerCase() !== accounts[0].toLowerCase()) {
            await signedAccount(accounts[0]);
            setAccountAddress(accounts[0]);
            setIsConnected(true);
            getBalance(accounts[0], network.chainId);
            allow(accounts[0]);
            setNetworkId(network.chainId);
          }
        } else {
          if (!accounts[0]) {
            console.warn('not connected: ', isConnected);
          }
          setAccountAddress('');
          setIsConnected(false);
          setAccountBalance('');
          setNetworkId(BNB_CHAIN_ID);
        }
      });
    };

    const listenNetworkChange = () => {
      ethereum.on('chainChanged', async (chain) => {
        setChainId(parseInt(chain, 16));
        const [account] = await ethereum.request({ method: 'eth_accounts' });
        getBalance(account, parseInt(chain, 16));
      });
    };

    const marketContract = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      `${chainID}` === MUMBAI_CHAIN_ID ? NFT_ETH_CONTRACT_MARKET : NFT_CONTRACT_MARKET,
      Market.abi,
      provider,
    );
    const oveContract = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      `${chainID}` === MUMBAI_CHAIN_ID ? NFT_ETH_OVE : NFT_OVE,
      CMCCoin.abi,
      provider,
    );

    const allow = async (address) => {
      const num = await oveContract.allowance(
        address,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        `${chainID}` === MUMBAI_CHAIN_ID ? NFT_ETH_CONTRACT_MARKET : NFT_CONTRACT_MARKET,
      );
      setAllowanceNum(num);
    };

    const comparePrice = (nftPrice) => {
      if (!allowanceNum || !ethereum) return true;
      return allowanceNum.lt(ethers.BigNumber.from(nftPrice));
    };

    return {
      listenNetworkChange,
      handleAccountChange,
      checkConnected,
      getBalance,
      comparePrice,
      allow,
      marketContract,
      oveContract,
      signer,
      provider,
    };
  };

  const metamask = detectMetamask();

  const connectWalletMobile = async () => {
    window.open(DEEP_LINK);
    location.reload();
  };

  const connectWallet = async () => {
    if (isMobile && !ethereum) {
      connectWalletMobile();
      return;
    }
    try {
      if (!ethereum) {
        window.open('https://metamask.io/download/', '_blank');
      }
      if (!isConnected) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const [account] = await ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccountAddress(account);
        setIsConnected(true);
        await signedAccount(account);
        return;
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  const signedAccount = async (account) => {
    const epochTime = new Date().getTime();
    const message = `Welcome to Samurai Metaverse! 
    Click SIGN to link wallet with your account. 
    This request will not trigger a blockchain transaction or cost any gas fees. 
    Wallet address: ${account.toLowerCase()} 
    Nonce: ${epochTime}`;
    try {
      const signedData = await ethereum.request({
        method: 'personal_sign',
        params: [account, message],
      });
      const network = await metamask?.provider.getNetwork();
      await handleLinkToWallet(message, signedData);
      getUser();
      metamask?.getBalance(account, network.chainId);
      metamask?.allow(account);
      toast('Successfully Link To Wallet');
    } catch (e) {
      e?.response?.data?.message && toast(e.response.data.message, { type: 'error' });
      setAccountAddress('');
      setIsConnected(false);
      setAccountBalance('');
    }
  };

  const handleLinkToWallet = async (message, signedData) => {
    await auth.linkToWallet(message, signedData);
  };

  const handleDisconnect = () => {
    if (!ethereum) return;
    ethereum.on('accountsChanged', async (accounts) => {
      if (
        !accounts[0] ||
        accounts[0].toLowerCase() !== (user?.wallet_address || '').toLowerCase()
      ) {
        await login.disconnectWallet();
        getUser();
        resetNFT();
      }
    });
  };

  useEffect(() => {
    userActive = user;
    if (!ethereum || !user || !user.wallet_address) return;
    metamask?.checkConnected();
  }, [user]);

  useEffect(() => {
    if (!ethereum) return;
    metamask?.handleAccountChange();
    metamask?.listenNetworkChange();
  }, []);

  const formatPrice = (price: string) => {
    return ethers.utils.formatUnits(ethers.BigNumber.from(price), 18);
  };

  const switchNetwork = async (chain) => {
    if (chain) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexValue(+chain) }],
        });
        setNetworkId(chain);
      } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: chain === BNB_CHAIN_ID ? binanceParams : mumbaiParams,
          });
        }
      }
    }
  };

  const switchChainId = async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (![MUMBAI_CHAIN_ID, BNB_CHAIN_ID].includes(`${chainID}`)) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexValue(+BNB_CHAIN_ID) }],
        });
      } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: binanceParams,
          });
        }
      }
    }
  };

  const onApprove = async (item) => {
    setIsLoading(true);
    try {
      if (!accountAddress) {
        await connectWallet();
        setIsLoading(false);
        return;
      }
      await switchChainId();
      const _nonce = await metamask?.provider.getTransactionCount(accountAddress);
      const _gasPrice = await metamask?.provider.getGasPrice();
      const approveTx = await metamask.oveContract.connect(metamask.signer).approve(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        `${chainID}` === MUMBAI_CHAIN_ID ? NFT_ETH_CONTRACT_MARKET : NFT_CONTRACT_MARKET,
        ethers.constants.MaxUint256,
        {
          nonce: _nonce,
          gasPrice: _gasPrice,
          gasLimit: _gasLimit.approveOVE,
        },
      );
      await approveTx.wait(1);
      await metamask.allow(accountAddress);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const onBuy = async (item, cb) => {
    toast.dismiss();
    setIsLoading(true);
    if (!accountAddress) {
      await connectWallet();
      setIsLoading(false);
      return;
    }
    const _nonce = await metamask?.provider.getTransactionCount(accountAddress);
    const _gasPrice = await metamask?.provider.getGasPrice();
    await switchChainId();
    const { data } = await property.checkListing(item.id);
    if (!data.data.check) {
      toast('Item Purchase Failed', { type: 'error' });
      setIsLoading(false);
      return;
    }
    try {
      const _beforeBuy = await metamask.marketContract.connect(metamask.signer).callStatic.buy(
        item.listing_id,
        accountAddress,
        1,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        `${chainID}` === MUMBAI_CHAIN_ID ? NFT_ETH_OVE : NFT_OVE,
        item.price,
      );
      const tx = await metamask.marketContract.connect(metamask.signer).buy(
        item.listing_id,
        accountAddress,
        1,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        `${chainID}` === MUMBAI_CHAIN_ID ? NFT_ETH_OVE : NFT_OVE,
        item.price,
        {
          nonce: _nonce,
          gasPrice: _gasPrice,
          gasLimit: _gasLimit.buy,
        },
      );
      const { provider } = metamask;
      if (provider) {
        await tx.wait();
        const txReceipt = await provider.getTransactionReceipt(tx.hash);
        const { status } = txReceipt;
        if (status === 1) {
          toast('Successfully Purchase');
          cb(item);
        } else {
          toast('Item Purchase Failed', { type: 'error' });
        }
        setIsLoading(false);
      }
    } catch (e) {
      if (!e.reason) {
        toast('Item Purchase Failed', { type: 'error' });
      } else {
        toast(msgMap[e.reason], { type: 'error' });
      }
      setIsLoading(false);
    }
  };

  const onRent = async (rentalData, cb) => {
    console.log('[MetaMaskProvider] onRent called with:', rentalData);
    try {
      if (!accountAddress) {
        await connectWallet();
        return;
      }

      // Switch to correct network based on rental data chainId
      const targetChainId = rentalData.chainId === '97' ? parseInt(BNB_CHAIN_ID) : parseInt(MUMBAI_CHAIN_ID);
      if (chainID !== targetChainId) {
        await switchNetwork(targetChainId.toString());
      }

      // Send native currency (e.g., BNB on BSC) directly to the property owner via MetaMask
      const valueHex = ethers.BigNumber.from(rentalData.price).toHexString();
      console.log('[MetaMaskProvider] Sending transaction:', {
        from: accountAddress,
        to: rentalData.owner,
        value: valueHex,
      });
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accountAddress,
            to: rentalData.owner,
            value: valueHex,
          },
        ],
      });
      console.log('[MetaMaskProvider] txHash:', txHash);

      // Wait for confirmation
      const receipt = await metamask.provider.waitForTransaction(txHash, 1);
      console.log('[MetaMaskProvider] receipt:', receipt);
      cb(receipt?.status === 1);
    } catch (e) {
      console.error('Rental payment error:', e);
      cb(false);
    }
  };

  const value = useMemo(() => {
    return {
      connectWallet,
      accountAddress,
      getBalance: metamask?.getBalance,
      accountBalance,
      chainID,
      formatPrice,
      comparePrice:
        metamask?.comparePrice ||
        function comparePrice(val) {
          return true;
        },
      onApprove,
      onBuy,
      onRent,
      isLoading,
      handleDisconnect,
      switchNetwork,
    };
  }, [chainID, accountAddress, accountBalance, isLoading]);

  return <MetamaskContext.Provider value={value}>{children}</MetamaskContext.Provider>;
};

export const useMetaMask = () => {
  return useContext(MetamaskContext);
};
