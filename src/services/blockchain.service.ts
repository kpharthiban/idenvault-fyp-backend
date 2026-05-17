import { ethers } from 'ethers';
import { env } from '../config/env';
import { contracts } from '../config/contracts';

// Read-only provider — no private key needed
const provider = new ethers.JsonRpcProvider(env.INFURA_URL);

const issuerRegistry = new ethers.Contract(
  contracts.issuerRegistry.address,
  contracts.issuerRegistry.abi,
  provider
);

const credentialAnchor = new ethers.Contract(
  contracts.credentialAnchor.address,
  contracts.credentialAnchor.abi,
  provider
);

export const blockchainService = {
  async isIssuerTrusted(wallet: string): Promise<boolean> {
    return await issuerRegistry.isIssuerTrusted(wallet);
  },

  async getCredentialOnChain(refId: string, storedDataHash: string) {
    try {
      // Read from the public mapping getter — credentials(refId)
      const result = await credentialAnchor.credentials(refId);
      // result = [dataHash (bytes32), issuer (address), issuedAt (uint256), revoked (bool)]
      const [onChainHash, issuer, issuedAt, revoked] = result;

      const exists = BigInt(issuedAt) > 0n;
      const valid = exists && onChainHash === storedDataHash;

      return { valid, revoked, issuer };
    } catch {
      return { valid: false, revoked: false, issuer: '' };
    }
  }
};