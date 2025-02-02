import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { FortmaticConnector } from "@web3-react/fortmatic-connector";
import { PortisConnector } from "@web3-react/portis-connector";
import { NetworkConnector } from "@web3-react/network-connector";

const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  1: process.env.NEXT_PUBLIC_PROVIDER || 'https://eth.llamarpc.com',
  4: "https://rinkeby.infura.io/v3/bd80ce1ca1f94da48e151bb6868bb150"
};

export const network = new NetworkConnector({ urls: { 1: RPC_URLS[1] } });

export const injected = new InjectedConnector({
  supportedChainIds: [1]
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: "Fixed Forex"
});

export const fortmatic = new FortmaticConnector({
  apiKey: "pk_live_F95FEECB1BE324B5",
  chainId: 1
});

export const portis = new PortisConnector({
  dAppId: "5dea304b-33ed-48bd-8f00-0076a2546b60",
  networks: [1, 100]
});
