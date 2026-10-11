import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { LoadingGrid } from '../components/LoadingSkeleton';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const { user } = useAuth();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 500);
    return () => clearTimeout(t);
  }, [keyword]);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const categoryParam = activeCategory === 'All' ? '' : activeCategory;
      const { data } = await api.get('/recipes', {
        params: { keyword: debouncedKeyword, category: categoryParam, page, limit: 9 },
      });
      setRecipes(data.items);
      setPagination(data.pagination);
    } catch { /* interceptor handles */ }
    finally { setLoading(false); }
  }, [debouncedKeyword, activeCategory, page]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedKeyword, activeCategory]);

  return (
    <>
      <SEO
        title="Discover Recipes"
        description="Explore thousands of recipes. Search, filter, and find your next favourite meal."
      />
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <div className="text-center mb-5 animate-fade-in">
          <h1 className="display-4 fw-bolder mb-3">
            Discover Your Next <span style={{ color: 'var(--accent)' }}>Favorite Meal</span>
          </h1>
          <p className="lead text-secondary mb-4">Explore a world of flavors, plan your week, and cook with confidence.</p>
          {user ? (
            <Link to="/add-recipe" className="btn btn-premium btn-lg">+ Share a Recipe</Link>
          ) : (
            <Link to="/register" className="btn btn-premium btn-lg">Join the Community</Link>
          )}
        </div>

        <div className="row justify-content-center mb-5">
          <div className="col-lg-8">
            <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border border-secondary border-opacity-25">
              <input
                type="text"
                className="form-control border-0 bg-transparent"
                placeholder="Search for recipes..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ color: 'var(--text-primary)' }}
              />
              {keyword && (
                <button className="btn btn-glass" onClick={() => setKeyword('')}>✕</button>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn rounded-pill px-4 ${activeCategory === cat ? 'btn-premium' : 'btn-glass'}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingGrid count={6} />
        ) : recipes.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-secondary">No recipes found.</h4>
            <p className="text-secondary">Try a different search or category.</p>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {recipes.map((recipe) => (
                <div className="col-12 col-sm-6 col-lg-4" key={recipe._id}>
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                <button
                  className="btn btn-glass"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Prev
                </button>
                <span className="text-secondary">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="btn btn-glass"
                  disabled={page === pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
export default Home;