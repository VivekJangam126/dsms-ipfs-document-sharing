import { db } from '../index.js';

/**
 * Get all documents owned by the user
 */
export async function getDocuments(req, res) {
  try {
    const snapshot = await db.collection('documents')
      .where('owner.uid', '==', req.user.uid)
      .get();

    // Sort in memory to avoid composite index requirement
    const documents = snapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => b.uploadedAt - a.uploadedAt);
    
    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get documents shared with the current user
 */
export async function getSharedWithMeDocuments(req, res) {
  try {
    // Get all documents and filter in memory to avoid complex index requirements
    const snapshot = await db.collection('documents').get();
    
    const documents = snapshot.docs
      .map(doc => doc.data())
      .filter(doc => {
        // Check if user's email is in sharedWith array
        return doc.sharedWith && doc.sharedWith.some(share => share.email === req.user.email);
      })
      .sort((a, b) => b.uploadedAt - a.uploadedAt);
    
    res.json({ documents });
  } catch (error) {
    console.error('Get shared documents error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get document by ID
 */
export async function getDocumentById(req, res) {
  try {
    const { id } = req.params;
    const docRef = await db.collection('documents').doc(id).get();

    if (!docRef.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = docRef.data();

    // Check if user has access
    const hasAccess = 
      document.owner.uid === req.user.uid ||
      document.sharedWith.some(share => share.email === req.user.email);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete document
 */
export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    const docRef = db.collection('documents').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = doc.data();

    // Only owner can delete
    if (document.owner.uid !== req.user.uid) {
      return res.status(403).json({ error: 'Only owner can delete document' });
    }

    await docRef.delete();

    // Log deletion
    await db.collection('logs').add({
      action: 'delete',
      documentId: id,
      fileName: document.fileName,
      user: req.user.email,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Remove self from shared document
 */
export async function removeSelfFromShared(req, res) {
  try {
    const { id } = req.params;
    const docRef = db.collection('documents').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = doc.data();

    // Check if user is in sharedWith array
    if (!document.sharedWith || !document.sharedWith.some(share => share.email === req.user.email)) {
      return res.status(403).json({ error: 'You do not have access to this document' });
    }

    // Remove user from sharedWith array
    const updatedSharedWith = document.sharedWith.filter(share => share.email !== req.user.email);

    await docRef.update({
      sharedWith: updatedSharedWith,
    });

    // Log removal
    await db.collection('logs').add({
      action: 'remove_self_from_share',
      documentId: id,
      fileName: document.fileName,
      user: req.user.email,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Successfully removed from shared document' });
  } catch (error) {
    console.error('Remove self from shared error:', error);
    res.status(500).json({ error: error.message });
  }
}
