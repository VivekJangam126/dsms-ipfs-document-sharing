import axios from 'axios';
import FormData from 'form-data';

const PINATA_API_URL = 'https://api.pinata.cloud';

/**
 * Upload file to IPFS via Pinata
 */
export async function uploadToPinata(fileBuffer, fileName) {
  try {
    const formData = new FormData();
    formData.append('file', fileBuffer, fileName);

    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
      },
    });
    formData.append('pinataMetadata', metadata);

    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    return {
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp,
    };
  } catch (error) {
    console.error('Pinata upload error:', error.response?.data || error.message);
    throw new Error('Failed to upload to IPFS');
  }
}

/**
 * Get IPFS gateway URL
 */
export function getIPFSUrl(ipfsHash) {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}
