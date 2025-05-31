
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/Dashboard";

const DashboardPage = () => {
  const [userType, setUserType] = useState<'individual' | 'organization'>('individual');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in or is a guest
    const user = localStorage.getItem('user');
    const guestUser = localStorage.getItem('guestUser');
    
    if (!user && !guestUser) {
      navigate('/auth');
      return;
    }

    // Determine user type
    if (user) {
      const userData = JSON.parse(user);
      setUserType(userData.userType === 'organization' ? 'organization' : 'individual');
    } else if (guestUser) {
      setUserType('individual'); // Guests are always individual
    }
  }, [navigate]);

  return <Dashboard userType={userType} />;
};

export default DashboardPage;
