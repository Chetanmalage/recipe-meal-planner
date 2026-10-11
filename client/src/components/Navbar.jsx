import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const closeMenu = () => setMenuOpen(false);
  const navClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-premium fixed-top" aria-label="Main navigation">
      <div className="container nav-inner">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={closeMenu} aria-label="Arshiya’s Kitchen home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span className="fw-bolder">Arshiya&apos;s Kitchen</span>
        </Link>
        <button
          className="nav-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span /><span />
        </button>
        <div className={`navbar-content${menuOpen ? ' is-open' : ''}`} id="primary-navigation">
          <div className="navbar-links">
            <NavLink className={navClass} to="/" end onClick={closeMenu}>Discover</NavLink>
            <NavLink className={navClass} to="/favourites" onClick={closeMenu}>Favourites</NavLink>
            {user && <NavLink className={navClass} to="/meal-planner" onClick={closeMenu}>Meal planner</NavLink>}
            {user?.role === 'admin' && <NavLink className={navClass} to="/admin" onClick={closeMenu}>Admin</NavLink>}
          </div>
          <div className="navbar-actions">
            <button className="btn btn-glass theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
              {theme === 'dark' ? '☼' : '☾'}
            </button>
            {user ? (
              <details className="profile-menu">
                <summary aria-label={`Account menu for ${user.name}`}>
                  <span className="profile-avatar">{user.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                  <span className="profile-name">{user.name}</span>
                  <span aria-hidden="true">⌄</span>
                </summary>
                <div className="profile-menu-panel">
                  <span className="profile-email">{user.email}</span>
                  <button type="button" onClick={handleLogout}>Sign out</button>
                </div>
              </details>
            ) : (
              <>
                <NavLink className="nav-link" to="/login" onClick={closeMenu}>Log in</NavLink>
                <Link className="btn btn-premium btn-sm" to="/register" onClick={closeMenu}>Join the table</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
