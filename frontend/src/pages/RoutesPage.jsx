import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import { routesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const RoutesPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await routesAPI.getAll();
      setRoutes(response.data.routes || []);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Rute Transportasi</h1>
          <p className="text-gray-600 mt-2">Jelajahi semua rute yang tersedia</p>
        </div>

        {routes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/route/${route.id}`)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-blue-600 mb-2">
                    Rute {route.route_number}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Dari</p>
                      <p className="font-semibold text-gray-800">{route.start_location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ke</p>
                      <p className="font-semibold text-gray-800">{route.end_location}</p>
                    </div>
                    {route.description && (
                      <div>
                        <p className="text-sm text-gray-600">Deskripsi</p>
                        <p className="text-gray-700">{route.description}</p>
                      </div>
                    )}
                  </div>
                  <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition">
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">Tidak ada rute yang tersedia</p>
          </div>
        )}
      </main>
    </div>
  );
};
