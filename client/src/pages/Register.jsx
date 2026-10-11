import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: 'var(--bg-primary)' }}>
      <div className="glass-card p-5 animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bolder">Join Arshiya's Kitchen</h2>
          <p className="text-secondary">Create an account to start sharing and planning.</p>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input type="text" className="form-control bg-transparent text-white" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input type="email" className="form-control bg-transparent text-white" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input type="password" className="form-control bg-transparent text-white" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button className="btn btn-premium w-100 py-2" type="submit">Create Account</button>
        </form>
        <p className="mt-4 text-center text-secondary">Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Log In</Link></p>
      </div>
    </div>
  );
};
export default Register;