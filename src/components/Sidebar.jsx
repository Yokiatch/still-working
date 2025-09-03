import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { signOut } = useAuth();
  return (
    <nav className="w-60 bg-gray-900 text-gray-100 p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">Spotify Clone</h1>
      <NavLink to="/" className="mb-4 hover:text-white">Home</NavLink>
      <NavLink to="/search" className="mb-4 hover:text-white">Search</NavLink>
      <NavLink to="/library" className="mb-4 hover:text-white">Library</NavLink>
      <button onClick={signOut} className="mt-auto text-left text-red-500 hover:text-red-600">
        Sign Out
      </button>
    </nav>
  );
}
