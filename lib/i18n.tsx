"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "id" | "en";

const LANG_KEY = "ft_lang_v1";

/**
 * Kamus Inggris. Kuncinya adalah teks Indonesia yang dipakai langsung di kode,
 * jadi kalau ada teks yang belum diterjemahkan, tampilannya otomatis tetap
 * memakai versi Indonesia (tidak pernah kosong).
 *
 * Header (nama web + subtitle) dan footer sengaja TIDAK diterjemahkan.
 */
export const EN: Record<string, string> = {
  /* ================= NAVIGASI ================= */
  "Buka menu": "Open menu",
  "Tutup menu": "Close menu",
  "Keluar": "Log out",
  "Keluar dari akun": "Log out",
  "Mode lokal": "Local mode",
  "— data belum tersinkron antar device. Klik di sini untuk mengaktifkan sinkronisasi.":
    "— data is not synced across devices yet. Click here to enable sync.",
  "Bahasa": "Language",
  "Indonesia": "Indonesian",
  "Inggris": "English",

  /* ================= UMUM ================= */
  "Batal": "Cancel",
  "Simpan": "Save",
  "Simpan Perubahan": "Save Changes",
  "Hapus": "Delete",
  "Edit": "Edit",
  "Reset": "Reset",
  "Kirim": "Send",
  "Tutup": "Close",
  "Memuat...": "Loading...",
  "Belum ada data": "No data yet",
  "Belum ada data.": "No data yet.",
  "Belum ada income.": "No income yet.",
  "Belum ada expense.": "No expenses yet.",
  "Belum ada goal.": "No goals yet.",
  "Kosong": "Empty",
  "Semua": "All",
  "Semua bulan": "All months",
  "Semua tipe": "All types",
  "Semua kategori": "All categories",
  "Semua metode": "All methods",
  "Semua periode": "All time",
  "Belum ditentukan": "Not set",
  "Belum diatur": "Not set",
  "Transaksi": "Transactions",
  "transaksi": "transactions",
  "pos": "entries",
  "bulan": "months",
  "goal": "goals",
  "budget": "budgets",
  "Income": "Income",
  "Expense": "Expenses",
  "Expenses": "Expenses",
  "Saving": "Saving",
  "Investment": "Investment",
  "Cash Flow": "Cash Flow",
  "Planner": "Planner",
  "Profile": "Profile",
  "Dashboard": "Dashboard",
  "Saldo": "Balance",
  "Aman": "On track",
  "Over!": "Over!",
  "Tercapai 🎉": "Achieved 🎉",
  "Surplus": "Surplus",
  "Defisit": "Deficit",
  "Savings rate": "Savings rate",
  "Income − Expense": "Income − Expense",
  "Tanggal": "Date",
  "Tipe": "Type",
  "Kategori": "Category",
  "Bentuk": "Type",
  "Metode": "Method",
  "Catatan": "Note",
  "Nominal": "Amount",
  "Aksi": "Actions",
  "Status": "Status",
  "Bulan": "Month",
  "Tahun": "Year",
  "Net": "Net",
  "Total": "Total",
  "Target": "Target",
  "Sisa": "Remaining",
  "Deadline": "Deadline",

  /* ================= KATEGORI & METODE (tampilan) ================= */
  "Dividen": "Dividend",
  "Usaha": "Business",
  "Lainnya": "Others",
  "Kartu Kredit": "Credit Card",
  "Kesehatan": "Health",

  /* ================= HALAMAN LOGIN ================= */
  "Masuk ke akunmu": "Sign in to your account",
  "Buat akun baru": "Create a new account",
  "Login sekali, data keuanganmu tersinkron di HP, laptop, dan tablet.":
    "Sign in once — your data stays synced across your phone, laptop, and tablet.",
  "Email": "Email",
  "Password": "Password",
  "Nama": "Name",
  "Nama kamu": "Your name",
  "cth: Rina": "e.g. Rina",
  "masuk@email.com": "you@email.com",
  "minimal 6 karakter": "at least 6 characters",
  "Masuk": "Sign in",
  "Daftar": "Sign up",
  "Memproses...": "Processing...",
  "Belum punya akun? ": "Don't have an account? ",
  "Daftar sekarang": "Sign up now",
  "Sudah punya akun? ": "Already have an account? ",
  "Email dan password wajib diisi.": "Email and password are required.",
  "Nama wajib diisi.": "Name is required.",
  "Password minimal 6 karakter.": "Password must be at least 6 characters.",
  "Data kamu dilindungi Row Level Security — hanya akunmu yang bisa membacanya.":
    "Your data is protected by Row Level Security — only your account can read it.",
  "Kamu sudah login": "You are signed in",
  "Buka Dashboard": "Open Dashboard",
  "⚙️ Sinkronisasi belum aktif": "⚙️ Sync is not active yet",
  "Aplikasi sedang berjalan dalam mode lokal (data hanya tersimpan di browser ini). Untuk bisa diakses dan disinkronkan antar device, ikuti 3 langkah berikut.":
    "The app is running in local mode (data is stored only in this browser). To access and sync it across devices, follow these 3 steps.",
  "Buat project gratis di supabase.com, lalu salin Project URL dan anon public key (menu Settings → API).":
    "Create a free project at supabase.com, then copy the Project URL and anon public key (Settings → API).",
  "Buka SQL Editor di Supabase, copy-paste isi file supabase-schema.sql, lalu klik Run.":
    "Open SQL Editor in Supabase, paste the contents of supabase-schema.sql, then click Run.",
  "Buat file .env.local di folder proyek ini, isi dua nilai tadi, lalu jalankan ulang start-tania.cmd.":
    "Create a .env.local file in this project folder, fill in both values, then restart start-tania.cmd.",
  "Lanjut pakai mode lokal": "Continue in local mode",
  "Memuat data keuanganmu...": "Loading your data...",
  "Menyambungkan ke database.": "Connecting to the database.",

  /* ================= DASHBOARD ================= */
  "Halo! Ini ringkasan keuanganmu.": "Hi! Here's your financial summary.",
  "Halo {name}! Ini ringkasan keuanganmu.": "Hi {name}! Here's your financial summary.",
  "Periode aktif: {period} • {count} transaksi • Cash flow {cashflow}":
    "Active period: {period} • {count} transactions • Cash flow {cashflow}",
  "＋ Tambah Income": "＋ Add Income",
  "＋ Tambah Expense": "＋ Add Expense",
  "Ringkasan {period}": "Summary — {period}",
  "Empat angka kunci: pemasukan, pengeluaran, arus kas bersih, dan alokasi masa depan.":
    "Four key numbers: money in, money out, net cash flow, and future allocation.",
  "{count} pos pemasukan": "{count} income entries",
  "{count} pos pengeluaran": "{count} expense entries",
  "· ideal 🎉": "· ideal 🎉",
  "· target ≥ 20%": "· target ≥ 20%",
  "Saving {saving} · Invest {invest}": "Saving {saving} · Invest {invest}",
  "Detail per kategori": "Details by category",
  "Pilih tab di panel kiri — setiap tab berisi rincian, grafik, dan tombol tambah pos.":
    "Pick a tab on the left panel — each tab has details, charts, and an add button.",
  "Tren cash flow bulanan": "Monthly cash flow trend",
  "Perbandingan income vs expense 8 bulan terakhir untuk melihat pola keuanganmu.":
    "Income vs expense for the last 8 months to reveal your money patterns.",
  "Income vs Expense per bulan": "Income vs Expense per month",
  "Bar biru = income, bar merah = expense. Tabel di bawah merangkum net tiap bulan.":
    "Blue bars = income, red bars = expense. The table below sums up the net for each month.",
  "＋ Tambah Pos Income": "＋ Add Income Entry",
  "＋ Tambah Pos Expense": "＋ Add Expense Entry",
  "Catat Salary, Bonus, Dividen, Gift, atau sumber income lainnya.":
    "Record Salary, Bonus, Dividend, Gift, or any other income source.",
  "Catat pengeluaran beserta metode bayar: Cash, QRIS, atau Transfer.":
    "Record an expense along with how you paid: Cash, QRIS, or Transfer.",

  /* ================= PANEL DETAIL ================= */
  "☰ Detail Keuangan": "☰ Financial Detail",
  "Pemasukan": "Income",
  "Pengeluaran": "Expenses",
  "Arus kas": "Cash flow",
  "Tabungan": "Saving",
  "Investasi": "Investment",
  "Setiap tab menampilkan statistik, grafik, dan transaksi terkait — plus tombol tambah pos.":
    "Each tab shows stats, charts, and related transactions — plus an add button.",
  "{count} pos pemasukan pada periode ini": "{count} income entries in this period",
  "{count} pos pengeluaran pada periode ini": "{count} expense entries in this period",
  "＋ Tambah Saving": "＋ Add Saving",
  "＋ Income": "＋ Income",
  "＋ Expense": "＋ Expense",
  "＋ Tambah Investasi": "＋ Add Investment",
  "Total income": "Total income",
  "{count} transaksi": "{count} transactions",
  "Rata-rata / pos": "Average / entry",
  "Per transaksi": "Per transaction",
  "Sumber terbesar": "Biggest source",
  "Komposisi sumber income": "Income composition",
  "Rincian per kategori": "Breakdown by category",
  "{percent}% dari total income": "{percent}% of total income",
  "{percent}% dari total expense": "{percent}% of total expenses",
  "Transaksi income terbaru": "Latest income transactions",
  "Transaksi investasi": "Investment transactions",
  "Transaksi expense terbaru": "Latest expense transactions",
  "Total expense": "Total expenses",
  "Metode favorit": "Favourite method",
  "Kategori terbesar": "Biggest category",
  "Komposisi pengeluaran": "Expense composition",
  "Top kategori": "Top categories",
  "Per metode pembayaran": "By payment method",
  "Selisih income dan expense — penentu kesehatan keuangan":
    "The gap between income and expenses — the key to financial health",
  "Total masuk": "Total in",
  "Total keluar": "Total out",
  "Net cash flow": "Net cash flow",
  "✅ Surplus {amount}. Bagus! Sisihkan minimal 20% ke Saving & Investasi sebelum belanja keinginan.":
    "✅ Surplus of {amount}. Nice! Set aside at least 20% for Saving & Investment before spending on wants.",
  "⚠️ Defisit {amount}. Coba pangkas 10–15% dari Hobby, Entertainment, atau Shopping bulan ini.":
    "⚠️ Deficit of {amount}. Try trimming 10–15% from Hobby, Entertainment, or Shopping this month.",
  "Rincian bulanan": "Monthly breakdown",
  "Dana yang disisihkan + progres tiap goal": "Money set aside + progress on each goal",
  "Total saving": "Total saving",
  "{count} pos kategori Saving": "{count} entries in the Saving category",
  "Porsi dari income": "Share of income",
  "Sudah ideal 🎉": "Already ideal 🎉",
  "Target ideal ≥ 20%": "Ideal target ≥ 20%",
  "Goals": "Goals",
  "{percent}% tercapai • Deadline {deadline} • Sisa {remaining}":
    "{percent}% reached • Deadline {deadline} • {remaining} to go",
  "Belum ada saving goal. Buat di halaman Planner.": "No saving goals yet. Create one on the Planner page.",
  "Modal yang ditanam vs return yang kembali": "Capital invested vs returns received",
  "Modal (keluar)": "Capital (out)",
  "Kategori Invest": "Invest category",
  "Return (masuk)": "Return (in)",
  "Investasi + Dividen": "Investment + Dividend",
  "Net investasi": "Net investment",
  "Return − Modal": "Return − Capital",
  "Alokasi per bentuk investasi": "Allocation by investment type",
  "Belum ada pos investasi.": "No investment entries yet.",
  "Belum ada pos investasi. Tambahkan dan pilih bentuknya: Gold, Stock, Bonds, dll.":
    "No investment entries yet. Add one and choose its type: Gold, Stock, Bonds, etc.",
  "Bentuk investasi tersedia": "Available investment types",
  "💡 Strategi: alokasikan 10–20% income ke Invest di awal bulan (pay yourself first), dan sebar ke beberapa bentuk agar risiko tidak menumpuk di satu instrumen.":
    "💡 Strategy: allocate 10–20% of income to investments at the start of the month (pay yourself first), and spread it across several types so risk doesn't pile up in one instrument.",
  "💡 Strategi: alokasikan 10–20% income ke Invest di awal bulan (pay yourself first), konsisten tiap gajian.":
    "💡 Strategy: allocate 10–20% of income to investments at the start of the month (pay yourself first), consistently every payday.",
  "Surplus {amount}. Bagus! Pertahankan minimal 20% untuk saving & investasi.":
    "Surplus of {amount}. Great! Keep at least 20% going to saving & investment.",
  "Belum ada income. Tambah pos Salary / Bonus / Dividen / Gift.":
    "No income yet. Add a Salary / Bonus / Dividend / Gift entry.",

  /* ================= FORM TRANSAKSI ================= */
  "Nominal harus lebih dari 0": "Amount must be greater than 0",
  "Tanggal wajib diisi": "Date is required",
  "⬆ Income": "⬆ Income",
  "⬇ Expense": "⬇ Expense",
  "Nominal (Rp)": "Amount (Rp)",
  "cth: 50000": "e.g. 50000",
  "Kategori Income": "Income category",
  "Kategori Expense": "Expense category",
  "Bentuk Investasi": "Investment type",
  "Metode Pembayaran": "Payment method",
  "cth: Makan siang, Gaji September...": "e.g. Lunch, September salary...",
  "+ Tambah Transaksi": "+ Add Transaction",

  /* ================= HALAMAN TRANSACTION ================= */
  "Semua pemasukan & pengeluaranmu.": "All your income & expenses.",
  "Hasil filter: {income} income · {expense} expense • {shown} dari {total} transaksi":
    "Filtered: {income} income · {expense} expense • {shown} of {total} transactions",
  "＋ Tambah Transaksi": "＋ Add Transaction",
  "⬇ Export CSV": "⬇ Export CSV",
  "🗑 Hapus Semua": "🗑 Delete All",
  "Hapus semua transaksi?": "Delete all transactions?",
  "Filter & pencarian": "Filter & search",
  "Saring berdasarkan tipe, kategori, metode bayar, bulan, atau kata kunci.":
    "Narrow down by type, category, payment method, month, or keyword.",
  "🔍 Cari catatan / kategori...": "🔍 Search note / category...",
  "💰 Income": "💰 Income",
  "🧾 Expense": "🧾 Expense",
  "Daftar transaksi": "Transaction list",
  "Klik Edit untuk koreksi, Hapus untuk menghapus. Nominal hijau = masuk, merah = keluar.":
    "Click Edit to fix, Delete to remove. Green amount = in, red = out.",
  "Hapus transaksi ini?": "Delete this transaction?",
  "Tidak ada transaksi yang cocok. Ubah filter atau tambah transaksi baru.":
    "No matching transactions. Change the filter or add a new one.",
  "Ubah filter atau tambah transaksi baru.": "Change the filter or add a new transaction.",
  "✏️ Edit Transaksi": "✏️ Edit Transaction",
  "Perbarui detail transaksi lalu simpan perubahan.": "Update the transaction details, then save.",
  "Pilih Income atau Expense, lalu lengkapi nominal, kategori, dan tanggal.":
    "Choose Income or Expense, then fill in the amount, category, and date.",

  /* ================= HALAMAN PLANNER ================= */
  "🎯 Planner & Budget": "🎯 Planner & Budget",
  "Rencanakan bulanmu dengan tenang.": "Plan your month with peace of mind.",
  "Periode {period} • Total budget {budget} • Terpakai {spent}":
    "Period {period} • Total budget {budget} • Used {spent}",
  "• {count} kategori over ⚠️": "• {count} categories over ⚠️",
  "• semua aman 🎉": "• all on track 🎉",
  "Budget bulanan per kategori": "Monthly budget by category",
  "Atur limit tiap kategori expense. Klik di luar kolom nominal untuk menyimpan otomatis.":
    "Set a limit for each expense category. Click outside the field to save automatically.",
  "Total budget": "Total budget",
  "Terpakai": "Used",
  "Atur limit (Rp)": "Set limit (Rp)",
  "Target saving & investasi": "Saving & investment goals",
  "Pantau progres Dana Darurat, DP Rumah, Liburan, dan goal lainnya.":
    "Track progress for your Emergency Fund, House Down Payment, Holiday, and more.",
  "Hapus goal ini?": "Delete this goal?",
  "Terkumpul": "Collected",
  "+ Tambah tabungan (Rp)": "+ Add savings (Rp)",
  "＋ Nabung": "＋ Add",
  "Masukkan nominal yang valid": "Enter a valid amount",
  "Tambah goal pertamamu di bawah.": "Add your first goal below.",
  "＋ Tambah Goal Baru": "＋ Add New Goal",
  "Contoh: Dana Darurat 20 juta, Liburan Jepang 15 juta.":
    "Examples: Emergency Fund 20 million, Japan Trip 15 million.",
  "Nama goal": "Goal name",
  "Dana Darurat": "Emergency Fund",
  "Target (Rp)": "Target (Rp)",
  "Sudah terkumpul (Rp)": "Already saved (Rp)",
  "Nama dan target wajib diisi": "Name and target are required",
  "＋ Tambah Goal": "＋ Add Goal",
  "💡 Rumus 50/30/20:": "💡 The 50/30/20 rule:",
  "50% kebutuhan (Housing, Food, Transport, Utilities) • 30% keinginan (Hobby, Entertainment, Shopping, Family) • 20% masa depan (Saving, Invest). Cash flow positif = income > expense.":
    "50% needs (Housing, Food, Transport, Utilities) • 30% wants (Hobby, Entertainment, Shopping, Family) • 20% future (Saving, Invest). Positive cash flow = income > expense.",

  /* ================= HALAMAN PROFILE ================= */
  "👤 Profile": "👤 Profile",
  "Mode Lokal": "Local Mode",
  "Akunmu tersinkron di semua device. Data dipisahkan per akun oleh Row Level Security.":
    "Your account is synced across all devices. Data is separated per account by Row Level Security.",
  "Kamu sedang memakai mode lokal — data hanya tersimpan di browser ini.":
    "You are in local mode — data is stored only in this browser.",
  "Aktifkan Sinkronisasi": "Enable Sync",
  "Status akun": "Account status",
  "Informasi login dan kondisi sinkronisasi datamu.": "Your sign-in details and data sync status.",
  "🔐 Akun": "🔐 Account",
  "User ID": "User ID",
  "Login terakhir": "Last sign-in",
  "☁️ Sinkronisasi": "☁️ Sync",
  "Sinkronisasi aktif.": "Sync is active.",
  "Datamu tersimpan di database dan bisa diakses dari HP, laptop, maupun tablet dengan akun yang sama.":
    "Your data lives in the database and is reachable from your phone, laptop, or tablet with the same account.",
  "Mode lokal.": "Local mode.",
  "Data hanya ada di browser ini.": "Data exists only in this browser.",
  "Setiap akun hanya bisa membaca datanya sendiri. Isolasi ini dijaga oleh Row Level Security di database, bukan hanya oleh tampilan web — jadi akun lain tidak bisa melihat keuanganmu walau memodifikasi halaman ini.":
    "Each account can only read its own data. This isolation is enforced by Row Level Security in the database — not just the web UI — so other accounts cannot see your finances even if they modify this page.",
  "Status data: {status} • Transaksi tercatat sejak {since}":
    "Data status: {status} • Transactions recorded since {since}",
  "siap": "ready",
  "memuat...": "loading...",
  "Ringkasan data": "Data summary",
  "Total keseluruhan dari semua transaksi yang tercatat di akun ini.":
    "Overall totals from every transaction recorded in this account.",
  "sepanjang waktu": "all time",
  "income − expense": "income − expense",
  "{months} bulan · {goals} goal · {budgets} budget":
    "{months} months · {goals} goals · {budgets} budgets",
  "Kelola data": "Manage data",
  "Tindakan yang mengubah seluruh data di akun ini.": "Actions that change all data in this account.",
  "🗑️ Hapus semua transaksi": "🗑️ Delete all transactions",
  "Menghapus {count} transaksi dari akun ini{scope}.": "Deletes {count} transactions from this account{scope}.",
  " (termasuk di database)": " (including in the database)",
  "Budget dan goal tidak terpengaruh.": "Budgets and goals are not affected.",
  "Hapus Semua Transaksi": "Delete All Transactions",
  "Hapus semua {count} transaksi? Tindakan ini tidak bisa dibatalkan.":
    "Delete all {count} transactions? This cannot be undone.",
  "Ubah profil": "Edit profile",
  "Perbarui nama tampilan dan password akunmu.":
    "Update your display name and account password.",
  "Nama tampilan": "Display name",
  "Simpan Nama": "Save Name",
  "Nama berhasil diperbarui.": "Name updated successfully.",
  "Password baru": "New password",
  "Konfirmasi password baru": "Confirm new password",
  "Ubah Password": "Change Password",
  "Password berhasil diubah.": "Password changed successfully.",
  "Konfirmasi password tidak cocok.": "Passwords do not match.",
  "Nama tidak boleh kosong.": "Name cannot be empty.",

  /* ================= CHATBOT ================= */
  "Halo! 💙 Aku FinBuddy — bisa jawab soal income, expenses, cash flow, saving, investment, dan diskusi keputusan finansial. Coba misal \"mau beli HP 3 juta, gimana menurutmu?\"":
    "Hi! 💙 I'm FinBuddy — I can answer questions about income, expenses, cash flow, saving, investment, and financial decisions. Try: \"I want to buy a 3 million phone, what do you think?\"",
  "Aku belum bisa memberi pendapat soal {item} ({amount}) karena data incomemu masih kosong. Tambahkan dulu pos income (misal Salary bulan ini), lalu tanya lagi ya — biar pendapatku berdasar angka nyata.":
    "I can't give an opinion on {item} ({amount}) yet because your income data is still empty. Add an income entry first (e.g. this month's Salary), then ask again — so my opinion is based on real numbers.",
  "💡 Pendapatku: GAS — {item} ({amount}) TERJANGKAU buat kondisi keuanganmu saat ini. ✅":
    "💡 My verdict: GO FOR IT — {item} ({amount}) is AFFORDABLE for your current finances. ✅",
  "💡 Pendapatku: BOLEH — tapi dengan syarat. {item} ({amount}) masih masuk akal, asal aturannya dipatuhi. ✅⚠️":
    "💡 My verdict: OKAY — but with conditions. {item} ({amount}) is still reasonable, as long as you follow the rules. ✅⚠️",
  "💡 Pendapatku sejujurnya: PIKIR ULANG dulu. {item} ({amount}) cukup berat untuk kondisi saat ini. ⚠️":
    "💡 Honestly: THINK AGAIN first. {item} ({amount}) is quite heavy for your current situation. ⚠️",
  "💡 Pendapatku sejujurnya: TAHAN DULU. {item} ({amount}) belum aman untuk kondisi saat ini. ⛔":
    "💡 Honestly: HOLD OFF for now. {item} ({amount}) is not safe for your current situation. ⛔",
  "📊 Alasanku (dari datamu):": "📊 My reasoning (from your data):",
  "• Cicilan {amount}/bln = {percent}% dari income bulanan ({income}). Patokan sehat: total cicilan ≤ 30% income (≈ {cap}/bln).":
    "• An installment of {amount}/month = {percent}% of your monthly income ({income}). Healthy benchmark: total installments ≤ 30% of income (≈ {cap}/month).",
  "• Nominal {amount} = {percent}% dari rata-rata income bulananmu ({income}/bln).":
    "• The amount {amount} = {percent}% of your average monthly income ({income}/month).",
  "• Cash flow bulananmu surplus {net} — jadi secara arus kas {note}.":
    "• Your monthly cash flow has a surplus of {net} — so in cash-flow terms {note}.",
  "masih ketutup": "it is still covered",
  "ini setara {months} bulan surplus": "it equals about {months} months of surplus",
  "• ⚠️ Cash flow bulananmu sedang defisit ({net}). Pengeluaran besar apa pun sebaiknya ditahan dulu.":
    "• ⚠️ Your monthly cash flow is in deficit ({net}). Any big spending should wait.",
  "• Dana darurat/tabungan tercatat {saving} (≈ {months} bulan pengeluaran). Idealnya jangan sampai sisa di bawah 3 bulan pengeluaran.":
    "• Your emergency fund/savings stand at {saving} (≈ {months} months of expenses). Ideally never let it drop below 3 months of expenses.",
  "• Catatan: ada budget yang over bulan ini ({list}), jadi ruang gerakmu lebih sempit.":
    "• Note: some budgets are over this month ({list}), so your room to manoeuvre is tighter.",
  "\n\n🔁 Alternatif yang lebih ringan:\n• Nabung {perMonth}/bln (50% surplus) → terkumpul dalam ±{months} bulan.\n• Cari opsi second / turun spek 30–40% lebih murah.\n• Kalau mendesak, bagi jadi cicilan dengan tenor pendek — tanya aku \"cicilan X per bulan aman nggak?\".":
    "\n\n🔁 Lighter alternatives:\n• Save {perMonth}/month (50% of surplus) → funded in about {months} months.\n• Look for a used option / a model 30–40% cheaper.\n• If urgent, split it into a short-tenor installment — ask me \"is an X per month installment safe?\".",
  "\n\n🔁 Biar makin aman:\n• Bayar pakai metode tercatat (QRIS/Transfer) supaya otomatis masuk tracker.\n• Sisihkan dulu pos Saving/Invest bulan ini sebelum checkout.\n• Tunggu 3x24 jam (aturan jeda) — kalau masih kepingin, berarti memang butuh.":
    "\n\n🔁 To stay safer:\n• Pay with a trackable method (QRIS/Transfer) so it lands in the tracker automatically.\n• Fund this month's Saving/Invest entries before checking out.\n• Wait 72 hours (the pause rule) — if you still want it, you probably need it.",
  "\n\n👉 Rekomendasiku: tunda {item} sampai savings rate-mu ≥ 20% dan tidak ada budget over. Mau aku bantu susun skema nabungnya per bulan?":
    "\n\n👉 My recommendation: postpone {item} until your savings rate is ≥ 20% and no budget is over. Want me to draft a monthly saving plan?",
  "\n\n👉 Rekomendasiku: lanjut, tapi catat sebagai expense di kategorinya begitu dibayar. Mau aku bantu cek dampaknya ke budget kategori terkait?":
    "\n\n👉 My recommendation: go ahead, but record it as an expense in its category once paid. Want me to check the impact on that category's budget?",
  "\n\n_Ini pendapat berbasis datamu, bukan nasihat keuangan profesional ya._":
    "\n\n_This is an opinion based on your data, not professional financial advice._",
  "🎯 Skor kesiapan finansialmu: {score}/100\n\n{rows}\n\n{verdict}\n\nCoba diskusikan rencana spesifiknya, misal \"mau beli laptop 8 juta, gimana menurutmu?\" — aku beri pendapat lengkap dengan angkanya.":
    "🎯 Your financial readiness score: {score}/100\n\n{rows}\n\n{verdict}\n\nTry discussing a specific plan, e.g. \"I want to buy an 8 million laptop, what do you think?\" — I'll give a full opinion with the numbers.",
  "✅ SIAP — silakan ambil keputusan besar dengan percaya diri, tetap catat di tracker.":
    "✅ READY — go ahead with big decisions confidently, just keep logging them.",
  "⚠️ SIAP BERSYARAT — boleh jalan, tapi amankan dulu poin yang masih 0 di atas.":
    "⚠️ CONDITIONALLY READY — you can proceed, but fix the items still at 0 above first.",
  "⛔ BELUM SIAP — fokus 1–2 bulan ke depan untuk memperbaiki poin di atas sebelum komitmen besar.":
    "⛔ NOT READY — spend the next 1–2 months improving the points above before making big commitments.",
  "• Savings rate ≥ 20% (+30) — fondasi kuat.": "• Savings rate ≥ 20% (+30) — a strong foundation.",
  "• Savings rate {rate}% (+0) — idealnya ≥ 20% dulu.": "• Savings rate {rate}% (+0) — ideally get to ≥ 20% first.",
  "• Cash flow bulanan surplus {net} (+25).": "• Monthly cash flow surplus of {net} (+25).",
  "• Cash flow bulanan defisit ({net}) (+0) — bereskan ini dulu.": "• Monthly cash flow deficit ({net}) (+0) — fix this first.",
  "• Dana darurat ≈ {months} bulan pengeluaran (+25).": "• Emergency fund ≈ {months} months of expenses (+25).",
  "• Dana darurat ≈ {months} bulan (+0) — target minimal 3 bulan.": "• Emergency fund ≈ {months} months (+0) — target at least 3 months.",
  "• Tidak ada budget over (+20).": "• No budget overruns (+20).",
  "• Budget over di: {list} (+0).": "• Budget overruns in: {list} (+0).",
  "⚖️ Perbandinganmu (\"{input}\"):\n• Opsi hemat {cheap}\n• Opsi mahal {pricey}\n• Selisih: {diff}\n\n{pick}\n\nMau aku bedah salah satunya lebih dalam? Sebutkan nominalnya.":
    "⚖️ Your comparison (\"{input}\"):\n• Cheaper option {cheap}\n• Pricier option {pricey}\n• Difference: {diff}\n\n{pick}\n\nWant me to dig into one of them? Just give me the amount.",
  " ({percent}% income bulanan)": " ({percent}% of monthly income)",
  "Pendapatku: pilih yang hemat. Selisihnya lumayan dan cash flow-mu tidak longgar untuk opsi mahal.":
    "My take: pick the cheaper one. The gap is significant and your cash flow isn't roomy enough for the pricier option.",
  "Pendapatku: kalau beda kualitasnya sepadan dan opsi mahal masih di bawah 35% income bulanan, boleh ambil yang mahal — kalau tidak, hemat saja, selisihnya masukkan ke Saving.":
    "My take: if the quality gap is worth it and the pricier option stays under 35% of monthly income, take the pricier one — otherwise save the difference into Savings.",
  "🧮 Simulasinya:\n• Target: {target}\n• Nabung: {perMonth}/bln\n• Estimasi: ±{months} bulan ({years}).\n\n{warning}":
    "🧮 The simulation:\n• Target: {target}\n• Saving: {perMonth}/month\n• Estimate: about {months} months ({years}).\n\n{warning}",
  "{y} tahun {rest} bulan": "{y} years {rest} months",
  "⚠️ Hati-hati: nominal nabung ini di atas surplus bulananmu ({net}). Turunkan sedikit atau pangkas expense non-esensial.":
    "⚠️ Careful: that saving amount is above your monthly surplus ({net}). Lower it a bit or trim non-essential spending.",
  "✅ Skema ini realistis. Otomatiskan transfernya tiap awal bulan biar konsisten.":
    "✅ This plan is realistic. Automate the transfer at the start of each month to stay consistent.",
  "Masih soal {item} ({amount}) ya? Pendapat jujurku tetap seperti di atas 👆 — {note}\n\nKalau nominalnya beda, sebutkan angkanya (misal \"kalau yang 5 juta gimana?\") dan aku hitung ulang.":
    "Still about {item} ({amount})? My honest take is the same as above 👆 — {note}\n\nIf the amount differs, tell me the number (e.g. \"what about the 5 million one?\") and I'll recalculate.",
  "ini bukan pengeluaran kecil, jadi pastikan dana daruratmu tidak tersentuh.":
    "this isn't small spending, so make sure your emergency fund stays untouched.",
  "ini masih wajar, asal dicatat dan tidak mengganggu pos Saving bulan ini.":
    "this is still reasonable, as long as it's logged and doesn't disturb this month's Saving entry.",
  "Boleh banget kita diskusikan! 🤝 Biar pendapatku tepat, ceritakan:\n1. Rencananya apa? (misal beli HP, ambil cicilan motor, liburan)\n2. Berapa nominalnya? (misal 3 juta / cicilan 800rb per bulan)\n3. Kebutuhan mendesak atau keinginan?\n\nContoh: \"mau beli laptop 8 juta untuk kerja, gimana menurutmu?\"":
    "Let's definitely discuss it! 🤝 So my opinion is accurate, tell me:\n1. What's the plan? (e.g. buy a phone, take a motorbike loan, a holiday)\n2. How much? (e.g. 3 million / an 800k monthly installment)\n3. Urgent need or a want?\n\nExample: \"I want to buy an 8 million laptop for work, what do you think?\"",
  "Cash flow-mu saat ini:\n• Income: {income}\n• Expense: {expense}\n• Net: {net} ({status})\n• Savings rate: {rate}% (ideal ≥ 20%)\n\n{advice}":
    "Your cash flow right now:\n• Income: {income}\n• Expense: {expense}\n• Net: {net} ({status})\n• Savings rate: {rate}% (ideal ≥ 20%)\n\n{advice}",
  "surplus 🎉": "surplus 🎉",
  "defisit ⚠️": "deficit ⚠️",
  "Pertahankan! Sisihkan surplus ke Saving/Invest sebelum belanja keinginan.":
    "Keep it up! Move the surplus into Saving/Investment before spending on wants.",
  "Saran: pangkas 10-15% dari kategori Hobby/Entertainment/Shopping bulan ini.":
    "Suggestion: trim 10–15% from Hobby/Entertainment/Shopping this month.",
  "Pengeluaran terbesarmu adalah kategori {category} sebesar {amount}.\n\nCek tab Expenses di side-panel untuk rincian per kategori dan metode bayar (Cash/QRIS/Transfer). Kalau {category} non-esensial, coba batasi 10% lebih rendah bulan depan.":
    "Your biggest expense category is {category} at {amount}.\n\nCheck the Expenses tab in the side panel for the breakdown by category and payment method (Cash/QRIS/Transfer). If {category} is non-essential, try capping it 10% lower next month.",
  "Total pos Saving-mu: {saving} (≈ {months} bulan pengeluaran).\n\nIdealnya 20% income untuk saving+invest. {budgetNote} Buka tab Saving untuk progres tiap goal.":
    "Your total Saving entries: {saving} (≈ {months} months of expenses).\n\nIdeally 20% of income goes to saving+investment. {budgetNote} Open the Saving tab for each goal's progress.",
  "Perhatian budget over: {list}.": "Heads up, budget overruns: {list}.",
  "Budget kategori aman sejauh ini.": "Category budgets look safe so far.",
  "Ringkasan investasimu:\n• Modal keluar (Invest): {out}\n• Return masuk (Investasi+Dividen): {in}\n• Net: {net}\n\nStrategi simpel: rutin tiap gajian, pisahkan dana darurat dulu 3-6x pengeluaran, baru kejar return. Atau diskusikan rencana spesifik, misal \"mau investasi 2 juta per bulan, aman nggak?\"":
    "Your investment summary:\n• Capital out (Invest): {out}\n• Return in (Investment+Dividend): {in}\n• Net: {net}\n\nSimple strategy: be consistent every payday, set aside an emergency fund of 3–6x your expenses first, then chase returns. Or discuss a specific plan, e.g. \"I want to invest 2 million a month, is that safe?\"",
  "Total income-mu: {income}.\nSumber terbesar biasanya Salary, dilengkapi Bonus/Dividen/Freelance. Tambah pos income baru lewat tombol + Income di side-panel. Diversifikasi income bikin cash flow lebih aman.":
    "Your total income: {income}.\nThe biggest source is usually Salary, complemented by Bonus/Dividend/Freelance. Add a new income entry via the + Income button in the side panel. Diversifying income makes cash flow safer.",
  "Ada {count} kategori over budget: {list}. Yuk geser alokasinya atau naikkan limit secara realistis di halaman Planner.":
    "{count} categories are over budget: {list}. Shift the allocation or raise the limit realistically on the Planner page.",
  "Semua budget kategori masih aman. Kamu bisa atur limit tiap kategori di halaman Planner dan pantau progresnya tiap bulan.":
    "All category budgets are still safe. You can set each category's limit on the Planner page and track progress monthly.",
  "Tips untukmu (50/30/20):\n• 50% kebutuhan: Housing, Food, Transport, Utilities\n• 30% keinginan: Hobby, Family, Entertainment\n• 20% masa depan: Saving + Invest\n\nOtomatiskan transfer Saving/Invest di awal bulan, pakai QRIS/Transfer agar tercatat rapi, dan review cash flow tiap minggu.":
    "Tips for you (50/30/20):\n• 50% needs: Housing, Food, Transport, Utilities\n• 30% wants: Hobby, Family, Entertainment\n• 20% future: Saving + Investment\n\nAutomate Saving/Investment transfers at the start of the month, use QRIS/Transfer so everything is recorded, and review your cash flow weekly.",
  "Sama-sama! 💙 Senang bisa bantu. Jaga cash flow tetap positif ya!":
    "You're welcome! 💙 Happy to help. Keep that cash flow positive!",
  "Aku mencatat pertanyaanmu: \"{input}\".\n\nAku bisa bantu dua hal:\n1. Info keuanganmu: cash flow, income/expense terbesar, saving, investasi, budget.\n2. Diskusi keputusan: ceritakan rencanamu + nominalnya, misal \"mau beli kamera 4,5 juta, worth it nggak?\" — aku beri pendapat jujur berdasar datamu.":
    "Noted, your question: \"{input}\".\n\nI can help with two things:\n1. Your financial info: cash flow, biggest income/expense, saving, investment, budget.\n2. Decision discussion: tell me your plan + the amount, e.g. \"I want to buy a 4.5 million camera, is it worth it?\" — I'll give an honest opinion based on your data.",
  "Mau beli HP 3 juta, gimana menurutmu?": "I want to buy a 3 million phone, what do you think?",
  "Cicilan 800 rb/bln aman nggak?": "Is an 800k/month installment safe?",
  "Siap ambil keputusan besar?": "Am I ready for a big decision?",
  "Berapa cash flow saya?": "What's my cash flow?",
  "Tips nabung untukku?": "Tips for saving up?",
  "💬 FinBuddy — Diskusi Finansial": "💬 FinBuddy — Financial Discussion",
  "Info keuangan • pendapat keputusan • simulasi nabung/cicil":
    "Financial info • decision opinions • saving/installment simulation",
  "Coba: \"mau beli laptop 8jt, worth it?\"": "Try: \"I want to buy an 8m laptop, is it worth it?\"",
  "Buka chatbot": "Open chatbot",
};

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Terjemahkan teks Indonesia ke bahasa aktif (dengan opsional {placeholder}). */
  t: (text: string, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

function applyVars(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.split(`{${k}}`).join(String(v)),
    text
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "id") setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<LangContextValue>(() => {
    const t = (text: string, vars?: Record<string, string | number>) => {
      const source = lang === "en" ? EN[text] ?? text : text;
      return applyVars(source, vars);
    };
    return {
      lang,
      t,
      setLang: (l: Lang) => {
        setLangState(l);
        try {
          localStorage.setItem(LANG_KEY, l);
        } catch {
          /* ignore */
        }
      },
    };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang harus dipakai di dalam LanguageProvider");
  return ctx;
}

/** Ambil nama panggilan user dari metadata Supabase. */
export function displayName(user: { email?: string | null; user_metadata?: Record<string, unknown> } | null): string | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  const name = (meta.full_name ?? meta.name) as string | undefined;
  if (name && name.trim()) return name.trim();
  const email = user.email ?? "";
  const prefix = email.split("@")[0];
  return prefix ? prefix : null;
}
