import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../authContext/AuthContext";

/**
 * Wrap any protected page:
 * <ProtectedRoute allowedRoles={["hr","manager"]}><HRDashboard /></ProtectedRoute>
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const { user, loading } = useAuth();

    /* 1️⃣  Wait until AuthContext finishes restoring user */
    if (loading) return null; // or a spinner

    /* 2️⃣  Not logged‑in → login page */
    if (!user) return <Navigate to="/loginNew" replace />;
    // if (!user) return <Navigate to="/login" replace />;

    /* 3️⃣  Role mismatch → unauthorized page  (NOTE: lowercase path) */
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    /* 4️⃣  Success → render protected content */
    return children;
};

export default ProtectedRoute;
