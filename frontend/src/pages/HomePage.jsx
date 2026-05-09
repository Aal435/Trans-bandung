import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { routesAPI, reportsAPI, monitoringAPI } from '../services/api';
import Navigation from '../components/Navigation';

export const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [reports, setReports] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [routesRes, reportsRes, monitoringRes] = await Promise.all([
        routesAPI.getAll(),
        reportsAPI.getAll({ limit: 5 }),
        monitoringAPI.getAll()
      ]);

      setRoutes(routesRes.data.routes || []);
      setReports(reportsRes.data.reports || []);
      setMonitoring(monitoringRes.data.monitoring || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Dasbor</h1>
          <p className="text-gray-600 mt-2">Selamat datang, {user?.username}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Total Rute</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{routes.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Laporan Terbaru</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{reports.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Kendaraan Aktif</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{monitoring.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Peran Anda</h3>
            <p className="text-2xl font-bold text-purple-600 mt-2 capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/routes')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
          >
            <h3 className="text-lg font-semibold text-gray-800">🚌 Lihat Rute</h3>
            <p className="text-gray-600 mt-2">Periksa semua rute transportasi</p>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
          >
            <h3 className="text-lg font-semibold text-gray-800">📢 Lihat Laporan</h3>
            <p className="text-gray-600 mt-2">Lihat laporan lalu lintas dan kecelakaan</p>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-800">⚙️ Panel Admin</h3>
              <p className="text-gray-600 mt-2">Kelola data sistem</p>
            </button>
          )}
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Laporan Terbaru</h2>
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border-l-4 border-blue-500 p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800 capitalize">{report.type}</h4>
                      <p className="text-gray-600 text-sm">{report.location}</p>
                      <p className="text-gray-600 text-sm mt-1">{report.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      report.status === 'verified' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reports found</p>
          )}
        </div>
      </main>
    </div>
  );
};
