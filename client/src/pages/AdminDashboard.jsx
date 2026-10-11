import { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [tab, setTab] = useState('users');
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    const fetchData = async () => {
      const usersRes = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(await usersRes.json());
      const recipesRes = await fetch('/api/admin/recipes', { headers: { Authorization: `Bearer ${token}` } });
      setRecipes(await recipesRes.json());
    };
    fetchData();
  }, [token]);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setUsers(users.filter(u => u._id !== id));
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    await fetch(`/api/admin/recipes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setRecipes(recipes.filter(r => r._id !== id));
  };

  return (
    <div className="container py-5" style={{ marginTop: '80px' }}>
      <h2 className="fw-bolder mb-5">Admin Dashboard 👑</h2>
      
      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="glass-card p-4 text-center">
            <h3 className="fw-bolder mb-0">{users.length}</h3>
            <p className="text-secondary mb-0">Total Users</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-4 text-center">
            <h3 className="fw-bolder mb-0">{recipes.length}</h3>
            <p className="text-secondary mb-0">Total Recipes</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-4 text-center">
            <h3 className="fw-bolder mb-0">★ {recipes.length > 0 ? (recipes.reduce((acc, r) => acc + r.rating, 0) / recipes.length).toFixed(1) : '0.0'}</h3>
            <p className="text-secondary mb-0">Avg. Rating</p>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs border-secondary mb-4">
        <li className="nav-item"><button className={`nav-link fw-bolder ${tab === 'users' ? 'active' : 'text-secondary'}`} onClick={() => setTab('users')}>Manage Users</button></li>
        <li className="nav-item"><button className={`nav-link fw-bolder ${tab === 'recipes' ? 'active' : 'text-secondary'}`} onClick={() => setTab('recipes')}>Manage Recipes</button></li>
      </ul>

      {tab === 'users' && (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td><td>{u.email}</td><td><span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>{u.role}</span></td>
                    <td><button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(u._id)} disabled={u.role === 'admin'}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'recipes' && (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Action</th></tr></thead>
              <tbody>
                {recipes.map(r => (
                  <tr key={r._id}>
                    <td>{r.title}</td><td>{r.author?.name}</td><td>{r.category}</td>
                    <td><button className="btn btn-sm btn-outline-danger" onClick={() => deleteRecipe(r._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;