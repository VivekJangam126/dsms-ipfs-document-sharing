import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedDocument } from '../services/api';
import toast from 'react-hot-toast';
import { FileText, Download } from 'lucide-react';

export default function AccessShared() {
  const { shareId } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDocument();
  }, [shareId]);

  const loadDocument = async () => {
    try {
      const res = await getSharedDocument(shareId);
      setDocument(res.document);
    } catch (error) {
      setError(error.message);
      toast.error('Failed to load shared document');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="card max-w-md text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Access Denied</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        <div className="flex items-center gap-4 mb-6">
          <FileText className="text-blue-500" size={48} />
          <div>
            <h1 className="text-2xl font-bold">{document.fileName}</h1>
            <p className="text-gray-400">Shared by {document.owner.name}</p>
          </div>
        </div>

        {document.description && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-400">{document.description}</p>
          </div>
        )}

        <div className="flex gap-4">
          <a
            href={document.ipfsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary flex items-center gap-2"
          >
            <Download size={20} />
            Download / View
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-400">
          <p>Uploaded: {new Date(document.uploadedAt).toLocaleString()}</p>
          <p>Size: {(document.size / 1024).toFixed(2)} KB</p>
        </div>
      </div>
    </div>
  );
}
