import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import { LoadingPage } from './components/LoadingSkeleton';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AddRecipe = lazy(() => import('./pages/AddRecipe'));
const EditRecipe = lazy(() => import('./pages/EditRecipe'));
const RecipeDetails = lazy(() => import('./pages/RecipeDetails'));
const Favourites = lazy(() => import('./pages/Favourites'));
const MealPlanner = lazy(() => import('./pages/MealPlanner'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { theme } = useTheme();

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <div id="main-content" tabIndex="-1">
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recipe/:id" element={<RecipeDetails />} />
            <Route path="/add-recipe" element={<ProtectedRoute><AddRecipe /></ProtectedRoute>} />
            <Route path="/edit-recipe/:id" element={<ProtectedRoute><EditRecipe /></ProtectedRoute>} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/meal-planner" element={<MealPlanner />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      <ToastContainer position="top-right" autoClose={3200} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme={theme} />
    </>
  );
}

export default App;
