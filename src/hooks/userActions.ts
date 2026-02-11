import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const login = async (email: string, password: string) => {
    /*
    This function is used to login the user.
    It is used axios to make a post request to the backend.
    If the request is successful, it will return the response.
    If the request is not successful, it will throw an error.
    */
    try {
        const response = await axios.post(`${BASE_URL}/auth/login/`, {
            email,
            password,
        });

        return response;

    } catch (error: any) {
        // Re-throw the original error so components can access error.response
        throw error;
    }
}


const register = async (username: string, email: string, password: string) => {
    /*
    This function is used to register the user.
    It is used axios to make a post request to the backend.
    If the request is successful, it will return the response.
    If the request is not successful, it will throw an error.
    */
    try {
        const response = await axios.post(`${BASE_URL}/auth/register/`, {
            username,
            email,
            password,
        });

        return response;

    } catch (error: any) {
        // Re-throw the original error so components can access error.response
        throw error;
    }
}


export {
    login,
    register,
}
