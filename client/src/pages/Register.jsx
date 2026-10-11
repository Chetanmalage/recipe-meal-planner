import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import GoogleSignInButton from '../components/GoogleSignInButton';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Your account could not be created. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    if (!response.credential) {
      setError('Google did not return a sign-in credential. Please try again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await googleLogin(response.credential);
      toast.success('Welcome to Arshiya’s Kitchen.');
      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Google sign-in didn’t finish. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Join the kitchen" description="Create an account to share recipes, keep favorites, and plan your week." />
      <main className="auth-shell">
        <section className="auth-panel animate-fade-in" aria-labelledby="register-title">
          <span className="auth-brand-mark" aria-hidden="true">A</span>
          <p className="eyebrow">There’s room for one more</p>
          <h1 id="register-title">Come on in.</h1>
          <p className="auth-copy">Save the recipes you love, plan an easier week, and share something good.</p>
          {error && <div className="form-alert" role="alert">{error}</div>}
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && <>
            <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={() => setError('Google sign-in didn’t finish. You can try again, or use email and password.')} disabled={loading} />
            <div className="auth-divider"><span>or sign up with email</span></div>
          </>}
          <form onSubmit={handleSubmit} className="recipe-form">
            <label htmlFor="register-name">Your name<input id="register-name" className="form-control" type="text" value={name} onChange={(event) => setName(event.target.value)} minLength="2" maxLength="60" autoComplete="name" required /></label>
            <label htmlFor="register-email">Email address<input id="register-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
            <label htmlFor="register-password">Password <span className="field-hint">At least 6 characters</span><input id="register-password" className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="6" autoComplete="new-password" required /></label>
            <button className="btn btn-premium btn-lg w-100" type="submit" disabled={loading}>{loading ? 'Saving you a seat…' : 'Create my account'}</button>
          </form>
          <p className="auth-switch">Already part of the table? <Link to="/login">Log in</Link></p>
        </section>
      </main>
    </>
  );
};

export default Register;
