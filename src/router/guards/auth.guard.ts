import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  
  // Periksa apakah rute butuh autentikasi
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  // Periksa apakah rute khusus tamu (seperti login)
  const isGuestRoute = to.matched.some(record => record.meta.guest);

  if (requiresAuth && !authStore.isAuthenticated) {
    // Jika butuh auth tapi belum login
    next({ path: '/login', replace: true });
    return;
  }

  if (isGuestRoute && authStore.isAuthenticated) {
    // Jika rute guest (login) tapi sudah login
    next({ path: '/home', replace: true });
    return;
  }

  // Periksa otorisasi role
  const requiredRole = to.matched.map(r => r.meta.role).filter(Boolean)[0] as string | undefined;
  if (requiredRole && authStore.user) {
    // Check if user has the required role
    const hasRole = authStore.user.roles?.includes(requiredRole);
    if (!hasRole) {
      // Not authorized
      next({ path: '/home', replace: true });
      return;
    }
  }

  // Jalankan seperti biasa
  next();
};
