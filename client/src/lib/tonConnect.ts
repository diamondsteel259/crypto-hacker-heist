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
    // Use the raw address from the account
    const address = ui.account.address;
    console.log('Fetching TON balance for address:', address);
    
    // Get balance from TON network using v2 API (more stable)
    const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`);
    const data = await response.json();
    
    console.log('TON balance API response:', data);
    
    if (data.ok && data.result) {
      // Convert from nanoTON to TON
      const balanceInTON = (parseInt(data.result) / 1000000000).toFixed(4);
      console.log('TON balance:', balanceInTON);
      return balanceInTON;
    } else {
      console.warn('TON balance API returned non-ok result:', data);
      // Return 0 instead of throwing error to prevent UI breaks
      return '0.0000';
    }
  } catch (error) {
    console.error('Error fetching TON balance:', error);
    // Return 0 instead of throwing to prevent UI crashes
    return '0.0000';
  }
}

export async function sendTonTransaction(to: string, amount: string, comment?: string) {
  const ui = getTonConnectUI();
  if (!ui.account) {
    throw new Error('Wallet not connected');
  }

  const transaction = {
    address: to,
    amount: (amount * 1000000000).toString(), // Convert TON to nanoTON
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
