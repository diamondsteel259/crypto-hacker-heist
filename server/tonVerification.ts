/**
 * TON Blockchain Transaction Verification Service
 *
 * Verifies transactions on the TON blockchain using TON Center API v3
 */

interface TONTransaction {
  hash: string;
  from: string;
  to: string;
  value: string; // in nanotons
  timestamp: number;
}

interface VerificationResult {
  verified: boolean;
  error?: string;
  transaction?: TONTransaction;
}

/**
 * Verify a TON transaction on the blockchain using v3 API
 *
 * @param txHash - Transaction hash (BOC or hash string)
 * @param expectedAmount - Expected amount in TON (e.g., 0.5, 2.0)
 * @param recipientAddress - Game's wallet address that should receive payment
 * @param senderAddress - User's wallet address (optional, for additional verification)
 * @returns VerificationResult
 */
export async function verifyTONTransaction(
  txHash: string,
  expectedAmount: number,
  recipientAddress: string,
  senderAddress?: string
): Promise<VerificationResult> {
  try {
    // Get TON Center API key from environment
    const apiKey = process.env.TON_API_KEY;
    
    // Use v3 API endpoint for getting transactions
    const baseUrl = 'https://toncenter.com/api/v3';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    // Fetch transactions for the recipient address using v3 API
    const url = `${baseUrl}/transactions?account=${recipientAddress}&limit=100&sort=desc`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('TON API response not OK:', response.status, response.statusText);
      return {
        verified: false,
        error: 'Failed to connect to TON blockchain API',
      };
    }

    const data = await response.json();

    if (!data.transactions || !Array.isArray(data.transactions)) {
      console.error('Invalid TON API response structure:', data);
      return {
        verified: false,
        error: 'Invalid response from TON blockchain API',
      };
    }

    // Convert expected amount to nanotons (1 TON = 1,000,000,000 nanotons)
    const expectedNanotons = BigInt(Math.floor(expectedAmount * 1e9));
    const tolerance = BigInt(1e6); // 0.001 TON tolerance for rounding/fees

    // Search for matching transaction in v3 format
    for (const tx of data.transactions) {
      // v3 API structure: transaction has hash, in_msg, out_msgs
      const txHashMatch = tx.hash === txHash || tx.transaction_id === txHash;
      
      if (!txHashMatch) continue;

      // Check incoming message (in_msg)
      const inMsg = tx.in_msg;
      if (!inMsg) continue;

      const fromAddress = inMsg.source;
      const toAddress = inMsg.destination;
      const value = BigInt(inMsg.value || '0');

      // Verify recipient address matches
      if (toAddress !== recipientAddress) {
        console.log(`Address mismatch: expected ${recipientAddress}, got ${toAddress}`);
        continue;
      }

      // Verify sender if provided
      if (senderAddress && fromAddress !== senderAddress) {
        console.log(`Sender mismatch: expected ${senderAddress}, got ${fromAddress}`);
        continue;
      }

      // Verify amount (with tolerance for fees)
      const amountDiff = value > expectedNanotons
        ? value - expectedNanotons
        : expectedNanotons - value;

      if (amountDiff > tolerance) {
        console.log(`Amount mismatch: expected ${expectedAmount} TON (${expectedNanotons}), got ${Number(value) / 1e9} TON (${value})`);
        return {
          verified: false,
          error: `Amount mismatch: expected ${expectedAmount} TON, received ${Number(value) / 1e9} TON`,
        };
      }

      // Transaction verified successfully!
      console.log('✅ TON transaction verified:', {
        hash: tx.hash,
        from: fromAddress,
        to: toAddress,
        amount: `${Number(value) / 1e9} TON`,
      });

      return {
        verified: true,
        transaction: {
          hash: tx.hash,
          from: fromAddress,
          to: toAddress,
          value: value.toString(),
          timestamp: tx.utime || Math.floor(Date.now() / 1000),
        },
      };
    }

    // Transaction not found
    console.log(`Transaction ${txHash} not found in recent transactions`);
    return {
      verified: false,
      error: 'Transaction not found on blockchain. It may still be processing or the hash is incorrect.',
    };

  } catch (error: any) {
    console.error('TON verification error:', error);
    return {
      verified: false,
      error: `Verification service error: ${error.message}`,
    };
  }
}

/**
 * Alternative: Direct transaction lookup by hash using v3 API
 * More efficient if you have the exact transaction hash
 */
export async function verifyTONTransactionByHash(
  txHash: string,
  expectedAmount: number,
  recipientAddress: string
): Promise<VerificationResult> {
  try {
    const apiKey = process.env.TON_API_KEY;
    const baseUrl = 'https://toncenter.com/api/v3';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    // Direct transaction lookup by hash
    const url = `${baseUrl}/transactionsByMasterchainBlock?workchain=0&seqno=0&include_msg_body=false`;
    
    // For now, fallback to account-based lookup
    // v3 API requires more specific transaction lookup parameters
    return await verifyTONTransaction(txHash, expectedAmount, recipientAddress);
    
  } catch (error: any) {
    return {
      verified: false,
      error: error.message,
    };
  }
}

/**
 * Get the game's TON wallet address from environment
 */
export function getGameWalletAddress(): string {
  const address = process.env.GAME_TON_WALLET_ADDRESS;

  if (!address) {
    console.warn('⚠️  GAME_TON_WALLET_ADDRESS not set in environment variables');
    // Return a test address for development
    return 'EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqIw';
  }

  return address;
}

/**
 * Validate TON address format
 */
export function isValidTONAddress(address: string): boolean {
  // TON addresses can be in different formats:
  // - User-friendly: EQ... or kQ... (base64url)
  // - Raw format: 0:hex...
  
  // User-friendly format (most common)
  if (/^[Ek]Q[A-Za-z0-9_-]{46}$/.test(address)) {
    return true;
  }
  
  // Raw format
  if (/^-?\d+:[a-fA-F0-9]{64}$/.test(address)) {
    return true;
  }
  
  return false;
}
