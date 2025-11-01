import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { useEffect, useState } from 'react';

// 1. Get projectID at https://cloud.walletconnect.com

const useWalletConnect = () => {
  const [providerClient, setProviderClient] = useState(undefined);
  const [connector, setConnector] = useState(undefined);

  const connect = async () => {
    // bridge url
    const bridge = 'https://bridge.walletconnect.org';

    // create new connector
    const cont = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });

    setConnector(cont);

    // check if already connected
    if (!cont.connected) {
      // create new session
      await cont.createSession();
    }

    // subscribe to events
    await subscribeToEvents();
  };

  const subscribeToEvents = () => {
    if (!connector) {
      return;
    }

    connector.on('session_update', async (error, payload) => {
      console.log('connector.on("session_update")');

      if (error) {
        throw error;
      }

      const { chainId, accounts } = payload.params[0];
      onSessionUpdate(accounts, chainId);
    });

    connector.on('connect', (error, payload) => {
      console.log('connector.on("connect")');

      if (error) {
        throw error;
      }

      onConnect(payload);
    });

    connector.on('disconnect', (error, payload) => {
      console.log('connector.on("disconnect")');

      if (error) {
        throw error;
      }

      // this.onDisconnect();
    });

    if (connector.connected) {
      const { chainId, accounts } = connector;
      const address = accounts[0];
      // this.setState({
      //   connected: true,
      //   chainId,
      //   accounts,
      //   address,
      // });
      onSessionUpdate(accounts, chainId);
    }

    // this.setState({connector});
  };

  const onSessionUpdate = async (accounts: string[], chainId: number) => {
    const address = accounts[0];
    console.log(chainId, accounts, address);
    // await this.getAccountAssets();
  };

  const onConnect = async (payload) => {
    const { chainId, accounts } = payload.params[0];
    const address = accounts[0];
    // await this.setState({
    //   connected: true,
    //   chainId,
    //   accounts,
    //   address,
    // });
    // this.getAccountAssets();
    console.log(address, chainId);
  };

  useEffect(() => {
    // onInitializeProviderClient();
  }, []);

  return {
    providerClient,
    connect,
  };
};

export default useWalletConnect;
