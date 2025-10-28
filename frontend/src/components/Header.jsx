import { Link } from "react-router-dom";
import { useAuth } from "../context/Auth";

const Header = () => {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-md border-b border-gray-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold text-gray-800">
          your_friend
        </Link>
        <button
          onClick={logout}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Log Out
        </button>
      </div>
    </header>
  );
};

export default Header;
