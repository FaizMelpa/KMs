<div align="center">

```
 ██████╗ █████╗ ███████╗██╗  ██╗
██╔════╝██╔══██╗██╔════╝██║  ██║
██║     ███████║███████╗███████║
██║     ██╔══██║╚════██║██╔══██║
╚██████╗██║  ██║███████║██║  ██║
 ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

     ██╗ ██████╗ ██╗   ██╗██████╗ ███╗   ██╗ █████╗ ██╗
     ██║██╔═══██╗██║   ██║██╔══██╗████╗  ██║██╔══██╗██║
     ██║██║   ██║██║   ██║██████╔╝██╔██╗ ██║███████║██║
██   ██║██║   ██║██║   ██║██╔══██╗██║╚██╗██║██╔══██║██║
╚█████╔╝╚██████╔╝╚██████╔╝██║  ██║██║ ╚████║██║  ██║███████╗
 ╚════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
```

Personal finance tracker — offline, bebas iklan, 100% milik lo.

![Android](https://img.shields.io/badge/ANDROID-APK-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![React](https://img.shields.io/badge/REACT-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Capacitor](https://img.shields.io/badge/CAPACITOR-5-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![Build](https://img.shields.io/badge/BUILD-GITHUB_ACTIONS-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

</div>

---

## Fitur

- **Transaksi** — pemasukan, pengeluaran, transfer antar akun
- **Multi Akun** — bank, e-wallet, tunai, tabungan
- **Anggaran** — batas pengeluaran per kategori
- **Statistik** — bar chart, pie chart, heatmap
- **Hutang & Piutang** — catat, bayar, tambah hutang per orang
- **Investasi** — saham, kripto, reksa dana, emas
- **Backup & Restore** — file `.json` ke folder Downloads
- **Kalkulator Kekayaan** — jumlahkan akun + porto + piutang
- **100% Offline** — tidak ada server, tidak ada iklan

---

## Build APK

```
1. Upload project ke repo GitHub
2. Actions → Build Android APK → Run workflow
3. Tunggu ±3 menit
4. Download APK dari tab Artifacts
5. Install → izinkan sumber tidak dikenal
```

---

## Stack

```
React 18 + Vite        UI & bundler
Tailwind CSS           Styling
Capacitor 5            Native Android bridge
Recharts               Grafik
localStorage           Penyimpanan lokal
GitHub Actions         CI/CD build APK
```

---

## Struktur

```
CashJournal/
├── .github/workflows/build-apk.yml
├── icons/                  Icon APK (mdpi → xxxhdpi)
├── public/
│   ├── logo_apk.png
│   └── logo_clean.png
├── src/
│   ├── assets/             Logo base64
│   ├── components/         BottomNav, UI
│   ├── context/            AppContext (global state)
│   ├── pages/              Dashboard, Transaksi, Akun, dll
│   └── utils/              constants.js
├── capacitor.config.js     com.mycashjournal.Fz
├── gen_icons.py
└── package.json
```

---

<div align="center">

Built by **Dncelzie**

</div>
