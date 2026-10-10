import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSharedWithMeDocuments, removeSelfFromShared } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText, Download, User, X } from 'lucide-react';

export default function SharedWithMe() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSharedDocuments();
  }, []);

  const loadSharedDocuments = async () => {
    try {
      const res = await getSharedWithMeDocuments();
      setDocuments(res.documents || []);
    } catch (error) {
      toast.error('Failed to load shared documents');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSelf = async (docId, fileName) => {
    if (!confirm(`Remove yourself from "${fileName}"? You won't be able to access it anymore.`)) return;

    try {
      await removeSelfFromShared(docId);
      toast.success('Removed from shared document');
      loadSharedDocuments();
    } catch (error) {
      toast.error(error.message || 'Failed to remove');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Documents Shared With Me</h1>

        {documents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400">No documents shared with you yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="text-blue-500 mt-1" size={32} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{doc.fileName}</h3>
                      {doc.description && (
                        <p className="text-gray-400 text-sm mb-2">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>Shared by {doc.owner?.name || doc.owner?.email}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{(doc.size / 1024).toFixed(2)} KB</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={doc.ipfsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Download size={16} />
                      View/Download
                    </a>
                    <button
                      onClick={() => handleRemoveSelf(doc.id, doc.fileName)}
                      className="btn btn-danger flex items-center gap-2"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
