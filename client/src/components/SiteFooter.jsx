import { Link } from 'react-router-dom';

const SiteFooter = () => (
  <footer className="site-footer">
    <div className="container footer-inner">
      <div className="footer-top">
        <div className="footer-branding">
          <Link to="/" aria-label="Arshiya’s Kitchen home">
            <span className="brand-mark" aria-hidden="true">A</span>
            <span>Arshiya&apos;s Kitchen</span>
          </Link>
          <p>Indian recipes for everyday tables.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link to="/">Discover</Link>
          <Link to="/favourites">Favourites</Link>
          <Link to="/meal-planner">Meal planner</Link>
          <Link to="/register">Join the table</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Arshiya&apos;s Kitchen</span>
        <span>Cook with care. Share generously.</span>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
