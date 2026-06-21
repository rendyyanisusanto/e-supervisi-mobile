import { toastController } from '@ionic/vue';

export const showToast = async (message: string, color: string = 'primary') => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top',
    buttons: [
      {
        text: 'Tutup',
        role: 'cancel',
      },
    ],
  });
  await toast.present();
};

export const showSuccessToast = (message: string) => showToast(message, 'success');
export const showErrorToast = (message: string) => showToast(message, 'danger');
export const showInfoToast = (message: string) => showToast(message, 'primary');
