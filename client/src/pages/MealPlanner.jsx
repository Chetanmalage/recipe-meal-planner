import { useState, useEffect } from 'react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MealPlanner = () => {
  const [mealPlan, setMealPlan] = useState({});
  const [allRecipes, setAllRecipes] = useState([]);
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    const fetchData = async () => {
      const planRes = await fetch('/api/users/mealplan', { headers: { Authorization: `Bearer ${token}` } });
      const planData = await planRes.json();
      setMealPlan(planData);

      const recipeRes = await fetch('/api/recipes');
      const recipeData = await recipeRes.json();
      setAllRecipes(recipeData);
    };
    fetchData();
  }, [token]);

  const addToPlan = async (day, recipeId) => {
    if (!recipeId) return;
    const res = await fetch('/api/users/mealplan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ day, recipeId }),
    });
    const data = await res.json();
    setMealPlan(data);
  };

  return (
    <div className="container py-5" style={{ marginTop: '80px' }}>
      <h2 className="fw-bolder mb-5">Weekly Meal Planner 📅</h2>
      <div className="row g-4">
        {days.map(day => (
          <div className="col-12 col-md-6 col-lg-3" key={day}>
            <div className="glass-card p-4 h-100">
              <h5 className="fw-bolder text-primary mb-3">{day}</h5>
              <select className="form-select bg-transparent text-secondary border-secondary mb-3" onChange={(e) => addToPlan(day, e.target.value)} value="">
                <option value="">+ Add a Recipe</option>
                {allRecipes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
              </select>
              {mealPlan[day]?.map(recipeId => {
                const recipe = allRecipes.find(r => r._id === recipeId);
                return recipe ? (
                  <div key={recipeId} className="badge bg-secondary d-block text-start p-2 mb-2 text-wrap">
                    {recipe.title}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MealPlanner;