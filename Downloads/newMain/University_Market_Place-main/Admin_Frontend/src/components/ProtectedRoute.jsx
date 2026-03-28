import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", background:"#f8fafc" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:32, height:32, border:"2.5px solid #e2e8f0",
            borderTop:"2.5px solid #0f172a", borderRadius:"50%",
            animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontFamily:"sans-serif", fontSize:13, color:"#94a3b8" }}>
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
