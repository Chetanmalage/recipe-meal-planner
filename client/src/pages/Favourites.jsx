import { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import { LoadingGrid } from '../components/LoadingSkeleton';
import SEO from '../components/SEO';
import api from '../api/axios';

const Favourites = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const { data } = await api.get('/users/favourites');
        setRecipes(data.recipes);
      } catch { /* handled */ }
      finally { setLoading(false); }
    };
    fetchFavs();
  }, []);

  return (
    <>
      <SEO title="My Favourites" />
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <h2 className="fw-bolder mb-5">Your Favourites ❤️</h2>
        {loading ? (
          <LoadingGrid count={3} />
        ) : recipes.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-secondary">No favourites yet. Start exploring!</p>
          </div>
        ) : (
          <div className="row g-4">
            {recipes.map((r) => (
              <div className="col-12 col-sm-6 col-lg-4" key={r._id}>
                <RecipeCard recipe={r} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
export default Favourites;