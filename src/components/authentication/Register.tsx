// Imports
import React, { useState, type CSSProperties } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { register } from '../../hooks/userActions';
import "./css/register.css";

// Interface
interface TitleInterface {
    title: string;
    style: CSSProperties
}


// Component
const Register = () => {
    // Constants
    const ORIGINAL_TITLE = "Register";

    // States
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [mainTitle, setMainTitle] = useState<TitleInterface>({
        title: ORIGINAL_TITLE,
        style: {}
    });

    // Hooks
    const navigate = useNavigate();

    // Functions
    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await register(username, email, password);

            // Registration successful, redirect to login
            navigate('/', { state: { registered: true } });

        } catch (err: any) {
            if (err.response?.status === 400) {
                // Validation errors
                const errorData = err.response.data;
                const errorMessage = errorData.email || errorData.username;

                //#region Change title to error message
                setMainTitle({
                    title: errorMessage,
                    style: { color: "red", fontSize: "1.2rem" }
                });

                setTimeout(() => {
                    setMainTitle({
                        title: ORIGINAL_TITLE,
                        style: {}
                    });
                }, 3000);
                //#endregion

                // Clear the form
                setUsername('');
                setEmail('');
                setPassword('');

            } else {
                setMainTitle({
                    title: "An unexpected error occurred. Please try again.",
                    style: { color: "red", fontSize: "1.1rem" }
                });

                setTimeout(() => {
                    setMainTitle({
                        title: ORIGINAL_TITLE,
                        style: {}
                    });
                }, 3000);
            }
        } finally {
            setIsLoading(false);
        }
    };


    // Render
    return (
        <div className="register-main">
            <div className="register-container">
                <div className="register-title">
                    <h2 style={mainTitle.style}>{mainTitle.title}</h2>
                </div>

                <form onSubmit={handleSubmit} className="register-form" autoComplete="off">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="off"
                            required
                            minLength={3}
                            maxLength={20}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="off"
                            required
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+[.][a-z]{2,}$"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                            minLength={8}
                            maxLength={20}
                        />

                        <button
                            type="button"
                            className="register-show-password-btn"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className={username.length && email.length && password.length > 0 ? "register-btn" : "register-btn-disabled"}
                        disabled={isLoading || username.length === 0 || email.length === 0 || password.length === 0}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="login-link">
                    <p>Already have an account? <Link to="/">Login</Link></p>
                </div>
            </div>
        </div>
    );
};


// Export
export default Register;


