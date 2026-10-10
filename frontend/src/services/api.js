import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Get Firebase Auth token
 */
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Upload document
 */
export async function uploadDocument(file, description = '', tags = '') {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  formData.append('tags', tags);

  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data;
}

/**
 * Get user documents
 */
export async function getDocuments() {
  return apiRequest('/api/file');
}

/**
 * Get documents shared with me
 */
export async function getSharedWithMeDocuments() {
  return apiRequest('/api/file/shared-with-me');
}

/**
 * Get document by ID
 */
export async function getDocumentById(id) {
  return apiRequest(`/api/file/${id}`);
}

/**
 * Delete document
 */
export async function deleteDocument(id) {
  return apiRequest(`/api/file/${id}`, { method: 'DELETE' });
}

/**
 * Remove self from shared document
 */
export async function removeSelfFromShared(id) {
  return apiRequest(`/api/file/${id}/remove-self`, { method: 'POST' });
}

/**
 * Share document
 */
export async function shareDocument(documentId, recipients, isPublic = false, permissions = {}) {
  return apiRequest('/api/share', {
    method: 'POST',
    body: JSON.stringify({ documentId, recipients, isPublic, permissions }),
  });
}

/**
 * Get shared document by share ID
 */
export async function getSharedDocument(shareId) {
  return apiRequest(`/api/share/${shareId}`);
}

/**
 * Autocomplete users
 */
export async function autocompleteUsers(query) {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/api/share/users/autocomplete?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Get user shares
 */
export async function getUserShares() {
  return apiRequest('/api/share/my-shares');
}

/**
 * Revoke user access from document
 */
export async function revokeUserAccess(documentId, userEmail) {
  return apiRequest(`/api/share/${documentId}/revoke`, {
    method: 'POST',
    body: JSON.stringify({ userEmail }),
  });
}

/**
 * Get logs
 */
export async function getLogs(limit = 50, action = null, documentId = null) {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (action) params.append('action', action);
  if (documentId) params.append('documentId', documentId);
  return apiRequest(`/api/logs?${params}`);
}

/**
 * Get log stats
 */
export async function getLogStats() {
  return apiRequest('/api/logs/stats');
}
