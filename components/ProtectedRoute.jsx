import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, role }) => {
  const { user , loading } = useAuth();

  console.log('user refresh: ' , user)

    if (loading) {
      return (
        <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-500 font-medium animate-pulse">Loading accounts...</p>
        </div>
      );
    }

  if (!user) return <Navigate to="/login" replace />;

  // If role is passed, allow multiple roles
  const allowedRoles = Array.isArray(role) ? role : [role];

  if (role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;