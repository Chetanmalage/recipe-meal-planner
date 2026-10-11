import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { LoadingPage } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const RecipeDetails = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadRecipe = async () => {
      try {
        const { data } = await api.get(`/recipes/${id}`);
        if (active) setRecipe(data.recipe);
      } catch {
        if (active) navigate('/', { replace: true });
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadRecipe();
    return () => { active = false; };
  }, [id, navigate]);

  useEffect(() => {
    let active = true;
    if (user) {
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
    if (!user) {
      toast.info('Log in to save recipes to your favourites');
      navigate('/login');
      return;
    }
    try {
      await api.put(`/users/favourites/${id}`);
      setIsFavourite((current) => !current);
      toast.success(favoriteActive ? 'Removed from favourites' : 'Saved to favourites');
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

  if (loading) return <LoadingPage />;
  if (!recipe) return null;

  const isAuthor = user && recipe.author && user._id === recipe.author._id;
  const isAdmin = user?.role === 'admin';
  const favoriteActive = Boolean(user && isFavourite);
  const hasReviewed = user && recipe.reviews?.some((review) => (review.user?._id || review.user) === user._id);
  const stars = '★'.repeat(Math.round(recipe.rating || 0)) + '☆'.repeat(5 - Math.round(recipe.rating || 0));

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
              <p>By {recipe.author?.name || 'A community cook'} <span aria-hidden="true">·</span> <span className="rating-stars">{stars}</span> {Number(recipe.rating || 0).toFixed(1)} ({recipe.numReviews || 0} reviews)</p>
            </div>
          </div>
          <div className="recipe-detail-content">
            <p className="recipe-intro">{recipe.description}</p>
            <div className="recipe-stats">
              <div><strong>{recipe.prepTime || 0}<small> min</small></strong><span>Prep time</span></div>
              <div><strong>{recipe.cookTime || 0}<small> min</small></strong><span>Cook time</span></div>
              <div><strong>{recipe.servings || 2}</strong><span>Servings</span></div>
              <div><strong>{(recipe.prepTime || 0) + (recipe.cookTime || 0)}<small> min</small></strong><span>Total time</span></div>
            </div>
            <div className="recipe-method-grid">
              <section>
                <p className="eyebrow">Gather these</p><h2>Ingredients</h2>
                <ul className="ingredient-list">{(recipe.ingredients || []).map((ingredient, index) => <li key={`${ingredient}-${index}`}><span className="ingredient-dot" />{ingredient}</li>)}</ul>
              </section>
              <section>
                <p className="eyebrow">Make it happen</p><h2>Method</h2>
                <ol className="instruction-list">{(recipe.steps || []).map((step, index) => <li key={`${step}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
              </section>
            </div>
            <section className="reviews-section">
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
            </section>
          </div>
        </article>
        <div className="recipe-actions">
          <button className={`btn ${favoriteActive ? 'btn-premium' : 'btn-glass'}`} onClick={handleFavourite} aria-pressed={favoriteActive}>{favoriteActive ? '♥ Saved' : '♡ Save recipe'}</button>
          {(isAuthor || isAdmin) && <Link to={`/edit-recipe/${recipe._id}`} className="btn btn-glass">Edit recipe</Link>}
          {isAuthor || isAdmin ? <button className="btn btn-danger-soft" onClick={handleDelete}>Delete recipe</button> : null}
        </div>
      </main>
    </>
  );
};

export default RecipeDetails;
