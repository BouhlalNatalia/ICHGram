import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './storeHooks';
import { setCredentials, logout } from '../features/auth';

export const useAuthInit = () => {
  const dispatch = useAppDispatch();
  const { user, isAuth } = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const initApp = () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      if (savedUser && savedUser !== 'undefined' && savedToken && savedToken !== 'undefined') {
        try {
          const parsedUser = JSON.parse(savedUser);

     
          if (parsedUser && parsedUser.avatar && !parsedUser.avatarUrl) {
            parsedUser.avatarUrl = parsedUser.avatar;
          }

          dispatch(setCredentials({
            user: parsedUser,
            token: savedToken
          }));
        } catch (e) {
          console.error("Session restoration failed", e);
          dispatch(logout());
        }
      }
      setIsReady(true);
    };

    initApp();
  }, [dispatch]);

  return { user, isAuth, isReady, dispatch };
};