import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    // To verify if the user is authenticated against the token in the store
    const { token } = useAppSelector(state => state.auth);

    if (!token) {
        // Redirect to login if no token
        return <Navigate to="/" replace />;
    }

    // If the user is authenticated, render the children.
    // Children is the component that is being rendered.
    return <>{children}</>;
};

export default ProtectedRoute;
