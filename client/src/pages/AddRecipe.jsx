import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import api from '../api/axios';

const AddRecipe = () => {
  const [formData, setFormData] = useState({ title: '', description: '', ingredients: '', steps: '', category: 'Dinner', prepTime: 0, cookTime: 0, servings: 2 });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Choose a JPG, PNG, or WebP image');
      event.target.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be 3 MB or smaller');
      event.target.value = '';
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      for (const [key, value] of Object.entries(formData)) payload.append(key, value);
      payload.set('ingredients', JSON.stringify(formData.ingredients.split('\n').map((value) => value.trim()).filter(Boolean)));
      payload.set('steps', JSON.stringify(formData.steps.split('\n').map((value) => value.trim()).filter(Boolean)));
      if (image) payload.append('image', image);
      const { data } = await api.post('/recipes', payload);
      toast.success('Your recipe is on the table');
      navigate(`/recipe/${data.recipe._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not publish this recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Share a Recipe" description="Share a favorite recipe with the Arshiya's Kitchen community." />
      <main className="container page-shell">
        <section className="form-panel">
          <p className="eyebrow">Pass a good thing around</p>
          <h1>Share a recipe</h1>
          <p className="auth-copy" style={{ textAlign: 'left' }}>Add the details that help someone else make it their own.</p>
          <form onSubmit={handleSubmit} className="recipe-form">
            <label>Recipe title<input name="title" className="form-control" minLength="3" maxLength="120" placeholder="The dish everyone asks you to make" value={formData.title} onChange={handleChange} required /></label>
            <label>Short description<textarea name="description" className="form-control" rows="3" minLength="10" maxLength="500" placeholder="A little about what makes it special…" value={formData.description} onChange={handleChange} required /></label>
            <div className="form-columns">
              <label>Ingredients <span className="field-hint">One ingredient per line</span><textarea name="ingredients" className="form-control" rows="7" placeholder={'2 cups flour\n1 tsp salt'} value={formData.ingredients} onChange={handleChange} required /></label>
              <label>Instructions <span className="field-hint">One step per line</span><textarea name="steps" className="form-control" rows="7" placeholder={'Preheat the oven…\nMix the ingredients…'} value={formData.steps} onChange={handleChange} required /></label>
            </div>
            <div className="form-columns form-columns-3">
              <label>Category<select name="category" className="form-select" value={formData.category} onChange={handleChange}>{['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'].map((category) => <option key={category}>{category}</option>)}</select></label>
              <label>Prep time (mins)<input name="prepTime" type="number" min="0" max="1440" className="form-control" value={formData.prepTime} onChange={handleChange} /></label>
              <label>Cook time (mins)<input name="cookTime" type="number" min="0" max="1440" className="form-control" value={formData.cookTime} onChange={handleChange} /></label>
            </div>
            <div className="form-columns">
              <label>Servings<input name="servings" type="number" min="1" max="100" className="form-control" value={formData.servings} onChange={handleChange} /></label>
              <label>Recipe photo <span className="field-hint">JPG, PNG, or WebP · up to 3 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" className="form-control" onChange={handleImage} /></label>
            </div>
            {imagePreview && <img className="edit-image-preview" src={imagePreview} alt="Recipe photo preview" />}
            <button className="btn btn-premium btn-lg" type="submit" disabled={loading}>{loading ? 'Publishing…' : 'Publish recipe'}</button>
          </form>
        </section>
      </main>
    </>
  );
};

export default AddRecipe;
