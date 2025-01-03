'use client';

import { createContext, useContext } from 'react';

export const NotificationsContext = createContext({});

export const useNotifications = () => useContext(NotificationsContext);