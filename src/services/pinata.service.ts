import { PinataSDK } from 'pinata';
import { env } from '../config/env';

const pinata = new PinataSDK({
  pinataJwt: env.PINATA_JWT,
  pinataGateway: 'gateway.pinata.cloud',
});

export const pinataService = {
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const file = new File([new Uint8Array(fileBuffer)], fileName, { type: mimeType });

    const result = await pinata.upload.public.file(file);

    return result.cid; // The IPFS Content Identifier
  }
};