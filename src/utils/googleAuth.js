// Google OAuth utilities
// Uses Google Identity Services (GSI) for client-side auth

const GOOGLE_CLIENT_ID = '135275213730-d0r3orrkeb1shlevb88t513e243cj3k1.apps.googleusercontent.com';
const API_BASE = ''; // uses relative path, works for both dev and deployed

/**
 * Initialize Google OAuth2 with popup flow
 * @param {Function} callback - called with { email, name, picture, credential } on success
 * @param {Function} onError - called with error on failure
 */
export function initGoogleAuth(callback, onError) {
  if (typeof window.google === 'undefined') {
    // Google script not loaded yet, wait and retry
    setTimeout(() => initGoogleAuth(callback, onError), 500);
    return;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response.credential) {
          const payload = parseJwt(response.credential);
          callback({
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            credential: response.credential,
          });
        }
      },
      error_callback: (error) => {
        console.error('Google OAuth error:', error);
        onError?.(error);
      },
    });

    // Render the sign-in button
    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      {
        theme: 'outline',
        size: 'medium',
        text: 'signin_with',
        shape: 'rectangular',
        width: 160,
      }
    );
  } catch (err) {
    console.error('Failed to initialize Google Auth:', err);
    onError?.(err);
  }
}

/**
 * Prompt Google sign-in popup
 */
export function promptGoogleSignIn() {
  if (typeof window.google === 'undefined') return;

  window.google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkipped()) {
      console.warn('Google sign-in not displayed:', notification.getNotDisplayedReason());
    }
  });
}

/**
 * Sign out from Google
 */
export function signOutGoogle() {
  if (typeof window.google === 'undefined') return;

  window.google.accounts.id.disableAutoSelect();
}

/**
 * Upsert user to D1 via API
 * @param {Object} userData - { email, name, picture, credential }
 * @returns {Promise<Object>} - the saved user from DB
 */
export async function saveUserToBackend(userData) {
  const response = await fetch(`${API_BASE}/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Failed to save user');
  }

  const result = await response.json();
  return result.user;
}

/**
 * Parse a JWT token (without verification - client-side only)
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

/**
 * Store user in localStorage
 */
export function saveUser(user) {
  localStorage.setItem('bgremover_user', JSON.stringify(user));
}

/**
 * Load user from localStorage
 */
export function loadUser() {
  try {
    const data = localStorage.getItem('bgremover_user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Clear user from localStorage
 */
export function clearUser() {
  localStorage.removeItem('bgremover_user');
}
