import { useState, useEffect } from 'react';

let currentUser: any = null;
let listeners: any[] = [];

export const setUser = (user: any) => {
  currentUser = user;
  listeners.forEach(fn => fn(user));
};

export const getUser = () => currentUser;

export const useUser = () => {
  const [user, setUserState] = useState(currentUser);
  useEffect(() => {
    listeners.push(setUserState);
    return () => {
      listeners = listeners.filter(fn => fn !== setUserState);
    };
  }, []);
  return user;
};