import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { showErrorToast } from '@/utils/toast';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const authStore = useAuthStore();
      const token = authStore.accessToken;
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any;
      const authStore = useAuthStore();

      if (!error.response) {
        // Network Error
        showErrorToast('Koneksi jaringan bermasalah. Periksa koneksi internet Anda.');
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !originalRequest._retry) {
        // Exclude login and refresh endpoints from retry logic
        if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // Add to queue if refresh is already in progress
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh token
          const newToken = await authStore.refreshToken();
          processQueue(null, newToken);
          
          originalRequest.headers.Authorization = 'Bearer ' + newToken;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Refresh failed, clear session and force login
          authStore.clearSession();
          showErrorToast('Sesi Anda telah berakhir. Silakan login kembali.');
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other errors globally
      if (error.response.status === 403) {
        showErrorToast('Anda tidak memiliki akses untuk tindakan ini.');
      } else if (error.response.status === 500) {
        showErrorToast('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
      } else if (error.response.status !== 401) {
        const data = error.response.data as any;
        const message = data?.message || 'Terjadi kesalahan tidak terduga.';
        // showErrorToast(message);
        console.error(message);
      }

      return Promise.reject(error);
    }
  );
};
