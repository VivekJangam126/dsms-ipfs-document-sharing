import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDocuments, uploadDocument, shareDocument, deleteDocument, autocompleteUsers } from '../services/api';
import toast from 'react-hot-toast';
import { Upload, Share2, Trash2, ArrowLeft, X, Search } from 'lucide-react';
import { Eye } from 'lucide-react';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchQuery, documents]);

  const loadDocuments = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.documents || []);
      setFilteredDocuments(res.documents || []);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = documents.filter(doc => 
      doc.fileName.toLowerCase().includes(query) ||
      (doc.description && doc.description.toLowerCase().includes(query)) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(query)))
    );
    setFilteredDocuments(filtered);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('file');
    const description = formData.get('description');
    const tags = formData.get('tags');

    try {
      await uploadDocument(file, description, tags);
      toast.success('Document uploaded successfully!');
      setShowUpload(false);
      loadDocuments();
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const recipientEmail = formData.get('recipient');
    const isPublic = formData.get('shareType') === 'public';

    try {
      const res = await shareDocument(
        selectedDoc.id,
        isPublic ? [] : [recipientEmail],
        isPublic
      );
      
      if (isPublic) {
        toast.success(`🔗 Public share link created! Copy the link from "My Shares" page.`, {
          duration: 5000,
        });
      } else {
        toast.success(`✉️ Document shared with ${recipientEmail} successfully!`, {
          duration: 4000,
        });
      }
      setShowShare(false);
      setSelectedDoc(null);
    } catch (error) {
      toast.error(error.message || 'Share failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument(id);
      toast.success('Document deleted');
      loadDocuments();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <button onClick={() => setShowUpload(true)} className="btn btn-primary flex items-center gap-2">
            <Upload size={18} />
            Upload Document
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Documents</h1>

        {documents.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-4">No documents yet</p>
            <button onClick={() => setShowUpload(true)} className="btn btn-primary">
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDocuments.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-400">No documents match your search</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
              <div key={doc.id} className="card flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{doc.fileName}</h3>
                  <p className="text-sm text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {doc.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                    <Link
                      to={`/documents/${doc.id}`}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View
                    </Link>
                  <button
                    onClick={() => { setSelectedDoc(doc); setShowShare(true); }}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="btn btn-danger flex items-center gap-2">
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        )}
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Document</h2>
              <button onClick={() => setShowUpload(false)}><X /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">File</label>
                <input type="file" name="file" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea name="description" className="input" rows="3"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (optional, comma-separated)</label>
                <input type="text" name="tags" className="input" placeholder="e.g., work, important, invoice" />
              </div>
              <button type="submit" className="btn btn-primary w-full">Upload</button>
            </form>
          </div>
        </div>
      )}

      {showShare && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Share {selectedDoc.fileName}</h2>
              <button onClick={() => { setShowShare(false); setSelectedDoc(null); }}><X /></button>
            </div>
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Share Type</label>
                <select name="shareType" className="input">
                  <option value="private">Private (specific user)</option>
                  <option value="public">Public (anyone with link)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Recipient Email</label>
                <input type="email" name="recipient" className="input" placeholder="user@example.com" />
              </div>
              <button type="submit" className="btn btn-primary w-full">Share</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
