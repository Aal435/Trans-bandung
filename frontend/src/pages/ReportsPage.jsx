import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import { reportsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const ReportsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    type: 'accident',
    location: '',
    description: ''
  });
  const [files, setFiles] = useState({
    photo: null,
    document: null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filterType]);

  const fetchReports = async () => {
    try {
      const params = filterType ? { type: filterType } : {};
      const response = await reportsAPI.getAll(params);
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
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

  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0]
    });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('type', formData.type);
      form.append('location', formData.location);
      form.append('description', formData.description);
      if (files.photo) form.append('photo', files.photo);
      if (files.document) form.append('document', files.document);

      await reportsAPI.create(form);
      setShowForm(false);
      setFormData({
        type: 'accident',
        location: '',
        description: ''
      });
      setFiles({ photo: null, document: null });
      fetchReports();
    } catch (error) {
      console.error('Failed to create report:', error);
      alert('Failed to create report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Laporan</h1>
            <p className="text-gray-600 mt-2">Laporan lalu lintas dan kecelakaan komunitas</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            {showForm ? 'Batal' : '+ Laporan Baru'}
          </button>
        </div>

        {/* Report Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Buat Laporan Baru</h2>
            <form onSubmit={handleSubmitReport} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Tipe *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="accident">Kecelakaan</option>
                    <option value="congestion">Kemacetan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Lokasi *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Masukkan lokasi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Deskripsi *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Jelaskan kejadian..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Foto (opsional)</label>
                  <input
                    type="file"
                    name="photo"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Dokumen (opsional)</label>
                  <input
                    type="file"
                    name="document"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400"
              >
                {submitting ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterType('')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterType === '' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('accident')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterType === 'accident' ? 'bg-red-600 text-white' : 'bg-white text-gray-800'
            }`}
          >
            Kecelakaan
          </button>
          <button
            onClick={() => setFilterType('congestion')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterType === 'congestion' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-800'
            }`}
          >
            Kemacetan
          </button>
        </div>

        {/* Reports List */}
        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-3xl ${
                      report.type === 'accident' ? '🚗' : '🚦'
                    }`}></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 capitalize">{report.type}</h3>
                      <p className="text-gray-600">{report.location}</p>
                    </div>
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

                {(report.photo_url || report.document_url) && (
                  <div className="flex gap-4 mb-4">
                    {report.photo_url && (
                      <a
                        href={report.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        📷 Lihat Foto
                      </a>
                    )}
                    {report.document_url && (
                      <a
                        href={report.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        📄 Lihat Dokumen
                      </a>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Reported on {new Date(report.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No reports found</p>
          </div>
        )}
      </main>
    </div>
  );
};
