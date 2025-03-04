import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update profile';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout,
      updateUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 