import { useState, useEffect } from 'react';
import { getLogs, getLogStats } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const logsRes = await getLogs();
      const statsRes = await getLogStats();
      setLogs(logsRes.logs || []);
      setStats(statsRes.stats || null);
    } catch (error) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold mb-6">Activity Logs</h1>
        {stats && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-2">Log Statistics</h2>
            <p className="mb-2">Total Logs: {stats.total}</p>
            <ul>
              {Object.entries(stats.byAction).map(([action, count]) => (
                <li key={action} className="text-gray-400">{action}: {count}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Logs</h2>
          {logs.length === 0 ? (
            <p className="text-gray-400">No logs found.</p>
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <span className="font-semibold text-blue-400">{log.action}</span>
                    <span className="ml-2 text-gray-300">{log.fileName || log.documentId || ''}</span>
                  </div>
                  <div className="text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
