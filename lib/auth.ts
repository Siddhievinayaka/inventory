'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(!!Cookies.get('auth_token'));
    setLoading(false);
  }, []);

  const login = (token: string) => {
    Cookies.set('auth_token', token, {
      expires: 30,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setIsAuthenticated(false);
    router.push('/login');
  };

  return { isAuthenticated, loading, login, logout };
}
