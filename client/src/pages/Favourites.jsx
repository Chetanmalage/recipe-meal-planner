import { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import { LoadingGrid } from '../components/LoadingSkeleton';
import SEO from '../components/SEO';
import api from '../api/axios';
import { getSavedStarterRecipes } from '../data/starterRecipes';

const Favourites = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchFavs = async () => {
      const savedStarterRecipes = getSavedStarterRecipes();
      try {
        const { data } = await api.get('/users/favourites');
        if (active) setRecipes([...savedStarterRecipes, ...(data.recipes || [])]);
      } catch {
        if (active) setRecipes(savedStarterRecipes);
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchFavs();
    return () => { active = false; };
  }, []);

  return (
    <>
      <SEO title="My Favourites" description="Your saved recipes, ready for another good meal." />
      <main className="container page-shell">
        <header className="page-heading">
          <p className="eyebrow">Your personal cookbook</p>
          <h1>Recipes to <span className="text-accent">come back to.</span></h1>
          <p>Your saved community favorites and house recipes live together here.</p>
        </header>
        {loading ? <LoadingGrid count={3} /> : recipes.length === 0 ? (
          <div className="empty-state"><span aria-hidden="true">♡</span><h3>Your cookbook is waiting.</h3><p>Save a house recipe on this device, or explore the community cookbook to find your next favorite.</p><a className="btn btn-premium" href="/#house-recipes">Browse recipes</a></div>
        ) : (
          <div className="recipe-grid">{recipes.map((recipe) => <RecipeCard recipe={recipe} key={recipe._id} />)}</div>
        )}
      </main>
    </>
  );
};

export default Favourites;
