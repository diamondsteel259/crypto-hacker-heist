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

export async function getTonBalance(): Promise<string> {
  const ui = getTonConnectUI();
  if (!ui.account) {
    throw new Error('Wallet not connected');
  }
  
  try {
    // Get balance from TON network
    const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${ui.account.address}`);
    const data = await response.json();
    
    if (data.ok) {
      // Convert from nanoTON to TON
      const balanceInTON = (parseInt(data.result) / 1000000000).toFixed(4);
      return balanceInTON;
    } else {
      throw new Error('Failed to fetch balance');
    }
  } catch (error) {
    console.error('Error fetching TON balance:', error);
    throw new Error('Failed to fetch TON balance');
  }
}

export async function sendTonTransaction(to: string, amount: number, comment?: string) {
  const ui = getTonConnectUI();
  if (!ui.account) {
    throw new Error('Wallet not connected');
  }

  const transaction = {
    to: to,
    value: (amount * 1000000000).toString(), // Convert TON to nanoTON
    body: comment || 'Payment',
  };

  try {
    const result = await ui.sendTransaction({
      messages: [transaction],
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
    });
    
    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}
