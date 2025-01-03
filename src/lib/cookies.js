import Cookies from 'js-cookie';

const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

export const getCookiePreferences = () => {
  const preferences = Cookies.get(COOKIE_PREFERENCES_KEY);
  if (!preferences) {
    return {
      essential: true,
      functional: false,
      analytics: false,
    };
  }
  return JSON.parse(preferences);
};

// Type: 'essential' | 'functional' | 'analytics'
export const canUseCookie = (type) => {
  const preferences = getCookiePreferences();
  return preferences[type];
};