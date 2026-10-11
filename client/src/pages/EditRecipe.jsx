import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { LoadingPage } from '../components/LoadingSkeleton';
import api from '../api/axios';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [formData, setFormData] = useState({ title: '', description: '', ingredients: '', steps: '', category: 'Breakfast', prepTime: 0, cookTime: 0, servings: 2 });

  useEffect(() => {
    let active = true;
    api.get(`/recipes/${id}`)
      .then(({ data }) => {
        if (!active) return;
        const recipe = data.recipe;
        setCurrentImage(recipe.imageUrl || '');
        setFormData({
          title: recipe.title || '', description: recipe.description || '',
          ingredients: (recipe.ingredients || []).join('\n'), steps: (recipe.steps || []).join('\n'),
          category: recipe.category || 'Breakfast', prepTime: recipe.prepTime ?? 0,
          cookTime: recipe.cookTime ?? 0, servings: recipe.servings ?? 2,
        });
      })
      .catch(() => navigate('/', { replace: true }))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, navigate]);

  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      for (const [key, value] of Object.entries(formData)) payload.append(key, value);
      payload.set('ingredients', JSON.stringify(formData.ingredients.split('\n').map((value) => value.trim()).filter(Boolean)));
      payload.set('steps', JSON.stringify(formData.steps.split('\n').map((value) => value.trim()).filter(Boolean)));
      if (image) payload.append('image', image);
      await api.put(`/recipes/${id}`, payload);
      toast.success('Recipe updated');
      navigate(`/recipe/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update this recipe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <>
      <SEO title="Edit Recipe" />
      <main className="container page-shell">
        <section className="form-panel">
          <p className="eyebrow">Your recipe, refined</p>
          <h1>Edit recipe</h1>
          <form onSubmit={handleSubmit} className="recipe-form">
            <label>Recipe title<input name="title" className="form-control" minLength="3" maxLength="120" value={formData.title} onChange={handleChange} required /></label>
            <label>Short description<textarea name="description" className="form-control" rows="3" minLength="10" maxLength="500" value={formData.description} onChange={handleChange} required /></label>
            <div className="form-columns">
              <label>Ingredients <span className="field-hint">One ingredient per line</span><textarea name="ingredients" className="form-control" rows="7" value={formData.ingredients} onChange={handleChange} required /></label>
              <label>Instructions <span className="field-hint">One step per line</span><textarea name="steps" className="form-control" rows="7" value={formData.steps} onChange={handleChange} required /></label>
            </div>
            <div className="form-columns form-columns-3">
              <label>Category<select name="category" className="form-select" value={formData.category} onChange={handleChange}>{['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'].map((category) => <option key={category}>{category}</option>)}</select></label>
              <label>Prep time (mins)<input name="prepTime" type="number" min="0" max="1440" className="form-control" value={formData.prepTime} onChange={handleChange} /></label>
              <label>Cook time (mins)<input name="cookTime" type="number" min="0" max="1440" className="form-control" value={formData.cookTime} onChange={handleChange} /></label>
            </div>
            <div className="form-columns">
              <label>Servings<input name="servings" type="number" min="1" max="100" className="form-control" value={formData.servings} onChange={handleChange} /></label>
              <label>Replace photo <span className="field-hint">JPG, PNG, or WebP · max 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" className="form-control" onChange={(event) => setImage(event.target.files?.[0] || null)} /></label>
            </div>
            {currentImage && <img className="edit-image-preview" src={currentImage} alt="Current recipe" />}
            {image && <p className="field-hint">New photo selected: {image.name}</p>}
            <button className="btn btn-premium btn-lg" type="submit" disabled={saving}>{saving ? 'Saving changes…' : 'Save changes'}</button>
          </form>
        </section>
      </main>
    </>
  );
};

export default EditRecipe;
