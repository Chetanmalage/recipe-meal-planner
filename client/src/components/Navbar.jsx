import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar navbar-expand-lg navbar-premium shadow-sm fixed-top">
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span style={{ fontSize: '1.5rem' }}>🍲</span>
          <span className="fw-bolder fs-4 d-none d-sm-inline">Arshiya's Kitchen</span>
        </Link>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item"><Link className="nav-link" to="/">Discover</Link></li>
            {user ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/favourites">Favourites</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/meal-planner">Meal Planner</Link></li>
                {user.role === 'admin' && <li className="nav-item"><Link className="nav-link text-warning" to="/admin">Admin</Link></li>}
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown">
                    <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {user.name}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="btn btn-premium btn-sm" to="/register">Get Started</Link></li>
              </>
            )}
            <li className="nav-item">
              <button className="btn btn-glass btn-sm" onClick={toggleTheme}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;