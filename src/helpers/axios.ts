import axios from 'axios';


const BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    /*
    This function adds the Authorization header to the request.
    If the accessToken is not found it throws an error.
    */
    config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
    return config;
},
    (error) => {
        return handleAuthError(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("error: ", error);
        return handleAuthError(error);
    }
);

const refreshAuthLogic = async () => {
    /*
    refresh token logic it uses axios to make the request.
    This is to avoid infinite loop. It returns the response from the server.
    If it fails it throws an error, which is handled by handleAuthError.
    If it does not fail it updates the accessToken and returns the response.
    */
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token found');
    }
    const response = await axios.post(`${BASE_URL}/auth/refresh/`, {
        refresh: refreshToken,
    });
    return response;
}

const handleAuthError = async (error: any) => {
    /*
    This function handles authentication errors.
    If the error is a 401 error it tries to refresh the token.
    If the refresh is successful it updates the accessToken and returns the response.
    If the refresh fails it removes the auth from localStorage and throws the error.
    */
    if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;

        console.log("Intercepted 401: Refreshing token...");

        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            console.log("No refresh token, throwing error");
            throw error;
        }
        try {
            const response = await refreshAuthLogic();
            const accessToken = response.data.access;

            console.log("Refreshed token successfully");

            localStorage.setItem('accessToken', accessToken);

            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            error.config.headers['Authorization'] = `Bearer ${accessToken}`;

            console.log("Retrying original request...");

            return axiosInstance(error.config);

        } catch (error) {
            console.log("Refresh failed or retry failed", error);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            localStorage.removeItem("username");
            // Redirect to login page to clear Redux state via page reload
            window.location.href = '/';
            return Promise.reject(error);
        }
    }
    throw error;
}

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("error: ", error);
        return handleAuthError(error);
    }
);


export default axiosInstance;
