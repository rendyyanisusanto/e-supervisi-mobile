<template>
  <div class="photo-uploader">
    <div v-if="previewUrl" class="photo-preview-container">
      <img :src="previewUrl" alt="Dokumentasi" class="photo-preview" />
      <ion-button 
        fill="clear" 
        color="danger" 
        class="remove-photo-btn"
        @click="removePhoto"
      >
        <ion-icon :icon="closeCircle" slot="icon-only"></ion-icon>
      </ion-button>
    </div>
    
    <div v-else class="upload-placeholder" @click="presentActionSheet">
      <ion-icon :icon="cameraOutline" class="upload-icon"></ion-icon>
      <p>Ketuk untuk menambah dokumentasi (Opsional)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IonButton, IonIcon, actionSheetController } from '@ionic/vue';
import { cameraOutline, closeCircle, imageOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { getImageUrl } from '@/core/api/axios';

const props = defineProps<{
  initialUrl?: string | null;
}>();

const emit = defineEmits<{
  (e: 'photo-selected', file: File): void;
  (e: 'photo-removed'): void;
}>();

const previewUrl = ref<string | null>(props.initialUrl || null);

watch(() => props.initialUrl, (newUrl) => {
  if (newUrl && !newUrl.startsWith('blob:')) {
    previewUrl.value = getImageUrl(newUrl);
  }
});

const presentActionSheet = async () => {
  const actionSheet = await actionSheetController.create({
    header: 'Pilih Sumber Foto',
    buttons: [
      {
        text: 'Ambil Foto',
        icon: cameraOutline,
        handler: () => {
          takePhoto(CameraSource.Camera);
        }
      },
      {
        text: 'Pilih dari Galeri',
        icon: imageOutline,
        handler: () => {
          takePhoto(CameraSource.Photos);
        }
      },
      {
        text: 'Batal',
        role: 'cancel'
      }
    ]
  });

  await actionSheet.present();
};

const takePhoto = async (source: CameraSource) => {
  try {
    const image = await Camera.getPhoto({
      quality: 70,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: source
    });

    if (image.webPath) {
      previewUrl.value = image.webPath;
      
      // Convert webPath to File
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], `documentation_${new Date().getTime()}.${image.format}`, { type: `image/${image.format}` });
      
      emit('photo-selected', file);
    }
  } catch (error) {
    console.error('Error taking photo', error);
  }
};

const removePhoto = () => {
  previewUrl.value = null;
  emit('photo-removed');
};
</script>

<style scoped>
.photo-uploader {
  margin-bottom: 1.5rem;
}

.upload-placeholder {
  background: var(--ion-color-light);
  border: 2px dashed var(--ion-color-medium);
  border-radius: 12px;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-placeholder:active {
  background: rgba(0,0,0,0.05);
}

.upload-icon {
  font-size: 3rem;
  color: var(--ion-color-medium);
  margin-bottom: 0.5rem;
}

.upload-placeholder p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.photo-preview-container {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  margin: 0;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.remove-photo-btn ion-icon {
  font-size: 32px;
}
</style>
