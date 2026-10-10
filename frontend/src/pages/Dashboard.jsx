import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDocuments, getSharedWithMeDocuments } from '../services/api';
import toast from 'react-hot-toast';
import { FileText, Share2, LogOut, Files, Upload, UserCheck, HardDrive } from 'lucide-react';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const totalStorage = useMemo(() => {
    const totalBytes = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
    return totalMB;
  }, [documents]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [docsRes, sharedRes] = await Promise.all([
        getDocuments(),
        getSharedWithMeDocuments(),
      ]);
      setDocuments(docsRes.documents || []);
      setSharedDocs(sharedRes.documents || []);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-500">DSMS</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{user?.email}</span>
            <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <FileText className="text-blue-500 mb-2" size={32} />
            <h3 className="text-2xl font-bold">{documents.length}</h3>
            <p className="text-gray-400">My Documents</p>
          </div>

          <div className="card">
            <Share2 className="text-green-500 mb-2" size={32} />
            <h3 className="text-2xl font-bold">{sharedDocs.length}</h3>
            <p className="text-gray-400">Shared With Me</p>
          </div>

          <div className="card">
            <Files className="text-purple-500 mb-2" size={32} />
            <h3 className="text-2xl font-bold">{documents.length + sharedDocs.length}</h3>
            <p className="text-gray-400">Total Access</p>
          </div>

          <div className="card">
            <HardDrive className="text-orange-500 mb-2" size={32} />
            <h3 className="text-2xl font-bold">{totalStorage} MB</h3>
            <p className="text-gray-400">Storage Used</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/documents" className="card hover:border-blue-500 transition-colors">
            <Upload className="text-blue-500 mb-4" size={40} />
            <h3 className="font-semibold mb-2">Upload Document</h3>
            <p className="text-gray-400 text-sm">Upload and manage your documents</p>
          </Link>

          <Link to="/shared-with-me" className="card hover:border-green-500 transition-colors">
            <UserCheck className="text-green-500 mb-4" size={40} />
            <h3 className="font-semibold mb-2">Shared With Me</h3>
            <p className="text-gray-400 text-sm">Documents others shared with you</p>
          </Link>

          <Link to="/shared" className="card hover:border-purple-500 transition-colors">
            <Share2 className="text-purple-500 mb-4" size={40} />
            <h3 className="font-semibold mb-2">My Shares</h3>
            <p className="text-gray-400 text-sm">Manage your shared documents</p>
          </Link>

          <Link to="/logs" className="card hover:border-yellow-500 transition-colors">
            <span className="text-yellow-500 mb-4 block" style={{fontSize:40}}>📝</span>
            <h3 className="font-semibold mb-2">Activity Logs</h3>
            <p className="text-gray-400 text-sm">View your recent actions</p>
          </Link>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Documents</h2>
          {documents.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No documents yet. Upload your first document!</p>
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-500" size={24} />
                    <div>
                      <h3 className="font-medium">{doc.fileName}</h3>
                      <p className="text-sm text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
