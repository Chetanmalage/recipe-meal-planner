import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const safeDestination = (from) => {
  const path = typeof from === 'string'
    ? from
    : from && typeof from.pathname === 'string'
      ? `${from.pathname}${from.search || ''}${from.hash || ''}`
      : '/';
  if (!path.startsWith('/') || path.startsWith('//')) return '/';
  try {
    return new URL(path, window.location.origin).origin === window.location.origin ? path : '/';
  } catch {
    return '/';
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      toast.success(location.state?.saveFavourite
        ? 'Welcome back. Tap Save again to keep this recipe.'
        : 'Lovely to have you back.');
      navigate(safeDestination(location.state?.from), { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We couldn’t sign you in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Log in" description="Log in to save recipes and plan meals with Arshiya’s Kitchen." />
      <main className="auth-shell">
        <section className="auth-panel animate-fade-in" aria-labelledby="login-title">
          <span className="auth-brand-mark" aria-hidden="true">A</span>
          <p className="eyebrow">Your place at the table</p>
          <h1 id="login-title">Welcome back.</h1>
          <p className="auth-copy">Your saved recipes and good ideas are right where you left them.</p>
          {error && <div className="form-alert" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="recipe-form">
            <label htmlFor="login-email">Email address<input id="login-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
            <label htmlFor="login-password">Password<input id="login-password" className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
            <button className="btn btn-premium btn-lg w-100" type="submit" disabled={loading}>{loading ? 'Setting your place…' : 'Log in'}</button>
          </form>
          <p className="auth-switch">New to the kitchen? <Link to="/register">Join us here</Link></p>
        </section>
      </main>
    </>
  );
};

export default Login;
