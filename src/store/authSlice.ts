import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../models/User';


interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const getUserFromStorage = (): User | null => {
    /*
    This function is used to get the user from localStorage.
    It is used to get the user from localStorage when the page is refreshed.
    If the user is not found, it will return null.
    If the user is found, it will return the user.
    */
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        // Invalid JSON in localStorage, clear it
        localStorage.removeItem('user');
        return null;
    }
};

const initialState: AuthState = {
    /*
    This is the initial state of the Redux store.
    It gets the information from the localStorage.
    The information is stored in the localStorage when the user logs in.
    */
    user: getUserFromStorage(),
    token: localStorage.getItem('accessToken'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
};


const authSlice = createSlice({
    /*
    This slice is used to store the user and token in the Redux store.
    It is used to store the user and token in the Redux store when the user logs in.
    If the user is not found, it will return null.
    If the user is found, it will return the user.
    */
    name: 'auth',
    initialState,
    reducers: {
        /*
        setCredentials is used to set the user and token in the Redux store.
        */
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', token);
            localStorage.setItem('username', user.username);
        },
        /*
        logout is used to remove the user and token from the Redux store.
        It is used to remove the user and token from the Redux store when the user logs out.
        */
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('username');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
