import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Login" description="Log in to your Arshiya's Kitchen account." />
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '80px' }}>
        <div className="glass-card p-5 animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
          <div className="text-center mb-4">
            <h2 className="fw-bolder">Welcome Back</h2>
            <p className="text-secondary">Log in to your account.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email" className="form-control bg-transparent text-white"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password" className="form-control bg-transparent text-white"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password"
              />
            </div>
            <button className="btn btn-premium w-100 py-2" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          <p className="mt-4 text-center text-secondary">
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </>
  );
};
export default Login;