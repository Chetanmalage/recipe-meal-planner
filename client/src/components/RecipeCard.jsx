import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  return (
    <div className="glass-card h-100 d-flex flex-column animate-fade-in">
      <div className="position-relative">
        <img src={recipe.imageUrl} className="card-img-top recipe-img" alt={recipe.title} />
        <span className="badge bg-dark bg-opacity-75 position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill">{recipe.category}</span>
      </div>
      <div className="card-body d-flex flex-column p-4">
        <h5 className="card-title fw-bold mb-2">{recipe.title}</h5>
        <p className="card-text text-secondary small flex-grow-1">{recipe.description.substring(0, 90)}...</p>
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-secondary border-opacity-25">
          <div className="text-warning">
            {'★'.repeat(Math.round(recipe.rating))}
            <span className="text-secondary ms-1">({recipe.numReviews})</span>
          </div>
          <Link to={`/recipe/${recipe._id}`} className="btn btn-premium btn-sm">View</Link>
        </div>
      </div>
    </div>
  );
};
export default RecipeCard;