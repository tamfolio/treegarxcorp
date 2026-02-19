import { useState, useEffect, useCallback } from 'react';
import { get401Stats, get401Log, clear401Log } from '../lib/apiclient';

// React hook for 401 error tracking
export const use401Tracking = () => {
  const [stats, setStats] = useState(null);
  const [errorLog, setErrorLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current stats and log
  const refreshData = useCallback(() => {
    setIsLoading(true);
    try {
      const currentStats = get401Stats();
      const currentLog = get401Log(50); // Get last 50 errors
      
      setStats(currentStats);
      setErrorLog(currentLog);
    } catch (error) {
      console.error('Failed to fetch 401 tracking data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error log
  const clearLog = useCallback(() => {
    clear401Log();
    refreshData();
  }, [refreshData]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    refreshData();
    
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Listen for new 401 errors (custom event)
  useEffect(() => {
    const handleNewError = () => {
      refreshData();
    };

    window.addEventListener('unauthorized-error', handleNewError);
    return () => window.removeEventListener('unauthorized-error', handleNewError);
  }, [refreshData]);

  return {
    stats,
    errorLog,
    isLoading,
    refreshData,
    clearLog,
    
    // Helper functions
    hasRecentErrors: stats?.lastHour > 0,
    hasFrequentErrors: stats?.lastHour > 5,
    mostCommonErrorType: stats?.byType ? 
      Object.entries(stats.byType).sort(([,a], [,b]) => b - a)[0]?.[0] : null,
  };
};

// Utility hook for checking if user has authentication issues
export const useAuthHealthCheck = () => {
  const { stats } = use401Tracking();
  
  const isAuthHealthy = !stats || (
    stats.lastHour <= 2 && // Max 2 errors per hour is acceptable
    stats.last24Hours <= 10 // Max 10 errors per day is acceptable
  );
  
  const needsAttention = stats && (
    stats.lastHour > 5 || // More than 5 errors in last hour
    stats.last24Hours > 20 // More than 20 errors in last day
  );
  
  return {
    isAuthHealthy,
    needsAttention,
    errorFrequency: stats?.lastHour || 0,
  };
};