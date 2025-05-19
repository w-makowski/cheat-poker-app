import { getAuth0Client } from './auth0Client';

export const getToken = async (): Promise<string | undefined> => {
    try {
        const auth0Client = await getAuth0Client();
        const isAuthenticated = await auth0Client.isAuthenticated();

        if (!isAuthenticated) {
            return undefined;
        }

        return await auth0Client.getTokenSilently();
    } catch (error) {
        console.error('Error fetching token:', error);
        return undefined;
    }
}

export const getUserProfile = async () => {
    try {
        const auth0Client = await getAuth0Client();
        const isAuthenticated = await auth0Client.isAuthenticated();
        
        if (!isAuthenticated) {
            return null;
        }
        
        return await auth0Client.getUser();
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}
