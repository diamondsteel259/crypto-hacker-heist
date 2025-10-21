/**
 * TON Blockchain Transaction Verification Service
 *
 * Verifies transactions on the TON blockchain using TON Center API
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
 * Verify a TON transaction on the blockchain
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
    const tonCenterUrl = apiKey
      ? `https://toncenter.com/api/v2/getTransactions?address=${recipientAddress}&limit=100&api_key=${apiKey}`
      : `https://toncenter.com/api/v2/getTransactions?address=${recipientAddress}&limit=100`;

    // Fetch recent transactions for the recipient address
    const response = await fetch(tonCenterUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        verified: false,
        error: 'Failed to connect to TON blockchain API',
      };
    }

    const data = await response.json();

    if (!data.ok || !data.result) {
      return {
        verified: false,
        error: 'Invalid response from TON blockchain API',
      };
    }

    // Convert expected amount to nanotons (1 TON = 1,000,000,000 nanotons)
    const expectedNanotons = BigInt(Math.floor(expectedAmount * 1e9));
    const tolerance = BigInt(1e6); // 0.001 TON tolerance for rounding

    // Search for matching transaction
    for (const tx of data.result) {
      // Check if this transaction matches our criteria
      if (tx.transaction_id?.hash === txHash || tx.hash === txHash) {
        // Extract transaction details
        const inMsg = tx.in_msg;
        if (!inMsg) continue;

        const fromAddress = inMsg.source;
        const toAddress = inMsg.destination;
        const value = BigInt(inMsg.value || '0');

        // Verify recipient address matches
        if (toAddress !== recipientAddress) {
          continue;
        }

        // Verify sender if provided
        if (senderAddress && fromAddress !== senderAddress) {
          continue;
        }

        // Verify amount (with tolerance)
        const amountDiff = value > expectedNanotons
          ? value - expectedNanotons
          : expectedNanotons - value;

        if (amountDiff > tolerance) {
          return {
            verified: false,
            error: `Amount mismatch: expected ${expectedAmount} TON, received ${Number(value) / 1e9} TON`,
          };
        }

        // Transaction verified successfully!
        return {
          verified: true,
          transaction: {
            hash: tx.transaction_id?.hash || tx.hash,
            from: fromAddress,
            to: toAddress,
            value: value.toString(),
            timestamp: tx.utime || Date.now() / 1000,
          },
        };
      }
    }

    // Transaction not found
    return {
      verified: false,
      error: 'Transaction not found on blockchain. It may still be processing.',
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
 * Alternative verification using transaction hash lookup
 * This is a simpler approach that directly queries a specific transaction
 */
export async function verifyTONTransactionByHash(
  txHash: string,
  expectedAmount: number,
  recipientAddress: string
): Promise<VerificationResult> {
  try {
    // For now, we'll use the transaction list approach
    // In production, you might use a dedicated transaction lookup endpoint
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
  // TON addresses start with EQ (mainnet) or kQ (testnet) and are base64 encoded
  return /^[Ek]Q[A-Za-z0-9_-]{46}$/.test(address);
}
