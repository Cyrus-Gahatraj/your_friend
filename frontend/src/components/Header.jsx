import { useAuth } from "../context/Auth";
import { Link } from "react-router-dom";

const Header = ({ onMenuClick, selectedPersona, onShowPersonaManager }) => {
    const { logout } = useAuth();
  
  return (
    <header className="bg-white border-b border-gray-200 px-2 lg:px-25 py-3 flex items-center justify-between ">
      <div className="flex items-center gap-4">
        {/* Menu Button for Mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo/Brand */}
        <Link to="/dashboard" className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
          your_friend
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {selectedPersona && (
          <button
            onClick={onShowPersonaManager}
            className="btn-secondary text-sm flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Manage Personas
          </button>
        )}
        
        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn-danger rounded-lg transition-colors text-sm "
        >
          Log Out
        </button>
      </div>
    </header>
  );
}

export default Header;