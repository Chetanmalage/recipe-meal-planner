import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { LoadingPage } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { findStarterRecipe, getSavedStarterIds, toggleSavedStarter } from '../data/starterRecipes';

const scaleIngredient = (ingredient, ratio) => {
  const match = ingredient.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)(\s+)(.*)$/);
  if (!match) return ingredient;
  const [, amount, spacing, rest] = match;
  const quantity = amount.includes(' ')
    ? (() => {
      const [whole, fraction] = amount.split(' ');
      const [numerator, denominator] = fraction.split('/').map(Number);
      return Number(whole) + numerator / denominator;
    })()
    : amount.includes('/')
      ? (() => {
        const [numerator, denominator] = amount.split('/').map(Number);
        return numerator / denominator;
      })()
      : Number(amount);
  const scaled = quantity * ratio;
  const formatted = Number.isInteger(scaled) ? String(scaled) : String(Number(scaled.toFixed(2)));
  return `${formatted}${spacing}${rest}`;
};

const RecipeDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(() => id.startsWith('starter-') && getSavedStarterIds().includes(id));
  const [servings, setServings] = useState(2);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  useEffect(() => {
    let active = true;
    const loadRecipe = async () => {
      const starter = findStarterRecipe(id);
      if (starter) {
        if (active) {
          setRecipe(starter);
          setServings(starter.servings);
          setIsFavourite(getSavedStarterIds().includes(id));
          setLoading(false);
        }
        return;
      }
      try {
        const { data } = await api.get(`/recipes/${id}`);
        if (active) {
          setRecipe(data.recipe);
          setServings(data.recipe.servings || 2);
        }
      } catch {
        const starter = findStarterRecipe(id);
        if (active && starter) {
          setRecipe(starter);
          setServings(starter.servings);
        } else if (active) {
          navigate('/', { replace: true });
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadRecipe();
    return () => { active = false; };
  }, [id, navigate]);

  useEffect(() => {
    let active = true;
    if (!id.startsWith('starter-') && user) {
      api.get('/users/favourites').then(({ data }) => {
        if (active) setIsFavourite(data.recipes.some((item) => item._id === id));
      }).catch(() => {});
    }
    return () => { active = false; };
  }, [id, user]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/recipes/${id}`);
      toast.success('Recipe deleted');
      navigate('/');
    } catch {
      // The shared API interceptor displays the request error.
    }
  };

  const handleFavourite = async () => {
    if (recipe?.isStarter) {
      const isSaved = toggleSavedStarter(id);
      setIsFavourite(isSaved);
      toast.success(isSaved ? 'Saved to this device’s cookbook' : 'Removed from your cookbook');
      return;
    }
    if (!user) {
      toast.info('Log in to save community recipes to your favourites');
      navigate('/login');
      return;
    }
    try {
      await api.put(`/users/favourites/${id}`);
      setIsFavourite((current) => !current);
      toast.success(isFavourite ? 'Removed from favourites' : 'Saved to favourites');
    } catch {
      // The shared API interceptor displays the request error.
    }
  };

  const handleReview = async (event) => {
    event.preventDefault();
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/recipes/${id}/reviews`, { rating: Number(rating), comment });
      setRecipe(data.recipe);
      setComment('');
      toast.success('Thanks for sharing your review');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit your review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const copyShoppingList = async () => {
    const ingredients = (recipe.ingredients || []).map((ingredient) => `☐ ${scaleIngredient(ingredient, servings / (recipe.servings || servings))}`).join('\n');
    const shoppingList = `Shopping list: ${recipe.title} (serves ${servings})\n\n${ingredients}`;
    try {
      await navigator.clipboard.writeText(shoppingList);
      toast.success('Shopping list copied');
    } catch {
      toast.error('Clipboard access is unavailable in this browser');
    }
  };

  if (loading) return <LoadingPage />;
  if (!recipe) return null;

  const isAuthor = !recipe.isStarter && user && recipe.author && user._id === recipe.author._id;
  const isAdmin = !recipe.isStarter && user?.role === 'admin';
  const favoriteActive = Boolean(isFavourite);
  const hasReviewed = user && recipe.reviews?.some((review) => (review.user?._id || review.user) === user._id);
  const stars = '★'.repeat(Math.round(recipe.rating || 0)) + '☆'.repeat(5 - Math.round(recipe.rating || 0));
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <>
      <SEO title={recipe.title} description={recipe.description} image={recipe.imageUrl} />
      <main className="container page-shell">
        <article className="recipe-detail animate-fade-in">
          <div className="recipe-detail-cover">
            <img src={recipe.imageUrl} alt={recipe.title} />
            <div className="recipe-cover-overlay">
              <span className="category-pill">{recipe.category}</span>
              <h1>{recipe.title}</h1>
              <p>By {recipe.author?.name || 'A community cook'} <span aria-hidden="true">·</span> {recipe.isStarter ? <span className="starter-byline">A house recipe</span> : <><span className="rating-stars">{stars}</span> {Number(recipe.rating || 0).toFixed(1)} ({recipe.numReviews || 0} reviews)</>}</p>
            </div>
          </div>
          <div className="recipe-detail-content">
            <p className="recipe-intro">{recipe.description}</p>
            <div className="recipe-stats">
              <div><strong>{recipe.prepTime || 0}<small> min</small></strong><span>Prep time</span></div>
              <div><strong>{recipe.cookTime || 0}<small> min</small></strong><span>Cook time</span></div>
              <div><strong>{servings}</strong><span>Servings</span></div>
              <div><strong>{totalTime}<small> min</small></strong><span>Total time</span></div>
            </div>
            <div className="recipe-method-grid">
              <section>
                <div className="ingredient-heading">
                  <div><p className="eyebrow">Gather these</p><h2>Ingredients</h2></div>
                  <div className="serving-control" aria-label="Adjust servings">
                    <button type="button" onClick={() => setServings((count) => Math.max(1, count - 1))} aria-label="Decrease servings" disabled={servings <= 1}>−</button>
                    <span>{servings} <small>servings</small></span>
                    <button type="button" onClick={() => setServings((count) => Math.min(24, count + 1))} aria-label="Increase servings" disabled={servings >= 24}>+</button>
                  </div>
                </div>
                <ul className="ingredient-list">{(recipe.ingredients || []).map((ingredient, index) => <li key={`${ingredient}-${index}`}><span className="ingredient-dot" />{scaleIngredient(ingredient, servings / (recipe.servings || servings))}</li>)}</ul>
                <button className="btn btn-glass shopping-list-button" type="button" onClick={() => void copyShoppingList()}><span aria-hidden="true">▢</span> Copy shopping list</button>
              </section>
              <section>
                <p className="eyebrow">Make it happen</p><h2>Method</h2>
                <ol className="instruction-list">{(recipe.steps || []).map((step, index) => <li key={`${step}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
              </section>
            </div>
            {!recipe.isStarter && <section className="reviews-section">
              <div className="section-heading"><div><p className="eyebrow">Cooked it? Tell us</p><h2>Community notes <span>({recipe.numReviews || 0})</span></h2></div></div>
              {user && !hasReviewed ? (
                <form className="review-form" onSubmit={handleReview}>
                  <label>Rating<select className="form-select" value={rating} onChange={(event) => setRating(event.target.value)}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value === 1 ? '' : 's'}</option>)}</select></label>
                  <label className="review-comment">Your note<textarea className="form-control" rows="3" maxLength="500" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What did you enjoy? Any tips for the next cook?" required /></label>
                  <button className="btn btn-premium" type="submit" disabled={submittingReview}>{submittingReview ? 'Sending…' : 'Post review'}</button>
                </form>
              ) : !user ? (
                <p className="review-prompt"><Link to="/login">Log in</Link> to leave a review.</p>
              ) : <p className="review-prompt">Thanks for contributing a review to this recipe.</p>}
              {recipe.reviews?.length ? <div className="review-list">{[...recipe.reviews].reverse().map((review) => <article className="review-card" key={review._id}><div className="review-card-top"><strong>{review.name}</strong><span className="rating-stars" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></div><p>{review.comment}</p></article>)}</div> : <p className="review-prompt">No reviews yet. Be the first to share how it turned out.</p>}
            </section>}
          </div>
        </article>
        <div className="recipe-actions">
          <button className="btn btn-glass" type="button" onClick={() => window.print()}><span aria-hidden="true">⎙</span> Print recipe</button>
          <button className={`btn ${favoriteActive ? 'btn-premium' : 'btn-glass'}`} onClick={() => void handleFavourite()} aria-pressed={favoriteActive}>{favoriteActive ? '♥ Saved' : recipe.isStarter ? '♡ Save on this device' : '♡ Save recipe'}</button>
          {(isAuthor || isAdmin) && <Link to={`/edit-recipe/${recipe._id}`} className="btn btn-glass">Edit recipe</Link>}
          {(isAuthor || isAdmin) && <button className="btn btn-danger-soft" onClick={() => void handleDelete()}>Delete recipe</button>}
        </div>
      </main>
    </>
  );
};

export default RecipeDetails;
