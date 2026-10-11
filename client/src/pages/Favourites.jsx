import { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import { LoadingGrid } from '../components/LoadingSkeleton';
import SEO from '../components/SEO';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getSavedStarterRecipes } from '../data/starterRecipes';

const Favourites = () => {
  const { user } = useAuth();
  const [accountRecipes, setAccountRecipes] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const fetchFavs = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/users/favourites');
        if (active) setAccountRecipes(data.recipes || []);
      } catch {
        if (active) setAccountRecipes([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchFavs();
    return () => { active = false; };
  }, [user]);

  const recipes = [...getSavedStarterRecipes(), ...(user ? accountRecipes : [])];

  return (
    <>
      <SEO title="My Favourites" description="Your saved recipes, ready for another good meal." />
      <main className="container page-shell">
        <header className="page-heading">
          <p className="eyebrow">Your personal cookbook</p>
          <h1>Recipes to <span className="text-accent">come back to.</span></h1>
          <p>{user ? 'Your saved community favorites and house recipes live together here.' : 'Your house recipes saved on this device are ready whenever you are.'}</p>
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
