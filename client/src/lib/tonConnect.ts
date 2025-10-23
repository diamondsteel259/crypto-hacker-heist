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
    console.log('[TON Balance] No address provided');
    return '0.0000';
  }

  console.log(`[TON Balance] Fetching balance for address: ${address}`);

  try {
    // Try TON Center API v3 first (more reliable)
    try {
      const v3Response = await fetch(
        `https://toncenter.com/api/v3/account?address=${address}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      console.log(`[TON Balance] API v3 response status: ${v3Response.status}`);
      
      if (v3Response.ok) {
        const v3Data = await v3Response.json();
        console.log('[TON Balance] API v3 data:', JSON.stringify(v3Data).substring(0, 200));
        
        if (v3Data && v3Data.balance !== undefined) {
          // v3 API returns balance in nanoTON as a string
          const balanceInTON = (parseInt(v3Data.balance) / 1000000000).toFixed(4);
          console.log(`[TON Balance] ✅ Success (v3): ${balanceInTON} TON`);
          return balanceInTON;
        }
      } else {
        console.warn(`[TON Balance] API v3 returned non-OK status: ${v3Response.status}`);
      }
    } catch (v3Error) {
      console.warn('[TON Balance] API v3 failed, trying v2:', v3Error);
    }

    // Fallback to TON Center API v2
    const v2Response = await fetch(
      `https://toncenter.com/api/v2/getAddressBalance?address=${address}`
    );

    console.log(`[TON Balance] API v2 response status: ${v2Response.status}`);

    if (v2Response.ok) {
      const v2Data = await v2Response.json();
      console.log('[TON Balance] API v2 data:', JSON.stringify(v2Data).substring(0, 200));

      if (v2Data.ok && v2Data.result) {
        const balanceInTON = (parseInt(v2Data.result) / 1000000000).toFixed(4);
        console.log(`[TON Balance] ✅ Success (v2): ${balanceInTON} TON`);
        return balanceInTON;
      }
    }

    console.error('[TON Balance] Both API v3 and v2 failed to return valid data');
    return '0.0000';
  } catch (error) {
    console.error('[TON Balance] Fatal error fetching balance:', error);
    return '0.0000';
  }
}
