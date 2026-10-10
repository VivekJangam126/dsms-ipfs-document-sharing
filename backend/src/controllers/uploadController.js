import { db } from '../index.js';
import { uploadToPinata, getIPFSUrl } from '../utils/ipfsClient.js';

/**
 * Upload document to IPFS and save metadata to Firestore
 */
export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype, size } = req.file;
    const { description, tags } = req.body;

    // Upload to IPFS
    const ipfsResult = await uploadToPinata(buffer, originalname);

    // Save metadata to Firestore
    const docRef = db.collection('documents').doc();
    const documentData = {
      id: docRef.id,
      fileName: originalname,
      ipfsHash: ipfsResult.ipfsHash,
      ipfsUrl: getIPFSUrl(ipfsResult.ipfsHash),
      mimeType: mimetype,
      size: size,
      description: description || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      owner: {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name,
      },
      uploadedAt: new Date().toISOString(),
      sharedWith: [],
    };

    await docRef.set(documentData);

    // Log the upload
    await db.collection('logs').add({
      action: 'upload',
      documentId: docRef.id,
      fileName: originalname,
      user: req.user.email,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Document uploaded successfully',
      document: documentData,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
}
