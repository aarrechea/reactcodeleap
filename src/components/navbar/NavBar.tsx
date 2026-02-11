// Imports
import './css/navBar.css';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';

// NavBar component
const NavBar = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector((state: RootState) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    }

    return (
        <div className="fixed-navbar">
            <div className="navbar-container">
                <div className="navbar-title">
                    <h3>CodeLeap Network</h3>
                </div>

                <div className="navbar-user-info">
                    <input type="text" value={`@${user?.username || ""}`} readOnly />
                </div>

                <div className="navbar-logout-button">
                    <button
                        onClick={handleLogout}
                        className="navbar-logout-button"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
