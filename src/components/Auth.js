// hooks/useAuth.js
'use client'

import { useState, useEffect, useCallback } from 'react';
import { parseCookies, destroyCookie, setCookie } from 'nookies';

export function useAuth() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const checkAuthStatus = useCallback(() => {

    setLoading(true);
    
    try {
      const cookies = parseCookies();
      const token = cookies.smallytoken;
      
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((token) => {
    try {
      setCookie(null, 'smallytoken', token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    try {
      destroyCookie(null, 'smallytoken', { path: '/' });
      setIsLoggedIn(false);
      setUserData(null);
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const cookies = parseCookies();
      const token = cookies.smallytoken;
      if (!token) {
        return null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fetch_user_data`,{
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        body: new URLSearchParams({ token:token }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData(data.user);
      //console.log('Fetched user data:', data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
    fetchUserData();
  }, [checkAuthStatus, fetchUserData]);

  return {
    isLoggedIn,
    loading,
    login,
    logout,
    userData
  };
}