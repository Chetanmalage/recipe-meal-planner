import { GoogleLogin } from '@react-oauth/google';

const googleSignInConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

const GoogleSignInButton = ({ onSuccess, onError, disabled = false }) => {
  if (!googleSignInConfigured) return null;

  const width = Math.min(360, Math.max(240, window.innerWidth - 40));

  return (
    <div className={`google-signin-shell${disabled ? ' is-disabled' : ''}`} aria-disabled={disabled}>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="outline"
        size="large"
        shape="rectangular"
        text="continue_with"
        width={String(width)}
        useOneTap={false}
      />
    </div>
  );
};

export default GoogleSignInButton;
