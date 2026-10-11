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
  const [pagination, setPagination] = useState({ pages: 1, total: 0, page: 1 });
  const { user } = useAuth();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const fetchRecipes = useCallback(async () => {
    try {
      const { data } = await api.get('/recipes', {
        params: { keyword: debouncedKeyword, category: activeCategory === 'All' ? '' : activeCategory, page, limit: 9 },
      });
      setRecipes(data.items || []);
      setPagination(data.pagination || { pages: 1, total: 0, page: 1 });
    } catch {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, activeCategory, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchRecipes(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchRecipes]);

  const handleKeyword = (event) => {
    setKeyword(event.target.value);
    setPage(1);
    setLoading(true);
  };
  const handleCategory = (category) => {
    setActiveCategory(category);
    setPage(1);
    setLoading(true);
  };
  const changePage = (nextPage) => {
    setPage(nextPage);
    setLoading(true);
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <>
      <SEO title="Discover Recipes" description="Find your next favorite, share a dish, and make weeknight cooking feel easier." />
      <main className="container home-shell">
        <section className="home-hero animate-fade-in">
          <div className="home-hero-content">
            <span className="eyebrow">Good food brings us together</span>
            <h1>A little more joy<br />in <em>every bite.</em></h1>
            <p>Find a new favorite, trade recipes with your community, and make space for something delicious.</p>
            <div className="hero-actions">
              {user ? <Link to="/add-recipe" className="btn btn-premium btn-lg">Share your recipe <span aria-hidden="true">↗</span></Link> : <Link to="/register" className="btn btn-premium btn-lg">Join the table <span aria-hidden="true">↗</span></Link>}
              <a className="hero-text-link" href="#recipe-discovery">Explore recipes <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-note"><span className="hero-note-dot" /> A community made for curious cooks</div>
          </div>
          <div className="home-hero-art" aria-hidden="true">
            <div className="hero-art-orbit hero-art-orbit-one" />
            <div className="hero-art-orbit hero-art-orbit-two" />
            <div className="hero-art-center"><img src="/images/community-table.jpg" alt="A colorful shared meal" /><span>made<br />with <em>love</em></span><i>✳</i></div>
            <span className="hero-art-caption">your next favorite is waiting</span>
          </div>
        </section>

        <section className="discovery-section" id="recipe-discovery">
          <div className="section-heading discovery-heading">
            <div><p className="eyebrow">The community cookbook</p><h2>Find your next favorite.</h2></div>
            <span className="results-count">{pagination.total} {pagination.total === 1 ? 'recipe' : 'recipes'}</span>
          </div>
          <div className="search-row">
            <div className="search-box"><span aria-hidden="true">⌕</span><label className="visually-hidden" htmlFor="recipe-search">Search recipes</label><input id="recipe-search" type="search" placeholder="Search dishes, ingredients, anything…" value={keyword} onChange={handleKeyword} /><kbd>⌕</kbd></div>
          </div>
          <div className="category-scroll" aria-label="Recipe categories">
            {categories.map((category) => <button key={category} className={`category-filter${activeCategory === category ? ' is-active' : ''}`} aria-pressed={activeCategory === category} onClick={() => handleCategory(category)}>{category}</button>)}
          </div>
          {loading ? <LoadingGrid count={6} /> : recipes.length === 0 ? (
            <div className="empty-state"><span aria-hidden="true">✳</span><h3>Nothing simmering just yet.</h3><p>Try another search, or be the first to share a recipe with the community.</p>{user && <Link to="/add-recipe" className="btn btn-premium">Add a recipe</Link>}</div>
          ) : (
            <>
              <div className="recipe-grid">{recipes.map((recipe) => <RecipeCard recipe={recipe} key={recipe._id} />)}</div>
              {pagination.pages > 1 && <nav className="pagination-bar" aria-label="Recipe pages"><button className="btn btn-glass" disabled={page <= 1} onClick={() => changePage(page - 1)}>← Previous</button><span>Page <strong>{pagination.page}</strong> of {pagination.pages}</span><button className="btn btn-glass" disabled={page >= pagination.pages} onClick={() => changePage(page + 1)}>Next →</button></nav>}
            </>
          )}
        </section>
        <footer className="site-footer"><Link to="/">Arshiya&apos;s Kitchen</Link><span>Made for the love of good food.</span><Link to="/meal-planner">Plan your week →</Link></footer>
      </main>
    </>
  );
};

export default Home;
