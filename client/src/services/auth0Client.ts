import { Auth0Client } from '@auth0/auth0-spa-js';

let auth0Client: Auth0Client | null = null;

export const getAuth0Client = async (): Promise<Auth0Client> => {
    if (auth0Client === null) {
        auth0Client = new Auth0Client({
            domain: import.meta.env.VITE_APP_AUTH0_DOMAIN || '',
            clientId: import.meta.env.VITE_APP_AUTH0_CLIENT_ID || '',
            authorizationParams: {
                redirect_uri: window.location.origin,
                audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE || '',
            }
        })
    }

    return auth0Client;
}
