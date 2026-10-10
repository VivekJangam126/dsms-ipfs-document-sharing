import { db } from '../index.js';

/**
 * Get activity logs
 */
export async function getLogs(req, res) {
  try {
    const { limit = 50, action, documentId } = req.query;

    let query = db.collection('logs')
      .where('user', '==', req.user.email);

    if (action) {
      query = query.where('action', '==', action);
    }

    if (documentId) {
      query = query.where('documentId', '==', documentId);
    }

    const snapshot = await query.get();
    let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort logs in memory by timestamp desc
    logs = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    // Limit results
    logs = logs.slice(0, parseInt(limit));

    res.json({ logs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get log statistics
 */
export async function getLogStats(req, res) {
  try {
    const snapshot = await db.collection('logs')
      .where('user', '==', req.user.email)
      .get();

    const stats = {
      total: snapshot.size,
      byAction: {},
    };

    snapshot.docs.forEach(doc => {
      const action = doc.data().action;
      stats.byAction[action] = (stats.byAction[action] || 0) + 1;
    });

    res.json({ stats });
  } catch (error) {
    console.error('Get log stats error:', error);
    res.status(500).json({ error: error.message });
  }
}
