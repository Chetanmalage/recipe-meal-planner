import { GoogleLogin } from '@react-oauth/google';

const googleSignInConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

const GoogleSignInButton = ({ onSuccess, onError, disabled = false }) => {
  if (!googleSignInConfigured) return null;

  const width = Math.min(360, Math.max(200, window.innerWidth - 80));

  return (
    <div className={`google-signin-shell${disabled ? ' is-disabled' : ''}`} aria-disabled={disabled} role="group" aria-label="Continue with Google">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="outline"
        size="large"
        shape="pill"
        text="continue_with"
        logo_alignment="left"
        width={String(width)}
        useOneTap={false}
      />
    </div>
  );
};

export default GoogleSignInButton;
