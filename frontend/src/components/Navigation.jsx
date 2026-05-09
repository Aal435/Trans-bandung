import React from 'react';
import { Link } from 'react-router-dom';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const Navigation = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            TransBandung
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200 transition">Dasbor</Link>
            <Link to="/routes" className="hover:text-blue-200 transition">Rute</Link>
            <Link to="/reports" className="hover:text-blue-200 transition">Laporan</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="hover:text-blue-200 transition">Admin</Link>
            )}

            <div className="flex items-center space-x-3 border-l border-blue-400 pl-6">
              <span className="text-sm">{user?.username}</span>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
              >
                <FiLogOut />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              className="block px-4 py-2 hover:bg-blue-700 rounded"
              onClick={() => setIsOpen(false)}
            >
              Dasbor
            </Link>
            <Link
              to="/routes"
              className="block px-4 py-2 hover:bg-blue-700 rounded"
              onClick={() => setIsOpen(false)}
            >
              Rute
            </Link>
            <Link
              to="/reports"
              className="block px-4 py-2 hover:bg-blue-700 rounded"
              onClick={() => setIsOpen(false)}
            >
              Laporan
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="block px-4 py-2 hover:bg-blue-700 rounded"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center gap-2"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
