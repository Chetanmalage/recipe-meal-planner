import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', ingredients: '', steps: '', imageUrl: '', category: 'Breakfast', prepTime: '', cookTime: '', servings: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      const res = await fetch(`/api/recipes/${id}`);
      const data = await res.json();
      setFormData({
        title: data.title, description: data.description,
        ingredients: data.ingredients.join('\n'), steps: data.steps.join('\n'),
        imageUrl: data.imageUrl, category: data.category,
        prepTime: data.prepTime, cookTime: data.cookTime, servings: data.servings
      });
    };
    fetchRecipe();
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    const recipeData = {
      ...formData,
      ingredients: formData.ingredients.split('\n').filter(i => i.trim()),
      steps: formData.steps.split('\n').filter(s => s.trim()),
      prepTime: Number(formData.prepTime), cookTime: Number(formData.cookTime), servings: Number(formData.servings)
    };
    const res = await fetch(`/api/recipes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(recipeData),
    });
    if (res.ok) navigate(`/recipe/${id}`);
    else setError('Failed to update recipe');
  };

  return (
    <div className="container py-5" style={{ marginTop: '80px' }}>
      <div className="glass-card p-5 animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="fw-bolder mb-4">Edit Recipe</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Same form fields as AddRecipe, but using formData values */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Recipe Title</label>
            <input type="text" name="title" className="form-control bg-transparent text-white" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Short Description</label>
            <textarea name="description" className="form-control bg-transparent text-white" rows="2" value={formData.description} onChange={handleChange} required />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Ingredients (one per line)</label>
              <textarea name="ingredients" className="form-control bg-transparent text-white" rows="5" value={formData.ingredients} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Steps (one per line)</label>
              <textarea name="steps" className="form-control bg-transparent text-white" rows="5" value={formData.steps} onChange={handleChange} required />
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Category</label>
              <select name="category" className="form-select bg-transparent text-white" value={formData.category} onChange={handleChange}>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Dessert">Dessert</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Prep Time (mins)</label>
              <input type="number" name="prepTime" className="form-control bg-transparent text-white" value={formData.prepTime} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Cook Time (mins)</label>
              <input type="number" name="cookTime" className="form-control bg-transparent text-white" value={formData.cookTime} onChange={handleChange} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Servings</label>
              <input type="number" name="servings" className="form-control bg-transparent text-white" value={formData.servings} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Image URL (optional)</label>
              <input type="text" name="imageUrl" className="form-control bg-transparent text-white" value={formData.imageUrl} onChange={handleChange} />
            </div>
          </div>
          <button className="btn btn-premium w-100 py-2 mt-3" type="submit">Update Recipe</button>
        </form>
      </div>
    </div>
  );
};
export default EditRecipe;