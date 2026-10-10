import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserShares } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';

export default function SharedDocuments() {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    try {
      const res = await getUserShares();
      setShares(res.shares || []);
    } catch (error) {
      toast.error('Failed to load shares');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950">Loading...</div>;
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
        <h1 className="text-3xl font-bold mb-6">Shared Documents</h1>

        {shares.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400">No shares yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {shares.map((share) => (
              <div key={share.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{share.fileName}</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(share.sharedAt).toLocaleDateString()}
                  </span>
                </div>
                {share.isPublic && (
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="text"
                      value={share.shareLink}
                      readOnly
                      className="input flex-1"
                    />
                    <button
                      onClick={() => copyLink(share.shareLink)}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                    <a
                      href={share.shareLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Open
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
