import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocumentById, getLogs } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText, Download, Calendar, HardDrive, Tag, Activity } from 'lucide-react';

export default function DocumentDetails() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
    loadDocumentLogs();
  }, [id]);

  const loadDocument = async () => {
    try {
      const res = await getDocumentById(id);
      setDocument(res.document);
    } catch (error) {
      toast.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentLogs = async () => {
    try {
      const res = await getLogs(20, null, id);
      setLogs(res.logs || []);
    } catch (error) {
      console.error('Failed to load logs');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="card text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Document Not Found</h2>
          <Link to="/documents" className="btn btn-primary">Back to Documents</Link>
        </div>
      </div>
    );
  }

  const isImage = document.mimeType?.startsWith('image/');
  const isPDF = document.mimeType === 'application/pdf';

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/documents" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
            Back to Documents
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-start gap-4 mb-6">
                <FileText className="text-blue-500" size={48} />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{document.fileName}</h1>
                  {document.description && (
                    <p className="text-gray-400 mb-4">{document.description}</p>
                  )}
                  {document.tags && document.tags.length > 0 && (
                    <div className="flex gap-1 mb-4">
                      <Tag size={16} className="text-gray-400 mt-1" />
                      {document.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} />
                  <span className="text-sm">{new Date(document.uploadedAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <HardDrive size={16} />
                  <span className="text-sm">{(document.size / 1024).toFixed(2)} KB</span>
                </div>
              </div>

              {(isImage || isPDF) && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Preview</h3>
                  {isImage && (
                    <img src={document.ipfsUrl} alt={document.fileName} className="max-w-full rounded-lg" />
                  )}
                  {isPDF && (
                    <iframe src={document.ipfsUrl} className="w-full h-96 rounded-lg border border-gray-700"></iframe>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <a
                  href={document.ipfsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Download size={18} />
                  Download / Open
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-yellow-500" size={24} />
                <h2 className="text-xl font-bold">Activity History</h2>
              </div>
              {logs.length === 0 ? (
                <p className="text-gray-400 text-sm">No activity recorded</p>
              ) : (
                <div className="space-y-3">
                  {logs.map(log => (
                    <div key={log.id} className="border-l-2 border-blue-500 pl-3 py-1">
                      <p className="font-semibold text-sm text-blue-400">{log.action}</p>
                      <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                      {log.sharedWith && <p className="text-xs text-gray-400">Shared with: {log.sharedWith}</p>}
                      {log.revokedUser && <p className="text-xs text-gray-400">Revoked: {log.revokedUser}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
