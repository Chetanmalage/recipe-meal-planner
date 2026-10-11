import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import api from '../api/axios';

const AddRecipe = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', ingredients: '', steps: '',
    category: 'Breakfast', prepTime: '', cookTime: '', servings: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('prepTime', formData.prepTime || 0);
      data.append('cookTime', formData.cookTime || 0);
      data.append('servings', formData.servings || 2);
      data.append('ingredients', JSON.stringify(formData.ingredients.split('\n').filter(Boolean)));
      data.append('steps', JSON.stringify(formData.steps.split('\n').filter(Boolean)));
      if (image) data.append('image', image);

      await api.post('/recipes', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Recipe published! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Add Recipe" />
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <div className="glass-card p-5 animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="fw-bolder mb-4">Share a New Recipe</h2>
          <form onSubmit={handleSubmit}>
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
                <label className="form-label fw-semibold">Recipe Image (max 5MB)</label>
                <input type="file" accept="image/*" className="form-control bg-transparent text-white" onChange={handleImage} />
              </div>
            </div>
            {imagePreview && (
              <div className="mb-3">
                <img src={imagePreview} alt="Preview" className="img-fluid rounded" style={{ maxHeight: '250px' }} />
              </div>
            )}
            <button className="btn btn-premium w-100 py-2 mt-3" type="submit" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Recipe'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
export default AddRecipe;