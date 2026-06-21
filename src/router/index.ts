import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { authGuard } from './guards/auth.guard';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/modules/auth/views/Login.vue'),
        meta: { guest: true }
      }
    ]
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/features/dashboard/views/DashboardView.vue')
      },
      {
        path: 'supervisi',
        name: 'Supervisi',
        component: () => import('@/features/supervision/views/SupervisionListView.vue')
      },
      {
        path: 'supervisi/:id',
        name: 'SupervisiDetail',
        component: () => import('@/features/supervision/views/SupervisionDetailView.vue')
      },
      {
        path: 'notifikasi',
        name: 'Notifikasi',
        component: () => import('@/modules/notification/views/Notifikasi.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/features/profile/views/ProfileView.vue')
      },
      {
        path: 'profile/edit',
        name: 'EditProfile',
        component: () => import('@/features/profile/views/EditProfileView.vue')
      },
      {
        path: 'profile/password',
        name: 'ChangePassword',
        component: () => import('@/features/profile/views/ChangePasswordView.vue')
      },
      {
        path: 'refleksi',
        name: 'Reflection',
        component: () => import('@/features/reflection/views/ReflectionListView.vue')
      },
      {
        path: 'refleksi/:supervisionId',
        name: 'ReflectionDetail',
        component: () => import('@/features/reflection/views/ReflectionDetailView.vue')
      },
      {
        path: 'refleksi/:supervisionId/edit',
        name: 'ReflectionForm',
        component: () => import('@/features/reflection/views/ReflectionFormView.vue')
      },
      {
        path: 'rapor',
        name: 'ReportList',
        component: () => import('@/features/report/views/ReportListView.vue')
      },
      {
        path: 'rapor/:id',
        name: 'ReportDetail',
        component: () => import('@/features/report/views/ReportDetailView.vue')
      },
      // Supervisor Roles (Penilai)
      {
        path: 'penilai/dashboard',
        name: 'SupervisorDashboard',
        component: () => import('@/features/supervisor/views/SupervisorDashboardView.vue'),
        meta: { role: 'penilai' }
      },
      {
        path: 'penilai/jadwal',
        name: 'SupervisorSchedule',
        component: () => import('@/features/supervisor/views/SupervisorScheduleView.vue'),
        meta: { role: 'penilai' }
      },
      {
        path: 'penilai/tambah',
        name: 'SupervisorCreate',
        component: () => import('@/features/supervisor/views/SupervisorCreateView.vue'),
        meta: { role: 'penilai' }
      },
      {
        path: 'penilai/jadwal/:id',
        name: 'SupervisorDetail',
        component: () => import('@/features/supervisor/views/SupervisorDetailView.vue'),
        meta: { role: 'penilai' }
      },
      {
        path: 'penilai/penilaian/:id',
        name: 'SupervisorAssessment',
        component: () => import('@/features/supervisor/views/AssessmentFormView.vue'),
        meta: { role: 'penilai' }
      },
      {
        path: 'penilai/riwayat',
        name: 'SupervisorHistory',
        component: () => import('@/features/supervisor/views/SupervisorHistoryView.vue'),
        meta: { role: 'penilai' }
      },
      {
        path: 'penilai/hasil/:id',
        name: 'SupervisorResult',
        component: () => import('@/features/supervisor/views/SupervisorResultView.vue'),
        meta: { role: 'penilai' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Gunakan auth guard terpisah
router.beforeEach(authGuard);

export default router;
