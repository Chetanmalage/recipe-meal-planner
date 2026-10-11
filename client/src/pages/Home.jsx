import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { LoadingGrid } from '../components/LoadingSkeleton';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import starterRecipes from '../data/starterRecipes';

const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];
const starterFilters = [
  { id: 'all', label: 'All house recipes' },
  { id: 'quick', label: 'Ready in 30 min' },
  { id: 'vegetarian', label: 'Vegetarian' },
];

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [starterFilter, setStarterFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0, page: 1 });
  const [loadError, setLoadError] = useState(false);
  const requestIdRef = useRef(0);
  const { user } = useAuth();

  const visibleStarters = useMemo(() => starterRecipes.filter((recipe) => {
    const searchableText = [recipe.title, recipe.description, recipe.category, recipe.cuisine, ...(recipe.ingredients || [])].join(' ').toLowerCase();
    const matchesKeyword = !debouncedKeyword || searchableText.includes(debouncedKeyword.toLowerCase());
    const matchesCategory = activeCategory === 'All' || recipe.category === activeCategory;
    const matchesHouseFilter = starterFilter === 'all'
      || (starterFilter === 'quick' && recipe.prepTime + recipe.cookTime <= 30)
      || (starterFilter === 'vegetarian' && recipe.vegetarian);
    return matchesKeyword && matchesCategory && matchesHouseFilter;
  }), [starterFilter, debouncedKeyword, activeCategory]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const fetchRecipes = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoadError(false);
    try {
      const { data } = await api.get('/recipes', {
        params: { keyword: debouncedKeyword, category: activeCategory === 'All' ? '' : activeCategory, page, limit: 9 },
      });
      if (requestId === requestIdRef.current) {
        setRecipes(data.items || []);
        setPagination(data.pagination || { pages: 1, total: 0, page: 1 });
      }
    } catch {
      if (requestId === requestIdRef.current) {
        setRecipes([]);
        setPagination({ pages: 1, total: 0, page: 1 });
        setLoadError(true);
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [debouncedKeyword, activeCategory, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchRecipes(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchRecipes]);

  useEffect(() => () => { requestIdRef.current += 1; }, []);

  const handleKeyword = (event) => {
    const nextKeyword = event.target.value;
    if (nextKeyword === keyword) return;
    requestIdRef.current += 1;
    setKeyword(nextKeyword);
    setPage(1);
    setLoading(true);
  };
  const handleCategory = (category) => {
    if (category === activeCategory) return;
    requestIdRef.current += 1;
    setActiveCategory(category);
    setPage(1);
    setLoading(true);
  };
  const changePage = (nextPage) => {
    if (nextPage === page) return;
    requestIdRef.current += 1;
    setPage(nextPage);
    setLoading(true);
    document.getElementById('recipe-discovery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <SEO title="Indian recipes made for sharing" description="Explore Indian home recipes, save the ones you love, and make weeknight cooking feel easier with Arshiya’s Kitchen." image="/images/indian-thali-hero.webp" />
      <main className="container home-shell">
        <section className="hero-panel animate-fade-in" aria-labelledby="home-title">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span aria-hidden="true">✿</span> Indian food, made for real life</p>
            <h1 id="home-title">Make something<br /><span>delicious.</span></h1>
            <p className="hero-subtitle">Regional Indian favorites, practical weeknight meals and the kind of recipes home cooks love to pass around.</p>
            <div className="hero-actions">
              {user ? <Link to="/add-recipe" className="btn btn-premium btn-lg">Share a recipe <span aria-hidden="true">↗</span></Link> : <a className="btn btn-premium btn-lg" href="#house-recipes">Find your next favorite <span aria-hidden="true">↓</span></a>}
              <a className="hero-text-link" href="#recipe-discovery">Visit the community cookbook <span aria-hidden="true">↗</span></a>
            </div>
            <div className="hero-trust"><span className="hero-trust-mark" aria-hidden="true">A</span><span>Made for real kitchens, by people who cook.</span></div>
          </div>
          <div className="hero-visual">
            <figure className="hero-photo">
              <img src="/images/indian-thali-hero.webp" alt="A traditional Indian thali with dal, rice, roti and chutney" fetchPriority="high" />
              <figcaption><span>From our Indian kitchen</span><strong>There’s always room for one more.</strong></figcaption>
            </figure>
            <div className="hero-note-card"><span className="hero-note-icon" aria-hidden="true">✳</span><div><strong>Good food, no fuss</strong><span>Find a new Indian favorite.</span></div></div>
            <span className="hero-sticker" aria-hidden="true">made<br />with love</span>
          </div>
        </section>

        <section className="welcome-strip" aria-label="What you can do">
          <div><span className="welcome-icon" aria-hidden="true">⌕</span><p><strong>Find your next favorite</strong><span>Recipes for quick lunches and long dinners.</span></p></div>
          <div><span className="welcome-icon" aria-hidden="true">♡</span><p><strong>Keep the good ones close</strong><span>Save recipes you want to make again.</span></p></div>
          <div><span className="welcome-icon" aria-hidden="true">▦</span><p><strong>Make the week feel easier</strong><span>Build a flexible plan, one meal at a time.</span></p></div>
        </section>

        <section className="recipe-finder" aria-label="Search and filter recipes">
          <div className="search-row">
            <div className="search-box"><span aria-hidden="true">⌕</span><label className="visually-hidden" htmlFor="recipe-search">Search all recipes and ingredients</label><input id="recipe-search" type="search" placeholder="Search all recipes, ingredients, or ideas…" value={keyword} onChange={handleKeyword} />{keyword && <button type="button" className="search-clear" onClick={() => handleKeyword({ target: { value: '' } })} aria-label="Clear recipe search">×</button>}</div>
          </div>
          <div className="category-scroll" role="group" aria-label="Filter by meal type">
            {categories.map((category) => <button key={category} type="button" className={`category-filter${activeCategory === category ? ' is-active' : ''}`} aria-pressed={activeCategory === category} onClick={() => handleCategory(category)}>{category}</button>)}
          </div>
        </section>

        <section className="starter-section" id="house-recipes" aria-labelledby="starter-heading">
          <div className="section-heading starter-heading">
            <div><p className="eyebrow">From our Indian kitchen</p><h2 id="starter-heading">Everyday favorites, made at home.</h2><p className="section-intro">Regional Indian breakfasts, curries, snacks and sweets. No account needed to get cooking.</p></div>
            <span className="starter-count">{visibleStarters.length} of {starterRecipes.length} Indian recipes</span>
          </div>
          <div className="starter-toolbar" role="group" aria-label="Filter house recipes">
            <span className="starter-toolbar-label">Find your kind of recipe</span>
            <div className="starter-filters">
              {starterFilters.map((filter) => <button key={filter.id} type="button" className={`starter-filter${starterFilter === filter.id ? ' is-active' : ''}`} aria-pressed={starterFilter === filter.id} onClick={() => setStarterFilter(filter.id)}>{filter.label}</button>)}
            </div>
          </div>
          {visibleStarters.length ? <div className="recipe-grid starter-grid">{visibleStarters.map((recipe) => <RecipeCard recipe={recipe} key={recipe._id} />)}</div> : (
            <div className="starter-empty-state"><h3>No house recipes match those filters.</h3><p>Try another search, or continue to the community cookbook below.</p><button className="btn btn-glass" type="button" onClick={() => { setStarterFilter('all'); handleKeyword({ target: { value: '' } }); handleCategory('All'); }}>Reset filters</button></div>
          )}
          {visibleStarters.length > 0 && <p className="starter-note"><span aria-hidden="true">✳</span> Every house recipe includes adjustable servings, a ready-to-copy shopping list, and a print-friendly view.</p>}
        </section>

        <section className="discovery-section" id="recipe-discovery" aria-labelledby="recipe-heading">
          <div className="section-heading discovery-heading">
            <div><p className="eyebrow">The community cookbook</p><h2 id="recipe-heading">What’s cooking at your place?</h2><p className="section-intro">Recipes shared by home cooks in our community.</p></div>
            <span className="results-count" aria-live="polite">{pagination.total} {pagination.total === 1 ? 'recipe' : 'recipes'}</span>
          </div>
          {loading ? <LoadingGrid count={6} /> : loadError ? (
            <div className="empty-state" role="alert"><span aria-hidden="true">☕</span><h3>The community kitchen is taking a breather.</h3><p>We couldn’t reach the shared cookbook just now. The house recipes above are ready to browse while it comes back.</p><button className="btn btn-premium" type="button" onClick={() => { setLoading(true); void fetchRecipes(); }}>Try again</button></div>
          ) : recipes.length === 0 ? (
            <div className="empty-state"><span aria-hidden="true">✿</span><h3>{keyword || activeCategory !== 'All' ? 'No matches this time.' : 'Be the first to share a favorite.'}</h3><p>{keyword || activeCategory !== 'All' ? 'Try a different search or meal type.' : 'The house recipes above are a good place to start — then add a recipe of your own.'}</p>{user ? <Link to="/add-recipe" className="btn btn-premium">Share a recipe</Link> : <Link to="/register" className="btn btn-premium">Join the table</Link>}</div>
          ) : (
            <>
              <div className="recipe-grid">{recipes.map((recipe) => <RecipeCard recipe={recipe} key={recipe._id} />)}</div>
              {pagination.pages > 1 && <nav className="pagination-bar" aria-label="Recipe pages"><button className="btn btn-glass" type="button" disabled={page <= 1} onClick={() => changePage(page - 1)}>← Previous</button><span>Page <strong>{pagination.page}</strong> of {pagination.pages}</span><button className="btn btn-glass" type="button" disabled={page >= pagination.pages} onClick={() => changePage(page + 1)}>Next →</button></nav>}
            </>
          )}
        </section>
      </main>
    </>
  );
};

export default Home;
