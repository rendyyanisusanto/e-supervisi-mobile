# E-Supervisi Mobile

Aplikasi mobile E-Supervisi dibangun menggunakan **Ionic**, **Vue 3**, dan **Capacitor**.

## Persyaratan
- Node.js (direkomendasikan v18 atau versi terbaru)
- npm / yarn / pnpm
- Android Studio (untuk menjalankan dan build Android)
- Xcode (untuk menjalankan dan build iOS, khusus di sistem operasi macOS)

## Memulai Pengembangan

1. Clone repositori ini:
   ```bash
   git clone https://github.com/rendyyanisusanto/e-supervisi-mobile.git
   cd e-supervisi-mobile
   ```

2. Instal seluruh dependensi:
   ```bash
   npm install
   ```

3. Jalankan aplikasi di environment browser (development server):
   ```bash
   npm run dev
   ```

## Build & Deploy Native (Capacitor)

### Sinkronisasi ke Platform Native
Setiap kali ada perubahan pada kode aplikasi web (`src/`), lakukan build lalu sinkronisasi ke project native:
```bash
npm run build
npx cap sync
```

### Menjalankan di Perangkat Android
```bash
npx cap run android
```
Atau buka project Android di Android Studio:
```bash
npx cap open android
```

### Menjalankan di Perangkat iOS
```bash
npx cap run ios
```
Atau buka project iOS di Xcode:
```bash
npx cap open ios
```

## Teknologi Utama yang Digunakan
- [Ionic Framework](https://ionicframework.com/docs) - UI Toolkit
- [Vue 3](https://vuejs.org/) - Frontend Framework
- [Capacitor](https://capacitorjs.com/) - Native Runtime
- [Vite](https://vitejs.dev/) - Build Tool & Dev Server
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS Framework
