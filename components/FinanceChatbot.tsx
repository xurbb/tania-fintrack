"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useFinance } from "@/lib/store";
import { formatIDR, monthKey } from "@/lib/utils";

interface Msg { role: "bot" | "user"; text: string; }

interface Ctx {
  totalIn: number; totalOut: number; net: number; rate: number;
  topExpense: string; topExpenseAmt: number;
  totalSaving: number; investOut: number; investIn: number;
  overBudgets: string[];
  monthlyIncome: number; monthlyNet: number; monthlyOut: number;
  emergencyMonths: number;
}

interface DecisionMemory { item: string; amount: number; installment: boolean; }

const SUGGESTIONS = [
  "Mau beli HP 3 juta, gimana menurutmu?",
  "Cicilan 800 rb/bln aman nggak?",
  "Siap ambil keputusan besar?",
  "Berapa cash flow saya?",
  "Tips nabung untukku?",
];

/* ---------- Parsing nominal (Rp, juta/jt, ribu/rb/k, miliar, 5.000.000) ---------- */
function parseAmount(text: string): { value: number; raw: string } | null {
  const q = text.toLowerCase();
  const num = "(\\d+(?:[.,]\\d+)?)";

  const tryUnit = (re: RegExp, mult: number) => {
    const m = q.match(re);
    if (!m) return null;
    const v = parseFloat(m[1].replace(",", "."));
    if (isNaN(v)) return null;
    return { value: Math.round(v * mult), raw: m[0] };
  };

  let r =
    tryUnit(new RegExp(num + "\\s*(miliar|milyar|m)\\b", ""), 1_000_000_000) ??
    tryUnit(new RegExp(num + "\\s*(juta|jt)\\b", ""), 1_000_000) ??
    tryUnit(new RegExp(num + "\\s*(ribu|rb|k)\\b", ""), 1_000);
  if (r) return r;

  // Format penuh ala Indonesia: 5.000.000 / 5 000 000 / Rp15.000.000
  const full = q.match(/rp\s?(\d{1,3}(?:[.\s]\d{3})+(?:,\d+)?)/) ?? q.match(/(\d{1,3}(?:[.\s]\d{3})+(?:,\d+)?)/);
  if (full) {
    const v = parseFloat(full[1].replace(/[.\s]/g, "").replace(",", "."));
    if (!isNaN(v) && v >= 1000) return { value: Math.round(v), raw: full[0] };
  }

  // Angka polos hanya dihitung kalau jelas nominal (diawali rp/rupiah)
  const plain = q.match(/(?:rp|rupiah)\s?(\d+(?:[.,]\d+)?)/);
  if (plain) {
    const v = parseFloat(plain[1].replace(",", "."));
    if (!isNaN(v) && v > 0) return { value: Math.round(v), raw: plain[0] };
  }
  return null;
}

function parseAllAmounts(text: string): number[] {
  // Untuk komparasi "mending A 3jt atau B 5jt" — ambil semua nominal ber-unit
  const q = text.toLowerCase();
  const out: number[] = [];
  const collect = (re: RegExp, mult: number) => {
    const g = new RegExp(re.source, "gi");
    let m: RegExpExecArray | null;
    while ((m = g.exec(q)) !== null) {
      const v = parseFloat(m[1].replace(",", "."));
      if (!isNaN(v)) out.push(Math.round(v * mult));
    }
  };
  collect(/(\d+(?:[.,]\d+)?)\s*(?:miliar|milyar|m)\b/, 1_000_000_000);
  collect(/(\d+(?:[.,]\d+)?)\s*(?:juta|jt)\b/, 1_000_000);
  collect(/(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k)\b/, 1_000);
  return out;
}

/* ---------- Ekstraksi item yang mau dibeli/diambil ---------- */
function extractItem(input: string, amountRaw: string | null): string {
  let q = input;
  if (amountRaw) q = q.replace(amountRaw, " ");
  const patterns = [
    /(?:beli|membeli|ambil|mengambil|purchase|bayar|membayar|cicil|mencicil|kredit)\s+([^,.?!]{3,42})/i,
    /(?:liburan|jalan-jalan|pergi)\s+(?:ke\s+)?([^,.?!]{3,42})/i,
    /(?:invest(?:asi)?|nabung|menabung)\s+(?:di\s+|ke\s+|buat\s+)?([^,.?!]{3,42})/i,
  ];
  for (const p of patterns) {
    const m = q.match(p);
    if (m) {
      const item = m[1].replace(/\b(ya|dong|nih|deh|sih|kah|nggak|gak)\b/gi, "").replace(/\s+/g, " ").trim();
      if (item.length >= 3) return item;
    }
  }
  return "rencana ini";
}

/* ---------- Mesin pendapat keputusan finansial ---------- */
function adviceDecision(item: string, amount: number, ctx: Ctx, installment: boolean): string {
  const mi = ctx.monthlyIncome;
  if (mi <= 0)
    return `Aku belum bisa memberi pendapat soal ${item} (${formatIDR(amount)}) karena data incomemu masih kosong. Tambahkan dulu pos income (misal Salary bulan ini), lalu tanya lagi ya — biar pendapatku berdasar angka nyata, bukan tebakan.`;

  const ratio = amount / mi;
  const verdict: string[] = [];
  let level: "aman" | "syarat" | "risiko" | "tahan" = "syarat";

  if (installment) {
    const debtAvg = 0; // disederhanakan: kapasitas 30% dari income bulanan
    const capacity = Math.max(0, 0.3 * mi - debtAvg);
    if (ctx.monthlyNet <= 0) level = "tahan";
    else if (amount <= capacity * 0.5) level = "aman";
    else if (amount <= capacity) level = "syarat";
    else level = "tahan";
    verdict.push(`• Cicilan ${formatIDR(amount)}/bln = ${(ratio * 100).toFixed(0)}% dari income bulanan (${formatIDR(mi)}). Patokan sehat: total cicilan ≤ 30% income (≈ ${formatIDR(Math.round(0.3 * mi))}/bln).`);
  } else {
    verdict.push(`• Nominal ${formatIDR(amount)} = ${(ratio * 100).toFixed(0)}% dari rata-rata income bulananmu (${formatIDR(mi)}/bln).`);
    if (ctx.monthlyNet > 0)
      verdict.push(`• Cash flow bulananmu surplus ${formatIDR(ctx.monthlyNet)} — jadi secara arus kas ${amount <= ctx.monthlyNet * 3 ? "masih ketutup" : "ini setara " + Math.ceil(amount / ctx.monthlyNet) + " bulan surplus"}.`);
    else verdict.push(`• ⚠️ Cash flow bulananmu sedang defisit (${formatIDR(ctx.monthlyNet)}). Pengeluaran besar apa pun sebaiknya ditahan dulu.`);
    verdict.push(`• Dana darurat/tabungan tercatat ${formatIDR(ctx.totalSaving)} (≈ ${ctx.emergencyMonths.toFixed(1)} bulan pengeluaran). Idealnya jangan sampai sisa di bawah 3 bulan pengeluaran.`);
    if (ctx.overBudgets.length) verdict.push(`• Catatan: ada budget yang over bulan ini (${ctx.overBudgets.join(", ")}), jadi ruang gerakmu lebih sempit.`);
  }

  if (ctx.monthlyNet <= 0 && !installment) level = "tahan";
  else if (!installment) {
    if (ratio <= 0.15) level = "aman";
    else if (ratio <= 0.35) level = "syarat";
    else if (ratio <= 0.7) level = "risiko";
    else level = "tahan";
  }

  const head =
    level === "aman"
      ? `💡 Pendapatku: GAS — ${item} (${formatIDR(amount)}) TERJANGKAU buat kondisi keuanganmu saat ini. ✅`
      : level === "syarat"
        ? `💡 Pendapatku: BOLEH — tapi dengan syarat. ${item} (${formatIDR(amount)}) masih masuk akal, asal aturannya dipatuhi. ✅⚠️`
        : level === "risiko"
          ? `💡 Pendapatku sejujurnya: PIKIR ULANG dulu. ${item} (${formatIDR(amount)}) cukup berat untuk kondisi saat ini. ⚠️`
          : `💡 Pendapatku sejujurnya: TAHAN DULU. ${item} (${formatIDR(amount)}) belum aman untuk kondisi saat ini. ⛔`;

  const after = !installment && (level === "risiko" || level === "tahan") && ctx.monthlyNet > 0
    ? `\n\n🔁 Alternatif yang lebih ringan:\n• Nabung ${formatIDR(Math.round(Math.max(ctx.monthlyNet * 0.5, 1)))} /bln (50% surplus) → terkumpul dalam ±${Math.ceil(amount / Math.max(ctx.monthlyNet * 0.5, 1))} bulan.\n• Cari opsi second / turun spek 30–40% lebih murah.\n• Kalau mendesak, bagi jadi cicilan dengan tenor pendek — tanya aku "cicilan X per bulan aman nggak?" dan aku hitungkan.`
    : `\n\n🔁 Biar makin aman:\n• Bayar pakai metode tercatat (QRIS/Transfer) supaya otomatis masuk tracker.\n• Sisihkan dulu pos Saving/Invest bulan ini sebelum checkout.\n• Tunggu 3x24 jam (aturan jeda) — kalau masih kepingin, berarti memang butuh.`;

  const next =
    level === "tahan" || level === "risiko"
      ? `\n\n👉 Rekomendasiku: tunda ${item} sampai savings rate-mu ≥ 20% dan tidak ada budget over. Mau aku bantu susun skema nabungnya per bulan?`
      : `\n\n👉 Rekomendasiku: lanjut, tapi catat sebagai expense di kategorinya begitu dibayar. Mau aku bantu cek dampaknya ke budget kategori terkait?`;

  return `${head}\n\n📊 Alasanku (dari datamu):\n${verdict.join("\n")}${after}${next}\n\n_Ini pendapat berbasis datamu, bukan nasihat keuangan profesional ya._`;
}

function readinessAdvice(ctx: Ctx): string {
  let score = 0;
  const rows: string[] = [];
  if (ctx.rate >= 20) { score += 30; rows.push("• Savings rate ≥ 20% (+30) — fondasi kuat."); }
  else { rows.push(`• Savings rate ${ctx.rate.toFixed(1)}% (+0) — idealnya ≥ 20% dulu.`); }
  if (ctx.monthlyNet > 0) { score += 25; rows.push(`• Cash flow bulanan surplus ${formatIDR(ctx.monthlyNet)} (+25).`); }
  else rows.push(`• Cash flow bulanan defisit (${formatIDR(ctx.monthlyNet)}) (+0) — bereskan ini dulu.`);
  if (ctx.emergencyMonths >= 3) { score += 25; rows.push(`• Dana darurat ≈ ${ctx.emergencyMonths.toFixed(1)} bulan pengeluaran (+25).`); }
  else rows.push(`• Dana darurat ≈ ${ctx.emergencyMonths.toFixed(1)} bulan (+0) — target minimal 3 bulan.`);
  if (ctx.overBudgets.length === 0) { score += 20; rows.push("• Tidak ada budget over (+20)."); }
  else rows.push(`• Budget over di: ${ctx.overBudgets.join(", ")} (+0).`);

  const verdict =
    score >= 75 ? "✅ SIAP — silakan ambil keputusan besar dengan percaya diri, tetap catat di tracker."
      : score >= 50 ? "⚠️ SIAP BERSYARAT — boleh jalan, tapi amankan dulu poin yang masih 0 di atas."
        : "⛔ BELUM SIAP — fokus 1–2 bulan ke depan untuk memperbaiki poin di atas sebelum komitmen besar.";
  return `🎯 Skor kesiapan finansialmu: ${score}/100\n\n${rows.join("\n")}\n\n${verdict}\n\nCoba diskusikan rencana spesifiknya, misal "mau beli laptop 8 juta, gimana menurutmu?" — aku beri pendapat lengkap dengan angkanya.`;
}

function compareAdvice(amounts: number[], ctx: Ctx, input: string): string {
  const [a, b] = [...amounts].sort((x, y) => x - y);
  const diff = b - a;
  const cheaper = `Opsi hemat ${formatIDR(a)}` + (ctx.monthlyIncome > 0 ? ` (${((a / ctx.monthlyIncome) * 100).toFixed(0)}% income bulanan)` : "");
  const pricey = `Opsi mahal ${formatIDR(b)}` + (ctx.monthlyIncome > 0 ? ` (${((b / ctx.monthlyIncome) * 100).toFixed(0)}% income bulanan)` : "");
  const pick =
    ctx.monthlyNet <= 0 || (ctx.monthlyIncome > 0 && b / ctx.monthlyIncome > 0.5)
      ? "Pendapatku: pilih yang hemat. Selisihnya lumayan dan cash flow-mu tidak longgar untuk opsi mahal."
      : "Pendapatku: kalau beda kualitasnya sepadan dan opsi mahal masih di bawah 35% income bulanan, boleh ambil yang mahal — kalau tidak, hemat saja, selisihnya masukkan ke Saving.";
  return `⚖️ Perbandinganmu ("${input.trim()}"):\n• ${cheaper}\n• ${pricey}\n• Selisih: ${formatIDR(diff)}\n\n${pick}\n\nMau aku bedah salah satunya lebih dalam? Sebutkan nominalnya, misal "yang ${formatIDR(b)} worth it nggak?"`;
}

function botAnswer(
  input: string,
  ctx: Ctx,
  memory: DecisionMemory | null
): { reply: string; memory: DecisionMemory | null } {
  const q = input.toLowerCase();
  const keep = (m: DecisionMemory | null) => ({ reply: "", memory: m });

  if (/terima kasih|makasih|thanks/.test(q))
    return { reply: "Sama-sama! 💙 Senang bisa bantu. Jaga cash flow tetap positif ya!", memory };

  if (/halo|hai|pagi|siang|sore|malam|hello/.test(q) && !/beli|ambil|cicil|kredit|menurut|pendapat|mending|keputusan/.test(q))
    return {
      reply: "Halo! 💙 Aku FinBuddy — bisa jawab soal income, expenses, cash flow, saving, investment, dan yang baru: diskusi keputusan finansial. Coba misal \"mau beli HP 3 juta, gimana menurutmu?\"",
      memory,
    };

  const parsed = parseAmount(input);
  const installment = /cicil|kredit|angsur|tenor|per bulan|\/bln|\bbln\b/.test(q) && !/\bdp\b|down payment|sekaligus|cash|tunai|lunas/.test(q);
  const decisionSignal = /beli|membeli|ambil|mengambil|purchase|\bbuy\b|bayar|membayar|cicil|mencicil|kredit|ngutang|utang|\bdp\b|down payment|tenor|angsur|libur|worth|layak|pantas|pantaskah|mending|sebaiknya|bagusnya|apakah.*(boleh|bisa|aman|tepat|bijak|baik|mampu|sanggup)|gimana.*(beli|ambil|keputusan|bayar)|bagaimana.*(beli|ambil|keputusan)|menurutmu|pendapatmu|setuju|jadi (beli|ambil)|oke (nggak|gak)|borong|checkout|co\b/.test(q);
  const opinionSeeking = /gimana|bagaimana|menurut|pendapat|worth|layak|pantas|pantaskah|boleh|aman|mending|sebaiknya|setuju|oke|jadi\?|saran/.test(q);
  const amounts = parseAllAmounts(input);

  // Komparasi dua opsi
  if (/mending|atau| vs |dibanding|banding/.test(q) && amounts.length >= 2)
    return { reply: compareAdvice(amounts.slice(0, 2), ctx, input), memory };

  // Simulasi menabung: "nabung 500rb per bulan untuk X 6jt, berapa lama?"
  if (/nabung|menabung|menabung|kumpul|kumpulin/.test(q) && amounts.length >= 2 && /berapa lama|kapan|berapa bulan/.test(q)) {
    const sorted = [...amounts].sort((x, y) => x - y);
    const perMonth = sorted[0];
    const target = sorted[sorted.length - 1];
    const n = Math.ceil(target / perMonth);
    return {
      reply: `🧮 Simulasinya:\n• Target: ${formatIDR(target)}\n• Nabung: ${formatIDR(perMonth)}/bln\n• Estimasi: ±${n} bulan (${Math.floor(n / 12) > 0 ? `${Math.floor(n / 12)} tahun ` : ""}${n % 12} bulan).\n\n${perMonth > ctx.monthlyNet && ctx.monthlyNet > 0 ? `⚠️ Hati-hati: nominal nabung ini di atas surplus bulananmu (${formatIDR(ctx.monthlyNet)}). Turunkan sedikit atau pangkas expense non-esensial.` : "✅ Skema ini realistis. Otomatiskan transfernya tiap awal bulan biar konsisten."}`,
      memory,
    };
  }

  // Kesiapan keputusan besar
  if (/siap.*(keputusan|beli|ambil|invest|besar|nikah|rumah|mobil|usaha|resign)|keputusan besar|berani.*(beli|ambil)/.test(q))
    return { reply: readinessAdvice(ctx), memory };

  // Diskusi keputusan spesifik (ada nominal)
  if (parsed && (decisionSignal || installment)) {
    const item = extractItem(input, parsed.raw);
    const mem: DecisionMemory = { item, amount: parsed.value, installment };
    return { reply: adviceDecision(item, parsed.value, ctx, installment), memory: mem };
  }

  // Follow-up tanpa nominal tapi ada konteks ("gimana menurutmu?", "kalau yang 5 juta?")
  if (!parsed && opinionSeeking && memory && /menurut|pendapat|gimana|bagaimana|worth|layak|jadi|oke|setuju/.test(q)) {
    return {
      reply: `Masih soal ${memory.item} (${formatIDR(memory.amount)}) ya? Pendapat jujurku tetap seperti di atas 👆 — ${memory.amount > ctx.monthlyIncome * 0.35 && ctx.monthlyIncome > 0 ? "ini bukan pengeluaran kecil, jadi pastikan dana daruratmu tidak tersentuh." : "ini masih wajar, asal dicatat dan tidak mengganggu pos Saving bulan ini."}\n\nKalau nominalnya beda, sebutkan angkanya (misal "kalau yang 5 juta gimana?") dan aku hitung ulang. Atau ceritakan: ini kebutuhan mendesak atau keinginan? Jawabanmu mengubah pendapatku.`,
      memory,
    };
  }

  // Sinyal keputusan tapi tanpa nominal → gali info (diskusi dua arah)
  if (decisionSignal && !parsed) {
    void keep;
    return {
      reply: `Boleh banget kita diskusikan! 🤝 Biar pendapatku tepat, ceritakan:\n1. Rencananya apa? (misal beli HP, ambil cicilan motor, liburan)\n2. Berapa nominalnya? (misal 3 juta / cicilan 800rb per bulan)\n3. Kebutuhan mendesak atau keinginan?\n\nContoh: "mau beli laptop 8 juta untuk kerja, gimana menurutmu?"`,
      memory,
    };
  }

  if (/cash ?flow|arus kas|surplus|defisit|net/.test(q))
    return {
      reply: `Cash flow-mu saat ini:\n• Income: ${formatIDR(ctx.totalIn)}\n• Expense: ${formatIDR(ctx.totalOut)}\n• Net: ${formatIDR(ctx.net)} (${ctx.net >= 0 ? "surplus 🎉" : "defisit ⚠️"})\n• Savings rate: ${ctx.rate.toFixed(1)}% (ideal ≥ 20%)\n\n${ctx.net >= 0 ? "Pertahankan! Sisihkan surplus ke Saving/Invest sebelum belanja keinginan." : "Saran: pangkas 10-15% dari kategori Hobby/Entertainment/Shopping bulan ini."}`,
      memory,
    };

  if (/pengeluaran terbesar|boros|expenses? terbesar|belanja/.test(q))
    return {
      reply: `Pengeluaran terbesarmu adalah kategori ${ctx.topExpense} sebesar ${formatIDR(ctx.topExpenseAmt)}.\n\nCek tab Expenses di side-panel untuk rincian per kategori dan metode bayar (Cash/QRIS/Transfer). Kalau ${ctx.topExpense} non-esensial, coba batasi 10% lebih rendah bulan depan.`,
      memory,
    };

  if (/saving|tabung|nabung|dana darurat/.test(q))
    return {
      reply: `Total pos Saving-mu: ${formatIDR(ctx.totalSaving)} (≈ ${ctx.emergencyMonths.toFixed(1)} bulan pengeluaran).\n\nIdealnya 20% income untuk saving+invest. ${ctx.overBudgets.length ? `Perhatian budget over: ${ctx.overBudgets.join(", ")}.` : "Budget kategori aman sejauh ini."} Buka tab Saving untuk progres tiap goal.`,
      memory,
    };

  if (/invest/.test(q))
    return {
      reply: `Ringkasan investasimu:\n• Modal keluar (Invest): ${formatIDR(ctx.investOut)}\n• Return masuk (Investasi+Dividen): ${formatIDR(ctx.investIn)}\n• Net: ${formatIDR(ctx.investIn - ctx.investOut)}\n\nStrategi simpel: rutin tiap gajian, pisahkan dana darurat dulu 3-6x pengeluaran, baru kejar return. Atau diskusikan rencana spesifik, misal "mau investasi 2 juta per bulan, aman nggak?"`,
      memory,
    };

  if (/income|penghasilan|gaji|salary|bonus|dividen/.test(q))
    return {
      reply: `Total incomemu: ${formatIDR(ctx.totalIn)}.\nSumber terbesar biasanya Salary, dilengkapi Bonus/Dividen/Freelance. Tambah pos income baru lewat tombol + Income di side-panel. Diversifikasi income (misal freelance/dividen) bikin cash flow lebih aman.`,
      memory,
    };

  if (/budget|batas|limit|planner/.test(q))
    return {
      reply: ctx.overBudgets.length
        ? `Ada ${ctx.overBudgets.length} kategori over budget: ${ctx.overBudgets.join(", ")}. Yuk geser alokasinya atau naikkan limit secara realistis di halaman Planner.`
        : "Semua budget kategori masih aman. Kamu bisa atur limit tiap kategori di halaman Planner dan pantau progresnya tiap bulan.",
      memory,
    };

  if (/tips|hemat|saran|atur|kelola/.test(q))
    return {
      reply: "Tips untukmu (50/30/20):\n• 50% kebutuhan: Housing, Food, Transport, Utilities\n• 30% keinginan: Hobby, Family, Entertainment\n• 20% masa depan: Saving + Invest\n\nOtomatiskan transfer Saving/Invest di awal bulan, pakai QRIS/Transfer agar tercatat rapi, dan review cash flow tiap minggu.",
      memory,
    };

  return {
    reply: `Aku mencatat pertanyaanmu: "${input}".\n\nAku bisa bantu dua hal:\n1. Info keuanganmu: cash flow, income/expense terbesar, saving, investasi, budget.\n2. Diskusi keputusan: ceritakan rencanamu + nominalnya, misal "mau beli kamera 4,5 juta untuk freelance, worth it nggak?" — aku beri pendapat jujur berdasar datamu.`,
    memory,
  };
}

export default function FinanceChatbot() {
  const { transactions, budgets, goals } = useFinance();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Halo! 💙 Aku FinBuddy. Tanya info keuanganmu, atau ajak aku diskusi keputusan — misal \"mau beli HP 3 juta, gimana menurutmu?\" / \"cicilan 800rb per bulan aman nggak?\"" },
  ]);
  const [lastDecision, setLastDecision] = useState<DecisionMemory | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const ctx: Ctx = useMemo(() => {
    const totalIn = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalOut = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const net = totalIn - totalOut;
    const rate = totalIn > 0 ? Math.max(0, (net / totalIn) * 100) : 0;
    const byCat = new Map<string, number>();
    transactions.filter((t) => t.type === "expense").forEach((t) => byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount));
    const top = Array.from(byCat.entries()).sort((a, b) => b[1] - a[1])[0];
    const totalSaving = transactions.filter((t) => t.category === "Saving").reduce((s, t) => s + t.amount, 0)
      + goals.reduce((s, g) => s + g.saved, 0);
    const investOut = transactions.filter((t) => t.category === "Invest").reduce((s, t) => s + t.amount, 0);
    const investIn = transactions.filter((t) => t.category === "Investasi" || t.category === "Dividen").reduce((s, t) => s + t.amount, 0);
    const cur = new Date().toISOString().slice(0, 7);
    const spendByCat = new Map<string, number>();
    transactions.filter((t) => t.type === "expense" && monthKey(t.date) === cur)
      .forEach((t) => spendByCat.set(t.category, (spendByCat.get(t.category) ?? 0) + t.amount));
    const overBudgets = budgets.filter((b) => b.limit > 0 && (spendByCat.get(b.category) ?? 0) > b.limit).map((b) => b.category);
    const monthCount = Math.max(1, new Set(transactions.map((t) => monthKey(t.date))).size);
    const monthlyIncome = Math.round(totalIn / monthCount);
    const monthlyOut = Math.round(totalOut / monthCount);
    const monthlyNet = monthlyIncome - monthlyOut;
    const emergencyMonths = monthlyOut > 0 ? totalSaving / monthlyOut : 0;
    return {
      totalIn, totalOut, net, rate,
      topExpense: top?.[0] ?? "-", topExpenseAmt: top?.[1] ?? 0,
      totalSaving, investOut, investIn, overBudgets,
      monthlyIncome, monthlyNet, monthlyOut, emergencyMonths,
    };
  }, [transactions, budgets, goals]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const send = (raw?: string) => {
    const v = (raw ?? text).trim();
    if (!v) return;
    const { reply, memory } = botAnswer(v, ctx, lastDecision);
    setLastDecision(memory);
    setMsgs((p) => [...p, { role: "user", text: v }, { role: "bot", text: reply }]);
    setText("");
  };

  if (path === "/login") return null;

  return (
    <>
      {open && (
        <div className="chat-window">
          <div className="chat-head">
            <b>💬 FinBuddy — Diskusi Finansial</b>
            <p>Info keuangan • pendapat keputusan • simulasi nabung/cicil</p>
          </div>
          <div className="chat-body" ref={bodyRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`msg ${m.role === "bot" ? "bot" : "user"}`}>{m.text}</div>
            ))}
          </div>
          <div className="chat-chips">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)}>{s}</button>
            ))}
          </div>
          <div className="chat-input">
            <input
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder='Coba: "mau beli laptop 8jt, worth it?"'
            />
            <button className="btn primary" onClick={() => send()}>Kirim</button>
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Buka chatbot">
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
