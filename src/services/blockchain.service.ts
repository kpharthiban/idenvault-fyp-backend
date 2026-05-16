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

  async verifyCredential(refId: string, dataHash: string) {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(dataHash));
    const [valid, revoked, issuer] = await credentialAnchor.verifyCredential(refId, hash);
    return { valid, revoked, issuer };
  }
};