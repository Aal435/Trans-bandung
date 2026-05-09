import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import { routesAPI, schedulesAPI, reportsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('routes');
  const [routes, setRoutes] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewRouteForm, setShowNewRouteForm] = useState(false);
  const [formData, setFormData] = useState({
    route_number: '',
    start_location: '',
    end_location: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      if (activeTab === 'routes') {
        const response = await routesAPI.getAll();
        setRoutes(response.data.routes || []);
      } else if (activeTab === 'reports') {
        const response = await reportsAPI.getAll({ limit: 100 });
        setReports(response.data.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await routesAPI.create(formData);
      setFormData({
        route_number: '',
        start_location: '',
        end_location: '',
        description: ''
      });
      setShowNewRouteForm(false);
      fetchAdminData();
    } catch (error) {
      console.error('Failed to create route:', error);
      alert('Failed to create route');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoute = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await routesAPI.delete(id);
        fetchAdminData();
      } catch (error) {
        console.error('Failed to delete route:', error);
        alert('Failed to delete route');
      }
    }
  };

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      await reportsAPI.updateStatus(reportId, newStatus);
      fetchAdminData();
    } catch (error) {
      console.error('Failed to update report status:', error);
      alert('Failed to update report status');
    }
  };

  const handleViewFile = (url, fileType) => {
    setSelectedFile(url);
    setSelectedFileType(fileType);
    setShowFileModal(true);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Dasbor Admin</h1>
          <p className="text-gray-600 mt-2">Kelola data dan operasi sistem</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'routes'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800'
            }`}
          >
            Manajemen Rute
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800'
            }`}
          >
            Moderasi Laporan
          </button>
        </div>

        {/* Routes Management */}
        {activeTab === 'routes' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setShowNewRouteForm(!showNewRouteForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {showNewRouteForm ? 'Batal' : '+ Rute Baru'}
              </button>
            </div>

            {showNewRouteForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Buat Rute Baru</h2>
                <form onSubmit={handleCreateRoute} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Nomor Rute *</label>
                      <input
                        type="text"
                        name="route_number"
                        value={formData.route_number}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="cth., B2, T5A"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Lokasi Awal *</label>
                      <input
                        type="text"
                        name="start_location"
                        value={formData.start_location}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="cth., Pusat Kota"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Lokasi Akhir *</label>
                      <input
                        type="text"
                        name="end_location"
                        value={formData.end_location}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="cth., Bandara"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Description</label>
                      <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Route description"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400"
                  >
                    {submitting ? 'Creating...' : 'Create Route'}
                  </button>
                </form>
              </div>
            )}

            {/* Routes Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Nomor Rute</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Dari</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Ke</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Deskripsi</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {routes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-800">{route.route_number}</td>
                      <td className="px-6 py-4 text-gray-700">{route.start_location}</td>
                      <td className="px-6 py-4 text-gray-700">{route.end_location}</td>
                      <td className="px-6 py-4 text-gray-700">{route.description || '-'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteRoute(route.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition text-sm"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Moderation */}
        {activeTab === 'reports' && (
          <div>
            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 capitalize">{report.type}</h3>
                        <p className="text-gray-600">{report.location}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full font-semibold ${
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        report.status === 'verified' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4">{report.description}</p>

                    <div className="flex gap-3 flex-wrap mb-4">
                      {report.photo_url ? (
                        <button
                          onClick={() => handleViewFile(report.photo_url, 'photo')}
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 px-4 py-2 rounded bg-blue-50 hover:bg-blue-100 transition"
                        >
                          📷 Lihat Foto
                        </button>
                      ) : (
                        <button
                          disabled
                          className="text-gray-400 font-semibold flex items-center gap-2 px-4 py-2 rounded bg-gray-100 cursor-not-allowed"
                        >
                          📷 Tidak Ada Foto
                        </button>
                      )}
                      {report.document_url ? (
                        <button
                          onClick={() => handleViewFile(report.document_url, 'document')}
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 px-4 py-2 rounded bg-blue-50 hover:bg-blue-100 transition"
                        >
                          📄 Lihat Dokumen
                        </button>
                      ) : (
                        <button
                          disabled
                          className="text-gray-400 font-semibold flex items-center gap-2 px-4 py-2 rounded bg-gray-100 cursor-not-allowed"
                        >
                          📄 Tidak Ada Dokumen
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleUpdateReportStatus(report.id, 'verified')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition text-sm"
                      >
                        Tandai Terverifikasi
                      </button>
                      <button
                        onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition text-sm"
                      >
                        Tandai Terselesaikan
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600 text-lg">Laporan tidak ditemukan</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* File Viewer Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedFileType === 'photo' ? 'Lihat Foto' : 'Lihat Dokumen'}
              </h2>
              <button
                onClick={() => setShowFileModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {selectedFileType === 'photo' ? (
                <img
                  src={selectedFile}
                  alt="Report Photo"
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Dokumen tidak dapat ditampilkan langsung di browser
                  </p>
                  <a
                    href={selectedFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Buka Dokumen di Tab Baru
                  </a>
                  <p className="text-sm text-gray-500 mt-4">
                    URL: {selectedFile}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-gray-50">
              <button
                onClick={() => setShowFileModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition"
              >
                Tutup
              </button>
              {selectedFile && (
                <a
                  href={selectedFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Unduh / Buka di Tab Baru
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
