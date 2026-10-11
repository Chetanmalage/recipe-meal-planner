import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { LoadingPage } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const RecipeDetails = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data } = await api.get(`/recipes/${id}`);
        setRecipe(data.recipe);
      } catch {
        toast.error('Recipe not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe permanently?')) return;
    try {
      await api.delete(`/recipes/${id}`);
      toast.success('Recipe deleted');
      navigate('/');
    } catch { /* handled */ }
  };

  const handleFavourite = async () => {
    if (!user) return toast.info('Please login to save favourites');
    try {
      await api.put(`/users/favourites/${id}`);
      toast.success('Favourites updated!');
    } catch { /* handled */ }
  };

  if (loading) return <LoadingPage />;
  if (!recipe) return null;

  const isAuthor = user && recipe.author && user._id === recipe.author._id;

  return (
    <>
      <SEO
        title={recipe.title}
        description={recipe.description}
        image={recipe.imageUrl}
      />
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="position-relative">
            <img src={recipe.imageUrl} alt={recipe.title} className="w-100" style={{ height: '450px', objectFit: 'cover' }} loading="lazy" />
            <div className="position-absolute bottom-0 start-0 w-100 p-5" style={{ background: 'linear-gradient(to top, rgba(15,23,42,1), transparent)' }}>
              <span className="badge bg-warning text-dark mb-2">{recipe.category}</span>
              <h1 className="display-5 fw-bolder text-white">{recipe.title}</h1>
              <p className="text-light mb-0">By {recipe.author?.name} | ★ {recipe.rating.toFixed(1)} ({recipe.numReviews} reviews)</p>
            </div>
          </div>
          <div className="p-5">
            <p className="lead text-secondary mb-5">{recipe.description}</p>
            <div className="row text-center mb-5 g-3">
              <div className="col-4">
                <div className="glass-card p-3">
                  <h4 className="fw-bolder mb-0">{recipe.prepTime}</h4>
                  <small className="text-secondary">Prep (mins)</small>
                </div>
              </div>
              <div className="col-4">
                <div className="glass-card p-3">
                  <h4 className="fw-bolder mb-0">{recipe.cookTime}</h4>
                  <small className="text-secondary">Cook (mins)</small>
                </div>
              </div>
              <div className="col-4">
                <div className="glass-card p-3">
                  <h4 className="fw-bolder mb-0">{recipe.servings}</h4>
                  <small className="text-secondary">Servings</small>
                </div>
              </div>
            </div>
            <div className="row g-5">
              <div className="col-md-4">
                <h3 className="fw-bolder mb-3">Ingredients</h3>
                <ul className="list-group list-group-flush">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="list-group-item bg-transparent text-secondary border-secondary border-opacity-25">{ing}</li>
                  ))}
                </ul>
              </div>
              <div className="col-md-8">
                <h3 className="fw-bolder mb-3">Instructions</h3>
                <ol className="list-group list-group-numbered">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="list-group-item bg-transparent text-secondary border-secondary border-opacity-25">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
          <button className="btn btn-glass" onClick={handleFavourite}>❤️ Favourite</button>
          {isAuthor && (
            <>
              <Link to={`/edit-recipe/${recipe._id}`} className="btn btn-glass">Edit</Link>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default RecipeDetails;