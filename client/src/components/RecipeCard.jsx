import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  const rating = Number(recipe.rating || 0);
  const image = recipe.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=900&q=80';
  const description = recipe.description || 'A delicious recipe from the Arshiya’s Kitchen community.';
  const totalTime = (Number(recipe.prepTime) || 0) + (Number(recipe.cookTime) || 0);
  const hasRating = Number(recipe.numReviews || 0) > 0;

  return (
    <article className="recipe-card animate-fade-in">
      <Link to={`/recipe/${recipe._id}`} className="recipe-card-image-link" aria-label={`View ${recipe.title}`}>
        <img src={image} className="recipe-card-image" alt={recipe.title} loading="lazy" />
        <span className="category-pill">{recipe.category || 'Kitchen favorite'}</span>
      </Link>
      <div className="recipe-card-body">
        <div className="recipe-card-meta"><span>{totalTime ? `${totalTime} min total` : 'Made to enjoy'}</span>{hasRating ? <span className="rating-stars" aria-label={`${rating.toFixed(1)} out of 5 stars`}>★ <span>{rating.toFixed(1)}</span></span> : <span className="recipe-origin">{recipe.isStarter ? recipe.cuisine || 'Indian kitchen' : 'New to the table'}</span>}</div>
        <h2><Link to={`/recipe/${recipe._id}`}>{recipe.title}</Link></h2>
        <p>{description.length > 105 ? `${description.slice(0, 105).trimEnd()}…` : description}</p>
        <div className="recipe-card-footer">
          <span>{recipe.author?.name ? `By ${recipe.author.name}` : `${recipe.numReviews || 0} reviews`}</span>
          <Link to={`/recipe/${recipe._id}`} className="text-link">Get cooking <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </article>
  );
};

export default RecipeCard;
