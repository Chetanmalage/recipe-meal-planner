import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { LoadingGrid } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import starterRecipes, { findStarterRecipe } from '../data/starterRecipes';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const LOCAL_PLAN_KEY = 'arshiyas-kitchen-week-plan-v1';

const readLocalPlan = () => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(LOCAL_PLAN_KEY) || '{}');
    return Object.fromEntries(days.map((day) => [
      day,
      Array.isArray(stored?.[day]) ? stored[day].filter((id) => typeof id === 'string') : [],
    ]));
  } catch {
    return {};
  }
};

const MealPlanner = () => {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState({});
  const [localPlan, setLocalPlan] = useState(readLocalPlan);
  const [allRecipes, setAllRecipes] = useState(starterRecipes);
  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState('');

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setAllRecipes(starterRecipes);
      if (!user) {
        setMealPlan({});
        setLoading(false);
        return;
      }

      setLoading(true);
      const [planResult, recipesResult] = await Promise.allSettled([
        api.get('/users/mealplan'),
        api.get('/recipes', { params: { limit: 50 } }),
      ]);
      if (!active) return;

      if (planResult.status === 'fulfilled') setMealPlan(planResult.value.data.mealPlan || {});
      else setMealPlan({});
      if (recipesResult.status === 'fulfilled') {
        setAllRecipes([...starterRecipes, ...(recipesResult.value.data.items || [])]);
      }
      setLoading(false);
    };

    void loadData();
    return () => { active = false; };
  }, [user]);

  const toggleMeal = async (day, recipe) => {
    if (!recipe) return;
    if (recipe.isStarter) {
      setLocalPlan((previous) => {
        const current = previous[day] || [];
        const nextIds = current.includes(recipe._id)
          ? current.filter((id) => id !== recipe._id)
          : [...current, recipe._id];
        const next = { ...previous, [day]: nextIds };
        try { window.localStorage.setItem(LOCAL_PLAN_KEY, JSON.stringify(next)); } catch { /* keep this session usable if storage is full */ }
        return next;
      });
      return;
    }
    if (!user) return;

    setSavingDay(day);
    try {
      const { data } = await api.put('/users/mealplan', { day, recipeId: recipe._id });
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

  const recipesForDay = (day) => {
    const plannedCommunity = Array.isArray(mealPlan[day]) ? mealPlan[day].map(getRecipe).filter(Boolean) : [];
    const plannedHouse = (localPlan[day] || []).map(findStarterRecipe).filter(Boolean);
    const unique = new Map([...plannedCommunity, ...plannedHouse].map((recipe) => [recipe._id, recipe]));
    return [...unique.values()];
  };

  const addSelectedRecipe = (day, value) => {
    const [type, id] = value.split(':', 2);
    const recipe = type === 'house'
      ? findStarterRecipe(id)
      : allRecipes.find((item) => item._id === id && !item.isStarter);
    void toggleMeal(day, recipe);
  };

  const communityRecipes = allRecipes.filter((recipe) => !recipe.isStarter);

  return (
    <>
      <SEO title="Weekly Meal Planner" description="Build a simple, flexible seven-day meal plan with house recipes saved on your device." />
      <main className="container page-shell">
        <header className="page-heading planner-heading">
          <p className="eyebrow">A little more ease, every day</p>
          <h1>Your week, <span className="text-accent">well planned.</span></h1>
          <p>Choose recipes for each day. Your house-recipe plan saves on this device; sign in to add community recipes and keep those picks with your account.</p>
          {!user && <p className="planner-sync-note"><Link to="/login">Log in</Link> to sync community recipes across devices, or keep planning here without an account.</p>}
        </header>
        {loading ? <LoadingGrid count={4} /> : (
          <div className="meal-plan-grid">
            {days.map((day) => {
              const entries = recipesForDay(day);
              return (
                <section className="meal-day-card" key={day} aria-labelledby={`day-${day}`}>
                  <div className="meal-day-heading">
                    <div><span className="eyebrow">Your menu</span><h2 id={`day-${day}`}>{day}</h2></div>
                    <span className="meal-count">{entries.length} {entries.length === 1 ? 'meal' : 'meals'}</span>
                  </div>
                  <label className="visually-hidden" htmlFor={`select-${day}`}>Add a recipe to {day}</label>
                  <select id={`select-${day}`} className="form-select meal-select" value="" disabled={savingDay === day} onChange={(event) => addSelectedRecipe(day, event.target.value)}>
                    <option value="">+ Add a recipe</option>
                    <optgroup label="House recipes">
                      {starterRecipes.map((recipe) => <option key={recipe._id} value={`house:${recipe._id}`}>{recipe.title}</option>)}
                    </optgroup>
                    {user && communityRecipes.length > 0 && <optgroup label="Community recipes">
                      {communityRecipes.map((recipe) => <option key={recipe._id} value={`community:${recipe._id}`}>{recipe.title}</option>)}
                    </optgroup>}
                  </select>
                  <ul className="meal-list">
                    {entries.map((recipe) => (
                      <li className="meal-item" key={recipe._id}>
                        <Link to={`/recipe/${recipe._id}`} className="meal-link">
                          <img src={recipe.imageUrl} alt="" loading="lazy" />
                          <span>{recipe.title}</span>
                        </Link>
                        <button className="icon-button" type="button" onClick={() => void toggleMeal(day, recipe)} disabled={savingDay === day} aria-label={`Remove ${recipe.title} from ${day}`} title="Remove from plan">×</button>
                      </li>
                    ))}
                  </ul>
                  {!entries.length && <p className="meal-empty">Your menu is open. Add a recipe when you find one you love.</p>}
                </section>
              );
            })}
          </div>
        )}
        <p className="planner-storage-note">House-recipe plans are saved automatically in this browser on this device.</p>
      </main>
    </>
  );
};

export default MealPlanner;
