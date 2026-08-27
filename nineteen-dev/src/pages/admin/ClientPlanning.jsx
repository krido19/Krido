import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../supabaseClient";
import {
  Plus, Trash2, ChevronDown, ChevronRight,
  Brain, Layers, Shield, FolderGit2, Database,
  Palette, Rocket, ClipboardList, CheckCircle2,
  Users, Calendar, Save, X, Loader2, StickyNote,
  ChevronDown as ExpandIcon, Sparkles, Copy, Check,
  HelpCircle, DollarSign, FileText, BookmarkPlus
} from "lucide-react";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Panggil Gemini langsung dari browser (admin-only, aman)
async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
      })
    }
  );
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── Static data ──────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "clarity",
    label: "🧠 Clarity Dulu",
    icon: Brain,
    color: "violet",
    items: [
      "Problem statement sudah jelas (user pain, bukan fitur)",
      "Target user sudah diidentifikasi",
      "Scope MVP sudah ditentukan (apa yang TIDAK dibangun)",
      "Success metric sudah disepakati",
    ],
  },
  {
    id: "architecture",
    label: "🏗️ Arsitektur & Stack",
    icon: Layers,
    color: "blue",
    items: [
      "Frontend: SPA / SSR / Static sudah dipilih",
      "Backend: REST / GraphQL / RPC / BaaS",
      "Database: Relational / NoSQL / BaaS (Supabase)",
      "Auth: Email-pass / OAuth / Magic link",
      "Hosting: Edge / Server / Serverless",
      "Infra: Docker / CI-CD dari awal?",
    ],
  },
  {
    id: "security",
    label: "🔐 Security",
    icon: Shield,
    color: "red",
    items: [
      "Auth & session management direncanakan",
      "RLS / row-level access di DB",
      "Input sanitization & validation",
      "HTTPS & env vars (tidak hardcode secret)",
      "Rate limiting dipertimbangkan",
    ],
  },
  {
    id: "project-setup",
    label: "📁 Project Setup",
    icon: FolderGit2,
    color: "orange",
    items: [
      "Repo (Git) + branching strategy (main/dev/feat)",
      ".env.example terdokumentasi",
      "Linter + formatter terpasang (ESLint, Prettier)",
      "README minimal: cara run local",
      ".gitignore bersih",
    ],
  },
  {
    id: "database",
    label: "🗄️ Data & Database",
    icon: Database,
    color: "teal",
    items: [
      "Schema awal (tabel, relasi, index) sudah dirancang",
      "Migration strategy ditentukan",
      "Backup plan ada",
      "Seed data untuk dev/testing",
    ],
  },
  {
    id: "ui",
    label: "🎨 UI/UX Foundation",
    icon: Palette,
    color: "pink",
    items: [
      "Design system / token (warna, tipografi, spacing)",
      "Mobile-first atau desktop-first ditentukan",
      "Komponen dasar sebelum halaman",
      "Aksesibilitas minimal (contrast, keyboard nav)",
    ],
  },
  {
    id: "deployment",
    label: "🚀 Deployment & Ops",
    icon: Rocket,
    color: "cyan",
    items: [
      "Environment: local → staging → production",
      "CI/CD pipeline terpasang",
      "Error monitoring (Sentry / log)",
      "Uptime monitoring",
    ],
  },
  {
    id: "pm",
    label: "📋 Project Management",
    icon: ClipboardList,
    color: "green",
    items: [
      "Backlog ringan dibuat (Issues / Notion / Trello)",
      "Definition of Done per fitur disepakati",
      "PIC yang approve ke production jelas",
    ],
  },
];

const TOTAL_CHECKS = SECTIONS.reduce((a, s) => a + s.items.length, 0);

const COLOR_MAP = {
  violet: { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700", icon: "text-violet-500" },
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700",     icon: "text-blue-500"   },
  red:    { bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700",       icon: "text-red-500"    },
  orange: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700", icon: "text-orange-500" },
  teal:   { bg: "bg-teal-50",   border: "border-teal-200",   badge: "bg-teal-100 text-teal-700",     icon: "text-teal-500"   },
  pink:   { bg: "bg-pink-50",   border: "border-pink-200",   badge: "bg-pink-100 text-pink-700",     icon: "text-pink-500"   },
  cyan:   { bg: "bg-cyan-50",   border: "border-cyan-200",   badge: "bg-cyan-100 text-cyan-700",     icon: "text-cyan-500"   },
  green:  { bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-700",   icon: "text-green-500"  },
};

// ── Helpers ──────────────────────────────────────────────────────────────
// Build a flat checks map: { "sectionId:idx": { checked, item_notes } }
const buildChecksMap = (rows) => {
  const map = {};
  rows.forEach((r) => {
    map[`${r.section_id}:${r.item_index}`] = { checked: r.checked, notes: r.item_notes };
  });
  return map;
};

const getCheck = (map, sectionId, idx) =>
  map[`${sectionId}:${idx}`] || { checked: false, notes: "" };

// ── Component ─────────────────────────────────────────────────────────────
export default function ClientPlanning() {
  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [checksMap, setChecksMap] = useState({});  // for active project
  const [collapsed, setCollapsed] = useState({});
  const [expandedItem, setExpandedItem] = useState(null); // "sectionId:idx"
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", client: "", date: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef({});

  // AI state
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiMode, setAiMode] = useState("requirements"); // requirements | questions | price | proposal
  const [savedToNotes, setSavedToNotes] = useState(false);

  // Load projects
  useEffect(() => {
    supabase
      .from("planning_projects")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProjects(data || []);
        if (data && data.length > 0) setActiveId(data[0].id);
        setLoading(false);
      });
  }, []);

  // Load checks when active project changes
  useEffect(() => {
    if (!activeId) { setChecksMap({}); return; }
    supabase
      .from("planning_checks")
      .select("section_id, item_index, checked, item_notes")
      .eq("project_id", activeId)
      .then(({ data }) => setChecksMap(buildChecksMap(data || [])));
  }, [activeId]);

  const active = projects.find((p) => p.id === activeId) || null;
  const doneChecks = Object.values(checksMap).filter((v) => v.checked).length;
  const progress = active ? Math.round((doneChecks / TOTAL_CHECKS) * 100) : 0;

  // ── CRUD ─────────────────────────────────────────────────────────────
  const addProject = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from("planning_projects")
      .insert({ name: form.name.trim(), client: form.client.trim(), date: form.date })
      .select()
      .single();
    if (data) {
      setProjects((prev) => [data, ...prev]);
      setActiveId(data.id);
      setChecksMap({});
    }
    setShowForm(false);
    setForm({ name: "", client: "", date: new Date().toISOString().slice(0, 10) });
    setSaving(false);
  };

  const deleteProject = async (id) => {
    await supabase.from("planning_projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeId === id) setActiveId(projects.find((p) => p.id !== id)?.id || null);
  };

  const toggleCheck = useCallback(async (sectionId, idx) => {
    const key = `${sectionId}:${idx}`;
    const current = getCheck(checksMap, sectionId, idx);
    const newChecked = !current.checked;

    // Optimistic update
    setChecksMap((prev) => ({
      ...prev,
      [key]: { ...current, checked: newChecked },
    }));

    await supabase.from("planning_checks").upsert(
      { project_id: activeId, section_id: sectionId, item_index: idx, checked: newChecked, item_notes: current.notes },
      { onConflict: "project_id,section_id,item_index" }
    );
  }, [checksMap, activeId]);

  // Debounced item notes save
  const updateItemNotes = useCallback((sectionId, idx, value) => {
    const key = `${sectionId}:${idx}`;
    const current = getCheck(checksMap, sectionId, idx);

    // Optimistic update
    setChecksMap((prev) => ({ ...prev, [key]: { ...current, notes: value } }));

    // Debounce DB write
    clearTimeout(debounceRef.current[key]);
    debounceRef.current[key] = setTimeout(async () => {
      await supabase.from("planning_checks").upsert(
        { project_id: activeId, section_id: sectionId, item_index: idx, checked: current.checked, item_notes: value },
        { onConflict: "project_id,section_id,item_index" }
      );
    }, 600);
  }, [checksMap, activeId]);

  // Debounced project notes save
  const notesDebounceRef = useRef(null);
  const updateProjectNotes = (value) => {
    setProjects((prev) => prev.map((p) => (p.id === activeId ? { ...p, notes: value } : p)));
    clearTimeout(notesDebounceRef.current);
    notesDebounceRef.current = setTimeout(() => {
      supabase.from("planning_projects").update({ notes: value }).eq("id", activeId);
    }, 600);
  };

  const toggleSection = (id) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleItem = (key) => setExpandedItem((prev) => (prev === key ? null : key));

  // ── AI Prompts per mode ──────────────────────────────────────────────
  const STACK_CONTEXT = `Tech stack preference:
  • Landing page/konten → Astro + Svelte
  • SaaS/Dashboard besar → Next.js
  • SPA/Dashboard internal → Vite + React
  • Auth + DB + Realtime → Supabase`;

  const AI_MODES = {
    requirements: {
      label: "Requirements", icon: Sparkles, color: "violet",
      placeholder: 'Ceritakan apa yang diminta client...\nContoh: "Client mau bikin aplikasi absensi karyawan, bisa scan QR, laporan bulanan, dashboard admin"',
      buttonLabel: "Generate Requirements",
      prompt: (input) => `Kamu adalah Senior Software Architect. Prinsip: YAGNI, Lazy Dev, no over-engineering.\n${STACK_CONTEXT}\n\nPERMINTAAN CLIENT:\n"${input}"\n\nTUGAS:\n1. Rekomendasikan tech stack paling tepat + alasan.\n2. Buat requirements MVP saja (YAGNI ketat).\n3. Tiap item: [Mudah/Sedang/Sulit] + estimasi hari.\n4. Bedakan MVP vs Post-MVP.\n5. Identifikasi Red Flags yang wajib dikonfirmasi.\n6. Buat urutan phase pengerjaan.\nJawab Bahasa Indonesia, ringkas.\n\nFORMAT:\n## 🏗️ Rekomendasi Tech Stack\n## ✅ MVP — Fitur Utama (• item [level] ~X hari)\n## ➕ Post-MVP\n## ⚙️ Kebutuhan Teknis\n## 🚩 Red Flags — Konfirmasi ke Client\n## 📅 Phase Pengerjaan\n## 💡 Catatan Senior Dev`,
    },
    questions: {
      label: "Pertanyaan Client", icon: HelpCircle, color: "blue",
      placeholder: 'Ceritakan brief dari client (sedetail mungkin)...\nContoh: "Client mau website company profile dengan halaman layanan, portfolio, dan kontak"',
      buttonLabel: "Generate Pertanyaan",
      prompt: (input) => `Kamu adalah Senior Developer yang akan meeting dengan client.\n\nBRIEF CLIENT:\n"${input}"\n\nTUGAS: Buat daftar pertanyaan yang WAJIB ditanyakan ke client sebelum mulai coding. Kelompokkan berdasarkan:\n1. Pertanyaan Bisnis & Tujuan\n2. Pertanyaan Fitur & Fungsionalitas\n3. Pertanyaan Teknis & Infrastruktur\n4. Pertanyaan Konten & Aset\n5. Pertanyaan Timeline & Budget\n\nUntuk setiap pertanyaan, tambahkan [KRITIS] jika wajib dijawab sebelum mulai, atau [PENTING] jika bisa dijawab nanti.\nJawab Bahasa Indonesia. Format bullet point, maksimal 5 pertanyaan per kategori.`,
    },
    price: {
      label: "Estimasi Harga", icon: DollarSign, color: "green",
      placeholder: 'Deskripsikan project dan fitur-fiturnya...\nContoh: "Landing page + form pendaftaran + admin dashboard + email notifikasi, target selesai 2 minggu"',
      buttonLabel: "Hitung Estimasi Harga",
      prompt: (input) => `Kamu adalah Senior Freelance Developer Indonesia yang berpengalaman dalam pricing project.\n\nDESKRIPSI PROJECT:\n"${input}"\n\nTUGAS: Buat estimasi harga project dalam Rupiah. Pertimbangkan:\n- Kompleksitas fitur\n- Estimasi waktu pengerjaan\n- Standar harga freelancer Indonesia (junior, mid, senior)\n- Biaya tambahan (hosting, domain, tools)\n\nFORMAT OUTPUT:\n## 💰 Ringkasan Estimasi\n[range harga total]\n\n## 📊 Breakdown per Komponen\n| Komponen | Durasi | Harga |\n\n## 🔧 Biaya Tambahan (Opsional)\n• Hosting: ...\n• Domain: ...\n• Tools/API: ...\n\n## 📋 3 Opsi Paket\n**Paket Basic** (Rp X - Y): [fitur minimal]\n**Paket Standard** (Rp X - Y): [fitur utama]\n**Paket Premium** (Rp X - Y): [fitur lengkap]\n\n## 💡 Tips Negosiasi\n[saran untuk closing deal dengan client]`,
    },
    proposal: {
      label: "Draft Proposal", icon: FileText, color: "orange",
      placeholder: 'Ceritakan project lengkap termasuk fitur, timeline, dan budget yang sudah disepakati...\nContoh: "Website e-commerce fashion, fitur: katalog produk, cart, payment Midtrans, admin panel. Budget 15 juta, deadline 1 bulan"',
      buttonLabel: "Buat Draft Proposal",
      prompt: (input) => `Kamu adalah Senior Developer yang membuat proposal proyek profesional.\n\nINFO PROJECT:\n"${input}"\n\nBuat draft proposal singkat (1 halaman) yang profesional dan meyakinkan untuk dikirim ke client. Gunakan bahasa formal namun ramah.\n\nFORMAT PROPOSAL:\n# PROPOSAL PENGEMBANGAN [NAMA SISTEM]\n\n## Latar Belakang\n[1-2 paragraf singkat memahami kebutuhan client]\n\n## Scope Pekerjaan\n[daftar fitur yang akan dikerjakan]\n\n## Deliverables\n[apa yang akan diserahkan ke client]\n\n## Timeline Pengerjaan\n| Phase | Durasi | Keterangan |\n\n## Investasi\n[harga + breakdown singkat]\n\n## Yang Tidak Termasuk (Out of Scope)\n[batasan yang jelas]\n\n## Syarat & Ketentuan\n• Pembayaran: [DP + pelunasan]\n• Revisi: [jumlah revisi yang termasuk]\n• Support: [garansi bug setelah launch]\n\n## Langkah Selanjutnya\n[CTA — apa yang harus dilakukan client untuk mulai]`,
    },
  };

  const generateAI = async () => {
    if (!aiInput.trim() || aiLoading) return;
    setAiLoading(true);
    setAiResult("");
    setSavedToNotes(false);
    const mode = AI_MODES[aiMode];
    try {
      const result = await callGemini(mode.prompt(aiInput));
      setAiResult(result);
    } catch (e) {
      setAiResult("❌ Gagal menghubungi Gemini. Cek API key di .env");
    }
    setAiLoading(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToNotes = () => {
    const separator = `\n\n--- [AI ${AI_MODES[aiMode].label} — ${new Date().toLocaleDateString('id-ID')}] ---\n`;
    const newNotes = (active.notes || "") + separator + aiResult;
    updateProjectNotes(newNotes);
    setSavedToNotes(true);
    setTimeout(() => setSavedToNotes(false), 2000);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Memuat data...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Client Planning</h1>
        <p className="text-sm text-gray-400 mt-1">Checklist per project — tiap item bisa diberi catatan detail.</p>
      </div>

      <div className="flex gap-6">
        {/* ── LEFT: Project List ──────────────────────────── */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-foreground">Projects</span>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          {showForm && (
            <div className="bg-white border-2 border-primary/30 rounded-xl p-4 flex flex-col gap-2.5 shadow-sm">
              <input
                autoFocus
                placeholder="Nama project *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addProject()}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                placeholder="Nama client"
                value={form.client}
                onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={addProject}
                  disabled={saving}
                  className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan
                </button>
                <button onClick={() => setShowForm(false)} className="px-3 py-2 bg-gray-100 text-gray-500 rounded-md hover:bg-gray-200 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {projects.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-12">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                Belum ada project.
              </div>
            )}
            {projects.map((p) => {
              const isActive = p.id === activeId;
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={`cursor-pointer rounded-xl p-3 border-2 transition-all duration-200 group ${
                    isActive ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100 bg-white hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`font-bold text-sm truncate ${isActive ? "text-primary" : "text-foreground"}`}>{p.name}</p>
                      {p.client && (
                        <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" /> {p.client}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {p.date}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Checklist ───────────────────────────── */}
        {active ? (
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Header */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground">{active.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                    {active.client && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{active.client}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{active.date}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-3xl font-black ${progress === 100 ? "text-green-500" : "text-primary"}`}>{progress}%</span>
                  <p className="text-xs text-gray-400">{doneChecks} / {TOTAL_CHECKS} selesai</p>
                </div>
              </div>
              <div className="mt-3 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${progress === 100 ? "bg-green-400" : "bg-primary"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress === 100 && (
                <p className="text-green-600 text-sm font-bold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Semua checklist selesai! Siap mulai build. 🚀
                </p>
              )}
            </div>

            {/* ── AI Panel ── */}
            <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl border-2 border-violet-100 p-5">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <h3 className="font-bold text-sm text-foreground">AI Assistant</h3>
              </div>

              {/* Mode Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {Object.entries(AI_MODES).map(([key, mode]) => {
                  const Icon = mode.icon;
                  const isSelected = aiMode === key;
                  const tabColors = {
                    violet: isSelected ? "bg-violet-600 text-white border-violet-600" : "bg-white text-violet-600 border-violet-200 hover:bg-violet-50",
                    blue:   isSelected ? "bg-blue-600 text-white border-blue-600"   : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50",
                    green:  isSelected ? "bg-green-600 text-white border-green-600" : "bg-white text-green-600 border-green-200 hover:bg-green-50",
                    orange: isSelected ? "bg-orange-500 text-white border-orange-500" : "bg-white text-orange-500 border-orange-200 hover:bg-orange-50",
                  };
                  return (
                    <button
                      key={key}
                      onClick={() => { setAiMode(key); setAiResult(""); setSavedToNotes(false); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all duration-150 ${tabColors[mode.color]}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {/* Input */}
              <textarea
                key={aiMode}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={AI_MODES[aiMode].placeholder}
                rows={4}
                className="w-full text-sm border border-violet-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/40 resize-none text-gray-700 placeholder-gray-400 bg-white"
              />

              {/* Generate Button */}
              <button
                onClick={generateAI}
                disabled={aiLoading || !aiInput.trim()}
                className="mt-2.5 flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                  : <><Sparkles className="w-4 h-4" /> {AI_MODES[aiMode].buttonLabel}</>
                }
              </button>

              {/* Result */}
              {aiResult && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">Hasil AI — {AI_MODES[aiMode].label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveToNotes}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
                      >
                        {savedToNotes
                          ? <><Check className="w-3.5 h-3.5 text-green-500" /> Tersimpan!</>
                          : <><BookmarkPlus className="w-3.5 h-3.5" /> Simpan ke Notes</>
                        }
                      </button>
                      <button
                        onClick={copyResult}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-violet-100 p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {aiResult}
                  </div>
                </div>
              )}
            </div>

            {/* Sections */}
            {SECTIONS.map((section) => {
              const c = COLOR_MAP[section.color];
              const Icon = section.icon;
              const sectionDone = section.items.filter((_, idx) => getCheck(checksMap, section.id, idx).checked).length;
              const isOpen = !collapsed[section.id];
              const allDone = sectionDone === section.items.length;

              return (
                <div key={section.id} className={`bg-white rounded-xl border-2 ${allDone ? "border-green-200" : c.border} overflow-hidden`}>
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between p-4 ${allDone ? "bg-green-50" : c.bg} hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-center gap-3">
                      {allDone ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Icon className={`w-5 h-5 ${c.icon}`} />}
                      <span className="font-bold text-sm text-foreground">{section.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${allDone ? "bg-green-100 text-green-700" : c.badge}`}>
                        {sectionDone}/{section.items.length}
                      </span>
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-gray-50">
                      {section.items.map((item, idx) => {
                        const key = `${section.id}:${idx}`;
                        const { checked, notes } = getCheck(checksMap, section.id, idx);
                        const isExpanded = expandedItem === key;
                        const hasNotes = notes && notes.trim().length > 0;

                        return (
                          <div key={idx} className="px-4 py-3">
                            {/* Item row */}
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <button
                                onClick={() => toggleCheck(section.id, idx)}
                                className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  checked ? "bg-green-400 border-green-400" : "border-gray-300 hover:border-primary/60"
                                }`}
                              >
                                {checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </button>

                              {/* Label + expand toggle */}
                              <div className="flex-1 min-w-0">
                                <div
                                  className="flex items-start justify-between gap-2 cursor-pointer"
                                  onClick={() => toggleItem(key)}
                                >
                                  <span className={`text-sm transition-colors leading-snug ${checked ? "line-through text-gray-400" : "text-gray-700 hover:text-foreground"}`}>
                                    {item}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                                    {hasNotes && <StickyNote className="w-3.5 h-3.5 text-amber-400" />}
                                    <ExpandIcon className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                  </div>
                                </div>

                                {/* Expandable notes area */}
                                {isExpanded && (
                                  <div className="mt-2.5">
                                    <textarea
                                      autoFocus
                                      value={notes}
                                      onChange={(e) => updateItemNotes(section.id, idx, e.target.value)}
                                      placeholder="Ketik catatan, keputusan, atau detail untuk checklist ini..."
                                      rows={4}
                                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-gray-700 placeholder-gray-300 bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-300 mt-1">Tersimpan otomatis</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Project Notes */}
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
              <h3 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-gray-400" /> Catatan Meeting (General)
              </h3>
              <textarea
                value={active.notes}
                onChange={(e) => updateProjectNotes(e.target.value)}
                placeholder="Kesepakatan umum, poin penting, atau hal yang perlu difollow-up..."
                rows={5}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-gray-700 placeholder-gray-300"
              />
              <p className="text-xs text-gray-300 mt-1">Tersimpan otomatis</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
            <ClipboardList className="w-16 h-16 opacity-20 mb-4" />
            <p className="font-bold text-lg text-gray-300">Pilih atau buat project</p>
            <p className="text-sm mt-1">Gunakan panel kiri untuk memilih project client.</p>
          </div>
        )}
      </div>
    </div>
  );
}
