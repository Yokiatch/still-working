import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Topbar() {
  const { session } = useAuth();
  
  return (
    <div className="topbar">
      <div className="nav-buttons">
        <button className="nav-button">
          <ChevronLeft size={20} />
        </button>
        <button className="nav-button">
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="user-menu">
        <div className="user-avatar">
          {session?.user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  );
}
