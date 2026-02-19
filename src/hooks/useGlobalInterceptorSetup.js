import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setNavigateFunction } from '../api/GlobalApiClient'; // Adjust path to your apiClient


export const useGlobalInterceptorSetup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set the navigate function for the global interceptor
    console.log('🌍 Setting up GLOBAL API interceptor for entire application');
    setNavigateFunction(navigate);
    
    // Log what will be protected
    console.log('🛡️ Protected routes: All API calls will now handle 401s automatically');
    console.log('📋 Includes: BusinessPayouts, Dashboard, CompanyTokens, Users, etc.');
    
    // Cleanup function
    return () => {
      console.log('🌍 Cleaning up global API interceptor');
      setNavigateFunction(null);
    };
  }, [navigate]);
};

export default useGlobalInterceptorSetup;