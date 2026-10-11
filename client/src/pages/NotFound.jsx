import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound = () => (
  <>
    <SEO title="404 - Page Not Found" />
    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '80vh' }}>
      <h1 className="display-1 fw-bolder">404</h1>
      <p className="lead text-secondary mb-4">Looks like this recipe doesn't exist...</p>
      <Link to="/" className="btn btn-premium btn-lg">Back to Home</Link>
    </div>
  </>
);
export default NotFound;