import { db, admin } from '../index.js';
import { nanoid } from 'nanoid';

/**
 * Share document with users
 */
export async function shareDocument(req, res) {
  try {
    const { documentId, recipients, isPublic, permissions } = req.body;

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const docRef = db.collection('documents').doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = doc.data();

    // Only owner can share
    if (document.owner.uid !== req.user.uid) {
      return res.status(403).json({ error: 'Only owner can share document' });
    }

    let shareData = {
      documentId,
      owner: document.owner,
      fileName: document.fileName,
      sharedAt: new Date().toISOString(),
      permissions: permissions || { view: true, download: true },
    };

    if (isPublic) {
      // Generate public share link
      const shareId = nanoid(12);
      shareData.shareId = shareId;
      shareData.isPublic = true;
      shareData.shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareId}`;

      await db.collection('shares').doc(shareId).set(shareData);

      res.json({
        message: 'Public share link created',
        shareLink: shareData.shareLink,
        shareId,
      });
    } else {
      // Share with specific users
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: 'Recipients are required for private sharing' });
      }

      const sharedWith = [];
      for (const email of recipients) {
        sharedWith.push({ email, addedAt: new Date().toISOString() });
      }

      // Update document with shared users
      await docRef.update({
        sharedWith: admin.firestore.FieldValue.arrayUnion(...sharedWith),
      });

      // Log sharing
      for (const email of recipients) {
        await db.collection('logs').add({
          action: 'share',
          documentId,
          fileName: document.fileName,
          sharedWith: email,
          user: req.user.email,
          timestamp: new Date().toISOString(),
        });
      }

      res.json({
        message: 'Document shared successfully',
        sharedWith: recipients,
      });
    }
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get document by share ID (for public links)
 */
export async function getSharedDocument(req, res) {
  try {
    const { shareId } = req.params;

    const shareDoc = await db.collection('shares').doc(shareId).get();

    if (!shareDoc.exists) {
      return res.status(404).json({ error: 'Share link not found or expired' });
    }

    const shareData = shareDoc.data();
    const docRef = await db.collection('documents').doc(shareData.documentId).get();

    if (!docRef.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = docRef.data();

    // Log access
    await db.collection('logs').add({
      action: 'access_shared',
      documentId: document.id,
      fileName: document.fileName,
      shareId,
      user: req.user?.email || 'anonymous',
      timestamp: new Date().toISOString(),
    });

    res.json({
      document,
      permissions: shareData.permissions,
    });
  } catch (error) {
    console.error('Get shared document error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Autocomplete users by email for sharing
 */
export async function autocompleteUsers(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Search users in Firebase Auth
    const listUsersResult = await admin.auth().listUsers(100);
    const users = listUsersResult.users
      .filter(user => 
        user.email && 
        user.email.toLowerCase().includes(q.toLowerCase()) &&
        user.uid !== req.user.uid
      )
      .map(user => ({
        email: user.email,
        displayName: user.displayName || user.email,
      }))
      .slice(0, 10);

    res.json(users);
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all shares created by the user
 */
export async function getUserShares(req, res) {
  try {
    const snapshot = await db.collection('shares')
      .where('owner.uid', '==', req.user.uid)
      .get();

    let shares = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Sort shares in memory by sharedAt desc
    shares = shares.sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt));

    res.json({ shares });
  } catch (error) {
    console.error('Get shares error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Revoke user access from shared document
 */
export async function revokeUserAccess(req, res) {
  try {
    const { documentId } = req.params;
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const docRef = db.collection('documents').doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = doc.data();

    // Only owner can revoke access
    if (document.owner.uid !== req.user.uid) {
      return res.status(403).json({ error: 'Only owner can revoke access' });
    }

    // Remove user from sharedWith array
    const updatedSharedWith = document.sharedWith.filter(share => share.email !== userEmail);

    await docRef.update({
      sharedWith: updatedSharedWith,
    });

    // Log revocation
    await db.collection('logs').add({
      action: 'revoke_access',
      documentId,
      fileName: document.fileName,
      revokedUser: userEmail,
      user: req.user.email,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({ error: error.message });
  }
}
