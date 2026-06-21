export const ProfileService = {
  async getProfile() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: '1',
      name: 'Ahmad Fauzi, S.Pd',
      role: 'Guru',
      mapel: 'Teknik Komputer dan Jaringan',
      photo: null,
      sekolah: 'SMK Negeri 1 Jakarta',
    };
  },
};
