import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { LoadingGrid } from '../components/LoadingSkeleton';
import api from '../api/axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [userResponse, recipeResponse] = await Promise.all([api.get('/admin/users'), api.get('/admin/recipes')]);
      setUsers(userResponse.data.users || []);
      setRecipes(recipeResponse.data.recipes || []);
    } catch {
      // Shared API interceptor reports the failure.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchData(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name} and their recipes? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers((current) => current.filter((entry) => entry._id !== user._id));
      setRecipes((current) => current.filter((entry) => (entry.author?._id || entry.author) !== user._id));
      toast.success('User and their recipes deleted');
    } catch {
      // Shared API interceptor reports the failure.
    }
  };

  const deleteRecipe = async (recipe) => {
    if (!window.confirm(`Delete “${recipe.title}”? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/recipes/${recipe._id}`);
      setRecipes((current) => current.filter((entry) => entry._id !== recipe._id));
      toast.success('Recipe deleted');
    } catch {
      // Shared API interceptor reports the failure.
    }
  };

  const averageRating = recipes.length ? (recipes.reduce((total, recipe) => total + Number(recipe.rating || 0), 0) / recipes.length).toFixed(1) : '—';

  return (
    <>
      <SEO title="Admin Dashboard" />
      <main className="container page-shell">
        <header className="page-heading"><p className="eyebrow">Community kitchen</p><h1>Admin dashboard</h1><p>Keep the community welcoming and the cookbook in good shape.</p></header>
        {loading ? <LoadingGrid count={3} /> : <>
          <div className="admin-stat-grid">
            {[['Community members', users.length], ['Shared recipes', recipes.length], ['Average rating', averageRating]].map(([label, value]) => <div className="admin-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}
          </div>
          <div className="admin-tabs" role="tablist" aria-label="Admin sections">
            <button className={tab === 'users' ? 'is-active' : ''} role="tab" aria-selected={tab === 'users'} onClick={() => setTab('users')}>Members <span>{users.length}</span></button>
            <button className={tab === 'recipes' ? 'is-active' : ''} role="tab" aria-selected={tab === 'recipes'} onClick={() => setTab('recipes')}>Recipes <span>{recipes.length}</span></button>
          </div>
          <div className="admin-table-wrap">
            {tab === 'users' ? <table className="admin-table"><thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Action</th></tr></thead><tbody>{users.map((user) => <tr key={user._id}><td>{user.name}</td><td>{user.email}</td><td><span className={`role-pill${user.role === 'admin' ? ' role-admin' : ''}`}>{user.role}</span></td><td><button className="btn btn-danger-soft btn-sm" disabled={user.role === 'admin'} onClick={() => void deleteUser(user)}>Delete</button></td></tr>)}</tbody></table> : <table className="admin-table"><thead><tr><th>Recipe</th><th>Author</th><th>Category</th><th>Rating</th><th>Action</th></tr></thead><tbody>{recipes.map((recipe) => <tr key={recipe._id}><td>{recipe.title}</td><td>{recipe.author?.name || 'Unknown'}</td><td>{recipe.category}</td><td>{Number(recipe.rating || 0).toFixed(1)} ★</td><td><button className="btn btn-danger-soft btn-sm" onClick={() => void deleteRecipe(recipe)}>Delete</button></td></tr>)}</tbody></table>}
          </div>
        </>}
      </main>
    </>
  );
};

export default AdminDashboard;
