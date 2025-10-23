import { useTonConnectUI, useTonAddress, useTonWallet } from '@tonconnect/ui-react';

export const manifestUrl = 'https://crypto-hacker-heist.onrender.com/tonconnect-manifest.json';

// These are now HOOKS that must be used in React components
// DO NOT call these outside of React components!

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const wallet = useTonWallet();

  const isConnected = !!wallet;

  return {
    tonConnectUI,
    wallet,
    userFriendlyAddress,
    isConnected,
  };
}

// Helper function to send TON transaction
// This should only be called from within a component that has useTonConnect
export async function sendTonTransaction(
  tonConnectUI: any,
  to: string,
  amount: string,
  comment?: string
): Promise<string> {
  if (!tonConnectUI.wallet) {
    throw new Error('Wallet not connected');
  }

  const message: any = {
    address: to,
    amount: (parseFloat(amount) * 1000000000).toString(), // Convert TON to nanoTON
  };

  // Note: TonConnect SDK validates payload format strictly.
  // For simple transfers, payload field should be omitted.
  // Comments are not essential for our use case since we track via transaction hash.

  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
    messages: [message],
  };

  try {
    const result = await tonConnectUI.sendTransaction(transaction);
    return result.boc;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// Helper to get TON balance
export async function getTonBalance(address: string): Promise<string> {
  if (!address) {
    return '0.0000';
  }

  try {
    // Use TON Center API v2
    const response = await fetch(
      `https://toncenter.com/api/v2/getAddressBalance?address=${address}`
    );
    const data = await response.json();

    if (data.ok && data.result) {
      // Convert from nanoTON to TON
      const balanceInTON = (parseInt(data.result) / 1000000000).toFixed(4);
      return balanceInTON;
    }

    return '0.0000';
  } catch (error) {
    console.error('Error fetching TON balance:', error);
    return '0.0000';
  }
}
