import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ProfileApi, UpdateProfilePayload, ChangePasswordPayload } from '../api/profileApi';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { User } from '@/features/auth/types';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<User | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const uploading = ref(false);
  
  const authStore = useAuthStore();

  const syncAuthStore = (data: User) => {
    // Keep auth store user in sync with profile
    if (authStore.user) {
      authStore.user = { ...authStore.user, ...data };
    }
  };

  const loadProfile = async (force = false) => {
    if (profile.value && !force) return;
    
    loading.value = true;
    try {
      const data = await ProfileApi.getProfile();
      profile.value = data;
      syncAuthStore(data);
    } catch (error) {
      console.error('Failed to load profile', error);
      showErrorToast('Gagal memuat profil');
    } finally {
      loading.value = false;
    }
  };

  const refreshProfile = async () => {
    return loadProfile(true);
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    saving.value = true;
    try {
      const data = await ProfileApi.updateProfile(payload);
      profile.value = data;
      syncAuthStore(data);
      showSuccessToast('Profil berhasil diperbarui');
      return true;
    } catch (error: any) {
      console.error('Failed to update profile', error);
      showErrorToast(error.response?.data?.message || 'Gagal memperbarui profil');
      return false;
    } finally {
      saving.value = false;
    }
  };

  const changePassword = async (payload: ChangePasswordPayload) => {
    saving.value = true;
    try {
      await ProfileApi.changePassword(payload);
      showSuccessToast('Password berhasil diubah');
      return true;
    } catch (error: any) {
      console.error('Failed to change password', error);
      showErrorToast(error.response?.data?.message || 'Gagal mengubah password');
      return false;
    } finally {
      saving.value = false;
    }
  };

  const uploadAvatar = async (file: File) => {
    uploading.value = true;
    try {
      const result = await ProfileApi.uploadAvatar(file);
      if (profile.value) {
        profile.value.photo = result.photo;
        syncAuthStore(profile.value);
      }
      showSuccessToast('Foto profil berhasil diperbarui');
      return true;
    } catch (error: any) {
      console.error('Failed to upload avatar', error);
      showErrorToast(error.response?.data?.message || 'Gagal mengunggah foto profil');
      return false;
    } finally {
      uploading.value = false;
    }
  };

  const removeAvatar = async () => {
    saving.value = true;
    try {
      await ProfileApi.removeAvatar();
      if (profile.value) {
        profile.value.photo = null;
        syncAuthStore(profile.value);
      }
      showSuccessToast('Foto profil berhasil dihapus');
      return true;
    } catch (error: any) {
      console.error('Failed to remove avatar', error);
      showErrorToast(error.response?.data?.message || 'Gagal menghapus foto profil');
      return false;
    } finally {
      saving.value = false;
    }
  };

  return {
    profile,
    loading,
    saving,
    uploading,
    loadProfile,
    refreshProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    removeAvatar
  };
});
