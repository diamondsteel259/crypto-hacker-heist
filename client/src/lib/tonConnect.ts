import { TonConnectUI } from '@tonconnect/ui-react';

export const manifestUrl = 'https://crypto-hacker-heist.onrender.com/tonconnect-manifest.json';

let tonConnectUI: TonConnectUI | null = null;

export function getTonConnectUI(): TonConnectUI {
  if (!tonConnectUI) {
    tonConnectUI = new TonConnectUI({
      manifestUrl,
      buttonRootId: null,
    });
  }
  return tonConnectUI;
}

export async function connectWallet() {
  const ui = getTonConnectUI();
  return await ui.connectWallet();
}

export async function disconnectWallet() {
  const ui = getTonConnectUI();
  return await ui.disconnect();
}

export function getWalletInfo() {
  const ui = getTonConnectUI();
  return ui.wallet;
}

export function isWalletConnected() {
  const ui = getTonConnectUI();
  return ui.connected;
}
