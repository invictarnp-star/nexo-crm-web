import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  LayoutDashboard, Users, Car, Receipt, Plus, Search, X, Pencil, Trash2,
  Phone, Mail, MapPin, Calendar, CheckCircle2, XCircle, AlertTriangle,
  Menu, ArrowLeft, Clock, FileText, Wallet, TrendingUp, ChevronRight,
  CreditCard, MessageCircle, ListFilter, RotateCcw, Eye
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Tokens & global style                                               */
/* ------------------------------------------------------------------ */

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

.nexo {
  --ink: #0B1015;
  --surface: #121922;
  --surface-2: #19222D;
  --surface-3: #202B38;
  --border: #263241;
  --border-soft: #1D2732;
  --text: #E9EEF3;
  --text-dim: #92A2B2;
  --text-faint: #56646F;
  --accent: #3E86BF;
  --accent-dim: #2C5F87;
  --accent-soft: rgba(62,134,191,0.14);
  --success: #34B172;
  --success-soft: rgba(52,177,114,0.14);
  --warning: #DB9B3D;
  --warning-soft: rgba(219,155,61,0.14);
  --danger: #DD5F52;
  --danger-soft: rgba(221,95,82,0.14);
  --info: #7A8FB0;
  --info-soft: rgba(122,143,176,0.16);
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--ink);
  color: var(--text);
  min-height: 100vh;
  width: 100%;
  position: relative;
}
.nexo * { box-sizing: border-box; }
.nexo .mono { font-family: 'JetBrains Mono', monospace; }

/* Layout */
.nexo-shell { display: flex; min-height: 100vh; }
.nexo-sidebar {
  width: 232px; flex-shrink: 0; background: var(--surface);
  border-right: 1px solid var(--border-soft); padding: 20px 14px;
  display: flex; flex-direction: column; gap: 18px;
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 40;
  transition: transform .25s ease;
}
.nexo-brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px 10px; }
.nexo-brand-mark {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), var(--accent-dim));
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 15px; color: #fff; letter-spacing: -0.5px;
}
.nexo-brand-name { font-weight: 700; font-size: 15.5px; letter-spacing: -0.2px; line-height: 1.1;}
.nexo-brand-tag { font-size: 10.5px; color: var(--text-faint); margin-top: 2px; }
.nexo-nav { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.nexo-nav-item {
  display: flex; align-items: center; gap: 11px; padding: 9px 12px;
  border-radius: 8px; color: var(--text-dim); font-size: 13.5px; font-weight: 500;
  cursor: pointer; border: 1px solid transparent; user-select: none;
}
.nexo-nav-item:hover { background: var(--surface-2); color: var(--text); }
.nexo-nav-item.active { background: var(--accent-soft); color: var(--text); border-color: rgba(62,134,191,0.35); }
.nexo-nav-item.active svg { color: var(--accent); }
.nexo-sidebar-foot { font-size: 10.5px; color: var(--text-faint); padding: 8px; border-top: 1px solid var(--border-soft); padding-top: 12px;}

.nexo-main { margin-left: 232px; flex: 1; min-width: 0; display: flex; flex-direction: column; }
.nexo-topbar {
  height: 60px; border-bottom: 1px solid var(--border-soft); background: rgba(18,25,34,0.7);
  backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: space-between;
  padding: 0 22px; position: sticky; top: 0; z-index: 30; gap: 12px;
}
.nexo-topbar-title { font-size: 15.5px; font-weight: 700; display:flex; align-items:center; gap:10px;}
.nexo-topbar-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;}
.nexo-hamburger { display: none; background: none; border: none; color: var(--text); cursor: pointer; padding: 6px;}
.nexo-content { padding: 24px 26px 60px; flex: 1; }
.nexo-overlay { display:none; }

/* Buttons */
.nexo-btn {
  display: inline-flex; align-items: center; gap: 7px; font-family: inherit;
  font-size: 13px; font-weight: 600; padding: 9px 14px; border-radius: 8px;
  border: 1px solid var(--border); background: var(--surface-2); color: var(--text);
  cursor: pointer; white-space: nowrap; transition: border-color .15s, background .15s;
}
.nexo-btn:hover { border-color: var(--accent-dim); }
.nexo-btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.nexo-btn-primary:hover { background: #3679AC; }
.nexo-btn-ghost { background: transparent; border-color: transparent; color: var(--text-dim); }
.nexo-btn-ghost:hover { background: var(--surface-2); color: var(--text); }
.nexo-btn-danger { color: var(--danger); }
.nexo-btn-sm { padding: 6px 10px; font-size: 12px; }
.nexo-icon-btn {
  width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 7px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-dim);
  cursor: pointer;
}
.nexo-icon-btn:hover { color: var(--text); border-color: var(--accent-dim); }

/* Cards */
.nexo-card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 12px; padding: 18px; }
.nexo-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
.nexo-kpi { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 12px; padding: 16px 16px 14px; position: relative; overflow: hidden;}
.nexo-kpi-icon { width: 32px; height: 32px; border-radius: 8px; display:flex; align-items:center; justify-content:center; margin-bottom: 10px;}
.nexo-kpi-label { font-size: 12px; color: var(--text-dim); font-weight: 500; margin-bottom: 4px;}
.nexo-kpi-value { font-size: 21px; font-weight: 700; letter-spacing: -0.3px; }
.nexo-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;}
.nexo-chart-title { font-size: 13.5px; font-weight: 600; margin-bottom: 2px; }
.nexo-chart-sub { font-size: 11.5px; color: var(--text-faint); margin-bottom: 14px; }

/* Section header */
.nexo-section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;}
.nexo-section-title { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
.nexo-section-count { font-size: 12.5px; color: var(--text-faint); font-weight: 500; margin-left: 8px;}

/* Search & filters */
.nexo-searchbar { display:flex; align-items:center; gap:8px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; max-width: 380px; flex: 1; }
.nexo-searchbar input { background:none; border:none; outline:none; color: var(--text); font-size: 13px; width: 100%; font-family:inherit;}
.nexo-searchbar input::placeholder { color: var(--text-faint); }
.nexo-filters { background: var(--surface); border:1px solid var(--border-soft); border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; display:flex; flex-wrap:wrap; gap: 12px; align-items:flex-end;}
.nexo-filter-field { display:flex; flex-direction:column; gap:5px; min-width: 130px; flex:1;}
.nexo-filter-field label { font-size: 10.5px; text-transform:uppercase; letter-spacing:.4px; color: var(--text-faint); font-weight:600;}

/* Inputs */
.nexo-input, .nexo-select, .nexo-textarea {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
  border-radius: 7px; padding: 8px 10px; font-size: 13px; font-family: inherit; outline: none; width: 100%;
}
.nexo-input:focus, .nexo-select:focus, .nexo-textarea:focus { border-color: var(--accent); }
.nexo-textarea { resize: vertical; min-height: 60px; }
.nexo-field { display:flex; flex-direction:column; gap: 6px; }
.nexo-field label { font-size: 12px; color: var(--text-dim); font-weight: 500; }
.nexo-field-error { font-size: 11px; color: var(--danger); }
.nexo-field-row { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.nexo-field-row3 { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

/* Table */
.nexo-table-wrap { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 12px; overflow: hidden; }
.nexo-table-scroll { overflow-x: auto; }
.nexo-table { width: 100%; border-collapse: collapse; min-width: 640px; }
.nexo-table th {
  text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .5px;
  color: var(--text-faint); font-weight: 600; padding: 12px 16px; border-bottom: 1px solid var(--border-soft);
  white-space: nowrap;
}
.nexo-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid var(--border-soft); vertical-align: middle; }
.nexo-table tr:last-child td { border-bottom: none; }
.nexo-table tbody tr:hover { background: var(--surface-2); }
.nexo-row-link { cursor: pointer; }
.nexo-cell-muted { color: var(--text-faint); font-size: 12px; }
.nexo-actions-cell { display:flex; gap: 6px; justify-content:flex-end; }

/* Badges */
.nexo-badge { display:inline-flex; align-items:center; gap:5px; font-size: 11.5px; font-weight: 600; padding: 4px 9px; border-radius: 20px; }
.nexo-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink:0; }

/* Empty state */
.nexo-empty { text-align:center; padding: 60px 20px; color: var(--text-faint); }
.nexo-empty svg { margin-bottom: 12px; opacity: .5; }
.nexo-empty-title { color: var(--text-dim); font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.nexo-empty-sub { font-size: 12.5px; }

/* Modal */
.nexo-modal-overlay { position: fixed; inset: 0; background: rgba(5,8,11,0.6); z-index: 100; display:flex; align-items:flex-start; justify-content:center; overflow-y:auto; padding: 40px 16px; }
.nexo-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
.nexo-modal.wide { max-width: 620px; }
.nexo-modal-head { display:flex; align-items:center; justify-content:space-between; padding: 18px 20px; border-bottom: 1px solid var(--border-soft); }
.nexo-modal-head h3 { font-size: 15.5px; font-weight: 700; margin: 0; }
.nexo-modal-body { padding: 20px; display:flex; flex-direction:column; gap: 14px; }
.nexo-modal-foot { display:flex; justify-content:flex-end; gap: 8px; padding: 16px 20px; border-top: 1px solid var(--border-soft); }

/* Client detail */
.nexo-detail-grid { display:grid; grid-template-columns: 300px 1fr; gap: 16px; align-items:start; }
.nexo-info-row { display:flex; align-items:center; gap: 9px; font-size: 13px; color: var(--text-dim); padding: 7px 0; border-bottom: 1px solid var(--border-soft); }
.nexo-info-row:last-child { border-bottom: none; }
.nexo-info-row svg { color: var(--text-faint); flex-shrink:0; }
.nexo-avatar { width: 52px; height: 52px; border-radius: 12px; background: var(--accent-soft); color: var(--accent); display:flex; align-items:center; justify-content:center; font-weight: 700; font-size: 19px; }
.nexo-veiculo-card { border: 1px solid var(--border-soft); border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; background: var(--surface-2); }
.nexo-veiculo-card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px; }
.nexo-mini-kpis { display:grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
.nexo-mini-kpi { background: var(--surface-2); border: 1px solid var(--border-soft); border-radius: 10px; padding: 12px 14px; }
.nexo-mini-kpi-label { font-size: 11px; color: var(--text-faint); margin-bottom: 4px; }
.nexo-mini-kpi-value { font-size: 16px; font-weight: 700; }
.nexo-tabs { display:flex; gap: 4px; border-bottom: 1px solid var(--border-soft); margin-bottom: 14px; }
.nexo-tab { padding: 8px 4px; margin-right: 18px; font-size: 13px; font-weight: 600; color: var(--text-faint); cursor:pointer; border-bottom: 2px solid transparent; }
.nexo-tab.active { color: var(--text); border-color: var(--accent); }

/* Responsive */
@media (max-width: 1024px) {
  .nexo-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .nexo-charts-grid { grid-template-columns: 1fr; }
  .nexo-detail-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .nexo-sidebar { transform: translateX(-100%); box-shadow: 20px 0 40px rgba(0,0,0,0.3); }
  .nexo-sidebar.open { transform: translateX(0); }
  .nexo-main { margin-left: 0; }
  .nexo-hamburger { display: inline-flex; align-items:center; justify-content:center; }
  .nexo-content { padding: 16px 14px 40px; }
  .nexo-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .nexo-mini-kpis { grid-template-columns: repeat(2,1fr); }
  .nexo-field-row, .nexo-field-row3 { grid-template-columns: 1fr; }
  .nexo-overlay.open { display:block; position: fixed; inset:0; background: rgba(0,0,0,0.45); z-index: 39; }
  .nexo-topbar { padding: 0 14px; }
  .nexo-topbar-title span.hide-mobile { display:none; }
}
`;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const genId = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const parseISODate = (iso) => (iso ? new Date(iso + "T00:00:00") : null);
const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0);

function formatBRL(v) {
  const n = Number(v) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatDateBR(iso) {
  if (!iso) return "—";
  const d = parseISODate(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}
function maskCPF(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  let out = d;
  if (d.length > 9) out = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  else if (d.length > 6) out = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  else if (d.length > 3) out = `${d.slice(0, 3)}.${d.slice(3)}`;
  return out;
}
function maskPhone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
function maskCEP(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}
function computeBoletoStatus(b) {
  if (b.dataPagamento) return "Pago";
  if (!b.dataVencimento) return "Em aberto";
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const venc = parseISODate(b.dataVencimento);
  const diffDays = Math.round((venc - hoje) / 86400000);
  if (diffDays < 0) return "Vencido";
  if (diffDays <= 7) return "A vencer";
  return "Em aberto";
}

const STATUS_META = {
  Pago: { color: "var(--success)", bg: "var(--success-soft)", Icon: CheckCircle2 },
  Vencido: { color: "var(--danger)", bg: "var(--danger-soft)", Icon: AlertTriangle },
  "A vencer": { color: "var(--warning)", bg: "var(--warning-soft)", Icon: Clock },
  "Em aberto": { color: "var(--info)", bg: "var(--info-soft)", Icon: FileText },
};

/* ------------------------------------------------------------------ */
/* Small UI primitives                                                 */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META["Em aberto"];
  const Icon = meta.Icon;
  return (
    <span className="nexo-badge" style={{ color: meta.color, background: meta.bg }}>
      <Icon size={12} /> {status}
    </span>
  );
}

function AtivoInativoBadge({ ativo }) {
  const on = ativo === "Ativo";
  return (
    <span
      className="nexo-badge"
      style={{
        color: on ? "var(--success)" : "var(--danger)",
        background: on ? "var(--success-soft)" : "var(--danger-soft)",
      }}
    >
      <span className="nexo-dot" style={{ background: on ? "var(--success)" : "var(--danger)" }} />
      {ativo}
    </span>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="nexo-field">
      <label>{label}</label>
      {children}
      {error && <span className="nexo-field-error">{error}</span>}
    </div>
  );
}

function Modal({ title, onClose, children, wide, footer }) {
  return (
    <div className="nexo-modal-overlay" onClick={onClose}>
      <div className={`nexo-modal ${wide ? "wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="nexo-modal-head">
          <h3>{title}</h3>
          <button className="nexo-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="nexo-modal-body">{children}</div>
        {footer && <div className="nexo-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  const Icon = icon;
  return (
    <div className="nexo-empty">
      <Icon size={34} />
      <div className="nexo-empty-title">{title}</div>
      <div className="nexo-empty-sub">{sub}</div>
    </div>
  );
}

function Kpi({ icon, label, value, tone }) {
  const Icon = icon;
  const colors = {
    accent: ["var(--accent)", "var(--accent-soft)"],
    success: ["var(--success)", "var(--success-soft)"],
    warning: ["var(--warning)", "var(--warning-soft)"],
    danger: ["var(--danger)", "var(--danger-soft)"],
    info: ["var(--info)", "var(--info-soft)"],
  }[tone || "accent"];
  return (
    <div className="nexo-kpi">
      <div className="nexo-kpi-icon" style={{ background: colors[1], color: colors[0] }}>
        <Icon size={16} />
      </div>
      <div className="nexo-kpi-label">{label}</div>
      <div className="nexo-kpi-value">{value}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Forms                                                                */
/* ------------------------------------------------------------------ */

function ClienteForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || { nome: "", nascimento: "", cpf: "", telefone: "", whatsapp: "", email: "", cep: "", endereco: "", status: "Ativo" }
  );
  const [errors, setErrors] = useState({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepMsg, setCepMsg] = useState("");
  const [buscandoCpf, setBuscandoCpf] = useState(false);
  const [cpfMsg, setCpfMsg] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function buscarCpf() {
    const cpfLimpo = f.cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      setCpfMsg("Informe um CPF com 11 dígitos.");
      return;
    }
    setBuscandoCpf(true);
    setCpfMsg("");
    try {
      const resp = await fetch(`/api/consulta-cpf?cpf=${cpfLimpo}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || "Não foi possível consultar este CPF.");
      setF((prev) => ({ ...prev, nome: data.nome || prev.nome, nascimento: data.nascimento || prev.nascimento }));
      setCpfMsg("Nome e data de nascimento preenchidos.");
    } catch (e) {
      setCpfMsg(e.message);
    } finally {
      setBuscandoCpf(false);
    }
  }

  async function buscarCep() {
    const cepLimpo = f.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setCepMsg("Informe um CEP com 8 dígitos.");
      return;
    }
    setBuscandoCep(true);
    setCepMsg("");
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await resp.json();
      if (data.erro) {
        setCepMsg("CEP não encontrado.");
        return;
      }
      const partes = [data.logradouro, data.bairro, data.localidade && data.uf ? `${data.localidade} - ${data.uf}` : ""].filter(Boolean);
      setF((prev) => ({ ...prev, endereco: partes.join(", ") }));
      setCepMsg("Endereço preenchido. Complete com número e complemento, se precisar.");
    } catch (e) {
      setCepMsg("Não foi possível consultar o CEP agora.");
    } finally {
      setBuscandoCep(false);
    }
  }

  function submit() {
    const errs = {};
    if (!f.nome.trim()) errs.nome = "Informe o nome completo.";
    if (!f.cpf.trim()) errs.cpf = "Informe o CPF.";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, id: initial?.id });
  }

  return (
    <>
      <Field label="Nome completo *" error={errors.nome}>
        <input className="nexo-input" value={f.nome} onChange={set("nome")} placeholder="Ex.: Ana Paula Ribeiro" />
      </Field>
      <div className="nexo-field-row">
        <Field label="Data de nascimento">
          <input type="date" className="nexo-input" value={f.nascimento} onChange={set("nascimento")} />
        </Field>
        <Field label="CPF *" error={errors.cpf}>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="nexo-input mono"
              value={f.cpf}
              onChange={(e) => setF({ ...f, cpf: maskCPF(e.target.value) })}
              onBlur={() => f.cpf.replace(/\D/g, "").length === 11 && buscarCpf()}
              placeholder="000.000.000-00"
            />
            <button type="button" className="nexo-btn nexo-btn-sm" disabled={buscandoCpf || !f.cpf.trim()} onClick={buscarCpf}>
              {buscandoCpf ? "Buscando…" : "Buscar dados"}
            </button>
          </div>
        </Field>
      </div>
      {cpfMsg && (
        <div style={{ fontSize: 12, color: cpfMsg.includes("preenchidos") ? "var(--success)" : "var(--warning)", marginTop: -8 }}>
          {cpfMsg}
        </div>
      )}
      <div className="nexo-field-row">
        <Field label="Telefone">
          <input className="nexo-input mono" value={f.telefone} onChange={(e) => setF({ ...f, telefone: maskPhone(e.target.value) })} placeholder="(00) 0000-0000" />
        </Field>
        <Field label="WhatsApp">
          <input className="nexo-input mono" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" />
        </Field>
      </div>
      <Field label="E-mail">
        <input type="email" className="nexo-input" value={f.email} onChange={set("email")} placeholder="nome@email.com" />
      </Field>
      <Field label="CEP">
        <div style={{ display: "flex", gap: 6 }}>
          <input
            className="nexo-input mono"
            value={f.cep}
            onChange={(e) => setF({ ...f, cep: maskCEP(e.target.value) })}
            onBlur={() => f.cep.replace(/\D/g, "").length === 8 && buscarCep()}
            placeholder="00000-000"
            style={{ maxWidth: 140 }}
          />
          <button type="button" className="nexo-btn nexo-btn-sm" disabled={buscandoCep || !f.cep.trim()} onClick={buscarCep}>
            {buscandoCep ? "Buscando…" : "Buscar CEP"}
          </button>
        </div>
      </Field>
      {cepMsg && (
        <div style={{ fontSize: 12, color: cepMsg.includes("preenchido") ? "var(--success)" : "var(--warning)", marginTop: -8 }}>
          {cepMsg}
        </div>
      )}
      <Field label="Endereço">
        <textarea className="nexo-textarea" value={f.endereco} onChange={set("endereco")} placeholder="Rua, número, bairro, cidade - UF" />
      </Field>
      <Field label="Status">
        <select className="nexo-select" value={f.status} onChange={set("status")}>
          <option>Ativo</option>
          <option>Inativo</option>
        </select>
      </Field>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar cliente</button>
      </div>
    </>
  );
}

function VeiculoForm({ initial, clientes, defaultClienteId, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      clienteId: defaultClienteId || "", marca: "", modelo: "", ano: "", placa: "", chassi: "",
      valorVeiculo: "", valorMensal: "", dataCadastro: todayISO(), status: "Ativo",
      codigoFipe: "", valorFipe: "",
    }
  );
  const [errors, setErrors] = useState({});
  const [buscando, setBuscando] = useState(false);
  const [buscaMsg, setBuscaMsg] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function buscarDadosVeiculo(porChassi) {
    const termo = porChassi ? f.chassi.trim() : f.placa.trim();
    if (!termo) return;
    setBuscando(true);
    setBuscaMsg("");
    try {
      const param = porChassi ? `chassi=${encodeURIComponent(termo)}` : `placa=${encodeURIComponent(termo)}`;
      const resp = await fetch(`/api/consulta-veiculo?${param}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || "Não foi possível consultar este veículo.");
      setF((prev) => ({
        ...prev,
        marca: data.marca || prev.marca,
        modelo: data.modelo || prev.modelo,
        ano: data.ano || prev.ano,
        chassi: data.chassi || prev.chassi,
        codigoFipe: data.codigoFipe || prev.codigoFipe,
        valorFipe: data.valorFipe != null ? data.valorFipe : prev.valorFipe,
      }));
      setBuscaMsg(data.fipeEncontrada ? "Dados e valor Fipe encontrados." : "Dados do veículo encontrados (valor Fipe não localizado).");
    } catch (e) {
      setBuscaMsg(e.message);
    } finally {
      setBuscando(false);
    }
  }

  function submit() {
    const errs = {};
    if (!f.clienteId) errs.clienteId = "Selecione o cliente.";
    if (!f.marca.trim()) errs.marca = "Informe a marca.";
    if (!f.modelo.trim()) errs.modelo = "Informe o modelo.";
    if (!f.placa.trim()) errs.placa = "Informe a placa.";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, placa: f.placa.toUpperCase(), id: initial?.id });
  }

  return (
    <>
      <Field label="Cliente vinculado *" error={errors.clienteId}>
        <select className="nexo-select" value={f.clienteId} onChange={set("clienteId")}>
          <option value="">Selecione um cliente</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </Field>
      <div className="nexo-field-row">
        <Field label="Marca *" error={errors.marca}>
          <input className="nexo-input" value={f.marca} onChange={set("marca")} placeholder="Ex.: Fiat" />
        </Field>
        <Field label="Modelo *" error={errors.modelo}>
          <input className="nexo-input" value={f.modelo} onChange={set("modelo")} placeholder="Ex.: Argo" />
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Ano">
          <input className="nexo-input mono" value={f.ano} onChange={set("ano")} placeholder="2022" maxLength={4} />
        </Field>
        <Field label="Placa *" error={errors.placa}>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="nexo-input mono"
              value={f.placa}
              onChange={(e) => setF({ ...f, placa: e.target.value.toUpperCase() })}
              onBlur={() => f.placa.replace(/[^A-Z0-9]/g, "").length >= 7 && buscarDadosVeiculo(false)}
              placeholder="ABC1D23"
              maxLength={8}
            />
            <button type="button" className="nexo-btn nexo-btn-sm" disabled={buscando || !f.placa.trim()} onClick={() => buscarDadosVeiculo(false)}>
              {buscando ? "Buscando…" : "Buscar dados"}
            </button>
          </div>
        </Field>
      </div>
      <Field label="Chassi">
        <div style={{ display: "flex", gap: 6 }}>
          <input className="nexo-input mono" value={f.chassi} onChange={set("chassi")} placeholder="Número do chassi" style={{ flex: 1 }} />
          <button type="button" className="nexo-btn nexo-btn-sm" disabled={buscando || !f.chassi.trim()} onClick={() => buscarDadosVeiculo(true)}>
            {buscando ? "Buscando…" : "Buscar por chassi"}
          </button>
        </div>
      </Field>
      {buscaMsg && (
        <div style={{ fontSize: 12, color: buscaMsg.includes("encontrado") ? "var(--success)" : "var(--warning)", marginTop: -6 }}>
          {buscaMsg}
        </div>
      )}
      <div className="nexo-field-row">
        <Field label="Código Fipe">
          <input className="nexo-input mono" value={f.codigoFipe} readOnly placeholder="Preenchido pela busca" />
        </Field>
        <Field label="Valor Fipe (referência)">
          <input className="nexo-input mono" value={f.valorFipe ? formatBRL(f.valorFipe) : ""} readOnly placeholder="Preenchido pela busca" />
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Valor do veículo">
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorVeiculo} onChange={set("valorVeiculo")} placeholder="0,00" />
            {f.valorFipe ? (
              <button type="button" className="nexo-btn nexo-btn-sm" title="Usar valor Fipe" onClick={() => setF({ ...f, valorVeiculo: f.valorFipe })}>
                Usar Fipe
              </button>
            ) : null}
          </div>
        </Field>
        <Field label="Valor mensal">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorMensal} onChange={set("valorMensal")} placeholder="0,00" />
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Data de cadastro">
          <input type="date" className="nexo-input" value={f.dataCadastro} onChange={set("dataCadastro")} />
        </Field>
        <Field label="Status do veículo">
          <select className="nexo-select" value={f.status} onChange={set("status")}>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>
        </Field>
      </div>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar veículo</button>
      </div>
    </>
  );
}

function BoletoForm({ initial, clientes, veiculos, defaultClienteId, defaultVeiculoId, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      clienteId: defaultClienteId || "", veiculoId: defaultVeiculoId || "", numero: "",
      dataEmissao: todayISO(), dataVencimento: "", valor: "", dataPagamento: "",
    }
  );
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const veiculosDoCliente = veiculos.filter((v) => v.clienteId === f.clienteId);

  function submit() {
    const errs = {};
    if (!f.clienteId) errs.clienteId = "Selecione o cliente.";
    if (!f.veiculoId) errs.veiculoId = "Selecione o veículo.";
    if (!f.numero.trim()) errs.numero = "Informe o número do boleto.";
    if (!f.dataVencimento) errs.dataVencimento = "Informe o vencimento.";
    if (!f.valor || Number(f.valor) <= 0) errs.valor = "Informe um valor válido.";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, id: initial?.id });
  }

  return (
    <>
      <div className="nexo-field-row">
        <Field label="Cliente *" error={errors.clienteId}>
          <select className="nexo-select" value={f.clienteId} onChange={(e) => setF({ ...f, clienteId: e.target.value, veiculoId: "" })}>
            <option value="">Selecione</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Field>
        <Field label="Veículo *" error={errors.veiculoId}>
          <select className="nexo-select" value={f.veiculoId} onChange={set("veiculoId")} disabled={!f.clienteId}>
            <option value="">{f.clienteId ? "Selecione" : "Escolha o cliente primeiro"}</option>
            {veiculosDoCliente.map((v) => <option key={v.id} value={v.id}>{v.marca} {v.modelo} · {v.placa}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Número do boleto *" error={errors.numero}>
        <input className="nexo-input mono" value={f.numero} onChange={set("numero")} placeholder="Ex.: 000123" />
      </Field>
      <div className="nexo-field-row3">
        <Field label="Data de emissão">
          <input type="date" className="nexo-input" value={f.dataEmissao} onChange={set("dataEmissao")} />
        </Field>
        <Field label="Vencimento *" error={errors.dataVencimento}>
          <input type="date" className="nexo-input" value={f.dataVencimento} onChange={set("dataVencimento")} />
        </Field>
        <Field label="Valor (R$) *" error={errors.valor}>
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valor} onChange={set("valor")} placeholder="0,00" />
        </Field>
      </div>
      <Field label="Data de pagamento (deixe em branco se ainda não pago)">
        <input type="date" className="nexo-input" value={f.dataPagamento} onChange={set("dataPagamento")} />
      </Field>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar boleto</button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

function Dashboard({ db, onOpenModal }) {
  const boletosComStatus = useMemo(() => db.boletos.map((b) => ({ ...b, status: computeBoletoStatus(b) })), [db.boletos]);

  const clientesAtivos = db.clientes.filter((c) => c.status === "Ativo").length;
  const veiculosAtivos = db.veiculos.filter((v) => v.status === "Ativo").length;
  const veiculosInativos = db.veiculos.filter((v) => v.status === "Inativo").length;
  const emAberto = boletosComStatus.filter((b) => b.status !== "Pago");
  const aVencer = boletosComStatus.filter((b) => b.status === "A vencer");
  const valorEmAberto = sum(emAberto.map((b) => b.valor));
  const valorAReceber = sum(boletosComStatus.filter((b) => b.status === "A vencer" || b.status === "Em aberto").map((b) => b.valor));
  const valorRecebido = sum(boletosComStatus.filter((b) => b.status === "Pago").map((b) => b.valor));

  const valoresData = [
    { name: "Recebido", valor: valorRecebido, color: "var(--success)" },
    { name: "Em aberto", valor: valorEmAberto, color: "var(--info)" },
    { name: "A vencer", valor: valorAReceber, color: "var(--warning)" },
  ];

  const contagem = { Pago: 0, "Em aberto": 0, Vencido: 0, "A vencer": 0 };
  boletosComStatus.forEach((b) => { contagem[b.status] = (contagem[b.status] || 0) + 1; });
  const qtdData = [
    { name: "Pagos", value: contagem["Pago"], fill: "#34B172" },
    { name: "Em aberto", value: contagem["Em aberto"], fill: "#7A8FB0" },
    { name: "Vencidos", value: contagem["Vencido"], fill: "#DD5F52" },
    { name: "A vencer", value: contagem["A vencer"], fill: "#DB9B3D" },
  ];

  const evolucao = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", ""), total: 0 });
    }
    db.boletos.forEach((b) => {
      if (b.dataPagamento) {
        const key = b.dataPagamento.slice(0, 7);
        const m = months.find((m) => m.key === key);
        if (m) m.total += Number(b.valor) || 0;
      }
    });
    return months;
  }, [db.boletos]);

  return (
    <div>
      <div className="nexo-section-head">
        <div>
          <div className="nexo-section-title">Visão geral</div>
        </div>
        <div className="nexo-topbar-actions">
          <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("cliente")}><Plus size={15} /> Novo cliente</button>
          <button className="nexo-btn" onClick={() => onOpenModal("veiculo")}><Plus size={15} /> Novo veículo</button>
          <button className="nexo-btn" onClick={() => onOpenModal("boleto")}><Plus size={15} /> Novo boleto</button>
        </div>
      </div>

      <div className="nexo-kpi-grid">
        <Kpi icon={Users} label="Clientes ativos" value={clientesAtivos} tone="accent" />
        <Kpi icon={Car} label="Veículos ativos" value={veiculosAtivos} tone="success" />
        <Kpi icon={Car} label="Veículos inativos" value={veiculosInativos} tone="danger" />
        <Kpi icon={FileText} label="Boletos em aberto" value={emAberto.length} tone="info" />
        <Kpi icon={Clock} label="Boletos a vencer" value={aVencer.length} tone="warning" />
        <Kpi icon={Wallet} label="Valor em aberto" value={formatBRL(valorEmAberto)} tone="info" />
        <Kpi icon={TrendingUp} label="Valor a receber" value={formatBRL(valorAReceber)} tone="warning" />
        <Kpi icon={Receipt} label="Valor recebido" value={formatBRL(valorRecebido)} tone="success" />
      </div>

      <div className="nexo-charts-grid">
        <div className="nexo-card">
          <div className="nexo-chart-title">Panorama financeiro</div>
          <div className="nexo-chart-sub">Recebido, em aberto e a vencer</div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valoresData} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#263241" vertical={false} />
                <XAxis dataKey="name" stroke="#56646F" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#56646F" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} width={54} />
                <Tooltip
                  contentStyle={{ background: "#19222D", border: "1px solid #263241", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#E9EEF3" }}
                  formatter={(v) => formatBRL(v)}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {valoresData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="nexo-card">
          <div className="nexo-chart-title">Boletos por status</div>
          <div className="nexo-chart-sub">Quantidade de boletos cadastrados</div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={qtdData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>
                  {qtdData.map((d, i) => <Cell key={i} fill={d.fill} stroke="none" />)}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  formatter={(v) => <span style={{ color: "#92A2B2", fontSize: 12 }}>{v}</span>}
                />
                <Tooltip contentStyle={{ background: "#19222D", border: "1px solid #263241", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="nexo-card">
        <div className="nexo-chart-title">Evolução mensal dos recebimentos</div>
        <div className="nexo-chart-sub">Total pago por mês, últimos 6 meses</div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucao} margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#263241" vertical={false} />
              <XAxis dataKey="label" stroke="#56646F" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#56646F" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} width={54} />
              <Tooltip contentStyle={{ background: "#19222D", border: "1px solid #263241", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatBRL(v)} />
              <Line type="monotone" dataKey="total" stroke="#3E86BF" strokeWidth={2.5} dot={{ r: 3, fill: "#3E86BF" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Clientes                                                             */
/* ------------------------------------------------------------------ */

function ClientesView({ db, onOpenModal, onDeleteCliente, onOpenDetail }) {
  const [query, setQuery] = useState("");

  const filtered = db.clientes.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const nomeMatch = c.nome.toLowerCase().includes(q);
    const cpfMatch = c.cpf.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
    const placaMatch = db.veiculos.filter((v) => v.clienteId === c.id).some((v) => v.placa.toLowerCase().includes(q));
    return nomeMatch || cpfMatch || placaMatch;
  });

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Clientes<span className="nexo-section-count">{db.clientes.length} cadastrados</span></div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("cliente")}><Plus size={15} /> Novo cliente</button>
      </div>

      <div className="nexo-searchbar" style={{ marginBottom: 16 }}>
        <Search size={15} color="var(--text-faint)" />
        <input placeholder="Pesquisar por nome, CPF ou placa" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {db.clientes.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Users} title="Nenhum cliente cadastrado" sub="Clique em “Novo cliente” para começar." /></div>
      ) : filtered.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Search} title="Nenhum resultado" sub="Tente pesquisar por outro nome, CPF ou placa." /></div>
      ) : (
        <div className="nexo-table-wrap">
          <div className="nexo-table-scroll">
            <table className="nexo-table">
              <thead>
                <tr>
                  <th>Nome</th><th>CPF</th><th>Contato</th><th>Veículos</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const nVeiculos = db.veiculos.filter((v) => v.clienteId === c.id).length;
                  return (
                    <tr key={c.id} className="nexo-row-link" onClick={() => onOpenDetail(c.id)}>
                      <td style={{ fontWeight: 600 }}>{c.nome}</td>
                      <td className="mono nexo-cell-muted">{c.cpf || "—"}</td>
                      <td className="nexo-cell-muted">{c.telefone || c.whatsapp || "—"}</td>
                      <td className="nexo-cell-muted">{nVeiculos}</td>
                      <td><AtivoInativoBadge ativo={c.status} /></td>
                      <td>
                        <div className="nexo-actions-cell" onClick={(e) => e.stopPropagation()}>
                          <button className="nexo-icon-btn" onClick={() => onOpenModal("cliente", c)}><Pencil size={13} /></button>
                          <button className="nexo-icon-btn" onClick={() => onDeleteCliente(c.id)}><Trash2 size={13} /></button>
                          <button className="nexo-icon-btn" onClick={() => onOpenDetail(c.id)}><Eye size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Veículos                                                             */
/* ------------------------------------------------------------------ */

function VeiculosView({ db, onOpenModal, onDeleteVeiculo, onOpenDetail }) {
  const [query, setQuery] = useState("");
  const getCliente = (id) => db.clientes.find((c) => c.id === id);

  const filtered = db.veiculos.filter((v) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const cliente = getCliente(v.clienteId);
    return (
      v.placa.toLowerCase().includes(q) ||
      v.modelo.toLowerCase().includes(q) ||
      v.marca.toLowerCase().includes(q) ||
      (cliente && cliente.nome.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Veículos<span className="nexo-section-count">{db.veiculos.length} cadastrados</span></div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("veiculo")}><Plus size={15} /> Novo veículo</button>
      </div>

      <div className="nexo-searchbar" style={{ marginBottom: 16 }}>
        <Search size={15} color="var(--text-faint)" />
        <input placeholder="Pesquisar por placa, modelo ou cliente" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {db.veiculos.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Car} title="Nenhum veículo cadastrado" sub="Clique em “Novo veículo” para começar." /></div>
      ) : filtered.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Search} title="Nenhum resultado" sub="Tente pesquisar por outro termo." /></div>
      ) : (
        <div className="nexo-table-wrap">
          <div className="nexo-table-scroll">
            <table className="nexo-table">
              <thead>
                <tr>
                  <th>Cliente</th><th>Veículo</th><th>Placa</th><th>Ano</th><th>Valor mensal</th><th>Fipe</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const cliente = getCliente(v.clienteId);
                  return (
                    <tr key={v.id} className="nexo-row-link" onClick={() => cliente && onOpenDetail(cliente.id)}>
                      <td style={{ fontWeight: 600 }}>{cliente ? cliente.nome : "—"}</td>
                      <td>{v.marca} {v.modelo}</td>
                      <td className="mono nexo-cell-muted">{v.placa}</td>
                      <td className="nexo-cell-muted">{v.ano || "—"}</td>
                      <td className="mono">{formatBRL(v.valorMensal)}</td>
                      <td className="nexo-cell-muted">{v.codigoFipe ? `${v.codigoFipe} · ${formatBRL(v.valorFipe)}` : "—"}</td>
                      <td><AtivoInativoBadge ativo={v.status} /></td>
                      <td>
                        <div className="nexo-actions-cell" onClick={(e) => e.stopPropagation()}>
                          <button className="nexo-icon-btn" onClick={() => onOpenModal("veiculo", v)}><Pencil size={13} /></button>
                          <button className="nexo-icon-btn" onClick={() => onDeleteVeiculo(v.id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Financeiro                                                           */
/* ------------------------------------------------------------------ */

function FinanceiroView({ db, onOpenModal, onDeleteBoleto, onMarcarPago }) {
  const [fCliente, setFCliente] = useState("");
  const [fCpf, setFCpf] = useState("");
  const [fPlaca, setFPlaca] = useState("");
  const [fStatus, setFStatus] = useState("Todos");
  const [fDe, setFDe] = useState("");
  const [fAte, setFAte] = useState("");
  const [fVencimento, setFVencimento] = useState("Todos");

  const boletosComStatus = db.boletos.map((b) => ({ ...b, status: computeBoletoStatus(b) }));

  const emAberto = boletosComStatus.filter((b) => b.status !== "Pago");
  const aVencer = boletosComStatus.filter((b) => b.status === "A vencer");
  const valorEmAberto = sum(emAberto.map((b) => b.valor));
  const valorAReceber = sum(boletosComStatus.filter((b) => b.status === "A vencer" || b.status === "Em aberto").map((b) => b.valor));
  const valorRecebido = sum(boletosComStatus.filter((b) => b.status === "Pago").map((b) => b.valor));

  const filtered = boletosComStatus.filter((b) => {
    const cliente = db.clientes.find((c) => c.id === b.clienteId);
    const veiculo = db.veiculos.find((v) => v.id === b.veiculoId);
    if (fCliente && !(cliente && cliente.nome.toLowerCase().includes(fCliente.toLowerCase()))) return false;
    if (fCpf && !(cliente && cliente.cpf.replace(/\D/g, "").includes(fCpf.replace(/\D/g, "")))) return false;
    if (fPlaca && !(veiculo && veiculo.placa.toLowerCase().includes(fPlaca.toLowerCase()))) return false;
    if (fStatus !== "Todos" && b.status !== fStatus) return false;
    if (fDe && b.dataVencimento && b.dataVencimento < fDe) return false;
    if (fAte && b.dataVencimento && b.dataVencimento > fAte) return false;
    if (fVencimento !== "Todos" && b.dataVencimento) {
      const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      const venc = parseISODate(b.dataVencimento);
      const diffDays = Math.round((venc - hoje) / 86400000);
      if (fVencimento === "Vencidos" && diffDays >= 0) return false;
      if (fVencimento === "Hoje" && diffDays !== 0) return false;
      if (fVencimento === "Proximos7" && (diffDays < 0 || diffDays > 7)) return false;
      if (fVencimento === "Proximos30" && (diffDays < 0 || diffDays > 30)) return false;
    }
    return true;
  }).sort((a, b) => (a.dataVencimento || "").localeCompare(b.dataVencimento || ""));

  function limparFiltros() {
    setFCliente(""); setFCpf(""); setFPlaca(""); setFStatus("Todos"); setFDe(""); setFAte(""); setFVencimento("Todos");
  }

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Financeiro<span className="nexo-section-count">{db.boletos.length} boletos</span></div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("boleto")}><Plus size={15} /> Novo boleto</button>
      </div>

      <div className="nexo-kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <Kpi icon={FileText} label="Boletos em aberto" value={emAberto.length} tone="info" />
        <Kpi icon={Clock} label="Boletos a vencer" value={aVencer.length} tone="warning" />
        <Kpi icon={Wallet} label="Valor em aberto" value={formatBRL(valorEmAberto)} tone="info" />
        <Kpi icon={Receipt} label="Valor recebido" value={formatBRL(valorRecebido)} tone="success" />
      </div>

      <div className="nexo-filters">
        <div className="nexo-filter-field">
          <label>Cliente</label>
          <input className="nexo-input" value={fCliente} onChange={(e) => setFCliente(e.target.value)} placeholder="Nome" />
        </div>
        <div className="nexo-filter-field">
          <label>CPF</label>
          <input className="nexo-input mono" value={fCpf} onChange={(e) => setFCpf(e.target.value)} placeholder="000.000.000-00" />
        </div>
        <div className="nexo-filter-field">
          <label>Placa</label>
          <input className="nexo-input mono" value={fPlaca} onChange={(e) => setFPlaca(e.target.value)} placeholder="ABC1D23" />
        </div>
        <div className="nexo-filter-field">
          <label>Status</label>
          <select className="nexo-select" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option>Todos</option><option>Pago</option><option>Em aberto</option><option>A vencer</option><option>Vencido</option>
          </select>
        </div>
        <div className="nexo-filter-field">
          <label>Período (de)</label>
          <input type="date" className="nexo-input" value={fDe} onChange={(e) => setFDe(e.target.value)} />
        </div>
        <div className="nexo-filter-field">
          <label>Período (até)</label>
          <input type="date" className="nexo-input" value={fAte} onChange={(e) => setFAte(e.target.value)} />
        </div>
        <div className="nexo-filter-field">
          <label>Vencimento</label>
          <select className="nexo-select" value={fVencimento} onChange={(e) => setFVencimento(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Vencidos">Vencidos</option>
            <option value="Hoje">Vence hoje</option>
            <option value="Proximos7">Próximos 7 dias</option>
            <option value="Proximos30">Próximos 30 dias</option>
          </select>
        </div>
        <button className="nexo-btn nexo-btn-ghost nexo-btn-sm" onClick={limparFiltros}><RotateCcw size={13} /> Limpar</button>
      </div>

      {db.boletos.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Receipt} title="Nenhum boleto cadastrado" sub="Clique em “Novo boleto” para lançar o primeiro recebimento." /></div>
      ) : filtered.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={ListFilter} title="Nenhum boleto encontrado" sub="Ajuste os filtros para ver outros resultados." /></div>
      ) : (
        <div className="nexo-table-wrap">
          <div className="nexo-table-scroll">
            <table className="nexo-table">
              <thead>
                <tr><th>Cliente</th><th>Veículo</th><th>Placa</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const cliente = db.clientes.find((c) => c.id === b.clienteId);
                  const veiculo = db.veiculos.find((v) => v.id === b.veiculoId);
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{cliente ? cliente.nome : "—"}</td>
                      <td className="nexo-cell-muted">{veiculo ? `${veiculo.marca} ${veiculo.modelo}` : "—"}</td>
                      <td className="mono nexo-cell-muted">{veiculo ? veiculo.placa : "—"}</td>
                      <td>{formatDateBR(b.dataVencimento)}</td>
                      <td className="mono">{formatBRL(b.valor)}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td>
                        <div className="nexo-actions-cell">
                          {b.status !== "Pago" && (
                            <button className="nexo-btn nexo-btn-sm" onClick={() => onMarcarPago(b.id)}>Marcar pago</button>
                          )}
                          <button className="nexo-icon-btn" onClick={() => onOpenModal("boleto", b)}><Pencil size={13} /></button>
                          <button className="nexo-icon-btn" onClick={() => onDeleteBoleto(b.id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Detalhe do cliente                                                   */
/* ------------------------------------------------------------------ */

function ClienteDetailView({ db, clienteId, onBack, onOpenModal, onDeleteVeiculo, onMarcarPago }) {
  const cliente = db.clientes.find((c) => c.id === clienteId);
  if (!cliente) return <EmptyState icon={Users} title="Cliente não encontrado" sub="Ele pode ter sido removido." />;

  const veiculosDoCliente = db.veiculos.filter((v) => v.clienteId === clienteId);
  const veiculoIds = veiculosDoCliente.map((v) => v.id);
  const boletosDoCliente = db.boletos.filter((b) => b.clienteId === clienteId || veiculoIds.includes(b.veiculoId)).map((b) => ({ ...b, status: computeBoletoStatus(b) }));

  const pagos = boletosDoCliente.filter((b) => b.status === "Pago");
  const emAberto = boletosDoCliente.filter((b) => b.status !== "Pago");
  const aVencer = boletosDoCliente.filter((b) => b.status === "A vencer");
  const totalEmAberto = sum(emAberto.map((b) => b.valor));
  const totalRecebido = sum(pagos.map((b) => b.valor));

  const iniciais = cliente.nome.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

  return (
    <div>
      <button className="nexo-btn nexo-btn-ghost" style={{ marginBottom: 14 }} onClick={onBack}><ArrowLeft size={15} /> Voltar para clientes</button>

      <div className="nexo-detail-grid">
        <div className="nexo-card">
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <div className="nexo-avatar">{iniciais || "?"}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>{cliente.nome}</div>
              <div style={{ marginTop: 4 }}><AtivoInativoBadge ativo={cliente.status} /></div>
            </div>
          </div>
          <div className="nexo-info-row"><CreditCard size={14} /> <span className="mono">{cliente.cpf || "CPF não informado"}</span></div>
          <div className="nexo-info-row"><Calendar size={14} /> {cliente.nascimento ? formatDateBR(cliente.nascimento) : "Nascimento não informado"}</div>
          <div className="nexo-info-row"><Phone size={14} /> {cliente.telefone || "—"}</div>
          <div className="nexo-info-row"><MessageCircle size={14} /> {cliente.whatsapp || "—"}</div>
          <div className="nexo-info-row"><Mail size={14} /> {cliente.email || "—"}</div>
          <div className="nexo-info-row"><MapPin size={14} /> {cliente.endereco || "—"}{cliente.cep ? ` · CEP ${cliente.cep}` : ""}</div>
          <button className="nexo-btn" style={{ width: "100%", justifyContent: "center", marginTop: 14 }} onClick={() => onOpenModal("cliente", cliente)}>
            <Pencil size={14} /> Editar dados pessoais
          </button>
        </div>

        <div>
          <div className="nexo-mini-kpis">
            <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Boletos pagos</div><div className="nexo-mini-kpi-value">{pagos.length}</div></div>
            <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Boletos em aberto</div><div className="nexo-mini-kpi-value">{emAberto.length}</div></div>
            <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Total em aberto</div><div className="nexo-mini-kpi-value">{formatBRL(totalEmAberto)}</div></div>
            <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Total recebido</div><div className="nexo-mini-kpi-value">{formatBRL(totalRecebido)}</div></div>
          </div>

          <div className="nexo-card" style={{ marginBottom: 14 }}>
            <div className="nexo-section-head" style={{ marginBottom: 12 }}>
              <div className="nexo-chart-title" style={{ marginBottom: 0 }}>Veículos vinculados</div>
              <button className="nexo-btn nexo-btn-sm" onClick={() => onOpenModal("veiculo", null, clienteId)}><Plus size={13} /> Novo veículo</button>
            </div>
            {veiculosDoCliente.length === 0 ? (
              <div className="nexo-empty-sub">Nenhum veículo vinculado a este cliente.</div>
            ) : veiculosDoCliente.map((v) => (
              <div key={v.id} className="nexo-veiculo-card">
                <div className="nexo-veiculo-card-head">
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{v.marca} {v.modelo} {v.ano && `· ${v.ano}`}</div>
                  <AtivoInativoBadge ativo={v.status} />
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12.5, color: "var(--text-dim)" }}>
                  <span className="mono">{v.placa}</span>
                  <span>Mensal: <strong className="mono">{formatBRL(v.valorMensal)}</strong></span>
                  <span>Cadastro: {formatDateBR(v.dataCadastro)}</span>
                  {v.codigoFipe && <span>Fipe: <strong className="mono">{v.codigoFipe}</strong> ({formatBRL(v.valorFipe)})</span>}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button className="nexo-btn nexo-btn-sm" onClick={() => onOpenModal("veiculo", v)}><Pencil size={12} /> Editar</button>
                  <button className="nexo-btn nexo-btn-sm nexo-btn-danger" onClick={() => onDeleteVeiculo(v.id)}><Trash2 size={12} /> Excluir</button>
                  <button className="nexo-btn nexo-btn-sm" onClick={() => onOpenModal("boleto", null, clienteId, v.id)}><Plus size={12} /> Novo boleto</button>
                </div>
              </div>
            ))}
          </div>

          <div className="nexo-card">
            <div className="nexo-chart-title">Boletos do cliente</div>
            <div className="nexo-chart-sub">{boletosDoCliente.length} lançamento(s)</div>
            {boletosDoCliente.length === 0 ? (
              <div className="nexo-empty-sub">Nenhum boleto lançado para este cliente ainda.</div>
            ) : (
              <div className="nexo-table-scroll">
                <table className="nexo-table">
                  <thead><tr><th>Número</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {boletosDoCliente.sort((a, b) => (a.dataVencimento || "").localeCompare(b.dataVencimento || "")).map((b) => (
                      <tr key={b.id}>
                        <td className="mono">{b.numero}</td>
                        <td>{formatDateBR(b.dataVencimento)}</td>
                        <td className="mono">{formatBRL(b.valor)}</td>
                        <td><StatusBadge status={b.status} /></td>
                        <td>
                          <div className="nexo-actions-cell">
                            {b.status !== "Pago" && <button className="nexo-btn nexo-btn-sm" onClick={() => onMarcarPago(b.id)}>Marcar pago</button>}
                            <button className="nexo-icon-btn" onClick={() => onOpenModal("boleto", b)}><Pencil size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App shell                                                            */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "clientes", label: "Clientes", Icon: Users },
  { key: "veiculos", label: "Veículos", Icon: Car },
  { key: "financeiro", label: "Financeiro", Icon: Receipt },
];

const EMPTY_DB = { clientes: [], veiculos: [], boletos: [] };

/* Mapeamento entre o formato usado no app (camelCase) e as colunas do Supabase (snake_case) */
const rowToCliente = (r) => ({
  id: r.id, nome: r.nome || "", nascimento: r.nascimento || "", cpf: r.cpf || "",
  telefone: r.telefone || "", whatsapp: r.whatsapp || "", email: r.email || "",
  cep: r.cep || "", endereco: r.endereco || "", status: r.status || "Ativo",
});
const clienteToRow = (c) => ({
  nome: c.nome, nascimento: c.nascimento || null, cpf: c.cpf || null, telefone: c.telefone || null,
  whatsapp: c.whatsapp || null, email: c.email || null, cep: c.cep || null, endereco: c.endereco || null, status: c.status || "Ativo",
});
const rowToVeiculo = (r) => ({
  id: r.id, clienteId: r.cliente_id, marca: r.marca || "", modelo: r.modelo || "", ano: r.ano || "",
  placa: r.placa || "", chassi: r.chassi || "", valorVeiculo: r.valor_veiculo ?? "", valorMensal: r.valor_mensal ?? "",
  dataCadastro: r.data_cadastro || "", status: r.status || "Ativo",
  codigoFipe: r.codigo_fipe || "", valorFipe: r.valor_fipe ?? "",
});
const veiculoToRow = (v) => ({
  cliente_id: v.clienteId, marca: v.marca, modelo: v.modelo, ano: v.ano || null, placa: v.placa,
  chassi: v.chassi || null, valor_veiculo: v.valorVeiculo === "" ? null : Number(v.valorVeiculo),
  valor_mensal: v.valorMensal === "" ? null : Number(v.valorMensal), data_cadastro: v.dataCadastro || null,
  status: v.status || "Ativo",
  codigo_fipe: v.codigoFipe || null, valor_fipe: v.valorFipe === "" || v.valorFipe == null ? null : Number(v.valorFipe),
});
const rowToBoleto = (r) => ({
  id: r.id, clienteId: r.cliente_id, veiculoId: r.veiculo_id, numero: r.numero || "",
  dataEmissao: r.data_emissao || "", dataVencimento: r.data_vencimento || "", valor: r.valor ?? "",
  dataPagamento: r.data_pagamento || "",
});
const boletoToRow = (b) => ({
  cliente_id: b.clienteId, veiculo_id: b.veiculoId, numero: b.numero, data_emissao: b.dataEmissao || null,
  data_vencimento: b.dataVencimento || null, valor: Number(b.valor), data_pagamento: b.dataPagamento || null,
});

export default function App() {
  const [db, setDb] = useState(EMPTY_DB);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState("dashboard");
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const [modal, setModal] = useState(null); // { type, data, defaultClienteId, defaultVeiculoId }
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const carregarTudo = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [clientesRes, veiculosRes, boletosRes] = await Promise.all([
        supabase.from("clientes").select("*").order("nome"),
        supabase.from("veiculos").select("*"),
        supabase.from("boletos").select("*"),
      ]);
      if (clientesRes.error) throw clientesRes.error;
      if (veiculosRes.error) throw veiculosRes.error;
      if (boletosRes.error) throw boletosRes.error;
      setDb({
        clientes: (clientesRes.data || []).map(rowToCliente),
        veiculos: (veiculosRes.data || []).map(rowToVeiculo),
        boletos: (boletosRes.data || []).map(rowToBoleto),
      });
    } catch (e) {
      console.error(e);
      setLoadError(e.message || "Não foi possível conectar ao banco de dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  const closeModal = () => setModal(null);
  const openModal = (type, data = null, defaultClienteId = null, defaultVeiculoId = null) =>
    setModal({ type, data, defaultClienteId, defaultVeiculoId });

  const saveCliente = async (cliente) => {
    try {
      if (cliente.id) {
        const { data, error } = await supabase.from("clientes").update(clienteToRow(cliente)).eq("id", cliente.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, clientes: prev.clientes.map((c) => (c.id === data.id ? rowToCliente(data) : c)) }));
      } else {
        const { data, error } = await supabase.from("clientes").insert(clienteToRow(cliente)).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, clientes: [...prev.clientes, rowToCliente(data)] }));
      }
      closeModal();
    } catch (e) {
      alert("Não foi possível salvar o cliente: " + e.message);
    }
  };

  const saveVeiculo = async (veiculo) => {
    try {
      if (veiculo.id) {
        const { data, error } = await supabase.from("veiculos").update(veiculoToRow(veiculo)).eq("id", veiculo.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, veiculos: prev.veiculos.map((v) => (v.id === data.id ? rowToVeiculo(data) : v)) }));
      } else {
        const { data, error } = await supabase.from("veiculos").insert(veiculoToRow(veiculo)).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, veiculos: [...prev.veiculos, rowToVeiculo(data)] }));
      }
      closeModal();
    } catch (e) {
      alert("Não foi possível salvar o veículo: " + e.message);
    }
  };

  const saveBoleto = async (boleto) => {
    try {
      if (boleto.id) {
        const { data, error } = await supabase.from("boletos").update(boletoToRow(boleto)).eq("id", boleto.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, boletos: prev.boletos.map((b) => (b.id === data.id ? rowToBoleto(data) : b)) }));
      } else {
        const { data, error } = await supabase.from("boletos").insert(boletoToRow(boleto)).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, boletos: [...prev.boletos, rowToBoleto(data)] }));
      }
      closeModal();
    } catch (e) {
      alert("Não foi possível salvar o boleto: " + e.message);
    }
  };

  const deleteCliente = async (id) => {
    if (!window.confirm("Excluir este cliente? Os veículos e boletos vinculados também serão removidos.")) return;
    try {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => {
        const veiculoIds = prev.veiculos.filter((v) => v.clienteId === id).map((v) => v.id);
        return {
          clientes: prev.clientes.filter((c) => c.id !== id),
          veiculos: prev.veiculos.filter((v) => v.clienteId !== id),
          boletos: prev.boletos.filter((b) => b.clienteId !== id && !veiculoIds.includes(b.veiculoId)),
        };
      });
      if (selectedClienteId === id) { setSelectedClienteId(null); setView("clientes"); }
    } catch (e) {
      alert("Não foi possível excluir o cliente: " + e.message);
    }
  };

  const deleteVeiculo = async (id) => {
    if (!window.confirm("Excluir este veículo? Os boletos vinculados também serão removidos.")) return;
    try {
      const { error } = await supabase.from("veiculos").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({
        ...prev,
        veiculos: prev.veiculos.filter((v) => v.id !== id),
        boletos: prev.boletos.filter((b) => b.veiculoId !== id),
      }));
    } catch (e) {
      alert("Não foi possível excluir o veículo: " + e.message);
    }
  };

  const deleteBoleto = async (id) => {
    if (!window.confirm("Excluir este boleto?")) return;
    try {
      const { error } = await supabase.from("boletos").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, boletos: prev.boletos.filter((b) => b.id !== id) }));
    } catch (e) {
      alert("Não foi possível excluir o boleto: " + e.message);
    }
  };

  const marcarPago = async (id) => {
    try {
      const { data, error } = await supabase.from("boletos").update({ data_pagamento: todayISO() }).eq("id", id).select().single();
      if (error) throw error;
      setDb((prev) => ({ ...prev, boletos: prev.boletos.map((b) => (b.id === id ? rowToBoleto(data) : b)) }));
    } catch (e) {
      alert("Não foi possível atualizar o boleto: " + e.message);
    }
  };

  const openDetail = (clienteId) => { setSelectedClienteId(clienteId); setView("clienteDetail"); };

  const goTo = (v) => { setView(v); setSidebarOpen(false); };

  const titleMap = { dashboard: "Dashboard", clientes: "Clientes", veiculos: "Veículos", financeiro: "Financeiro", clienteDetail: "Detalhes do cliente" };

  return (
    <div className="nexo">
      <style>{STYLE}</style>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--text-dim)", fontSize: 13 }}>
          Carregando dados…
        </div>
      ) : loadError ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--text-dim)", fontSize: 13, padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--danger)", fontWeight: 600 }}>Não foi possível conectar ao banco de dados</div>
          <div style={{ maxWidth: 420 }}>{loadError}</div>
          <div style={{ fontSize: 12 }}>Confira se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretas e se as tabelas foram criadas.</div>
          <button className="nexo-btn nexo-btn-primary" onClick={carregarTudo}>Tentar novamente</button>
        </div>
      ) : (
        <div className="nexo-shell">
          <div className={`nexo-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
          <aside className={`nexo-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="nexo-brand">
              <div className="nexo-brand-mark">NX</div>
              <div>
                <div className="nexo-brand-name">Nexo Gestão</div>
                <div className="nexo-brand-tag">Clientes · Veículos · Financeiro</div>
              </div>
            </div>
            <nav className="nexo-nav">
              {NAV_ITEMS.map(({ key, label, Icon }) => (
                <div
                  key={key}
                  className={`nexo-nav-item ${view === key || (view === "clienteDetail" && key === "clientes") ? "active" : ""}`}
                  onClick={() => goTo(key)}
                >
                  <Icon size={16} /> {label}
                </div>
              ))}
            </nav>
            <div className="nexo-sidebar-foot">Dados salvos automaticamente neste navegador.</div>
          </aside>

          <div className="nexo-main">
            <header className="nexo-topbar">
              <div className="nexo-topbar-title">
                <button className="nexo-hamburger" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
                {titleMap[view]}
              </div>
              <div className="nexo-topbar-actions hide-mobile">
                <button className="nexo-btn nexo-btn-sm" onClick={() => openModal("cliente")}><Plus size={13} /> Cliente</button>
                <button className="nexo-btn nexo-btn-sm" onClick={() => openModal("veiculo")}><Plus size={13} /> Veículo</button>
                <button className="nexo-btn nexo-btn-sm nexo-btn-primary" onClick={() => openModal("boleto")}><Plus size={13} /> Boleto</button>
              </div>
            </header>

            <main className="nexo-content">
              {view === "dashboard" && <Dashboard db={db} onOpenModal={openModal} />}
              {view === "clientes" && (
                <ClientesView db={db} onOpenModal={openModal} onDeleteCliente={deleteCliente} onOpenDetail={openDetail} />
              )}
              {view === "veiculos" && (
                <VeiculosView db={db} onOpenModal={openModal} onDeleteVeiculo={deleteVeiculo} onOpenDetail={openDetail} />
              )}
              {view === "financeiro" && (
                <FinanceiroView db={db} onOpenModal={openModal} onDeleteBoleto={deleteBoleto} onMarcarPago={marcarPago} />
              )}
              {view === "clienteDetail" && (
                <ClienteDetailView
                  db={db}
                  clienteId={selectedClienteId}
                  onBack={() => goTo("clientes")}
                  onOpenModal={openModal}
                  onDeleteVeiculo={deleteVeiculo}
                  onMarcarPago={marcarPago}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {modal && modal.type === "cliente" && (
        <Modal title={modal.data ? "Editar cliente" : "Novo cliente"} onClose={closeModal}>
          <ClienteForm initial={modal.data} onSave={saveCliente} onCancel={closeModal} />
        </Modal>
      )}
      {modal && modal.type === "veiculo" && (
        <Modal title={modal.data ? "Editar veículo" : "Novo veículo"} onClose={closeModal} wide>
          <VeiculoForm initial={modal.data} clientes={db.clientes} defaultClienteId={modal.defaultClienteId} onSave={saveVeiculo} onCancel={closeModal} />
        </Modal>
      )}
      {modal && modal.type === "boleto" && (
        <Modal title={modal.data ? "Editar boleto" : "Novo boleto"} onClose={closeModal} wide>
          <BoletoForm
            initial={modal.data}
            clientes={db.clientes}
            veiculos={db.veiculos}
            defaultClienteId={modal.defaultClienteId}
            defaultVeiculoId={modal.defaultVeiculoId}
            onSave={saveBoleto}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}
