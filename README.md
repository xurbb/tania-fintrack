# Tania's FinTrack 💙

**🌐 Live:** https://tania-fintrack.vercel.app

Website pencatatan **income & expense**, perhitungan **cash flow + grafik bulanan**, dan **planner budget & saving goals**.
Dibangun dengan **Next.js (App Router) + React + Recharts + Supabase**.

## Fitur

- **Dashboard**
  - Total Income, Total Expense, Cash Flow (net), Savings Rate
  - Grafik bar Income vs Expense per bulan (8 bulan terakhir)
  - Tabel cash flow bulanan
  - Pie Expense per kategori
  - Breakdown Expense per metode pembayaran (Cash / QRIS / Transfer / E-Wallet / Kartu Kredit)
  - Breakdown Income per kategori
  - Filter bulan
- **Transaksi**
  - Tambah / Edit / Hapus income & expense
  - Kategori Income: Salary, Bonus, Dividen, Gift, Freelance, Usaha, Investasi, Lainnya
  - Kategori Expense: Debt, Transport, Invest, Saving, Food, Housing, Family, Hobby, Health, Education, Utilities, Entertainment, Shopping, Lainnya
  - Metode bayar khusus expense: Cash, QRIS, Transfer, E-Wallet, Kartu Kredit
  - Filter: tipe, kategori, metode, bulan, pencarian
  - Export CSV, Hapus semua
- **Planner**
  - Budget limit bulanan per kategori expense + progress bar + status Over/Aman
  - Saving goals (nama, target, terkumpul, deadline) + tombol +Nabung
  - Tips budgeting 50/30/20
- **Penyimpanan lokal** (localStorage) + data contoh otomatis saat pertama dibuka.

## Cara jalan

### Cara paling mudah (klik 2x)
- **`start-tania.cmd`** → menyalakan server, browser otomatis terbuka ke **http://localhost:4100**.
  Kalau `node_modules` belum ada, dependensi otomatis diinstall.
- **`stop-tania.cmd`** → mematikan server (hanya proses proyek ini, proyek lain tidak terganggu).

### Cara manual

```powershell
cd "E:\Belajar Ngoding"
npm install      # cukup sekali
npm run dev
```

Buka **http://localhost:4100**

> **Catatan port:** proyek ini dikunci di **4100** agar tidak bentrok dengan proyek lain
> yang memakai port 3000. Kalau tetap ingin di 3000, jalankan `npm run dev:3000`.

### Build production

```powershell
npm run build
npm start
```

## Akses dari device lain

### A. Satu WiFi (LAN) — sudah bisa tanpa setup tambahan

1. Jalankan `start-tania.cmd`
2. Cari IP laptop: buka CMD lalu jalankan `ipconfig`, lihat **IPv4 Address** di adapter Wi-Fi
3. Di HP/device lain, buka: `http://<IP-laptop>:4100` (contoh: `http://192.168.71.54:4100`)

Syarat: device di WiFi yang sama dan laptop menyala. Data **belum** tersinkron antar device (lihat bagian Supabase).

### B. Sinkronisasi data antar device (Supabase)

Wajib dilakukan kalau ingin data yang sama di HP dan laptop.

**1. Buat project Supabase**
- Daftar gratis di https://supabase.com → New project
- Buka **Settings → API**, salin **Project URL** dan **anon public key**

**2. Buat tabelnya**
- Buka **SQL Editor → New query**
- Copy-paste seluruh isi file `supabase-schema.sql`, klik **Run**

**3. Hubungkan aplikasi**
```powershell
Copy-Item .env.local.example .env.local
notepad .env.local     # isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Jalankan ulang `start-tania.cmd`, lalu buka `http://localhost:4100/login` dan **Daftar** akun.

Setelah aktif: strip kuning "Mode lokal" hilang, navbar menampilkan email + tombol Keluar, dan data otomatis tersinkron ke semua device yang login dengan akun sama.

**4. Konfirmasi email (opsional, disarankan saat testing)**
Supabase → **Authentication → Sign In / Providers → Email**, matikan *Confirm email* kalau tidak mau repot verifikasi saat mencoba. Ingat dinyalakan kembali sebelum dipakai serius.

### C. Deploy ke internet (Vercel)

Supaya bisa dibuka dari mana saja, bukan hanya WiFi rumah:

1. Install Git (atau minta dibantu): https://git-scm.com/download/win
2. Push folder ini ke repository GitHub
3. Buka https://vercel.com → **Add New Project** → import repo tadi
4. Di langkah konfigurasi, tambahkan **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Klik **Deploy** → dapat URL `https://xxx.vercel.app`
6. Di Supabase → **Authentication → URL Configuration**, tambahkan URL Vercel tadi ke *Site URL* dan *Redirect URLs*

## Update setelah deploy

| Metode | Cara update | Otomatis? |
|---|---|---|
| LAN / lokal | Simpan file → Next langsung hot-reload | ✅ Ya |
| Vercel + GitHub | `git push` → Vercel rebuild ±1 menit, URL tetap sama | ✅ Ya |
| Vercel CLI | `npx vercel --prod` tiap ada perubahan | ❌ Manual |

Update aplikasi **tidak menghapus data** — data tersimpan di database Supabase (atau localStorage untuk mode lokal), terpisah dari kode.

## Struktur

```
app/
  layout.tsx        # Layout + FinanceProvider + Navbar
  page.tsx          # Dashboard + cash flow chart
  globals.css       # Styling
  transactions/page.tsx
  planner/page.tsx
components/
  Navbar.tsx
  TransactionForm.tsx
  CashflowChart.tsx (recharts BarChart)
  CategoryChart.tsx (recharts PieChart)
lib/
  types.ts
  constants.ts      # kategori + payment methods + warna
  utils.ts          # formatIDR, monthKey, dll
  store.tsx         # Context + localStorage + seed data
```

## Kustomisasi cepat

- Tambah kategori: edit `INCOME_CATEGORIES` / `EXPENSE_CATEGORIES` di `lib/constants.ts`.
- Tambah metode bayar: edit `PAYMENT_METHODS` di `lib/constants.ts` (tipe di `lib/types.ts`).
- Ganti mata uang/format: edit `formatIDR` di `lib/utils.ts`.
