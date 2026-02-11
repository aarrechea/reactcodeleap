// Imports
import React, { useEffect, useState, type CSSProperties } from 'react';
import './css/login.css';
import { login } from '../../hooks/userActions';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/authSlice';


// Interface
interface TitleInterface {
    title: string;
    style: CSSProperties
}


// Component
const Login = () => {
    // Constants
    const ORIGINAL_TITLE = "Welcome Back";

    //#region States
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mainTitle, setMainTitle] = useState<TitleInterface>({
        title: ORIGINAL_TITLE,
        style: {}
    });
    const [showPassword, setShowPassword] = useState(false);
    //#endregion

    // Hooks
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();

    // Functions
    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await login(username, password);

            // Update Redux state (which also saves to localStorage)
            dispatch(setCredentials({
                user: response.data.user,
                token: response.data.access
            }));

            // Save refresh token separately (not in Redux)
            localStorage.setItem('refreshToken', response.data.refresh);

            navigate("/post");

        } catch (err: any) {
            if (err.detail) {
                setError(err.detail);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };


    // Effects
    useEffect(() => {
        if (location.state?.registered) {
            setMainTitle({
                title: "Successfully registered!",
                style: { color: "green" }
            });

            // Clear the location state to prevent showing message on reload
            navigate(location.pathname, { replace: true, state: null });

            const timer = setTimeout(() => {
                setMainTitle({
                    title: ORIGINAL_TITLE,
                    style: {}

                });
            }, 3500);

            return () => clearTimeout(timer);

        } else {
            setMainTitle({
                title: ORIGINAL_TITLE,
                style: {}
            });
        }
    }, [location.state, navigate, location.pathname])


    // Render
    return (
        <div className="login-page">
            <div className="login-container">
                <h2 style={mainTitle.style}>{mainTitle.title}</h2>

                <form onSubmit={handleSubmit} className="login-form">
                    {/* Email */}
                    <div className="login-form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                            title="Please enter a valid email address"
                        />
                    </div>

                    {/* Password */}
                    <div className="login-form-group" id='login-form-group'>
                        <label htmlFor="password">Password</label>

                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="button"
                            className="show-password-btn"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {/* Error */}
                    {error && <div className="error-message">{error}</div>}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={username.length && password.length > 0 ? "login-btn" : "login-btn-disabled"}
                        disabled={isLoading || username.length === 0 || password.length === 0}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* Register Link */}
                <div className="register-link">
                    <p>Don't have an account? <a href="/register">Register</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
