import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { LoadingGrid } from '../components/LoadingSkeleton';
import api from '../api/axios';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MealPlanner = () => {
  const [mealPlan, setMealPlan] = useState({});
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [planResponse, recipeResponse] = await Promise.all([
        api.get('/users/mealplan'),
        api.get('/recipes', { params: { limit: 50 } }),
      ]);
      setMealPlan(planResponse.data.mealPlan || {});
      setAllRecipes(recipeResponse.data.items || []);
    } catch {
      // The shared API interceptor displays the request error.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const toggleMeal = async (day, recipeId) => {
    if (!recipeId) return;
    setSavingDay(day);
    try {
      const { data } = await api.put('/users/mealplan', { day, recipeId });
      setMealPlan(data.mealPlan || {});
      toast.success('Meal plan updated');
    } catch {
      // The shared API interceptor displays the request error.
    } finally {
      setSavingDay('');
    }
  };

  const getRecipe = (entry) => {
    if (entry && typeof entry === 'object') return entry;
    return allRecipes.find((recipe) => recipe._id === entry);
  };

  return (
    <>
      <SEO title="Weekly Meal Planner" description="Build a simple, flexible plan for the week ahead." />
      <main className="container page-shell">
        <header className="page-heading">
          <p className="eyebrow">A little more ease, every day</p>
          <h1>Your week, <span className="text-accent">well planned.</span></h1>
          <p>Choose recipes for each day. Add or remove them whenever your plans change.</p>
        </header>
        {loading ? <LoadingGrid count={4} /> : (
          <div className="meal-plan-grid">
            {days.map((day) => {
              const entries = mealPlan[day] || [];
              return (
                <section className="meal-day-card" key={day} aria-labelledby={`day-${day}`}>
                  <div className="meal-day-heading">
                    <div><span className="eyebrow">Your menu</span><h2 id={`day-${day}`}>{day}</h2></div>
                    <span className="meal-count">{entries.length} {entries.length === 1 ? 'meal' : 'meals'}</span>
                  </div>
                  <label className="visually-hidden" htmlFor={`select-${day}`}>Add a recipe to {day}</label>
                  <select id={`select-${day}`} className="form-select meal-select" value="" disabled={savingDay === day || allRecipes.length === 0} onChange={(event) => void toggleMeal(day, event.target.value)}>
                    <option value="">{allRecipes.length ? '+ Add a recipe' : 'No recipes available yet'}</option>
                    {allRecipes.map((recipe) => <option key={recipe._id} value={recipe._id}>{recipe.title}</option>)}
                  </select>
                  <ul className="meal-list">
                    {entries.map((entry, index) => {
                      const recipe = getRecipe(entry);
                      if (!recipe) return null;
                      return (
                        <li className="meal-item" key={recipe._id || `${day}-${index}`}>
                          <Link to={`/recipe/${recipe._id}`} className="meal-link">
                            <img src={recipe.imageUrl} alt="" loading="lazy" />
                            <span>{recipe.title}</span>
                          </Link>
                          <button className="icon-button" type="button" onClick={() => void toggleMeal(day, recipe._id)} disabled={savingDay === day} aria-label={`Remove ${recipe.title} from ${day}`} title="Remove from plan">×</button>
                        </li>
                      );
                    })}
                  </ul>
                  {!entries.length && <p className="meal-empty">Your menu is open. Add a recipe when you find one you love.</p>}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
};

export default MealPlanner;
