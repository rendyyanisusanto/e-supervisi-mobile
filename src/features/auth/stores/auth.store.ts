import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, LoginPayload } from '../types';
import { AuthService } from '../services/auth.service';
import { StorageService } from '@/shared/storage';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshTokenState = ref<string | null>(null);
  const loading = ref<boolean>(false);

  const isAuthenticated = computed(() => !!accessToken.value);

  const login = async (payload: LoginPayload) => {
    loading.value = true;
    try {
      const response = await AuthService.login(payload);
      
      accessToken.value = response.access_token;
      refreshTokenState.value = response.refresh_token;
      user.value = response.user;

      await StorageService.set('access_token', response.access_token);
      await StorageService.set('refresh_token', response.refresh_token);
      await StorageService.set('user', response.user);
    } finally {
      loading.value = false;
    }
  };

  const fetchCurrentUser = async () => {
    loading.value = true;
    try {
      const userData = await AuthService.getCurrentUser();
      user.value = userData;
      await StorageService.set('user', userData);
    } catch (error) {
      console.error('Failed to fetch current user', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const refreshToken = async (): Promise<string> => {
    try {
      const currentRefreshToken = refreshTokenState.value || await StorageService.get<string>('refresh_token');
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const newToken = await AuthService.refreshToken(currentRefreshToken);
      
      accessToken.value = newToken;
      await StorageService.set('access_token', newToken);
      
      return newToken;
    } catch (error) {
      clearSession();
      throw error;
    }
  };

  const restoreSession = async (): Promise<boolean> => {
    loading.value = true;
    try {
      const token = await StorageService.get<string>('access_token');
      const rToken = await StorageService.get<string>('refresh_token');
      const userData = await StorageService.get<User>('user');

      if (token && rToken) {
        accessToken.value = token;
        refreshTokenState.value = rToken;
        user.value = userData;

        // Optionally, verify token or fetch fresh user data here
        // If it fails, interceptor will catch 401 and try to refresh
        try {
          await fetchCurrentUser();
        } catch (e) {
          // If fetch fails and cannot be refreshed, session is invalid
          return false;
        }

        return true;
      }
      
      return false;
    } finally {
      loading.value = false;
    }
  };

  const clearSession = async () => {
    user.value = null;
    accessToken.value = null;
    refreshTokenState.value = null;
    await StorageService.clear();
  };

  const logout = async () => {
    loading.value = true;
    try {
      // Call backend to invalidate token if applicable
      await AuthService.logout();
    } catch (e) {
      // ignore logout errors (e.g. network issue), we just want to clear local session
    } finally {
      await clearSession();
      loading.value = false;
    }
  };

  const hasRole = (role: string): boolean => {
    return user.value?.roles?.includes(role) ?? false;
  };

  return {
    user,
    accessToken,
    refreshTokenState,
    loading,
    isAuthenticated,
    login,
    fetchCurrentUser,
    refreshToken,
    restoreSession,
    clearSession,
    logout,
    hasRole
  };
});
