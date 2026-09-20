"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useFinance } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { formatIDR, monthKey } from "@/lib/utils";

interface Msg { role: "bot" | "user"; text: string; }

interface Ctx {
  totalIn: number; totalOut: number; net: number; rate: number;
  totalExpense: number; totalSaveTx: number; totalInvTx: number;
  topExpense: string; topExpenseAmt: number;
  totalSaving: number; investOut: number; investIn: number;
  overBudgets: string[];
  monthlyIncome: number; monthlyNet: number; monthlyOut: number;
  emergencyMonths: number;
}

interface DecisionMemory { item: string; amount: number; installment: boolean; }

/* ---------- Template jawaban (kunci terjemahan) ---------- */

const T = {
  greet:
    "Halo! 💙 Aku FinBuddy — bisa jawab soal income, expenses, cash flow, saving, investment, dan diskusi keputusan finansial. Coba misal \"mau beli HP 3 juta, gimana menurutmu?\"",
  emptyData:
    "Aku belum bisa memberi pendapat soal {item} ({amount}) karena data incomemu masih kosong. Tambahkan dulu pos income (misal Salary bulan ini), lalu tanya lagi ya — biar pendapatku berdasar angka nyata.",
  headGo: "💡 Pendapatku: GAS — {item} ({amount}) TERJANGKAU buat kondisi keuanganmu saat ini. ✅",
  headOk: "💡 Pendapatku: BOLEH — tapi dengan syarat. {item} ({amount}) masih masuk akal, asal aturannya dipatuhi. ✅⚠️",
  headThink: "💡 Pendapatku sejujurnya: PIKIR ULANG dulu. {item} ({amount}) cukup berat untuk kondisi saat ini. ⚠️",
  headHold: "💡 Pendapatku sejujurnya: TAHAN DULU. {item} ({amount}) belum aman untuk kondisi saat ini. ⛔",
  reasonsTitle: "📊 Alasanku (dari datamu):",
  rInstallment:
    "• Cicilan {amount}/bln = {percent}% dari income bulanan ({income}). Patokan sehat: total cicilan ≤ 30% income (≈ {cap}/bln).",
  rAmount: "• Nominal {amount} = {percent}% dari rata-rata income bulananmu ({income}/bln).",
  rSurplus: "• Cash flow bulananmu surplus {net} — jadi secara arus kas {note}.",
  rSurplusCovered: "masih ketutup",
  rSurplusEqual: "ini setara {months} bulan surplus",
  rDeficit: "• ⚠️ Cash flow bulananmu sedang defisit ({net}). Pengeluaran besar apa pun sebaiknya ditahan dulu.",
  rEmergency:
    "• Dana darurat/tabungan tercatat {saving} (≈ {months} bulan pengeluaran). Idealnya jangan sampai sisa di bawah 3 bulan pengeluaran.",
  rOverBudget: "• Catatan: ada budget yang over bulan ini ({list}), jadi ruang gerakmu lebih sempit.",
  altLighter:
    "\n\n🔁 Alternatif yang lebih ringan:\n• Nabung {perMonth}/bln (50% surplus) → terkumpul dalam ±{months} bulan.\n• Cari opsi second / turun spek 30–40% lebih murah.\n• Kalau mendesak, bagi jadi cicilan dengan tenor pendek — tanya aku \"cicilan X per bulan aman nggak?\".",
  altSafer:
    "\n\n🔁 Biar makin aman:\n• Bayar pakai metode tercatat (QRIS/Transfer) supaya otomatis masuk tracker.\n• Sisihkan dulu pos Saving/Invest bulan ini sebelum checkout.\n• Tunggu 3x24 jam (aturan jeda) — kalau masih kepingin, berarti memang butuh.",
  nextDelay:
    "\n\n👉 Rekomendasiku: tunda {item} sampai savings rate-mu ≥ 20% dan tidak ada budget over. Mau aku bantu susun skema nabungnya per bulan?",
  nextGo:
    "\n\n👉 Rekomendasiku: lanjut, tapi catat sebagai expense di kategorinya begitu dibayar. Mau aku bantu cek dampaknya ke budget kategori terkait?",
  disclaimer: "\n\n_Ini pendapat berbasis datamu, bukan nasihat keuangan profesional ya._",
  readyScore:
    "🎯 Skor kesiapan finansialmu: {score}/100\n\n{rows}\n\n{verdict}\n\nCoba diskusikan rencana spesifiknya, misal \"mau beli laptop 8 juta, gimana menurutmu?\" — aku beri pendapat lengkap dengan angkanya.",
  readyHigh: "✅ SIAP — silakan ambil keputusan besar dengan percaya diri, tetap catat di tracker.",
  readyMid: "⚠️ SIAP BERSYARAT — boleh jalan, tapi amankan dulu poin yang masih 0 di atas.",
  readyLow: "⛔ BELUM SIAP — fokus 1–2 bulan ke depan untuk memperbaiki poin di atas sebelum komitmen besar.",
  readyRowRateOk: "• Savings rate ≥ 20% (+30) — fondasi kuat.",
  readyRowRateBad: "• Savings rate {rate}% (+0) — idealnya ≥ 20% dulu.",
  readyRowFlowOk: "• Cash flow bulanan surplus {net} (+25).",
  readyRowFlowBad: "• Cash flow bulanan defisit ({net}) (+0) — bereskan ini dulu.",
  readyRowEmOk: "• Dana darurat ≈ {months} bulan pengeluaran (+25).",
  readyRowEmBad: "• Dana darurat ≈ {months} bulan (+0) — target minimal 3 bulan.",
  readyRowBudOk: "• Tidak ada budget over (+20).",
  readyRowBudBad: "• Budget over di: {list} (+0).",
  compare:
    "⚖️ Perbandinganmu (\"{input}\"):\n• Opsi hemat {cheap}\n• Opsi mahal {pricey}\n• Selisih: {diff}\n\n{pick}\n\nMau aku bedah salah satunya lebih dalam? Sebutkan nominalnya.",
  compareShare: " ({percent}% income bulanan)",
  comparePickCheap: "Pendapatku: pilih yang hemat. Selisihnya lumayan dan cash flow-mu tidak longgar untuk opsi mahal.",
  comparePickFlexible:
    "Pendapatku: kalau beda kualitasnya sepadan dan opsi mahal masih di bawah 35% income bulanan, boleh ambil yang mahal — kalau tidak, hemat saja, selisihnya masukkan ke Saving.",
  sim:
    "🧮 Simulasinya:\n• Target: {target}\n• Nabung: {perMonth}/bln\n• Estimasi: ±{months} bulan ({years}).\n\n{warning}",
  simYears: "{y} tahun {rest} bulan",
  simWarn: "⚠️ Hati-hati: nominal nabung ini di atas surplus bulananmu ({net}). Turunkan sedikit atau pangkas expense non-esensial.",
  simOk: "✅ Skema ini realistis. Otomatiskan transfernya tiap awal bulan biar konsisten.",
  followUp:
    "Masih soal {item} ({amount}) ya? Pendapat jujurku tetap seperti di atas 👆 — {note}\n\nKalau nominalnya beda, sebutkan angkanya (misal \"kalau yang 5 juta gimana?\") dan aku hitung ulang.",
  followUpBig: "ini bukan pengeluaran kecil, jadi pastikan dana daruratmu tidak tersentuh.",
  followUpSmall: "ini masih wajar, asal dicatat dan tidak mengganggu pos Saving bulan ini.",
  askDetail:
    "Boleh banget kita diskusikan! 🤝 Biar pendapatku tepat, ceritakan:\n1. Rencananya apa? (misal beli HP, ambil cicilan motor, liburan)\n2. Berapa nominalnya? (misal 3 juta / cicilan 800rb per bulan)\n3. Kebutuhan mendesak atau keinginan?\n\nContoh: \"mau beli laptop 8 juta untuk kerja, gimana menurutmu?\"",
  cf:
    "Cash flow-mu saat ini:\n• Income: {income}\n• Expense: {expense}\n• Saving: {saving}\n• Investment: {investment}\n• Sisa: {net} ({status})\n• Masa depan: {rate}% (ideal ≥ 20%)\n\n{advice}",
  cfSurplus: "surplus 🎉",
  cfDeficit: "defisit ⚠️",
  cfAdviceGood: "Pertahankan! Sisihkan surplus ke Saving/Invest sebelum belanja keinginan.",
  cfAdviceBad: "Saran: pangkas 10-15% dari kategori Hobby/Entertainment/Shopping bulan ini.",
  top:
    "Pengeluaran terbesarmu adalah kategori {category} sebesar {amount}.\n\nCek tab Expenses di side-panel untuk rincian per kategori dan metode bayar (Cash/QRIS/Transfer). Kalau {category} non-esensial, coba batasi 10% lebih rendah bulan depan.",
  savingInfo:
    "Total pos Saving-mu: {saving} (≈ {months} bulan pengeluaran).\n\nIdealnya 20% income untuk saving+invest. {budgetNote} Buka tab Saving untuk progres tiap goal.",
  savingBudgetOver: "Perhatian budget over: {list}.",
  savingBudgetOk: "Budget kategori aman sejauh ini.",
  investInfo:
    "Ringkasan investasimu:\n• Total ditanam (Investment): {out}\n• Dividen masuk (Dividend): {in}\n• Net: {net}\n\nStrategi simpel: rutin tiap gajian, pisahkan dana darurat dulu 3-6x pengeluaran, baru kejar return. Atau diskusikan rencana spesifik, misal \"mau investasi 2 juta per bulan, aman nggak?\"",
  incomeInfo:
    "Total income-mu: {income}.\nSumber terbesar biasanya Salary, dilengkapi Bonus/Dividen/Freelance. Tambah pos income baru lewat tombol + Income di side-panel. Diversifikasi income bikin cash flow lebih aman.",
  budgetInfoOver:
    "Ada {count} kategori over budget: {list}. Yuk geser alokasinya atau naikkan limit secara realistis di halaman Planner.",
  budgetInfoOk:
    "Semua budget kategori masih aman. Kamu bisa atur limit tiap kategori di halaman Planner dan pantau progresnya tiap bulan.",
  tips:
    "Tips untukmu (50/30/20):\n• 50% kebutuhan: Housing, Food, Transport, Utilities\n• 30% keinginan: Hobby, Family, Entertainment\n• 20% masa depan: Saving + Invest\n\nOtomatiskan transfer Saving/Invest di awal bulan, pakai QRIS/Transfer agar tercatat rapi, dan review cash flow tiap minggu.",
  thanks: "Sama-sama! 💙 Senang bisa bantu. Jaga cash flow tetap positif ya!",
  fallback:
    "Aku mencatat pertanyaanmu: \"{input}\".\n\nAku bisa bantu dua hal:\n1. Info keuanganmu: cash flow, income/expense terbesar, saving, investasi, budget.\n2. Diskusi keputusan: ceritakan rencanamu + nominalnya, misal \"mau beli kamera 4,5 juta, worth it nggak?\" — aku beri pendapat jujur berdasar datamu.",
  chip1: "Mau beli HP 3 juta, gimana menurutmu?",
  chip2: "Cicilan 800 rb/bln aman nggak?",
  chip3: "Siap ambil keputusan besar?",
  chip4: "Berapa cash flow saya?",
  chip5: "Tips nabung untukku?",
  header: "💬 FinBuddy — Diskusi Finansial",
  headerSub: "Info keuangan • pendapat keputusan • simulasi nabung/cicil",
  placeholder: "Coba: \"mau beli laptop 8jt, worth it?\"",
  openChat: "Buka chatbot",
};

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

  const r =
    tryUnit(new RegExp(num + "\\s*(miliar|milyar|m)\\b", ""), 1_000_000_000) ??
    tryUnit(new RegExp(num + "\\s*(juta|jt)\\b", ""), 1_000_000) ??
    tryUnit(new RegExp(num + "\\s*(ribu|rb|k)\\b", ""), 1_000);
  if (r) return r;

  const full = q.match(/rp\s?(\d{1,3}(?:[.\s]\d{3})+(?:,\d+)?)/) ?? q.match(/(\d{1,3}(?:[.\s]\d{3})+(?:,\d+)?)/);
  if (full) {
    const v = parseFloat(full[1].replace(/[.\s]/g, "").replace(",", "."));
    if (!isNaN(v) && v >= 1000) return { value: Math.round(v), raw: full[0] };
  }

  const plain = q.match(/(?:rp|rupiah)\s?(\d+(?:[.,]\d+)?)/);
  if (plain) {
    const v = parseFloat(plain[1].replace(",", "."));
    if (!isNaN(v) && v > 0) return { value: Math.round(v), raw: plain[0] };
  }
  return null;
}

function parseAllAmounts(text: string): number[] {
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

function extractItem(input: string, amountRaw: string | null): string {
  let q = input;
  if (amountRaw) q = q.replace(amountRaw, " ");
  const patterns = [
    /(?:beli|membeli|ambil|mengambil|purchase|buy|bayar|membayar|cicil|mencicil|kredit)\s+([^,.?!]{3,42})/i,
    /(?:liburan|jalan-jalan|pergi|holiday|trip)\s+(?:ke\s+|to\s+)?([^,.?!]{3,42})/i,
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

type TFunc = (text: string, vars?: Record<string, string | number>) => string;

/* ---------- Mesin pendapat keputusan finansial ---------- */
function adviceDecision(item: string, amount: number, ctx: Ctx, installment: boolean, t: TFunc): string {
  const mi = ctx.monthlyIncome;
  if (mi <= 0) return t(T.emptyData, { item, amount: formatIDR(amount) });

  const ratio = amount / mi;
  const reasons: string[] = [];
  let level: "aman" | "syarat" | "risiko" | "tahan" = "syarat";

  if (installment) {
    const capacity = Math.max(0, 0.3 * mi);
    if (ctx.monthlyNet <= 0) level = "tahan";
    else if (amount <= capacity * 0.5) level = "aman";
    else if (amount <= capacity) level = "syarat";
    else level = "tahan";
    reasons.push(
      t(T.rInstallment, {
        amount: formatIDR(amount),
        percent: (ratio * 100).toFixed(0),
        income: formatIDR(mi),
        cap: formatIDR(Math.round(capacity)),
      })
    );
  } else {
    reasons.push(t(T.rAmount, { amount: formatIDR(amount), percent: (ratio * 100).toFixed(0), income: formatIDR(mi) }));
    if (ctx.monthlyNet > 0) {
      reasons.push(
        t(T.rSurplus, {
          net: formatIDR(ctx.monthlyNet),
          note:
            amount <= ctx.monthlyNet * 3
              ? t(T.rSurplusCovered)
              : t(T.rSurplusEqual, { months: Math.ceil(amount / ctx.monthlyNet) }),
        })
      );
    } else {
      reasons.push(t(T.rDeficit, { net: formatIDR(ctx.monthlyNet) }));
    }
    reasons.push(t(T.rEmergency, { saving: formatIDR(ctx.totalSaving), months: ctx.emergencyMonths.toFixed(1) }));
    if (ctx.overBudgets.length) reasons.push(t(T.rOverBudget, { list: ctx.overBudgets.join(", ") }));
  }

  if (ctx.monthlyNet <= 0 && !installment) level = "tahan";
  else if (!installment) {
    if (ratio <= 0.15) level = "aman";
    else if (ratio <= 0.35) level = "syarat";
    else if (ratio <= 0.7) level = "risiko";
    else level = "tahan";
  }

  const head =
    level === "aman" ? t(T.headGo, { item, amount: formatIDR(amount) })
      : level === "syarat" ? t(T.headOk, { item, amount: formatIDR(amount) })
        : level === "risiko" ? t(T.headThink, { item, amount: formatIDR(amount) })
          : t(T.headHold, { item, amount: formatIDR(amount) });

  const after = !installment && (level === "risiko" || level === "tahan") && ctx.monthlyNet > 0
    ? t(T.altLighter, {
        perMonth: formatIDR(Math.round(Math.max(ctx.monthlyNet * 0.5, 1))),
        months: Math.ceil(amount / Math.max(ctx.monthlyNet * 0.5, 1)),
      })
    : t(T.altSafer);

  const next = level === "tahan" || level === "risiko"
    ? t(T.nextDelay, { item })
    : t(T.nextGo);

  return `${head}\n\n${t(T.reasonsTitle)}\n${reasons.join("\n")}${after}${next}${t(T.disclaimer)}`;
}

function readinessAdvice(ctx: Ctx, t: TFunc): string {
  let score = 0;
  const rows: string[] = [];
  if (ctx.rate >= 20) { score += 30; rows.push(t(T.readyRowRateOk)); }
  else rows.push(t(T.readyRowRateBad, { rate: ctx.rate.toFixed(1) }));
  if (ctx.monthlyNet > 0) { score += 25; rows.push(t(T.readyRowFlowOk, { net: formatIDR(ctx.monthlyNet) })); }
  else rows.push(t(T.readyRowFlowBad, { net: formatIDR(ctx.monthlyNet) }));
  if (ctx.emergencyMonths >= 3) { score += 25; rows.push(t(T.readyRowEmOk, { months: ctx.emergencyMonths.toFixed(1) })); }
  else rows.push(t(T.readyRowEmBad, { months: ctx.emergencyMonths.toFixed(1) }));
  if (ctx.overBudgets.length === 0) { score += 20; rows.push(t(T.readyRowBudOk)); }
  else rows.push(t(T.readyRowBudBad, { list: ctx.overBudgets.join(", ") }));

  const verdict = score >= 75 ? t(T.readyHigh) : score >= 50 ? t(T.readyMid) : t(T.readyLow);
  return t(T.readyScore, { score, rows: rows.join("\n"), verdict });
}

function compareAdvice(amounts: number[], ctx: Ctx, input: string, t: TFunc): string {
  const [a, b] = [...amounts].sort((x, y) => x - y);
  const pct = (v: number) => (ctx.monthlyIncome > 0 ? t(T.compareShare, { percent: ((v / ctx.monthlyIncome) * 100).toFixed(0) }) : "");
  const pick =
    ctx.monthlyNet <= 0 || (ctx.monthlyIncome > 0 && b / ctx.monthlyIncome > 0.5)
      ? t(T.comparePickCheap)
      : t(T.comparePickFlexible);
  return t(T.compare, {
    input: input.trim(),
    cheap: `${formatIDR(a)}${pct(a)}`,
    pricey: `${formatIDR(b)}${pct(b)}`,
    diff: formatIDR(b - a),
    pick,
  });
}

function botAnswer(
  input: string,
  ctx: Ctx,
  memory: DecisionMemory | null,
  t: TFunc
): { reply: string; memory: DecisionMemory | null } {
  const q = input.toLowerCase();

  if (/terima kasih|makasih|thanks|thank you/.test(q))
    return { reply: t(T.thanks), memory };

  if (/^(halo|hai|hi|hello|hey|pagi|siang|sore|malam)\b/.test(q) && !/beli|ambil|cicil|kredit|menurut|pendapat|mending|keputusan|buy/.test(q))
    return { reply: t(T.greet), memory };

  const parsed = parseAmount(input);
  const installment = /cicil|kredit|angsur|tenor|per bulan|\/bln|\bbln\b|installment|\/month/.test(q) && !/\bdp\b|down payment|sekaligus|cash|tunai|lunas/.test(q);
  const decisionSignal = /beli|membeli|ambil|mengambil|purchase|\bbuy\b|bayar|membayar|cicil|mencicil|kredit|ngutang|utang|\bdp\b|tenor|angsur|libur|nabung|menabung|tabung|darurat|invest|deposit|emas|gold|saham|stock|obligasi|bond|reksa|worth|layak|pantas|mending|sebaiknya|menurutmu|pendapatmu|setuju|checkout|afford|should i/.test(q);
  const opinionSeeking = /gimana|bagaimana|menurut|pendapat|worth|layak|pantas|boleh|aman|mending|sebaiknya|setuju|oke|saran|what do you think|should i/.test(q);
  const amounts = parseAllAmounts(input);

  if (/mending|atau| vs |dibanding|banding| or /.test(q) && amounts.length >= 2)
    return { reply: compareAdvice(amounts.slice(0, 2), ctx, input, t), memory };

  if (/nabung|menabung|kumpul|kumpulin|save up/.test(q) && amounts.length >= 2 && /berapa lama|kapan|berapa bulan|how long|how many months/.test(q)) {
    const sorted = [...amounts].sort((x, y) => x - y);
    const perMonth = sorted[0];
    const target = sorted[sorted.length - 1];
    const n = Math.ceil(target / perMonth);
    const years = Math.floor(n / 12) > 0 ? t(T.simYears, { y: Math.floor(n / 12), rest: n % 12 }) : `${n % 12} bulan`;
    const warning =
      perMonth > ctx.monthlyNet && ctx.monthlyNet > 0
        ? t(T.simWarn, { net: formatIDR(ctx.monthlyNet) })
        : t(T.simOk);
    return { reply: t(T.sim, { target: formatIDR(target), perMonth: formatIDR(perMonth), months: n, years, warning }), memory };
  }

  if (/siap.*(keputusan|beli|ambil|invest|besar|rumah|mobil|usaha)|keputusan besar|berani.*(beli|ambil)|ready.*(decision|buy)/.test(q))
    return { reply: readinessAdvice(ctx, t), memory };

  if (parsed && (decisionSignal || installment)) {
    const item = extractItem(input, parsed.raw);
    const mem: DecisionMemory = { item, amount: parsed.value, installment };
    return { reply: adviceDecision(item, parsed.value, ctx, installment, t), memory: mem };
  }

  if (!parsed && opinionSeeking && memory && /menurut|pendapat|gimana|bagaimana|worth|layak|jadi|oke|setuju|think|should/.test(q)) {
    return {
      reply: t(T.followUp, {
        item: memory.item,
        amount: formatIDR(memory.amount),
        note:
          memory.amount > ctx.monthlyIncome * 0.35 && ctx.monthlyIncome > 0
            ? t(T.followUpBig)
            : t(T.followUpSmall),
      }),
      memory,
    };
  }

  if (decisionSignal && !parsed)
    return { reply: t(T.askDetail), memory };

  if (/cash ?flow|arus kas|surplus|defisit|net/.test(q))
    return {
      reply: t(T.cf, {
        income: formatIDR(ctx.totalIn),
        expense: formatIDR(ctx.totalExpense),
        saving: formatIDR(ctx.totalSaveTx),
        investment: formatIDR(ctx.totalInvTx),
        net: formatIDR(ctx.net),
        status: ctx.net >= 0 ? t(T.cfSurplus) : t(T.cfDeficit),
        rate: ctx.rate.toFixed(1),
        advice: ctx.net >= 0 ? t(T.cfAdviceGood) : t(T.cfAdviceBad),
      }),
      memory,
    };

  if (/pengeluaran terbesar|boros|expenses? terbesar|belanja|biggest expense/.test(q))
    return { reply: t(T.top, { category: t(ctx.topExpense), amount: formatIDR(ctx.topExpenseAmt) }), memory };

  if (/saving|tabung|nabung|dana darurat|emergency fund/.test(q))
    return {
      reply: t(T.savingInfo, {
        saving: formatIDR(ctx.totalSaving),
        months: ctx.emergencyMonths.toFixed(1),
        budgetNote: ctx.overBudgets.length
          ? t(T.savingBudgetOver, { list: ctx.overBudgets.join(", ") })
          : t(T.savingBudgetOk),
      }),
      memory,
    };

  if (/invest/.test(q))
    return {
      reply: t(T.investInfo, {
        out: formatIDR(ctx.investOut),
        in: formatIDR(ctx.investIn),
        net: formatIDR(ctx.investIn - ctx.investOut),
      }),
      memory,
    };

  if (/income|penghasilan|gaji|salary|bonus|dividen/.test(q))
    return { reply: t(T.incomeInfo, { income: formatIDR(ctx.totalIn) }), memory };

  if (/budget|batas|limit|planner/.test(q))
    return {
      reply: ctx.overBudgets.length
        ? t(T.budgetInfoOver, { count: ctx.overBudgets.length, list: ctx.overBudgets.join(", ") })
        : t(T.budgetInfoOk),
      memory,
    };

  if (/tips|hemat|saran|atur|kelola/.test(q))
    return { reply: t(T.tips), memory };

  return { reply: t(T.fallback, { input }), memory };
}

export default function FinanceChatbot() {
  const { transactions, budgets, goals } = useFinance();
  const { t } = useLang();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [lastDecision, setLastDecision] = useState<DecisionMemory | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const suggestions = [T.chip1, T.chip2, T.chip3, T.chip4, T.chip5].map((k) => t(k));

  const ctx: Ctx = useMemo(() => {
    const totalIn = transactions.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
    const totalExpense = transactions.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
    const totalSaveTx = transactions.filter((x) => x.type === "saving").reduce((s, x) => s + x.amount, 0);
    const totalInvTx = transactions.filter((x) => x.type === "investment").reduce((s, x) => s + x.amount, 0);
    const totalOut = totalExpense + totalSaveTx + totalInvTx;
    const net = totalIn - totalOut; // sisa
    const rate = totalIn > 0 ? Math.max(0, (net / totalIn) * 100) : 0;
    const byCat = new Map<string, number>();
    transactions.filter((x) => x.type === "expense").forEach((x) => byCat.set(x.category, (byCat.get(x.category) ?? 0) + x.amount));
    const top = Array.from(byCat.entries()).sort((a, b) => b[1] - a[1])[0];
    const totalSaving = transactions.filter((x) => x.type === "saving").reduce((s, x) => s + x.amount, 0)
      + goals.reduce((s, g) => s + g.saved, 0);
    const investOut = transactions.filter((x) => x.type === "investment").reduce((s, x) => s + x.amount, 0);
    const investIn = transactions.filter((x) => x.type === "income" && x.category === "Dividend").reduce((s, x) => s + x.amount, 0);
    const cur = new Date().toISOString().slice(0, 7);
    const spendByCat = new Map<string, number>();
    transactions.filter((x) => x.type === "expense" && monthKey(x.date) === cur)
      .forEach((x) => spendByCat.set(x.category, (spendByCat.get(x.category) ?? 0) + x.amount));
    const overBudgets = budgets.filter((b) => b.limit > 0 && (spendByCat.get(b.category) ?? 0) > b.limit).map((b) => b.category);
    const monthCount = Math.max(1, new Set(transactions.map((x) => monthKey(x.date))).size);
    const monthlyIncome = Math.round(totalIn / monthCount);
    const monthlyOut = Math.round(totalOut / monthCount);
    const monthlyNet = monthlyIncome - monthlyOut;
    const monthlyExpense = Math.round(totalExpense / monthCount);
    const emergencyMonths = monthlyExpense > 0 ? totalSaving / monthlyExpense : 0;
    return {
      totalIn, totalOut, net, rate,
      totalExpense, totalSaveTx, totalInvTx,
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
    const { reply, memory } = botAnswer(v, ctx, lastDecision, t);
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
            <b>{t(T.header)}</b>
            <p>{t(T.headerSub)}</p>
          </div>
          <div className="chat-body" ref={bodyRef}>
            {msgs.length === 0 && <div className="msg bot">{t(T.greet)}</div>}
            {msgs.map((m, i) => (
              <div key={i} className={`msg ${m.role === "bot" ? "bot" : "user"}`}>{m.text}</div>
            ))}
          </div>
          <div className="chat-chips">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)}>{s}</button>
            ))}
          </div>
          <div className="chat-input">
            <input
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder={t(T.placeholder)}
            />
            <button className="btn primary" onClick={() => send()}>{t("Kirim")}</button>
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label={t(T.openChat)}>
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
