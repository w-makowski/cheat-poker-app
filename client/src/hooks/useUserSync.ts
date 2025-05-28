import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

export const useUserSync = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const syncUser = async () => {
      if (!isAuthenticated) return;

      try {
        const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE,
              scope: 'openid profile email'
            }
        });

        console.log('token_front:', token);

        await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('User synced with backend');
      } catch (err) {
        console.error('Failed to sync user:', err);
      }
    };

    syncUser();
  }, [isAuthenticated, getAccessTokenSilently]);
};
