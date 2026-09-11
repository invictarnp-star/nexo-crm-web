import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";
import jsPDF from "jspdf";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  LayoutDashboard, Users, Car, Receipt, Plus, Search, X, Pencil, Trash2,
  Phone, Mail, MapPin, Calendar, CheckCircle2, XCircle, AlertTriangle,
  Menu, ArrowLeft, Clock, FileText, Wallet, TrendingUp, ChevronRight,
  CreditCard, MessageCircle, ListFilter, RotateCcw, Eye, Upload, Shield, FileDown, Printer,
  Link2, ExternalLink
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

/* ------------------------------------------------------------------ */
/* Tela de login                                                        */
/* ------------------------------------------------------------------ */
.nexo-login-page { min-height: 100vh; width: 100%; display: flex; flex-direction: column; background: var(--ink); }
.nexo-login-body { flex: 1; display: flex; min-height: 0; }
.nexo-login-hero {
  flex: 1.15; position: relative; overflow: hidden; display: flex; flex-direction: column;
  justify-content: space-between; padding: 56px 60px 44px;
  background:
    radial-gradient(1100px 760px at 18% 12%, rgba(62,134,191,0.32), transparent 58%),
    radial-gradient(900px 680px at 88% 90%, rgba(52,177,114,0.16), transparent 55%),
    linear-gradient(160deg, #0B1015 0%, #0F1822 46%, #14263A 100%);
}
.nexo-login-hero-blob {
  position: absolute; border-radius: 50%; filter: blur(70px); opacity: 0.55; pointer-events: none;
}
.nexo-login-hero-blob.b1 { width: 340px; height: 340px; background: var(--accent); top: -120px; left: -100px; }
.nexo-login-hero-blob.b2 { width: 300px; height: 300px; background: var(--success); bottom: -140px; right: -80px; opacity: 0.28; }
.nexo-login-skyline { position: absolute; left: 0; right: 0; bottom: 0; height: 130px; display: flex; align-items: flex-end; gap: 3px; padding: 0 0 0 0; opacity: 0.5; }
.nexo-login-skyline span { display: block; flex: 1; background: linear-gradient(180deg, rgba(233,238,243,0.14), rgba(233,238,243,0.03)); border-top: 1px solid rgba(233,238,243,0.12); }
.nexo-login-hero-content { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; }
.nexo-login-brand { display: flex; align-items: center; gap: 14px; animation: nexoLoginFade .7s ease both; }
.nexo-login-brand-mark {
  width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-dim)); box-shadow: 0 10px 26px rgba(62,134,191,0.45);
}
.nexo-login-brand-name { font-size: 25px; font-weight: 800; letter-spacing: 1px; line-height: 1.15; }
.nexo-login-brand-tagline { font-size: 12.5px; color: var(--text-dim); margin-top: 3px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; }
.nexo-login-hero-mid { margin: auto 0; max-width: 520px; animation: nexoLoginFade .8s ease .1s both; }
.nexo-login-quote { font-size: 36px; font-weight: 700; line-height: 1.3; letter-spacing: -0.5px; color: var(--text); }
.nexo-login-quote span { color: var(--accent); }
.nexo-login-hero-icons { display: flex; align-items: center; gap: 18px; margin-top: 26px; color: var(--text-faint); }
.nexo-login-hero-icons .item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; }
.nexo-login-hero-icons svg { color: var(--accent); }
.nexo-login-hero-foot { position: relative; z-index: 2; font-size: 12px; color: var(--text-faint); animation: nexoLoginFade .9s ease .15s both; }

.nexo-login-panel {
  flex: 0 0 460px; display: flex; align-items: center; justify-content: center; padding: 40px 44px; position: relative;
  background: radial-gradient(600px 500px at 50% 40%, rgba(62,134,191,0.07), transparent 65%), var(--ink);
}
.nexo-login-card {
  width: 100%; max-width: 380px; background: var(--surface); border: 1px solid var(--border-soft);
  border-radius: 20px; padding: 40px 34px 32px; box-shadow: 0 30px 70px -24px rgba(0,0,0,0.65);
  animation: nexoLoginUp .6s cubic-bezier(.16,1,.3,1) .05s both;
}
.nexo-login-eyebrow { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); font-weight: 700; margin-bottom: 10px; }
.nexo-login-card h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.4px; margin: 0 0 6px; }
.nexo-login-card p.sub { font-size: 13.5px; color: var(--text-dim); margin: 0 0 26px; }
.nexo-login-fields { display: flex; flex-direction: column; gap: 16px; }
.nexo-login-forgot-row { display: flex; justify-content: flex-end; margin-top: 12px; }
.nexo-login-link { font-size: 12.5px; color: var(--accent); cursor: pointer; background: none; border: none; font-family: inherit; padding: 0; }
.nexo-login-link:hover { text-decoration: underline; }
.nexo-login-submit { width: 100%; justify-content: center; margin-top: 22px; padding: 12px; font-size: 13.5px; letter-spacing: .6px; text-transform: uppercase; }
.nexo-login-alert { border-radius: 9px; padding: 10px 12px; font-size: 12.5px; margin-top: 16px; line-height: 1.5; }
.nexo-login-alert.err { background: var(--danger-soft); color: var(--danger); }
.nexo-login-alert.ok { background: var(--success-soft); color: var(--success); }
.nexo-login-back { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text-dim); background: none; border: none; cursor: pointer; font-family: inherit; margin-bottom: 18px; padding: 0; }
.nexo-login-back:hover { color: var(--text); }
.nexo-login-page-foot { text-align: center; font-size: 11px; color: var(--text-faint); padding: 16px 20px 20px; line-height: 1.7; border-top: 1px solid var(--border-soft); background: var(--ink); }

@keyframes nexoLoginFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@keyframes nexoLoginUp { from { opacity: 0; transform: translateY(22px) scale(.98); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .nexo-login-card, .nexo-login-brand, .nexo-login-hero-mid, .nexo-login-hero-foot { animation: none; }
}

/* Responsive */
@media (max-width: 1024px) {
  .nexo-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .nexo-charts-grid { grid-template-columns: 1fr; }
  .nexo-detail-grid { grid-template-columns: 1fr; }
  .nexo-login-hero { padding: 44px 40px; }
  .nexo-login-panel { flex-basis: 400px; padding: 32px; }
}
@media (max-width: 860px) {
  .nexo-login-body { flex-direction: column; }
  .nexo-login-hero { flex: none; min-height: 240px; padding: 30px 26px; }
  .nexo-login-hero-mid { margin: 16px 0; }
  .nexo-login-quote { font-size: 21px; }
  .nexo-login-hero-icons { display: none; }
  .nexo-login-skyline { height: 70px; }
  .nexo-login-panel { flex: 1; padding: 26px 20px 34px; }
  .nexo-login-card { padding: 30px 24px 26px; border-radius: 16px; }
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
@media (max-width: 420px) {
  .nexo-login-card { padding: 26px 18px 22px; }
  .nexo-login-brand-name { font-size: 21px; }
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
function maskCpfCnpj(v) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) return maskCPF(d);
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
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

function normalizarTexto(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizarCabecalho(s) {
  return normalizarTexto(s).replace(/[^a-z0-9]/g, "");
}

/** Converte dd/mm/aaaa (ou aaaa-mm-dd já pronto) para o formato aaaa-mm-dd usado nos inputs de data. */
function paraDataISO(v) {
  const s = (v || "").toString().trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "";
}

function paraNumero(v) {
  if (v == null || v === "") return "";
  const s = String(v).trim().replace(/[^\d,.-]/g, "");
  if (!s) return "";
  const normalizado = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normalizado);
  return isNaN(n) ? "" : n;
}

/** Parser simples de CSV, com suporte a ; ou , como separador e campos entre aspas. */
function parseCSVTexto(texto) {
  const linhaLimpa = texto.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  if (!linhaLimpa) return { cabecalhos: [], linhas: [] };
  const primeiraLinha = linhaLimpa.split("\n")[0];
  const separador = (primeiraLinha.match(/;/g) || []).length >= (primeiraLinha.match(/,/g) || []).length ? ";" : ",";

  function parseLinha(linha) {
    const campos = [];
    let atual = "";
    let dentroAspas = false;
    for (let i = 0; i < linha.length; i++) {
      const ch = linha[i];
      if (ch === '"') {
        if (dentroAspas && linha[i + 1] === '"') { atual += '"'; i++; }
        else dentroAspas = !dentroAspas;
      } else if (ch === separador && !dentroAspas) {
        campos.push(atual);
        atual = "";
      } else {
        atual += ch;
      }
    }
    campos.push(atual);
    return campos.map((c) => c.trim());
  }

  const todasLinhas = linhaLimpa.split("\n").filter((l) => l.trim() !== "");
  const cabecalhos = parseLinha(todasLinhas[0]).map(normalizarCabecalho);
  const linhas = todasLinhas.slice(1).map(parseLinha);
  return { cabecalhos, linhas };
}

function valorDaColuna(cabecalhos, linha, candidatos) {
  for (const cand of candidatos) {
    const idx = cabecalhos.indexOf(cand);
    if (idx !== -1 && linha[idx] !== undefined) return linha[idx];
  }
  return "";
}

function lerArquivoTexto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
}

function exportarCSV(nomeArquivo, colunas, linhas) {
  const escapar = (v) => {
    const s = v == null ? "" : String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const cabecalho = colunas.map((c) => escapar(c.titulo)).join(";");
  const corpo = linhas.map((linha) => colunas.map((c) => escapar(c.valor(linha))).join(";")).join("\n");
  const csv = "\uFEFF" + cabecalho + "\n" + corpo;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

function ImportCSVButton({ label, onArquivoSelecionado, disabled }) {
  const inputRef = React.useRef(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onArquivoSelecionado(file);
          e.target.value = "";
        }}
      />
      <button type="button" className="nexo-btn" disabled={disabled} onClick={() => inputRef.current?.click()}>
        <Upload size={14} /> {label}
      </button>
    </>
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
    initial || {
      nome: "", nascimento: "", sexo: "", cpf: "", cnhNumero: "", cnhEmissao: "", cnhValidade: "",
      telefone: "", whatsapp: "", email: "", cep: "", endereco: "", status: "Ativo",
    }
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
    if (!f.cpf.trim()) errs.cpf = "Informe o CPF ou CNPJ.";
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
        <Field label="Sexo">
          <select className="nexo-select" value={f.sexo} onChange={set("sexo")}>
            <option value="">Não informado</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </Field>
      </div>
      <Field label="CPF ou CNPJ *" error={errors.cpf}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            className="nexo-input mono"
            value={f.cpf}
            onChange={(e) => setF({ ...f, cpf: maskCpfCnpj(e.target.value) })}
            onBlur={() => f.cpf.replace(/\D/g, "").length === 11 && buscarCpf()}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
          <button type="button" className="nexo-btn nexo-btn-sm" disabled={buscandoCpf || !f.cpf.trim()} onClick={buscarCpf}>
            {buscandoCpf ? "Buscando…" : "Buscar dados"}
          </button>
        </div>
      </Field>
      {cpfMsg && (
        <div style={{ fontSize: 12, color: cpfMsg.includes("preenchidos") ? "var(--success)" : "var(--warning)", marginTop: -8 }}>
          {cpfMsg}
        </div>
      )}
      <div className="nexo-field-row3">
        <Field label="CNH (número)">
          <input className="nexo-input mono" value={f.cnhNumero} onChange={set("cnhNumero")} placeholder="Número da CNH" />
        </Field>
        <Field label="CNH - emissão">
          <input type="date" className="nexo-input" value={f.cnhEmissao} onChange={set("cnhEmissao")} />
        </Field>
        <Field label="CNH - validade">
          <input type="date" className="nexo-input" value={f.cnhValidade} onChange={set("cnhValidade")} />
        </Field>
      </div>
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
      clienteId: defaultClienteId || "", tipoVeiculo: "Carro ou utilitário", marca: "", modelo: "", ano: "", anoFabricacao: "",
      placa: "", renavam: "", chassi: "", cor: "", cambio: "", combustivel: "", quilometragem: "", numeroMotor: "",
      estadoCirculacao: "", cidadeCirculacao: "", veiculoTrabalho: false, diaVencimento: "", depreciacao: "",
      valorVeiculo: "", valorCoberto: "", valorMensal: "", dataCadastro: todayISO(), status: "Ativo",
      codigoFipe: "", valorFipe: "", fipeCombustivel: "", fipeMesReferencia: "", fipeUltimaConsulta: "",
    }
  );
  const [errors, setErrors] = useState({});
  const [buscando, setBuscando] = useState(false);
  const [buscaMsg, setBuscaMsg] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setBool = (k) => (e) => setF({ ...f, [k]: e.target.checked });

  // --- Consulta Fipe por Marca → Modelo → Ano (sempre via /api/fipe, nunca direto do navegador) ---
  const [fipeMarcas, setFipeMarcas] = useState([]);
  const [fipeModelos, setFipeModelos] = useState([]);
  const [fipeAnos, setFipeAnos] = useState([]);
  const [fipeMarcaSel, setFipeMarcaSel] = useState("");
  const [fipeModeloSel, setFipeModeloSel] = useState("");
  const [fipeAnoSel, setFipeAnoSel] = useState("");
  const [buscandoFipe, setBuscandoFipe] = useState(false);
  const [fipeMsg, setFipeMsg] = useState("");
  const ultimaConsultaFipeRef = useRef("");

  useEffect(() => {
    fetch("/api/fipe?action=marcas")
      .then((r) => r.json())
      .then((lista) => Array.isArray(lista) && setFipeMarcas(lista))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!fipeMarcaSel) { setFipeModelos([]); return; }
    setFipeModeloSel("");
    setFipeAnos([]);
    setFipeAnoSel("");
    fetch(`/api/fipe?action=modelos&marca=${fipeMarcaSel}`)
      .then((r) => r.json())
      .then((lista) => Array.isArray(lista) && setFipeModelos(lista))
      .catch(() => {});
  }, [fipeMarcaSel]);

  useEffect(() => {
    if (!fipeMarcaSel || !fipeModeloSel) { setFipeAnos([]); return; }
    setFipeAnoSel("");
    fetch(`/api/fipe?action=anos&marca=${fipeMarcaSel}&modelo=${fipeModeloSel}`)
      .then((r) => r.json())
      .then((lista) => Array.isArray(lista) && setFipeAnos(lista))
      .catch(() => {});
  }, [fipeModeloSel]);

  async function consultarFipe() {
    if (!fipeMarcaSel || !fipeModeloSel || !fipeAnoSel) return;
    const chave = `${fipeMarcaSel}-${fipeModeloSel}-${fipeAnoSel}`;
    if (chave === ultimaConsultaFipeRef.current && f.valorFipe) {
      setFipeMsg("Esse veículo já foi consultado agora há pouco — usando o valor já carregado.");
      return;
    }
    setBuscandoFipe(true);
    setFipeMsg("");
    try {
      const resp = await fetch(`/api/fipe?action=valor&marca=${fipeMarcaSel}&modelo=${fipeModeloSel}&ano=${fipeAnoSel}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || "Não foi possível consultar a Tabela Fipe neste momento. Tente novamente.");
      ultimaConsultaFipeRef.current = chave;
      setF((prev) => ({
        ...prev,
        marca: data.marca || prev.marca,
        modelo: data.modelo || prev.modelo,
        ano: String(data.ano || prev.ano).slice(0, 4),
        codigoFipe: data.codigoFipe || prev.codigoFipe,
        valorFipe: data.valor != null ? data.valor : prev.valorFipe,
        fipeCombustivel: data.combustivel || prev.fipeCombustivel,
        fipeMesReferencia: data.mesReferencia || prev.fipeMesReferencia,
        fipeUltimaConsulta: todayISO(),
      }));
      setFipeMsg(`Valor Fipe encontrado (referência: ${data.mesReferencia || "—"}).`);
    } catch (e) {
      setFipeMsg("Não foi possível consultar a Tabela Fipe neste momento. Tente novamente.");
    } finally {
      setBuscandoFipe(false);
    }
  }

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

      <div className="nexo-field-row3">
        <Field label="Tipo de veículo">
          <select className="nexo-select" value={f.tipoVeiculo} onChange={set("tipoVeiculo")}>
            <option>Carro ou utilitário</option>
            <option>Moto</option>
            <option>Caminhão</option>
            <option>Ônibus / Van</option>
            <option>Outro</option>
          </select>
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
              style={{ flex: 1 }}
            />
            <button type="button" className="nexo-icon-btn" title="Consultar dados pela placa" disabled={buscando || !f.placa.trim()} onClick={() => buscarDadosVeiculo(false)}>
              <Search size={14} />
            </button>
          </div>
        </Field>
        <Field label="Chassi">
          <div style={{ display: "flex", gap: 6 }}>
            <input className="nexo-input mono" value={f.chassi} onChange={set("chassi")} placeholder="Número do chassi" style={{ flex: 1 }} />
            <button type="button" className="nexo-icon-btn" title="Buscar por chassi" disabled={buscando || !f.chassi.trim()} onClick={() => buscarDadosVeiculo(true)}>
              <Search size={14} />
            </button>
          </div>
        </Field>
      </div>
      {buscaMsg && (
        <div style={{ fontSize: 12, color: buscaMsg.includes("encontrado") ? "var(--success)" : "var(--warning)", marginTop: -6 }}>
          {buscaMsg}
        </div>
      )}

      <div className="nexo-field-row3">
        <Field label="Renavam">
          <input className="nexo-input mono" value={f.renavam} onChange={set("renavam")} placeholder="Número do Renavam" />
        </Field>
        <Field label="Marca *" error={errors.marca}>
          <input className="nexo-input" value={f.marca} onChange={set("marca")} placeholder="Ex.: Fiat" />
        </Field>
        <Field label="Ano modelo">
          <input className="nexo-input mono" value={f.ano} onChange={set("ano")} placeholder="2022" maxLength={4} />
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Modelo *" error={errors.modelo}>
          <input className="nexo-input" value={f.modelo} onChange={set("modelo")} placeholder="Ex.: Argo" />
        </Field>
        <Field label="Ano fabricação">
          <input className="nexo-input mono" value={f.anoFabricacao} onChange={set("anoFabricacao")} placeholder="2021" maxLength={4} />
        </Field>
      </div>

      <div className="nexo-card" style={{ background: "var(--surface-2)", padding: 14 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 10, color: "var(--text-dim)" }}>
          Consultar Tabela Fipe (Marca → Modelo → Ano)
        </div>
        <div className="nexo-field-row3">
          <Field label="Marca (Fipe)">
            <select className="nexo-select" value={fipeMarcaSel} onChange={(e) => setFipeMarcaSel(e.target.value)}>
              <option value="">Selecione</option>
              {fipeMarcas.map((m) => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
            </select>
          </Field>
          <Field label="Modelo (Fipe)">
            <select className="nexo-select" value={fipeModeloSel} onChange={(e) => setFipeModeloSel(e.target.value)} disabled={!fipeMarcaSel}>
              <option value="">{fipeMarcaSel ? "Selecione" : "Escolha a marca"}</option>
              {fipeModelos.map((m) => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
            </select>
          </Field>
          <Field label="Ano (Fipe)">
            <select className="nexo-select" value={fipeAnoSel} onChange={(e) => setFipeAnoSel(e.target.value)} disabled={!fipeModeloSel}>
              <option value="">{fipeModeloSel ? "Selecione" : "Escolha o modelo"}</option>
              {fipeAnos.map((a) => <option key={a.codigo} value={a.codigo}>{a.nome}</option>)}
            </select>
          </Field>
        </div>
        <button
          type="button"
          className="nexo-btn nexo-btn-sm"
          style={{ marginTop: 10 }}
          disabled={buscandoFipe || !fipeAnoSel}
          onClick={consultarFipe}
        >
          {buscandoFipe ? "Consultando…" : "🔎 Consultar Fipe"}
        </button>
        {fipeMsg && (
          <div style={{ fontSize: 12, marginTop: 8, color: fipeMsg.includes("encontrado") || fipeMsg.includes("carregado") ? "var(--success)" : "var(--warning)" }}>
            {fipeMsg}
          </div>
        )}
      </div>

      <div className="nexo-field-row3">
        <Field label="Código Fipe">
          <input className="nexo-input mono" value={f.codigoFipe} readOnly placeholder="Preenchido pela busca" />
        </Field>
        <Field label="Valor Fipe">
          <div style={{ display: "flex", gap: 6 }}>
            <input className="nexo-input mono" value={f.valorFipe ? formatBRL(f.valorFipe) : ""} readOnly placeholder="Preenchido pela busca" style={{ flex: 1 }} />
          </div>
        </Field>
        <Field label="Valor Coberto">
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorCoberto} onChange={set("valorCoberto")} placeholder="0,00" />
            {f.valorFipe ? (
              <button type="button" className="nexo-btn nexo-btn-sm" title="Usar valor Fipe" onClick={() => setF({ ...f, valorCoberto: f.valorFipe })}>
                Usar Fipe
              </button>
            ) : null}
          </div>
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Mês de referência (Fipe)">
          <input className="nexo-input" value={f.fipeMesReferencia} readOnly placeholder="—" />
        </Field>
        <Field label="Última consulta Fipe">
          <input className="nexo-input" value={f.fipeUltimaConsulta ? formatDateBR(f.fipeUltimaConsulta) : "—"} readOnly />
        </Field>
      </div>

      <Field label="Depreciação">
        <select className="nexo-select" value={f.depreciacao} onChange={set("depreciacao")}>
          <option value="">Selecione</option>
          <option value="Nenhuma">Nenhuma</option>
          <option value="Linear mensal">Linear mensal</option>
          <option value="Tabela seguradora">Conforme tabela da seguradora</option>
        </select>
      </Field>

      <div className="nexo-field-row3">
        <Field label="Dia de vencimento">
          <select className="nexo-select" value={f.diaVencimento} onChange={set("diaVencimento")}>
            <option value="">Selecione</option>
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Cor">
          <input className="nexo-input" value={f.cor} onChange={set("cor")} placeholder="Ex.: Prata" />
        </Field>
        <Field label="Câmbio">
          <select className="nexo-select" value={f.cambio} onChange={set("cambio")}>
            <option value="">Selecione</option>
            <option>Manual</option>
            <option>Automático</option>
          </select>
        </Field>
      </div>

      <div className="nexo-field-row3">
        <Field label="Combustível">
          <select className="nexo-select" value={f.combustivel} onChange={set("combustivel")}>
            <option value="">Selecione</option>
            <option>Flex</option>
            <option>Gasolina</option>
            <option>Etanol</option>
            <option>Diesel</option>
            <option>Elétrico</option>
            <option>Híbrido</option>
            <option>GNV</option>
          </select>
        </Field>
        <Field label="Quilometragem">
          <input type="number" min="0" className="nexo-input" value={f.quilometragem} onChange={set("quilometragem")} placeholder="0" />
        </Field>
        <Field label="Número do motor">
          <input className="nexo-input mono" value={f.numeroMotor} onChange={set("numeroMotor")} placeholder="Número do motor" />
        </Field>
      </div>

      <div className="nexo-field-row">
        <Field label="Estado de circulação">
          <input className="nexo-input" value={f.estadoCirculacao} onChange={set("estadoCirculacao")} placeholder="Ex.: São Paulo" />
        </Field>
        <Field label="Cidade de circulação">
          <input className="nexo-input" value={f.cidadeCirculacao} onChange={set("cidadeCirculacao")} placeholder="Ex.: São José dos Campos" />
        </Field>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-dim)", cursor: "pointer" }}>
        <input type="checkbox" checked={f.veiculoTrabalho} onChange={setBool("veiculoTrabalho")} />
        Veículo de trabalho (Táxi/Uber)
      </label>

      <div className="nexo-field-row">
        <Field label="Valor do veículo">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorVeiculo} onChange={set("valorVeiculo")} placeholder="0,00" />
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

function BoletoForm({ initial, clientes, veiculos, boletos, defaultClienteId, defaultVeiculoId, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      clienteId: defaultClienteId || "", veiculoId: defaultVeiculoId || "", numero: "", nossoNumero: "",
      dataEmissao: todayISO(), dataVencimento: "", valor: "", dataPagamento: "", parcelas: 1,
    }
  );
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const veiculosDoCliente = veiculos.filter((v) => v.clienteId === f.clienteId);

  function submit() {
    const errs = {};
    if (!f.clienteId) errs.clienteId = "Selecione o cliente.";
    if (!f.numero.trim()) errs.numero = "Informe o número do boleto.";
    if (!f.dataVencimento) errs.dataVencimento = "Informe o vencimento.";
    if (!f.valor || Number(f.valor) <= 0) errs.valor = "Informe um valor válido.";
    const nossoNumeroTrim = (f.nossoNumero || "").trim();
    if (nossoNumeroTrim && (boletos || []).some((b) => b.id !== initial?.id && (b.nossoNumero || "").trim() === nossoNumeroTrim)) {
      errs.nossoNumero = "Já existe outro boleto com esse Nosso Número.";
    }
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, id: initial?.id, parcelas: initial ? 1 : Number(f.parcelas) || 1 });
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
        <Field label="Veículo (opcional)">
          <select className="nexo-select" value={f.veiculoId} onChange={set("veiculoId")} disabled={!f.clienteId}>
            <option value="">{f.clienteId ? "Nenhum (boleto direto no cliente)" : "Escolha o cliente primeiro"}</option>
            {veiculosDoCliente.map((v) => <option key={v.id} value={v.id}>{v.marca} {v.modelo} · {v.placa}</option>)}
          </select>
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Número do boleto *" error={errors.numero}>
          <input className="nexo-input mono" value={f.numero} onChange={set("numero")} placeholder="Ex.: 000123" />
        </Field>
        <Field label="Nosso Número (controle/conciliação)" error={errors.nossoNumero}>
          <input className="nexo-input mono" value={f.nossoNumero || ""} onChange={set("nossoNumero")} placeholder="Ex.: 00012345678" />
        </Field>
      </div>
      <div className="nexo-field-row3">
        <Field label="Data de emissão">
          <input type="date" className="nexo-input" value={f.dataEmissao} onChange={set("dataEmissao")} />
        </Field>
        <Field label="1º vencimento *" error={errors.dataVencimento}>
          <input type="date" className="nexo-input" value={f.dataVencimento} onChange={set("dataVencimento")} />
        </Field>
        <Field label="Valor de cada parcela (R$) *" error={errors.valor}>
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valor} onChange={set("valor")} placeholder="0,00" />
        </Field>
      </div>
      {!initial && (
        <Field label="Quantidade de boletos (parcelas mensais)">
          <select className="nexo-select" value={f.parcelas} onChange={set("parcelas")}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}x {n > 1 ? `(gera ${n} boletos mensais, um por mês, a partir do vencimento acima)` : ""}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Data de pagamento (deixe em branco se ainda não pago)">
        <input type="date" className="nexo-input" value={f.dataPagamento} onChange={set("dataPagamento")} />
      </Field>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar boleto{!initial && Number(f.parcelas) > 1 ? "s" : ""}</button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

const COMISSAO_CORRETORA_PERCENTUAL = 10; // ajuste aqui se o percentual de recorrência mudar

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

  // Comissão recorrente da corretora: 10% sobre os boletos que vencem
  // (serão baixados) NO MÊS ATUAL — não sobre o total acumulado de todos
  // os boletos já cadastrados, pra não misturar com os totais do Financeiro.
  const hojeRef = new Date();
  const chaveMesAtual = `${hojeRef.getFullYear()}-${String(hojeRef.getMonth() + 1).padStart(2, "0")}`;
  const boletosDoMesAtual = boletosComStatus.filter((b) => (b.dataVencimento || "").slice(0, 7) === chaveMesAtual);
  const valorBoletosDoMesAtual = sum(boletosDoMesAtual.map((b) => b.valor));
  const comissaoCorretora = valorBoletosDoMesAtual * (COMISSAO_CORRETORA_PERCENTUAL / 100);

  const valoresData = [
    { name: "Recebido", valor: valorRecebido, color: "var(--success)" },
    { name: "Em aberto", valor: valorEmAberto, color: "var(--info)" },
    { name: "A vencer", valor: valorAReceber, color: "var(--warning)" },
    { name: `Comissão (${COMISSAO_CORRETORA_PERCENTUAL}% do mês)`, valor: comissaoCorretora, color: "#B08BF0" },
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
        <Kpi icon={CreditCard} label={`Comissão da corretora (${COMISSAO_CORRETORA_PERCENTUAL}% do mês)`} value={formatBRL(comissaoCorretora)} tone="accent" />
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

        <div className="nexo-card">
          <div className="nexo-chart-title">Comissão da corretora</div>
          <div className="nexo-chart-sub">{COMISSAO_CORRETORA_PERCENTUAL}% sobre os boletos que vencem neste mês (não é acumulado)</div>
          <div style={{ height: 240, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: `Comissão (${COMISSAO_CORRETORA_PERCENTUAL}%)`, value: COMISSAO_CORRETORA_PERCENTUAL },
                    { name: "Restante", value: 100 - COMISSAO_CORRETORA_PERCENTUAL },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={82}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={0}
                >
                  <Cell fill="#B08BF0" stroke="none" />
                  <Cell fill="#202B38" stroke="none" />
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#19222D", border: "1px solid #263241", borderRadius: 8, fontSize: 12 }}
                  formatter={(v, n) => [n.includes("Comissão") ? `${v}%` : `${v}%`, n]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", pointerEvents: "none", paddingBottom: 24,
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 800, color: "#B08BF0", lineHeight: 1 }}>{COMISSAO_CORRETORA_PERCENTUAL}%</div>
              <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>recorrência mensal</div>
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: 15, fontWeight: 700, marginTop: 4 }}>{formatBRL(comissaoCorretora)}</div>
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

function ClientesView({ db, onOpenModal, onDeleteCliente, onOpenDetail, onImportarClientes, onImportarClientesEVeiculos }) {
  const [query, setQuery] = useState("");
  const [importando, setImportando] = useState(false);
  const [importandoCombo, setImportandoCombo] = useState(false);
  const fileInputRef = useRef(null);
  const fileInputComboRef = useRef(null);

  const filtered = db.clientes.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const nomeMatch = c.nome.toLowerCase().includes(q);
    const cpfMatch = c.cpf.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
    const placaMatch = db.veiculos.filter((v) => v.clienteId === c.id).some((v) => v.placa.toLowerCase().includes(q));
    return nomeMatch || cpfMatch || placaMatch;
  });

  async function handleArquivoSelecionado(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setImportando(true);
    try {
      const texto = await lerArquivoTexto(arquivo);
      const { cabecalhos, linhas } = parseCSVTexto(texto);
      const clientesNovos = linhas
        .map((linha) => ({
          nome: valorDaColuna(cabecalhos, linha, ["nome", "nomecompleto"]),
          cpf: valorDaColuna(cabecalhos, linha, ["cpfcnpj", "cpf", "cnpj"]),
          nascimento: paraDataISO(valorDaColuna(cabecalhos, linha, ["nascimento", "datadenascimento"])),
          sexo: valorDaColuna(cabecalhos, linha, ["sexo"]),
          telefone: valorDaColuna(cabecalhos, linha, ["telefone"]),
          whatsapp: valorDaColuna(cabecalhos, linha, ["whatsapp"]),
          email: valorDaColuna(cabecalhos, linha, ["email", "e-mail"]),
          cep: valorDaColuna(cabecalhos, linha, ["cep"]),
          endereco: valorDaColuna(cabecalhos, linha, ["endereco"]),
          status: valorDaColuna(cabecalhos, linha, ["status"]) || "Ativo",
        }))
        .filter((c) => c.nome && c.cpf);
      if (clientesNovos.length === 0) {
        alert("Nenhuma linha válida encontrada. Confira se o arquivo tem as colunas Nome e CPF/CNPJ.");
      } else {
        await onImportarClientes(clientesNovos);
      }
    } catch (err) {
      alert("Não foi possível ler o arquivo: " + err.message);
    } finally {
      setImportando(false);
    }
  }

  async function handleArquivoClientesVeiculos(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setImportandoCombo(true);
    try {
      const texto = await lerArquivoTexto(arquivo);
      const { cabecalhos, linhas } = parseCSVTexto(texto);
      const registros = linhas
        .map((linha) => ({
          nome: valorDaColuna(cabecalhos, linha, ["nome", "nomecompleto"]),
          cpf: valorDaColuna(cabecalhos, linha, ["cpfcnpj", "cpf", "cnpj"]),
          nascimento: paraDataISO(valorDaColuna(cabecalhos, linha, ["nascimento", "datadenascimento"])),
          sexo: valorDaColuna(cabecalhos, linha, ["sexo"]),
          telefone: valorDaColuna(cabecalhos, linha, ["telefone"]),
          whatsapp: valorDaColuna(cabecalhos, linha, ["whatsapp"]),
          email: valorDaColuna(cabecalhos, linha, ["email"]),
          cep: valorDaColuna(cabecalhos, linha, ["cep"]),
          endereco: valorDaColuna(cabecalhos, linha, ["endereco"]),
          status: valorDaColuna(cabecalhos, linha, ["status"]) || "Ativo",
          placa: valorDaColuna(cabecalhos, linha, ["placa"]),
          marca: valorDaColuna(cabecalhos, linha, ["marca"]),
          modelo: valorDaColuna(cabecalhos, linha, ["modelo"]),
          ano: valorDaColuna(cabecalhos, linha, ["ano", "anomodelo"]),
          anoFabricacao: valorDaColuna(cabecalhos, linha, ["anofabricacao", "anodefabricacao"]),
          tipoVeiculo: valorDaColuna(cabecalhos, linha, ["tipodeveiculo", "tipoveiculo", "tipo"]),
          renavam: valorDaColuna(cabecalhos, linha, ["renavam"]),
          chassi: valorDaColuna(cabecalhos, linha, ["chassi"]),
          cor: valorDaColuna(cabecalhos, linha, ["cor"]),
        }))
        .filter((r) => r.nome && r.cpf);
      if (registros.length === 0) {
        alert("Nenhuma linha válida encontrada. Confira se o arquivo tem as colunas Nome e CPF/CNPJ.");
      } else {
        await onImportarClientesEVeiculos(registros);
      }
    } catch (err) {
      alert("Não foi possível ler o arquivo: " + err.message);
    } finally {
      setImportandoCombo(false);
    }
  }

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Clientes<span className="nexo-section-count">{db.clientes.length} cadastrados</span></div>
        <div className="nexo-topbar-actions">
          <button
            className="nexo-btn"
            onClick={() =>
              exportarCSV(
                "modelo-clientes.csv",
                [
                  { titulo: "Nome", valor: () => "" }, { titulo: "CPF/CNPJ", valor: () => "" },
                  { titulo: "Nascimento", valor: () => "" }, { titulo: "Sexo", valor: () => "" },
                  { titulo: "Telefone", valor: () => "" }, { titulo: "WhatsApp", valor: () => "" },
                  { titulo: "E-mail", valor: () => "" }, { titulo: "CEP", valor: () => "" },
                  { titulo: "Endereço", valor: () => "" }, { titulo: "Status", valor: () => "" },
                ],
                [{}]
              )
            }
          >
            Baixar modelo
          </button>
          <button className="nexo-btn" disabled={importando} onClick={() => fileInputRef.current?.click()}>
            {importando ? "Importando…" : "Importar CSV"}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleArquivoSelecionado} />
          <button
            className="nexo-btn"
            onClick={() =>
              exportarCSV(
                "modelo-clientes-e-veiculos.csv",
                [
                  { titulo: "Nome", valor: () => "" }, { titulo: "CPF/CNPJ", valor: () => "" },
                  { titulo: "Nascimento", valor: () => "" }, { titulo: "Sexo", valor: () => "" },
                  { titulo: "Telefone", valor: () => "" }, { titulo: "WhatsApp", valor: () => "" },
                  { titulo: "E-mail", valor: () => "" }, { titulo: "CEP", valor: () => "" },
                  { titulo: "Endereço", valor: () => "" }, { titulo: "Status", valor: () => "" },
                  { titulo: "Placa", valor: () => "" }, { titulo: "Marca", valor: () => "" },
                  { titulo: "Modelo", valor: () => "" }, { titulo: "Ano", valor: () => "" },
                  { titulo: "Ano Fabricação", valor: () => "" }, { titulo: "Tipo de veículo", valor: () => "" },
                  { titulo: "Renavam", valor: () => "" }, { titulo: "Chassi", valor: () => "" }, { titulo: "Cor", valor: () => "" },
                ],
                [{}]
              )
            }
            title="Cada linha é um veículo. Repita o CPF do mesmo cliente em várias linhas para cadastrar mais de um veículo para ele."
          >
            Baixar modelo (+ veículos)
          </button>
          <button className="nexo-btn" disabled={importandoCombo} onClick={() => fileInputComboRef.current?.click()}>
            <Upload size={13} /> {importandoCombo ? "Importando…" : "Importar clientes + veículos"}
          </button>
          <input ref={fileInputComboRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleArquivoClientesVeiculos} />
          <button
            className="nexo-btn"
            onClick={() =>
              exportarCSV(
                "clientes.csv",
                [
                  { titulo: "Nome", valor: (c) => c.nome },
                  { titulo: "CPF/CNPJ", valor: (c) => c.cpf },
                  { titulo: "Nascimento", valor: (c) => c.nascimento },
                  { titulo: "Sexo", valor: (c) => c.sexo },
                  { titulo: "Telefone", valor: (c) => c.telefone },
                  { titulo: "WhatsApp", valor: (c) => c.whatsapp },
                  { titulo: "E-mail", valor: (c) => c.email },
                  { titulo: "Endereço", valor: (c) => c.endereco },
                  { titulo: "Status", valor: (c) => c.status },
                ],
                filtered
              )
            }
          >
            Exportar CSV
          </button>
          <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("cliente")}><Plus size={15} /> Novo cliente</button>
        </div>
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
        <div className="nexo-topbar-actions">
          <button
            className="nexo-btn"
            onClick={() =>
              exportarCSV(
                "veiculos.csv",
                [
                  { titulo: "Cliente", valor: (v) => (getCliente(v.clienteId) ? getCliente(v.clienteId).nome : "") },
                  { titulo: "Marca", valor: (v) => v.marca },
                  { titulo: "Modelo", valor: (v) => v.modelo },
                  { titulo: "Ano fabricação", valor: (v) => v.anoFabricacao },
                  { titulo: "Ano modelo", valor: (v) => v.ano },
                  { titulo: "Cor", valor: (v) => v.cor },
                  { titulo: "Placa", valor: (v) => v.placa },
                  { titulo: "Renavam", valor: (v) => v.renavam },
                  { titulo: "Chassi", valor: (v) => v.chassi },
                  { titulo: "Código Fipe", valor: (v) => v.codigoFipe },
                  { titulo: "Valor Fipe", valor: (v) => v.valorFipe },
                  { titulo: "Valor mensal", valor: (v) => v.valorMensal },
                  { titulo: "Status", valor: (v) => v.status },
                ],
                filtered
              )
            }
          >
            Exportar CSV
          </button>
          <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("veiculo")}><Plus size={15} /> Novo veículo</button>
        </div>
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
                      <td className="nexo-cell-muted">{v.anoFabricacao || v.ano ? `${v.anoFabricacao || "—"}/${v.ano || "—"}` : "—"}</td>
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

function FinanceiroView({ db, onOpenModal, onDeleteBoleto, onMarcarPago, onImportarBoletos, onImportarBaixas }) {
  const [fCliente, setFCliente] = useState("");
  const [fCpf, setFCpf] = useState("");
  const [fPlaca, setFPlaca] = useState("");
  const [fStatus, setFStatus] = useState("Todos");
  const [fDe, setFDe] = useState("");
  const [fAte, setFAte] = useState("");
  const [fVencimento, setFVencimento] = useState("Todos");
  const [importandoCadastro, setImportandoCadastro] = useState(false);
  const [importandoBaixa, setImportandoBaixa] = useState(false);
  const inputCadastroRef = useRef(null);
  const inputBaixaRef = useRef(null);

  async function handleArquivoCadastro(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setImportandoCadastro(true);
    try {
      const texto = await lerArquivoTexto(arquivo);
      const { cabecalhos, linhas } = parseCSVTexto(texto);
      const registros = linhas
        .map((linha) => ({
          nome: valorDaColuna(cabecalhos, linha, ["nomedocliente", "nome", "cliente"]),
          cpf: valorDaColuna(cabecalhos, linha, ["cpfcnpj", "cpf", "cnpj"]),
          placa: valorDaColuna(cabecalhos, linha, ["placa"]),
          nossoNumero: valorDaColuna(cabecalhos, linha, ["nossonumero", "nnumero", "nosso"]),
          valor: paraNumero(valorDaColuna(cabecalhos, linha, ["valor", "valorboleto"])),
          dataVencimento: paraDataISO(valorDaColuna(cabecalhos, linha, ["vencimento", "datavencimento", "datadevencimento"])),
        }))
        .filter((r) => (r.nome || r.cpf) && r.valor);
      if (registros.length === 0) {
        alert("Nenhuma linha válida encontrada. Confira as colunas Nome do Cliente/CPF-CNPJ, Placa, Nosso Número e Valor.");
      } else {
        await onImportarBoletos(registros);
      }
    } catch (err) {
      alert("Não foi possível ler o arquivo: " + err.message);
    } finally {
      setImportandoCadastro(false);
    }
  }

  async function handleArquivoBaixa(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setImportandoBaixa(true);
    try {
      const texto = await lerArquivoTexto(arquivo);
      const { cabecalhos, linhas } = parseCSVTexto(texto);
      const registros = linhas
        .map((linha) => ({
          nome: valorDaColuna(cabecalhos, linha, ["nomedocliente", "nome", "cliente"]),
          nossoNumero: valorDaColuna(cabecalhos, linha, ["nossonumero", "nnumero", "nosso"]),
          situacao: valorDaColuna(cabecalhos, linha, ["situacao", "status"]),
          dataPagamento: paraDataISO(valorDaColuna(cabecalhos, linha, ["datadopagamento", "datapagamento", "datapgto"])),
        }))
        .filter((r) => r.nossoNumero);
      if (registros.length === 0) {
        alert("Nenhuma linha válida encontrada. Confira se o arquivo tem a coluna Nosso Número.");
      } else {
        await onImportarBaixas(registros);
      }
    } catch (err) {
      alert("Não foi possível ler o arquivo: " + err.message);
    } finally {
      setImportandoBaixa(false);
    }
  }

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
        <div className="nexo-topbar-actions">
          <button
            className="nexo-btn nexo-btn-sm"
            onClick={() =>
              exportarCSV(
                "modelo-cadastro-boletos.csv",
                [
                  { titulo: "Nome do Cliente", valor: () => "" }, { titulo: "CPF/CNPJ", valor: () => "" },
                  { titulo: "Placa", valor: () => "" }, { titulo: "Nosso Número", valor: () => "" },
                  { titulo: "Valor", valor: () => "" }, { titulo: "Vencimento", valor: () => "" },
                ],
                [{}]
              )
            }
          >
            Modelo (cadastro)
          </button>
          <button className="nexo-btn nexo-btn-sm" disabled={importandoCadastro} onClick={() => inputCadastroRef.current?.click()}>
            <Upload size={13} /> {importandoCadastro ? "Importando…" : "Importar boletos"}
          </button>
          <input ref={inputCadastroRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleArquivoCadastro} />

          <button
            className="nexo-btn nexo-btn-sm"
            onClick={() =>
              exportarCSV(
                "modelo-relatorio-baixa.csv",
                [
                  { titulo: "Nome do cliente", valor: () => "" }, { titulo: "Nosso Número", valor: () => "" },
                  { titulo: "Situação", valor: () => "" }, { titulo: "Data do Pagamento", valor: () => "" },
                  { titulo: "Voluntário", valor: () => "" },
                ],
                [{}]
              )
            }
          >
            Modelo (baixa)
          </button>
          <button className="nexo-btn nexo-btn-sm" disabled={importandoBaixa} onClick={() => inputBaixaRef.current?.click()}>
            <Upload size={13} /> {importandoBaixa ? "Importando…" : "Importar baixa (relatório)"}
          </button>
          <input ref={inputBaixaRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleArquivoBaixa} />

          <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("boleto")}><Plus size={15} /> Novo boleto</button>
        </div>
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
                <tr><th>Cliente</th><th>Veículo</th><th>Placa</th><th>Nosso Número</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr>
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
                      <td className="mono nexo-cell-muted">{b.nossoNumero || "—"}</td>
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
          <div className="nexo-info-row"><Calendar size={14} /> {cliente.nascimento ? formatDateBR(cliente.nascimento) : "Nascimento não informado"}{cliente.sexo ? ` · ${cliente.sexo}` : ""}</div>
          {cliente.cnhNumero && (
            <div className="nexo-info-row">
              <FileText size={14} /> CNH {cliente.cnhNumero}
              {cliente.cnhValidade ? ` · válida até ${formatDateBR(cliente.cnhValidade)}` : ""}
            </div>
          )}
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
/* Relatórios                                                           */
/* ------------------------------------------------------------------ */

function RelatoriosView({ db }) {
  const boletosComStatus = db.boletos.map((b) => ({ ...b, status: computeBoletoStatus(b) }));
  const pagos = boletosComStatus.filter((b) => b.status === "Pago");
  const emAberto = boletosComStatus.filter((b) => b.status !== "Pago");
  const aVencer = boletosComStatus.filter((b) => b.status === "A vencer");

  const nomeCliente = (id) => db.clientes.find((c) => c.id === id)?.nome || "—";
  const placaVeiculo = (id) => db.veiculos.find((v) => v.id === id)?.placa || "—";

  const colunasBoleto = [
    { titulo: "Cliente", valor: (b) => nomeCliente(b.clienteId) },
    { titulo: "Placa", valor: (b) => placaVeiculo(b.veiculoId) },
    { titulo: "Número", valor: (b) => b.numero },
    { titulo: "Vencimento", valor: (b) => formatDateBR(b.dataVencimento) },
    { titulo: "Valor", valor: (b) => b.valor },
    { titulo: "Status", valor: (b) => b.status },
    { titulo: "Data de pagamento", valor: (b) => formatDateBR(b.dataPagamento) },
  ];

  const relatorios = [
    {
      titulo: "Clientes cadastrados",
      total: db.clientes.length,
      arquivo: "relatorio-clientes.csv",
      colunas: [
        { titulo: "Nome", valor: (c) => c.nome },
        { titulo: "CPF/CNPJ", valor: (c) => c.cpf },
        { titulo: "Telefone", valor: (c) => c.telefone },
        { titulo: "E-mail", valor: (c) => c.email },
        { titulo: "Status", valor: (c) => c.status },
      ],
      linhas: db.clientes,
      tone: "accent",
    },
    {
      titulo: "Boletos pagos",
      total: pagos.length,
      valor: formatBRL(sum(pagos.map((b) => b.valor))),
      arquivo: "relatorio-boletos-pagos.csv",
      colunas: colunasBoleto,
      linhas: pagos,
      tone: "success",
    },
    {
      titulo: "Boletos em aberto",
      total: emAberto.length,
      valor: formatBRL(sum(emAberto.map((b) => b.valor))),
      arquivo: "relatorio-boletos-em-aberto.csv",
      colunas: colunasBoleto,
      linhas: emAberto,
      tone: "info",
    },
    {
      titulo: "Boletos a vencer",
      total: aVencer.length,
      valor: formatBRL(sum(aVencer.map((b) => b.valor))),
      arquivo: "relatorio-boletos-a-vencer.csv",
      colunas: colunasBoleto,
      linhas: aVencer,
      tone: "warning",
    },
  ];

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Relatórios</div>
      </div>
      <div className="nexo-kpi-grid">
        {relatorios.map((r) => (
          <div key={r.titulo} className="nexo-card">
            <div className="nexo-chart-title">{r.titulo}</div>
            <div className="nexo-kpi-value" style={{ marginTop: 6 }}>{r.total}</div>
            {r.valor && <div className="nexo-cell-muted" style={{ marginBottom: 10 }}>{r.valor}</div>}
            <button
              className="nexo-btn nexo-btn-sm"
              style={{ marginTop: 10 }}
              disabled={r.linhas.length === 0}
              onClick={() => exportarCSV(r.arquivo, r.colunas, r.linhas)}
            >
              Exportar CSV
            </button>
          </div>
        ))}
      </div>
      <div className="nexo-empty-sub" style={{ marginTop: 4 }}>
        Os arquivos exportados abrem direto no Excel, Google Sheets ou qualquer editor de planilhas.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cotação de seguros (seguradoras, planos e cotações)                  */
/* ------------------------------------------------------------------ */

function PlanoForm({ initial, seguradoras, defaultSeguradoraId, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || { seguradoraId: defaultSeguradoraId || "", nome: "", valorMensal: "", valorFranquia: "", beneficios: "" }
  );
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit() {
    const errs = {};
    if (!f.seguradoraId) errs.seguradoraId = "Selecione a seguradora.";
    if (!f.nome.trim()) errs.nome = "Informe o nome do plano.";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, id: initial?.id });
  }

  return (
    <>
      <Field label="Seguradora *" error={errors.seguradoraId}>
        <select className="nexo-select" value={f.seguradoraId} onChange={set("seguradoraId")}>
          <option value="">Selecione</option>
          {seguradoras.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </Field>
      <Field label="Nome do plano *" error={errors.nome}>
        <input className="nexo-input" value={f.nome} onChange={set("nome")} placeholder="Ex.: Completo, Básico, Terceiros" />
      </Field>
      <div className="nexo-field-row">
        <Field label="Valor mensal">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorMensal} onChange={set("valorMensal")} placeholder="0,00" />
        </Field>
        <Field label="Valor da franquia">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorFranquia} onChange={set("valorFranquia")} placeholder="0,00" />
        </Field>
      </div>
      <Field label="Benefícios">
        <textarea className="nexo-textarea" value={f.beneficios} onChange={set("beneficios")} placeholder="Ex.: Assistência 24h, carro reserva, guincho ilimitado…" />
      </Field>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar plano</button>
      </div>
    </>
  );
}

function CotacaoForm({ initial, clientes, veiculos, seguradoras, planos, defaultClienteId, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      clienteId: defaultClienteId || "", veiculoId: "", seguradoraId: "", planoId: "",
      valor: "", dataCotacao: todayISO(), observacoes: "",
    }
  );
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const veiculosDoCliente = veiculos.filter((v) => v.clienteId === f.clienteId);
  const planosDaSeguradora = planos.filter((p) => p.seguradoraId === f.seguradoraId);

  function selecionarPlano(planoId) {
    const plano = planos.find((p) => p.id === planoId);
    setF({ ...f, planoId, valor: plano?.valorMensal ?? f.valor });
  }

  function submit() {
    const errs = {};
    if (!f.clienteId) errs.clienteId = "Selecione o cliente.";
    if (!f.seguradoraId) errs.seguradoraId = "Selecione a seguradora.";
    if (!f.planoId) errs.planoId = "Selecione o plano.";
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
        <Field label="Veículo">
          <select className="nexo-select" value={f.veiculoId} onChange={set("veiculoId")} disabled={!f.clienteId}>
            <option value="">{f.clienteId ? "Sem veículo específico" : "Escolha o cliente primeiro"}</option>
            {veiculosDoCliente.map((v) => <option key={v.id} value={v.id}>{v.marca} {v.modelo} · {v.placa}</option>)}
          </select>
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Seguradora *" error={errors.seguradoraId}>
          <select className="nexo-select" value={f.seguradoraId} onChange={(e) => setF({ ...f, seguradoraId: e.target.value, planoId: "" })}>
            <option value="">Selecione</option>
            {seguradoras.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </Field>
        <Field label="Plano *" error={errors.planoId}>
          <select className="nexo-select" value={f.planoId} onChange={(e) => selecionarPlano(e.target.value)} disabled={!f.seguradoraId}>
            <option value="">{f.seguradoraId ? "Selecione" : "Escolha a seguradora primeiro"}</option>
            {planosDaSeguradora.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Valor da cotação">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valor} onChange={set("valor")} placeholder="0,00" />
        </Field>
        <Field label="Data da cotação">
          <input type="date" className="nexo-input" value={f.dataCotacao} onChange={set("dataCotacao")} />
        </Field>
      </div>
      <Field label="Observações">
        <textarea className="nexo-textarea" value={f.observacoes} onChange={set("observacoes")} placeholder="Notas internas sobre esta cotação" />
      </Field>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar cotação</button>
      </div>
    </>
  );
}

function gerarPdfCotacao(cotacao, db) {
  const cliente = db.clientes.find((c) => c.id === cotacao.clienteId);
  const veiculo = db.veiculos.find((v) => v.id === cotacao.veiculoId);
  const seguradora = db.seguradoras.find((s) => s.id === cotacao.seguradoraId);
  const plano = db.planos.find((p) => p.id === cotacao.planoId);

  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text("Seu Seguro Corretora", 14, y);
  doc.setFontSize(11);
  y += 8;
  doc.text("Cotação de Seguro Automotivo", 14, y);
  y += 10;
  doc.setDrawColor(200);
  doc.line(14, y, 196, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Cliente", 14, y);
  doc.setFontSize(10);
  y += 6;
  doc.text(`Nome: ${cliente?.nome || "—"}`, 14, y);
  y += 6;
  doc.text(`CPF/CNPJ: ${cliente?.cpf || "—"}`, 14, y);
  y += 10;

  if (veiculo) {
    doc.setFontSize(12);
    doc.text("Veículo", 14, y);
    doc.setFontSize(10);
    y += 6;
    doc.text(`${veiculo.marca} ${veiculo.modelo} — ${veiculo.anoFabricacao || "—"}/${veiculo.ano || "—"}`, 14, y);
    y += 6;
    doc.text(`Placa: ${veiculo.placa || "—"}   Cor: ${veiculo.cor || "—"}`, 14, y);
    y += 10;
  }

  doc.setFontSize(12);
  doc.text("Plano cotado", 14, y);
  doc.setFontSize(10);
  y += 6;
  doc.text(`Seguradora: ${seguradora?.nome || "—"}`, 14, y);
  y += 6;
  doc.text(`Plano: ${plano?.nome || "—"}`, 14, y);
  y += 6;
  doc.setFontSize(13);
  doc.text(`Valor: ${formatBRL(cotacao.valor)}`, 14, y);
  y += 8;

  if (plano?.beneficios) {
    doc.setFontSize(12);
    doc.text("Benefícios inclusos", 14, y);
    doc.setFontSize(10);
    y += 6;
    const linhas = doc.splitTextToSize(plano.beneficios, 180);
    doc.text(linhas, 14, y);
    y += linhas.length * 5 + 4;
  }

  if (cotacao.observacoes) {
    doc.setFontSize(12);
    doc.text("Observações", 14, y);
    doc.setFontSize(10);
    y += 6;
    const linhas = doc.splitTextToSize(cotacao.observacoes, 180);
    doc.text(linhas, 14, y);
    y += linhas.length * 5 + 4;
  }

  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(`Cotação gerada em ${formatDateBR(cotacao.dataCotacao || todayISO())}`, 14, 285);

  doc.save(`cotacao-${(cliente?.nome || "cliente").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

function CotacoesView({ db, onOpenModal, onSaveSeguradora, onDeleteSeguradora, onDeletePlano, onDeleteCotacao, onImportarPlanos }) {
  const [nomeSeguradora, setNomeSeguradora] = useState("");
  const [importando, setImportando] = useState(false);
  const fileInputRef = useRef(null);

  const nomeCliente = (id) => db.clientes.find((c) => c.id === id)?.nome || "—";
  const nomeVeiculo = (id) => {
    const v = db.veiculos.find((v) => v.id === id);
    return v ? `${v.marca} ${v.modelo} · ${v.placa}` : "—";
  };
  const nomeSeguradoraPorId = (id) => db.seguradoras.find((s) => s.id === id)?.nome || "—";
  const nomePlanoPorId = (id) => db.planos.find((p) => p.id === id)?.nome || "—";

  async function adicionarSeguradora() {
    if (!nomeSeguradora.trim()) return;
    await onSaveSeguradora(nomeSeguradora.trim());
    setNomeSeguradora("");
  }

  async function handleArquivoSelecionado(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setImportando(true);
    try {
      const texto = await lerArquivoTexto(arquivo);
      const { cabecalhos, linhas } = parseCSVTexto(texto);
      const planosNovos = linhas
        .map((linha) => ({
          seguradoraNome: valorDaColuna(cabecalhos, linha, ["seguradora"]),
          planoNome: valorDaColuna(cabecalhos, linha, ["plano"]),
          valorMensal: paraNumero(valorDaColuna(cabecalhos, linha, ["valormensal", "valor"])),
          valorFranquia: paraNumero(valorDaColuna(cabecalhos, linha, ["franquia", "valorfranquia"])),
          beneficios: valorDaColuna(cabecalhos, linha, ["beneficios"]),
        }))
        .filter((p) => p.seguradoraNome && p.planoNome);
      if (planosNovos.length === 0) {
        alert("Nenhuma linha válida encontrada. Confira as colunas Seguradora e Plano.");
      } else {
        await onImportarPlanos(planosNovos);
      }
    } catch (err) {
      alert("Não foi possível ler o arquivo: " + err.message);
    } finally {
      setImportando(false);
    }
  }

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Cotação de seguros</div>
      </div>

      <div className="nexo-card" style={{ marginBottom: 16 }}>
        <div className="nexo-section-head" style={{ marginBottom: 12 }}>
          <div className="nexo-chart-title" style={{ marginBottom: 0 }}>Seguradoras e tabela de preços</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="nexo-btn nexo-btn-sm"
              onClick={() =>
                exportarCSV(
                  "modelo-planos.csv",
                  [
                    { titulo: "Seguradora", valor: () => "" }, { titulo: "Plano", valor: () => "" },
                    { titulo: "Valor Mensal", valor: () => "" }, { titulo: "Franquia", valor: () => "" },
                    { titulo: "Beneficios", valor: () => "" },
                  ],
                  [{}]
                )
              }
            >
              Baixar modelo
            </button>
            <button className="nexo-btn nexo-btn-sm" disabled={importando} onClick={() => fileInputRef.current?.click()}>
              {importando ? "Importando…" : "Importar tabela (CSV)"}
            </button>
            <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleArquivoSelecionado} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <input
            className="nexo-input"
            style={{ maxWidth: 280 }}
            placeholder="Nome da nova seguradora"
            value={nomeSeguradora}
            onChange={(e) => setNomeSeguradora(e.target.value)}
          />
          <button className="nexo-btn nexo-btn-sm" onClick={adicionarSeguradora}>Adicionar seguradora</button>
        </div>

        {db.seguradoras.length === 0 ? (
          <div className="nexo-empty-sub">Nenhuma seguradora cadastrada ainda. Adicione uma acima ou importe sua tabela em CSV.</div>
        ) : (
          db.seguradoras.map((s) => {
            const planosDaSeguradora = db.planos.filter((p) => p.seguradoraId === s.id);
            return (
              <div key={s.id} className="nexo-veiculo-card">
                <div className="nexo-veiculo-card-head">
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.nome}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="nexo-btn nexo-btn-sm" onClick={() => onOpenModal("plano", null, null, null, s.id)}>
                      <Plus size={12} /> Novo plano
                    </button>
                    <button className="nexo-btn nexo-btn-sm nexo-btn-danger" onClick={() => onDeleteSeguradora(s.id)}>
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </div>
                {planosDaSeguradora.length === 0 ? (
                  <div className="nexo-cell-muted" style={{ fontSize: 12.5 }}>Nenhum plano cadastrado para esta seguradora.</div>
                ) : (
                  planosDaSeguradora.map((p) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--border-soft)" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.nome}</div>
                        <div className="nexo-cell-muted" style={{ fontSize: 12 }}>
                          Mensal: {formatBRL(p.valorMensal)} · Franquia: {formatBRL(p.valorFranquia)}
                          {p.beneficios ? ` · ${p.beneficios}` : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="nexo-icon-btn" onClick={() => onOpenModal("plano", p)}><Pencil size={13} /></button>
                        <button className="nexo-icon-btn" onClick={() => onDeletePlano(p.id)}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="nexo-card">
        <div className="nexo-section-head" style={{ marginBottom: 12 }}>
          <div className="nexo-chart-title" style={{ marginBottom: 0 }}>Cotações realizadas</div>
          <button className="nexo-btn nexo-btn-primary nexo-btn-sm" onClick={() => onOpenModal("cotacao")}>
            <Plus size={13} /> Nova cotação
          </button>
        </div>
        {db.cotacoes.length === 0 ? (
          <EmptyState icon={FileText} title="Nenhuma cotação registrada" sub="Clique em “Nova cotação” para gerar a primeira." />
        ) : (
          <div className="nexo-table-scroll">
            <table className="nexo-table">
              <thead><tr><th>Cliente</th><th>Veículo</th><th>Seguradora</th><th>Plano</th><th>Valor</th><th>Data</th><th></th></tr></thead>
              <tbody>
                {db.cotacoes
                  .slice()
                  .sort((a, b) => (b.dataCotacao || "").localeCompare(a.dataCotacao || ""))
                  .map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{nomeCliente(c.clienteId)}</td>
                      <td className="nexo-cell-muted">{c.veiculoId ? nomeVeiculo(c.veiculoId) : "—"}</td>
                      <td>{nomeSeguradoraPorId(c.seguradoraId)}</td>
                      <td>{nomePlanoPorId(c.planoId)}</td>
                      <td className="mono">{formatBRL(c.valor)}</td>
                      <td>{formatDateBR(c.dataCotacao)}</td>
                      <td>
                        <div className="nexo-actions-cell">
                          <button className="nexo-btn nexo-btn-sm" onClick={() => gerarPdfCotacao(c, db)}>Gerar PDF</button>
                          <button className="nexo-icon-btn" onClick={() => onOpenModal("cotacao", c)}><Pencil size={13} /></button>
                          <button className="nexo-icon-btn" onClick={() => onDeleteCotacao(c.id)}><Trash2 size={13} /></button>
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
  );
}

/* ------------------------------------------------------------------ */
/* Segurança do login (bloqueio por tentativas + política de senha)    */
/* ------------------------------------------------------------------ */

const LOGIN_MAX_TENTATIVAS = 5;
const LOGIN_BLOQUEIO_MS = 5 * 60 * 1000; // 5 minutos

function lerTentativasLogin(email) {
  try {
    const bruto = localStorage.getItem("nexo_login_tentativas_" + email.toLowerCase());
    return bruto ? JSON.parse(bruto) : { tentativas: 0, bloqueadoAte: 0 };
  } catch {
    return { tentativas: 0, bloqueadoAte: 0 };
  }
}

function gravarTentativasLogin(email, dados) {
  try {
    localStorage.setItem("nexo_login_tentativas_" + email.toLowerCase(), JSON.stringify(dados));
  } catch {
    /* localStorage indisponível — segue sem bloqueio local (o rate limit do Supabase ainda se aplica) */
  }
}

function registrarFalhaLogin(email) {
  const atual = lerTentativasLogin(email);
  const tentativas = atual.tentativas + 1;
  const bloqueadoAte = tentativas >= LOGIN_MAX_TENTATIVAS ? Date.now() + LOGIN_BLOQUEIO_MS : 0;
  gravarTentativasLogin(email, { tentativas, bloqueadoAte });
  return { tentativas, bloqueadoAte };
}

function limparTentativasLogin(email) {
  gravarTentativasLogin(email, { tentativas: 0, bloqueadoAte: 0 });
}

/* Mínimo 8 caracteres, com pelo menos uma letra e um número. */
function senhaAtendeRequisitos(senha) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(senha || "");
}

/* ------------------------------------------------------------------ */
/* Login                                                                */
/* ------------------------------------------------------------------ */

function LoginScreen({ onEntrar }) {
  const [modo, setModo] = useState("login"); // "login" | "recuperar"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  // Atualiza a contagem regressiva do bloqueio de login a cada segundo.
  useEffect(() => {
    const id = setInterval(() => setReloadTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const statusLogin = email.trim() ? lerTentativasLogin(email.trim()) : { tentativas: 0, bloqueadoAte: 0 };
  const bloqueado = statusLogin.bloqueadoAte > Date.now();
  const segundosRestantes = bloqueado ? Math.max(1, Math.ceil((statusLogin.bloqueadoAte - Date.now()) / 1000)) : 0;

  async function handleSubmit() {
    const emailLimpo = email.trim();
    if (!emailLimpo || !senha.trim()) {
      setErro("Preencha e-mail e senha.");
      return;
    }
    const status = lerTentativasLogin(emailLimpo);
    if (status.bloqueadoAte > Date.now()) {
      setErro(`Muitas tentativas incorretas. Tente novamente em ${Math.ceil((status.bloqueadoAte - Date.now()) / 1000)}s ou redefina sua senha.`);
      return;
    }
    setCarregando(true);
    setErro("");
    const { error } = await supabase.auth.signInWithPassword({ email: emailLimpo, password: senha });
    if (error) {
      const novoStatus = registrarFalhaLogin(emailLimpo);
      if (novoStatus.bloqueadoAte > Date.now()) {
        setErro(`Muitas tentativas incorretas. Acesso bloqueado por ${Math.round(LOGIN_BLOQUEIO_MS / 60000)} minutos.`);
      } else {
        setErro("E-mail ou senha incorretos.");
      }
      setCarregando(false);
      return;
    }
    limparTentativasLogin(emailLimpo);
    onEntrar();
  }

  async function handleRecuperar() {
    if (!email.trim()) {
      setErro("Informe seu e-mail para receber o link de redefinição.");
      return;
    }
    setCarregando(true);
    setErro("");
    setAviso("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    });
    setCarregando(false);
    if (error) {
      setErro("Não foi possível enviar o e-mail agora. Tente novamente em instantes.");
      return;
    }
    setAviso("Se este e-mail estiver cadastrado, enviamos um link para redefinir sua senha.");
  }

  function voltarParaLogin() {
    setModo("login");
    setErro("");
    setAviso("");
  }

  return (
    <div className="nexo-login-page">
      <div className="nexo-login-body">
        <div className="nexo-login-hero">
          <div className="nexo-login-hero-blob b1" />
          <div className="nexo-login-hero-blob b2" />
          <div className="nexo-login-skyline" aria-hidden="true">
            {[38, 62, 44, 80, 52, 68, 40, 90, 56, 46, 72, 50, 84, 40, 60].map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="nexo-login-hero-content">
            <div className="nexo-login-brand">
              <div className="nexo-login-brand-mark"><Shield size={26} color="#fff" /></div>
              <div>
                <div className="nexo-login-brand-name">SEU SEGURO</div>
                <div className="nexo-login-brand-tagline">Seguros para todos</div>
              </div>
            </div>
            <div className="nexo-login-hero-mid">
              <div className="nexo-login-quote">"Protegendo o que <span>realmente importa</span>."</div>
              <div className="nexo-login-hero-icons">
                <span className="item"><Shield size={15} /> Dados protegidos</span>
                <span className="item"><CheckCircle2 size={15} /> Cobertura completa</span>
                <span className="item"><Clock size={15} /> Atendimento ágil</span>
              </div>
            </div>
            <div className="nexo-login-hero-foot">Plataforma de gestão para corretoras e representantes de seguros.</div>
          </div>
        </div>

        <div className="nexo-login-panel">
          <div className="nexo-login-card">
            {modo === "login" ? (
              <>
                <div className="nexo-login-eyebrow">Bem-vindo</div>
                <h1>Entre na sua conta</h1>
                <p className="sub">Acesse o painel da Seu Seguro Corretora.</p>
                <div className="nexo-login-fields">
                  <Field label="E-mail">
                    <input
                      type="email"
                      className="nexo-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="seu@email.com"
                      autoComplete="username"
                      autoFocus
                    />
                  </Field>
                  <Field label="Senha">
                    <input
                      type="password"
                      className="nexo-input"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={bloqueado}
                    />
                  </Field>
                </div>
                <div className="nexo-login-forgot-row">
                  <button type="button" className="nexo-login-link" onClick={() => { setModo("recuperar"); setErro(""); setAviso(""); }}>
                    Esqueci minha senha
                  </button>
                </div>
                {erro && <div className="nexo-login-alert err" role="alert">{erro}</div>}
                {bloqueado && (
                  <div key={reloadTick} className="nexo-login-alert err" role="alert">
                    Tente novamente em {segundosRestantes}s.
                  </div>
                )}
                <button
                  className="nexo-btn nexo-btn-primary nexo-login-submit"
                  disabled={carregando || bloqueado}
                  onClick={handleSubmit}
                >
                  {carregando ? "Entrando…" : "Entrar"}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="nexo-login-back" onClick={voltarParaLogin}>
                  <ArrowLeft size={14} /> Voltar
                </button>
                <div className="nexo-login-eyebrow">Recuperar acesso</div>
                <h1>Esqueceu sua senha?</h1>
                <p className="sub">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
                <div className="nexo-login-fields">
                  <Field label="E-mail">
                    <input
                      type="email"
                      className="nexo-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRecuperar()}
                      placeholder="seu@email.com"
                      autoComplete="username"
                      autoFocus
                    />
                  </Field>
                </div>
                {erro && <div className="nexo-login-alert err" role="alert">{erro}</div>}
                {aviso && <div className="nexo-login-alert ok" role="status">{aviso}</div>}
                <button
                  className="nexo-btn nexo-btn-primary nexo-login-submit"
                  disabled={carregando}
                  onClick={handleRecuperar}
                >
                  {carregando ? "Enviando…" : "Enviar link de redefinição"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="nexo-login-page-foot">
        Sistema desenvolvido por Gilmar Alves<br />
        © {new Date().getFullYear()} Seu Seguro Corretora — Todos os direitos reservados.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Definir nova senha (após clicar no link recebido por e-mail)        */
/* ------------------------------------------------------------------ */

function RedefinirSenhaScreen({ onConcluido }) {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);

  async function handleSalvar() {
    if (!senhaAtendeRequisitos(senha)) {
      setErro("A senha deve ter pelo menos 8 caracteres, com letras e números.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    setCarregando(true);
    setErro("");
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);
    if (error) {
      setErro(error.message || "Não foi possível atualizar a senha. Peça um novo link e tente de novo.");
      return;
    }
    setConcluido(true);
  }

  return (
    <div className="nexo-login-page">
      <div className="nexo-login-body">
        <div className="nexo-login-hero">
          <div className="nexo-login-hero-blob b1" />
          <div className="nexo-login-hero-blob b2" />
          <div className="nexo-login-skyline" aria-hidden="true">
            {[38, 62, 44, 80, 52, 68, 40, 90, 56, 46, 72, 50, 84, 40, 60].map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="nexo-login-hero-content">
            <div className="nexo-login-brand">
              <div className="nexo-login-brand-mark"><Shield size={26} color="#fff" /></div>
              <div>
                <div className="nexo-login-brand-name">SEU SEGURO</div>
                <div className="nexo-login-brand-tagline">Seguros para todos</div>
              </div>
            </div>
            <div className="nexo-login-hero-mid">
              <div className="nexo-login-quote">"Protegendo o que <span>realmente importa</span>."</div>
              <div className="nexo-login-hero-icons">
                <span className="item"><Shield size={15} /> Dados protegidos</span>
                <span className="item"><CheckCircle2 size={15} /> Cobertura completa</span>
                <span className="item"><Clock size={15} /> Atendimento ágil</span>
              </div>
            </div>
            <div className="nexo-login-hero-foot">Plataforma de gestão para corretoras e representantes de seguros.</div>
          </div>
        </div>

        <div className="nexo-login-panel">
          <div className="nexo-login-card">
            {concluido ? (
              <>
                <div className="nexo-login-eyebrow">Tudo certo</div>
                <h1>Senha atualizada</h1>
                <p className="sub">Sua senha foi alterada com sucesso.</p>
                <button
                  className="nexo-btn nexo-btn-primary nexo-login-submit"
                  onClick={() => { supabase.auth.signOut(); onConcluido(); }}
                >
                  Ir para o login
                </button>
              </>
            ) : (
              <>
                <div className="nexo-login-eyebrow">Redefinir senha</div>
                <h1>Defina uma nova senha</h1>
                <p className="sub">Escolha uma senha com pelo menos 8 caracteres, com letras e números.</p>
                <div className="nexo-login-fields">
                  <Field label="Nova senha">
                    <input
                      type="password"
                      className="nexo-input"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      autoFocus
                    />
                  </Field>
                  <Field label="Confirmar nova senha">
                    <input
                      type="password"
                      className="nexo-input"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSalvar()}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </Field>
                </div>
                {erro && <div className="nexo-login-alert err" role="alert">{erro}</div>}
                <button
                  className="nexo-btn nexo-btn-primary nexo-login-submit"
                  disabled={carregando}
                  onClick={handleSalvar}
                >
                  {carregando ? "Salvando…" : "Salvar nova senha"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="nexo-login-page-foot">
        Sistema desenvolvido por Gilmar Alves<br />
        © {new Date().getFullYear()} Seu Seguro Corretora — Todos os direitos reservados.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status genérico (Adesões / Comissões)                                */
/* ------------------------------------------------------------------ */

const STATUS_TONS = {
  Recebida: "success", Pago: "success",
  Pendente: "warning", "A pagar": "warning",
  Cancelada: "danger", Cancelado: "danger",
};
function StatusPill({ status }) {
  const tone = STATUS_TONS[status] || "info";
  const cor = { success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)", info: "var(--info)" }[tone];
  const fundo = { success: "var(--success-soft)", warning: "var(--warning-soft)", danger: "var(--danger-soft)", info: "var(--info-soft)" }[tone];
  return <span className="nexo-badge" style={{ color: cor, background: fundo }}>{status}</span>;
}

/* ------------------------------------------------------------------ */
/* Consultoras                                                          */
/* ------------------------------------------------------------------ */

function ConsultoraForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || { nome: "", telefone: "", email: "", status: "Ativa" });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit() {
    const errs = {};
    if (!f.nome.trim()) errs.nome = "Informe o nome.";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, id: initial?.id });
  }

  return (
    <>
      <Field label="Nome da consultora *" error={errors.nome}>
        <input className="nexo-input" value={f.nome} onChange={set("nome")} placeholder="Nome completo" />
      </Field>
      <div className="nexo-field-row">
        <Field label="Telefone">
          <input className="nexo-input mono" value={f.telefone} onChange={(e) => setF({ ...f, telefone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" />
        </Field>
        <Field label="E-mail">
          <input type="email" className="nexo-input" value={f.email} onChange={set("email")} placeholder="nome@email.com" />
        </Field>
      </div>
      <Field label="Status">
        <select className="nexo-select" value={f.status} onChange={set("status")}>
          <option>Ativa</option>
          <option>Inativa</option>
        </select>
      </Field>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar consultora</button>
      </div>
    </>
  );
}

function ConsultorasView({ db, onOpenModal, onDeleteConsultora }) {
  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Consultoras<span className="nexo-section-count">{db.consultoras.length} cadastradas</span></div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("consultora")}><Plus size={15} /> Nova consultora</button>
      </div>

      {db.consultoras.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Users} title="Nenhuma consultora cadastrada" sub="Clique em “Nova consultora” para começar." /></div>
      ) : (
        <div className="nexo-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {db.consultoras.map((c) => {
            const adesoesDaConsultora = db.adesoes.filter((a) => a.consultoraId === c.id);
            const comissoesDaConsultora = db.comissoes.filter((cm) => cm.consultoraId === c.id);
            const totalRecebido = sum(adesoesDaConsultora.filter((a) => a.status === "Recebida").map((a) => a.valorRecebido || a.valorAdesao));
            const comissaoAPagar = sum(comissoesDaConsultora.filter((cm) => cm.status === "A pagar").map((cm) => cm.valorComissao));
            const comissaoPaga = sum(comissoesDaConsultora.filter((cm) => cm.status === "Pago").map((cm) => cm.valorComissao));
            return (
              <div key={c.id} className="nexo-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{c.nome}</div>
                    <div className="nexo-cell-muted" style={{ marginTop: 2 }}>{c.telefone || c.email || "—"}</div>
                  </div>
                  <AtivoInativoBadge ativo={c.status === "Ativa" ? "Ativo" : "Inativo"} />
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-dim)", display: "flex", flexDirection: "column", gap: 4 }}>
                  <span>Adesões recebidas: <strong className="mono">{formatBRL(totalRecebido)}</strong></span>
                  <span>Comissão a pagar: <strong className="mono" style={{ color: "var(--warning)" }}>{formatBRL(comissaoAPagar)}</strong></span>
                  <span>Comissão paga: <strong className="mono" style={{ color: "var(--success)" }}>{formatBRL(comissaoPaga)}</strong></span>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <button className="nexo-btn nexo-btn-sm" onClick={() => onOpenModal("consultora", c)}><Pencil size={12} /> Editar</button>
                  <button className="nexo-btn nexo-btn-sm nexo-btn-danger" onClick={() => onDeleteConsultora(c.id)}><Trash2 size={12} /> Excluir</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Links Úteis                                                          */
/* ------------------------------------------------------------------ */

function LinkForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || { nome: "", url: "", observacao: "" });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit() {
    const errs = {};
    if (!f.nome.trim()) errs.nome = "Informe um nome.";
    if (!f.url.trim()) errs.url = "Informe o link.";
    else if (!/^https?:\/\//i.test(f.url.trim())) errs.url = "O link deve começar com http:// ou https://";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, id: initial?.id });
  }

  return (
    <>
      <Field label="Nome *" error={errors.nome}>
        <input className="nexo-input" value={f.nome} onChange={set("nome")} placeholder="Ex.: SGA Hinova, Porto Seguro Corretor…" />
      </Field>
      <Field label="Link (URL) *" error={errors.url}>
        <input className="nexo-input mono" value={f.url} onChange={set("url")} placeholder="https://..." />
      </Field>
      <Field label="Observação (opcional)">
        <input className="nexo-input" value={f.observacao} onChange={set("observacao")} placeholder="Ex.: login com CPF, usuário compartilhado…" />
      </Field>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar link</button>
      </div>
    </>
  );
}

function LinksUteisView({ db, onOpenModal, onDeleteLink }) {
  const [query, setQuery] = useState("");
  const filtered = db.linksUteis.filter((l) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return l.nome.toLowerCase().includes(q) || l.url.toLowerCase().includes(q) || (l.observacao || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Links Úteis<span className="nexo-section-count">{db.linksUteis.length} cadastrados</span></div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("link")}><Plus size={15} /> Novo link</button>
      </div>

      <div className="nexo-filters">
        <div className="nexo-filter-field" style={{ minWidth: 260 }}>
          <label>Buscar</label>
          <input className="nexo-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome, link ou observação" />
        </div>
      </div>

      {db.linksUteis.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Link2} title="Nenhum link cadastrado" sub="Clique em “Novo link” para adicionar os sistemas das seguradoras/corretoras que você usa." /></div>
      ) : filtered.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={ListFilter} title="Nenhum link encontrado" sub="Ajuste a busca para ver outros resultados." /></div>
      ) : (
        <div className="nexo-table-wrap">
          <div className="nexo-table-scroll">
            <table className="nexo-table">
              <thead>
                <tr><th>Nome</th><th>Link</th><th>Observação</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.nome}</td>
                    <td>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="mono" style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 4, wordBreak: "break-all" }}>
                        {l.url} <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="nexo-cell-muted">{l.observacao || "—"}</td>
                    <td>
                      <div className="nexo-actions-cell">
                        <button className="nexo-icon-btn" onClick={() => onOpenModal("link", l)}><Pencil size={13} /></button>
                        <button className="nexo-icon-btn" onClick={() => onDeleteLink(l.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Adesões                                                               */
/* ------------------------------------------------------------------ */

function AdesaoForm({ initial, clientes, consultoras, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || { clienteId: "", consultoraId: "", dataVenda: todayISO(), valorAdesao: "", valorRecebido: "", dataRecebimento: "", status: "Pendente" }
  );
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit() {
    const errs = {};
    if (!f.clienteId) errs.clienteId = "Selecione o cliente.";
    if (!f.consultoraId) errs.consultoraId = "Selecione a consultora.";
    if (!f.valorAdesao || Number(f.valorAdesao) <= 0) errs.valorAdesao = "Informe um valor válido.";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, id: initial?.id });
  }

  return (
    <>
      <div className="nexo-field-row">
        <Field label="Cliente *" error={errors.clienteId}>
          <select className="nexo-select" value={f.clienteId} onChange={set("clienteId")}>
            <option value="">Selecione</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Field>
        <Field label="Consultora responsável *" error={errors.consultoraId}>
          <select className="nexo-select" value={f.consultoraId} onChange={set("consultoraId")}>
            <option value="">Selecione</option>
            {consultoras.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Data da venda">
          <input type="date" className="nexo-input" value={f.dataVenda} onChange={set("dataVenda")} />
        </Field>
        <Field label="Valor da adesão *" error={errors.valorAdesao}>
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorAdesao} onChange={set("valorAdesao")} placeholder="0,00" />
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Valor recebido">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorRecebido} onChange={set("valorRecebido")} placeholder="0,00" />
        </Field>
        <Field label="Data do recebimento">
          <input type="date" className="nexo-input" value={f.dataRecebimento} onChange={set("dataRecebimento")} />
        </Field>
      </div>
      <Field label="Status">
        <select className="nexo-select" value={f.status} onChange={set("status")}>
          <option>Pendente</option>
          <option>Recebida</option>
          <option>Cancelada</option>
        </select>
      </Field>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar adesão</button>
      </div>
    </>
  );
}

function AdesoesView({ db, onOpenModal, onDeleteAdesao, onMarcarRecebida }) {
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const nomeCliente = (id) => db.clientes.find((c) => c.id === id)?.nome || "—";
  const nomeConsultora = (id) => db.consultoras.find((c) => c.id === id)?.nome || "—";

  const recebidas = db.adesoes.filter((a) => a.status === "Recebida");
  const pendentes = db.adesoes.filter((a) => a.status === "Pendente");
  const canceladas = db.adesoes.filter((a) => a.status === "Cancelada");

  const filtradas = filtroStatus === "Todos" ? db.adesoes : db.adesoes.filter((a) => a.status === filtroStatus);

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Adesões<span className="nexo-section-count">{db.adesoes.length} lançadas</span></div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("adesao")}><Plus size={15} /> Nova adesão</button>
      </div>

      <div className="nexo-kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <Kpi icon={CheckCircle2} label="Adesões recebidas" value={formatBRL(sum(recebidas.map((a) => a.valorRecebido || a.valorAdesao)))} tone="success" />
        <Kpi icon={Clock} label="Adesões pendentes" value={formatBRL(sum(pendentes.map((a) => a.valorAdesao)))} tone="warning" />
        <Kpi icon={XCircle} label="Adesões canceladas" value={formatBRL(sum(canceladas.map((a) => a.valorAdesao)))} tone="danger" />
      </div>

      <div className="nexo-filters">
        <div className="nexo-filter-field">
          <label>Status</label>
          <select className="nexo-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option>Todos</option><option>Pendente</option><option>Recebida</option><option>Cancelada</option>
          </select>
        </div>
      </div>

      {db.adesoes.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={FileText} title="Nenhuma adesão lançada" sub="Clique em “Nova adesão” para começar." /></div>
      ) : (
        <div className="nexo-table-wrap">
          <div className="nexo-table-scroll">
            <table className="nexo-table">
              <thead><tr><th>Cliente</th><th>Consultora</th><th>Data da venda</th><th>Valor</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtradas.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{nomeCliente(a.clienteId)}</td>
                    <td className="nexo-cell-muted">{nomeConsultora(a.consultoraId)}</td>
                    <td>{formatDateBR(a.dataVenda)}</td>
                    <td className="mono">{formatBRL(a.valorAdesao)}</td>
                    <td><StatusPill status={a.status} /></td>
                    <td>
                      <div className="nexo-actions-cell">
                        {a.status === "Pendente" && <button className="nexo-btn nexo-btn-sm" onClick={() => onMarcarRecebida(a.id)}>Marcar recebida</button>}
                        <button className="nexo-icon-btn" onClick={() => onOpenModal("adesao", a)}><Pencil size={13} /></button>
                        <button className="nexo-icon-btn" onClick={() => onDeleteAdesao(a.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Comissões                                                             */
/* ------------------------------------------------------------------ */

function ComissaoForm({ initial, clientes, consultoras, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      consultoraId: "", clienteId: "", tipo: "Contrato/Mensalidade", referencia: "", dataVenda: todayISO(),
      valorBase: "", percentual: "", valorComissao: "", dataPrevistaPagamento: "", dataEfetivaPagamento: "", status: "A pagar",
    }
  );
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function setEComputar(k) {
    return (e) => {
      const next = { ...f, [k]: e.target.value };
      const base = Number(next.valorBase) || 0;
      const pct = Number(next.percentual) || 0;
      if (k === "valorBase" || k === "percentual") next.valorComissao = base && pct ? String(Math.round(base * (pct / 100) * 100) / 100) : next.valorComissao;
      setF(next);
    };
  }

  function submit() {
    const errs = {};
    if (!f.consultoraId) errs.consultoraId = "Selecione a consultora.";
    if (!f.clienteId) errs.clienteId = "Selecione o cliente.";
    if (!f.valorBase || Number(f.valorBase) <= 0) errs.valorBase = "Informe o valor do contrato/adesão.";
    if (!f.percentual || Number(f.percentual) <= 0) errs.percentual = "Informe o percentual.";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, id: initial?.id });
  }

  return (
    <>
      <div className="nexo-field-row">
        <Field label="Consultora *" error={errors.consultoraId}>
          <select className="nexo-select" value={f.consultoraId} onChange={set("consultoraId")}>
            <option value="">Selecione</option>
            {consultoras.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Field>
        <Field label="Cliente *" error={errors.clienteId}>
          <select className="nexo-select" value={f.clienteId} onChange={set("clienteId")}>
            <option value="">Selecione</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Comissão sobre">
          <select className="nexo-select" value={f.tipo} onChange={set("tipo")}>
            <option>Contrato/Mensalidade</option>
            <option>Adesão</option>
          </select>
        </Field>
        <Field label="Contrato / referência">
          <input className="nexo-input" value={f.referencia} onChange={set("referencia")} placeholder="Ex.: Contrato nº 123" />
        </Field>
      </div>
      <Field label="Data da venda">
        <input type="date" className="nexo-input" value={f.dataVenda} onChange={set("dataVenda")} />
      </Field>
      <div className="nexo-field-row3">
        <Field label="Valor do contrato/adesão *" error={errors.valorBase}>
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorBase} onChange={setEComputar("valorBase")} placeholder="0,00" />
        </Field>
        <Field label="Percentual (%) *" error={errors.percentual}>
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.percentual} onChange={setEComputar("percentual")} placeholder="10" />
        </Field>
        <Field label="Valor da comissão">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorComissao} onChange={set("valorComissao")} placeholder="Calculado automaticamente" />
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Data prevista de pagamento">
          <input type="date" className="nexo-input" value={f.dataPrevistaPagamento} onChange={set("dataPrevistaPagamento")} />
        </Field>
        <Field label="Data efetiva do pagamento">
          <input type="date" className="nexo-input" value={f.dataEfetivaPagamento} onChange={set("dataEfetivaPagamento")} />
        </Field>
      </div>
      <Field label="Status">
        <select className="nexo-select" value={f.status} onChange={set("status")}>
          <option>A pagar</option>
          <option>Pago</option>
          <option>Cancelado</option>
        </select>
      </Field>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar comissão</button>
      </div>
    </>
  );
}

function ComissoesView({ db, onOpenModal, onDeleteComissao, onMarcarPagaComissao }) {
  const [aba, setAba] = useState("lista"); // lista | fechamento
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const nomeCliente = (id) => db.clientes.find((c) => c.id === id)?.nome || "—";
  const nomeConsultora = (id) => db.consultoras.find((c) => c.id === id)?.nome || "—";

  const aPagar = db.comissoes.filter((c) => c.status === "A pagar");
  const pagas = db.comissoes.filter((c) => c.status === "Pago");
  const filtradas = filtroStatus === "Todos" ? db.comissoes : db.comissoes.filter((c) => c.status === filtroStatus);

  const fechamentoPorConsultora = db.consultoras.map((consultora) => {
    const comissoesDaConsultora = db.comissoes.filter((c) => c.consultoraId === consultora.id);
    return {
      consultora,
      totalContratos: comissoesDaConsultora.length,
      totalComissao: sum(comissoesDaConsultora.map((c) => c.valorComissao)),
      totalPago: sum(comissoesDaConsultora.filter((c) => c.status === "Pago").map((c) => c.valorComissao)),
      totalAPagar: sum(comissoesDaConsultora.filter((c) => c.status === "A pagar").map((c) => c.valorComissao)),
    };
  }).filter((f) => f.totalContratos > 0);

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Comissões<span className="nexo-section-count">{db.comissoes.length} lançamentos</span></div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("comissao")}><Plus size={15} /> Nova comissão</button>
      </div>

      <div className="nexo-kpi-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <Kpi icon={Clock} label="Comissões a pagar" value={formatBRL(sum(aPagar.map((c) => c.valorComissao)))} tone="warning" />
        <Kpi icon={CheckCircle2} label="Comissões pagas" value={formatBRL(sum(pagas.map((c) => c.valorComissao)))} tone="success" />
      </div>

      <div className="nexo-tabs">
        <div className={`nexo-tab ${aba === "lista" ? "active" : ""}`} onClick={() => setAba("lista")}>Lançamentos</div>
        <div className={`nexo-tab ${aba === "fechamento" ? "active" : ""}`} onClick={() => setAba("fechamento")}>Fechamento por consultora</div>
      </div>

      {aba === "lista" ? (
        <>
          <div className="nexo-filters">
            <div className="nexo-filter-field">
              <label>Status</label>
              <select className="nexo-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                <option>Todos</option><option>A pagar</option><option>Pago</option><option>Cancelado</option>
              </select>
            </div>
          </div>
          {db.comissoes.length === 0 ? (
            <div className="nexo-table-wrap"><EmptyState icon={FileText} title="Nenhuma comissão lançada" sub="Clique em “Nova comissão” para começar." /></div>
          ) : (
            <div className="nexo-table-wrap">
              <div className="nexo-table-scroll">
                <table className="nexo-table">
                  <thead><tr><th>Consultora</th><th>Cliente</th><th>Sobre</th><th>Valor base</th><th>%</th><th>Comissão</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {filtradas.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{nomeConsultora(c.consultoraId)}</td>
                        <td className="nexo-cell-muted">{nomeCliente(c.clienteId)}</td>
                        <td className="nexo-cell-muted">{c.tipo}</td>
                        <td className="mono">{formatBRL(c.valorBase)}</td>
                        <td className="mono">{c.percentual}%</td>
                        <td className="mono" style={{ fontWeight: 600 }}>{formatBRL(c.valorComissao)}</td>
                        <td><StatusPill status={c.status} /></td>
                        <td>
                          <div className="nexo-actions-cell">
                            {c.status === "A pagar" && <button className="nexo-btn nexo-btn-sm" onClick={() => onMarcarPagaComissao(c.id)}>Marcar pago</button>}
                            <button className="nexo-icon-btn" onClick={() => onOpenModal("comissao", c)}><Pencil size={13} /></button>
                            <button className="nexo-icon-btn" onClick={() => onDeleteComissao(c.id)}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="nexo-table-wrap">
          <div className="nexo-table-scroll">
            <table className="nexo-table">
              <thead><tr><th>Consultora</th><th>Total de contratos</th><th>Total de comissão</th><th>Pago</th><th>A pagar</th></tr></thead>
              <tbody>
                {fechamentoPorConsultora.length === 0 ? (
                  <tr><td colSpan={5} className="nexo-cell-muted" style={{ textAlign: "center", padding: 24 }}>Nenhuma comissão lançada ainda.</td></tr>
                ) : fechamentoPorConsultora.map((f) => (
                  <tr key={f.consultora.id}>
                    <td style={{ fontWeight: 600 }}>{f.consultora.nome}</td>
                    <td>{f.totalContratos}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{formatBRL(f.totalComissao)}</td>
                    <td className="mono" style={{ color: "var(--success)" }}>{formatBRL(f.totalPago)}</td>
                    <td className="mono" style={{ color: "var(--warning)" }}>{formatBRL(f.totalAPagar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
  { key: "relatorios", label: "Relatórios", Icon: FileText },
  { key: "cotacoes", label: "Cotação de seguros", Icon: Wallet },
  { key: "consultoras", label: "Consultoras", Icon: Users },
  { key: "adesoes", label: "Adesões", Icon: FileDown },
  { key: "comissoes", label: "Comissões", Icon: CreditCard },
  { key: "links", label: "Links Úteis", Icon: Link2 },
];

const EMPTY_DB = { clientes: [], veiculos: [], boletos: [], seguradoras: [], planos: [], cotacoes: [], consultoras: [], adesoes: [], comissoes: [], linksUteis: [] };

const rowToLink = (r) => ({ id: r.id, nome: r.nome || "", url: r.url || "", observacao: r.observacao || "" });
const linkToRow = (l) => ({ nome: l.nome, url: l.url, observacao: l.observacao || null });

const rowToConsultora = (r) => ({ id: r.id, nome: r.nome || "", telefone: r.telefone || "", email: r.email || "", status: r.status || "Ativa" });
const consultoraToRow = (c) => ({ nome: c.nome, telefone: c.telefone || null, email: c.email || null, status: c.status || "Ativa" });

const rowToAdesao = (r) => ({
  id: r.id, clienteId: r.cliente_id, consultoraId: r.consultora_id, dataVenda: r.data_venda || "",
  valorAdesao: r.valor_adesao ?? "", valorRecebido: r.valor_recebido ?? "", dataRecebimento: r.data_recebimento || "", status: r.status || "Pendente",
});
const adesaoToRow = (a) => ({
  cliente_id: a.clienteId, consultora_id: a.consultoraId, data_venda: a.dataVenda || null,
  valor_adesao: a.valorAdesao === "" ? null : Number(a.valorAdesao),
  valor_recebido: a.valorRecebido === "" || a.valorRecebido == null ? null : Number(a.valorRecebido),
  data_recebimento: a.dataRecebimento || null, status: a.status || "Pendente",
});

const rowToComissao = (r) => ({
  id: r.id, consultoraId: r.consultora_id, clienteId: r.cliente_id, tipo: r.tipo || "Contrato/Mensalidade",
  referencia: r.referencia || "", dataVenda: r.data_venda || "", valorBase: r.valor_base ?? "",
  percentual: r.percentual ?? "", valorComissao: r.valor_comissao ?? "",
  dataPrevistaPagamento: r.data_prevista_pagamento || "", dataEfetivaPagamento: r.data_efetiva_pagamento || "", status: r.status || "A pagar",
});
const comissaoToRow = (c) => ({
  consultora_id: c.consultoraId, cliente_id: c.clienteId, tipo: c.tipo || "Contrato/Mensalidade", referencia: c.referencia || null,
  data_venda: c.dataVenda || null, valor_base: c.valorBase === "" ? null : Number(c.valorBase),
  percentual: c.percentual === "" ? null : Number(c.percentual),
  valor_comissao: c.valorComissao === "" || c.valorComissao == null ? null : Number(c.valorComissao),
  data_prevista_pagamento: c.dataPrevistaPagamento || null, data_efetiva_pagamento: c.dataEfetivaPagamento || null, status: c.status || "A pagar",
});

const rowToSeguradora = (r) => ({ id: r.id, nome: r.nome || "" });
const seguradoraToRow = (s) => ({ nome: s.nome });

const rowToPlano = (r) => ({
  id: r.id, seguradoraId: r.seguradora_id, nome: r.nome || "",
  valorMensal: r.valor_mensal ?? "", valorFranquia: r.valor_franquia ?? "", beneficios: r.beneficios || "",
});
const planoToRow = (p) => ({
  seguradora_id: p.seguradoraId, nome: p.nome,
  valor_mensal: p.valorMensal === "" || p.valorMensal == null ? null : Number(p.valorMensal),
  valor_franquia: p.valorFranquia === "" || p.valorFranquia == null ? null : Number(p.valorFranquia),
  beneficios: p.beneficios || null,
});

const rowToCotacao = (r) => ({
  id: r.id, clienteId: r.cliente_id, veiculoId: r.veiculo_id, seguradoraId: r.seguradora_id, planoId: r.plano_id,
  valor: r.valor ?? "", dataCotacao: r.data_cotacao || "", observacoes: r.observacoes || "",
});
const cotacaoToRow = (c) => ({
  cliente_id: c.clienteId, veiculo_id: c.veiculoId || null, seguradora_id: c.seguradoraId, plano_id: c.planoId,
  valor: c.valor === "" || c.valor == null ? null : Number(c.valor), data_cotacao: c.dataCotacao || null,
  observacoes: c.observacoes || null,
});

/* Mapeamento entre o formato usado no app (camelCase) e as colunas do Supabase (snake_case) */
const rowToCliente = (r) => ({
  id: r.id, nome: r.nome || "", nascimento: r.nascimento || "", sexo: r.sexo || "", cpf: r.cpf || "",
  cnhNumero: r.cnh_numero || "", cnhEmissao: r.cnh_emissao || "", cnhValidade: r.cnh_validade || "",
  telefone: r.telefone || "", whatsapp: r.whatsapp || "", email: r.email || "",
  cep: r.cep || "", endereco: r.endereco || "", status: r.status || "Ativo",
});
const clienteToRow = (c) => ({
  nome: c.nome, nascimento: c.nascimento || null, sexo: c.sexo || null, cpf: c.cpf || null,
  cnh_numero: c.cnhNumero || null, cnh_emissao: c.cnhEmissao || null, cnh_validade: c.cnhValidade || null,
  telefone: c.telefone || null, whatsapp: c.whatsapp || null, email: c.email || null,
  cep: c.cep || null, endereco: c.endereco || null, status: c.status || "Ativo",
});
const rowToVeiculo = (r) => ({
  id: r.id, clienteId: r.cliente_id, tipoVeiculo: r.tipo_veiculo || "Carro ou utilitário",
  marca: r.marca || "", modelo: r.modelo || "", ano: r.ano || "",
  anoFabricacao: r.ano_fabricacao || "", placa: r.placa || "", renavam: r.renavam || "", chassi: r.chassi || "", cor: r.cor || "",
  cambio: r.cambio || "", combustivel: r.combustivel || "", quilometragem: r.quilometragem ?? "", numeroMotor: r.numero_motor || "",
  estadoCirculacao: r.estado_circulacao || "", cidadeCirculacao: r.cidade_circulacao || "", veiculoTrabalho: !!r.veiculo_trabalho,
  diaVencimento: r.dia_vencimento ?? "", depreciacao: r.depreciacao || "",
  valorVeiculo: r.valor_veiculo ?? "", valorCoberto: r.valor_coberto ?? "", valorMensal: r.valor_mensal ?? "",
  dataCadastro: r.data_cadastro || "", status: r.status || "Ativo",
  codigoFipe: r.codigo_fipe || "", valorFipe: r.valor_fipe ?? "",
  fipeCombustivel: r.fipe_combustivel || "", fipeMesReferencia: r.fipe_mes_referencia || "", fipeUltimaConsulta: r.fipe_ultima_consulta || "",
});
const veiculoToRow = (v) => ({
  cliente_id: v.clienteId, tipo_veiculo: v.tipoVeiculo || null, marca: v.marca, modelo: v.modelo, ano: v.ano || null, ano_fabricacao: v.anoFabricacao || null,
  placa: v.placa, renavam: v.renavam || null, chassi: v.chassi || null, cor: v.cor || null,
  cambio: v.cambio || null, combustivel: v.combustivel || null,
  quilometragem: v.quilometragem === "" || v.quilometragem == null ? null : Number(v.quilometragem),
  numero_motor: v.numeroMotor || null, estado_circulacao: v.estadoCirculacao || null, cidade_circulacao: v.cidadeCirculacao || null,
  veiculo_trabalho: !!v.veiculoTrabalho, dia_vencimento: v.diaVencimento === "" || v.diaVencimento == null ? null : Number(v.diaVencimento),
  depreciacao: v.depreciacao || null,
  valor_veiculo: v.valorVeiculo === "" ? null : Number(v.valorVeiculo),
  valor_coberto: v.valorCoberto === "" || v.valorCoberto == null ? null : Number(v.valorCoberto),
  valor_mensal: v.valorMensal === "" ? null : Number(v.valorMensal), data_cadastro: v.dataCadastro || null,
  status: v.status || "Ativo",
  codigo_fipe: v.codigoFipe || null, valor_fipe: v.valorFipe === "" || v.valorFipe == null ? null : Number(v.valorFipe),
  fipe_combustivel: v.fipeCombustivel || null, fipe_mes_referencia: v.fipeMesReferencia || null, fipe_ultima_consulta: v.fipeUltimaConsulta || null,
});
const rowToBoleto = (r) => ({
  id: r.id, clienteId: r.cliente_id, veiculoId: r.veiculo_id || "", numero: r.numero || "",
  nossoNumero: r.nosso_numero || "",
  dataEmissao: r.data_emissao || "", dataVencimento: r.data_vencimento || "", valor: r.valor ?? "",
  dataPagamento: r.data_pagamento || "",
});
const boletoToRow = (b) => ({
  cliente_id: b.clienteId, veiculo_id: b.veiculoId || null, numero: b.numero,
  nosso_numero: (b.nossoNumero || "").trim() || null,
  data_emissao: b.dataEmissao || null,
  data_vencimento: b.dataVencimento || null, valor: Number(b.valor), data_pagamento: b.dataPagamento || null,
});

export default function App() {
  const [sessao, setSessao] = useState(undefined); // undefined = verificando, null = sem sessão, objeto = logado
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);
  const [db, setDb] = useState(EMPTY_DB);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState("dashboard");
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const [modal, setModal] = useState(null); // { type, data, defaultClienteId, defaultVeiculoId }
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // Disparado quando o usuário chega pelo link de "redefinir senha" do e-mail.
      if (event === "PASSWORD_RECOVERY") setRecuperandoSenha(true);
      setSessao(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const carregarTudo = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [clientesRes, veiculosRes, boletosRes, seguradorasRes, planosRes, cotacoesRes, consultorasRes, adesoesRes, comissoesRes, linksUteisRes] = await Promise.all([
        supabase.from("clientes").select("*").order("nome"),
        supabase.from("veiculos").select("*"),
        supabase.from("boletos").select("*"),
        supabase.from("seguradoras").select("*").order("nome"),
        supabase.from("planos").select("*"),
        supabase.from("cotacoes").select("*"),
        supabase.from("consultoras").select("*").order("nome"),
        supabase.from("adesoes").select("*"),
        supabase.from("comissoes").select("*"),
        supabase.from("links_uteis").select("*").order("nome"),
      ]);
      if (clientesRes.error) throw clientesRes.error;
      if (veiculosRes.error) throw veiculosRes.error;
      if (boletosRes.error) throw boletosRes.error;
      if (seguradorasRes.error) throw seguradorasRes.error;
      if (planosRes.error) throw planosRes.error;
      if (cotacoesRes.error) throw cotacoesRes.error;
      if (consultorasRes.error) throw consultorasRes.error;
      if (adesoesRes.error) throw adesoesRes.error;
      if (comissoesRes.error) throw comissoesRes.error;
      if (linksUteisRes.error) throw linksUteisRes.error;
      setDb({
        clientes: (clientesRes.data || []).map(rowToCliente),
        veiculos: (veiculosRes.data || []).map(rowToVeiculo),
        boletos: (boletosRes.data || []).map(rowToBoleto),
        seguradoras: (seguradorasRes.data || []).map(rowToSeguradora),
        planos: (planosRes.data || []).map(rowToPlano),
        cotacoes: (cotacoesRes.data || []).map(rowToCotacao),
        consultoras: (consultorasRes.data || []).map(rowToConsultora),
        adesoes: (adesoesRes.data || []).map(rowToAdesao),
        comissoes: (comissoesRes.data || []).map(rowToComissao),
        linksUteis: (linksUteisRes.data || []).map(rowToLink),
      });
    } catch (e) {
      console.error(e);
      setLoadError(e.message || "Não foi possível conectar ao banco de dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessao) carregarTudo();
  }, [carregarTudo, sessao]);

  const closeModal = () => setModal(null);
  const openModal = (type, data = null, defaultClienteId = null, defaultVeiculoId = null, defaultSeguradoraId = null) =>
    setModal({ type, data, defaultClienteId, defaultVeiculoId, defaultSeguradoraId });

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
        const anterior = db.veiculos.find((v) => v.id === veiculo.id);
        const { data, error } = await supabase.from("veiculos").update(veiculoToRow(veiculo)).eq("id", veiculo.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, veiculos: prev.veiculos.map((v) => (v.id === data.id ? rowToVeiculo(data) : v)) }));
        const valorAntigo = anterior ? Number(anterior.valorFipe) || null : null;
        const valorNovo = Number(veiculo.valorFipe) || null;
        if (veiculo.codigoFipe && valorNovo != null && valorNovo !== valorAntigo) {
          await supabase.from("fipe_historico").insert({
            veiculo_id: veiculo.id,
            codigo_fipe: veiculo.codigoFipe,
            valor_anterior: valorAntigo,
            valor_novo: valorNovo,
            referencia: veiculo.fipeMesReferencia || null,
          });
        }
      } else {
        const { data, error } = await supabase.from("veiculos").insert(veiculoToRow(veiculo)).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, veiculos: [...prev.veiculos, rowToVeiculo(data)] }));
        if (data.codigo_fipe && data.valor_fipe != null) {
          await supabase.from("fipe_historico").insert({
            veiculo_id: data.id,
            codigo_fipe: data.codigo_fipe,
            valor_anterior: null,
            valor_novo: data.valor_fipe,
            referencia: data.fipe_mes_referencia || null,
          });
        }
      }
      closeModal();
    } catch (e) {
      alert("Não foi possível salvar o veículo: " + e.message);
    }
  };

  function somarMeses(dataISO, meses) {
    const [y, m, d] = dataISO.split("-").map(Number);
    const dt = new Date(y, m - 1 + meses, d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  }

  const saveBoleto = async (boleto) => {
    try {
      if (boleto.id) {
        const { data, error } = await supabase.from("boletos").update(boletoToRow(boleto)).eq("id", boleto.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, boletos: prev.boletos.map((b) => (b.id === data.id ? rowToBoleto(data) : b)) }));
      } else {
        const totalParcelas = Math.max(1, Math.min(12, Number(boleto.parcelas) || 1));
        const linhas = Array.from({ length: totalParcelas }, (_, i) => {
          const parcelado = totalParcelas > 1;
          return boletoToRow({
            ...boleto,
            numero: parcelado ? `${boleto.numero}-${i + 1}/${totalParcelas}` : boleto.numero,
            // o Nosso Número é um controle único por boleto: em parcelamento, só a 1ª parcela leva
            // o valor informado (senão as parcelas seguintes violariam a unicidade)
            nossoNumero: i === 0 ? boleto.nossoNumero : "",
            dataVencimento: somarMeses(boleto.dataVencimento, i),
            // a data de pagamento (se informada) só se aplica à 1ª parcela; as seguintes começam em aberto
            dataPagamento: i === 0 ? boleto.dataPagamento : "",
          });
        });
        const { data, error } = await supabase.from("boletos").insert(linhas).select();
        if (error) throw error;
        setDb((prev) => ({ ...prev, boletos: [...prev.boletos, ...(data || []).map(rowToBoleto)] }));
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

  // --- Seguradoras, planos e cotações ---
  const saveSeguradora = async (nome) => {
    try {
      const { data, error } = await supabase.from("seguradoras").insert({ nome }).select().single();
      if (error) throw error;
      setDb((prev) => ({ ...prev, seguradoras: [...prev.seguradoras, rowToSeguradora(data)] }));
      return data.id;
    } catch (e) {
      alert("Não foi possível salvar a seguradora: " + e.message);
      return null;
    }
  };

  const deleteSeguradora = async (id) => {
    if (!window.confirm("Excluir esta seguradora? Os planos vinculados também serão removidos.")) return;
    try {
      const { error } = await supabase.from("seguradoras").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({
        ...prev,
        seguradoras: prev.seguradoras.filter((s) => s.id !== id),
        planos: prev.planos.filter((p) => p.seguradoraId !== id),
      }));
    } catch (e) {
      alert("Não foi possível excluir a seguradora: " + e.message);
    }
  };

  const savePlano = async (plano) => {
    try {
      if (plano.id) {
        const { data, error } = await supabase.from("planos").update(planoToRow(plano)).eq("id", plano.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, planos: prev.planos.map((p) => (p.id === data.id ? rowToPlano(data) : p)) }));
      } else {
        const { data, error } = await supabase.from("planos").insert(planoToRow(plano)).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, planos: [...prev.planos, rowToPlano(data)] }));
      }
      closeModal();
    } catch (e) {
      alert("Não foi possível salvar o plano: " + e.message);
    }
  };

  const deletePlano = async (id) => {
    if (!window.confirm("Excluir este plano?")) return;
    try {
      const { error } = await supabase.from("planos").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, planos: prev.planos.filter((p) => p.id !== id) }));
    } catch (e) {
      alert("Não foi possível excluir o plano: " + e.message);
    }
  };

  const saveCotacao = async (cotacao) => {
    try {
      if (cotacao.id) {
        const { data, error } = await supabase.from("cotacoes").update(cotacaoToRow(cotacao)).eq("id", cotacao.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, cotacoes: prev.cotacoes.map((c) => (c.id === data.id ? rowToCotacao(data) : c)) }));
      } else {
        const { data, error } = await supabase.from("cotacoes").insert(cotacaoToRow(cotacao)).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, cotacoes: [...prev.cotacoes, rowToCotacao(data)] }));
      }
      closeModal();
    } catch (e) {
      alert("Não foi possível salvar a cotação: " + e.message);
    }
  };

  const deleteCotacao = async (id) => {
    if (!window.confirm("Excluir esta cotação?")) return;
    try {
      const { error } = await supabase.from("cotacoes").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, cotacoes: prev.cotacoes.filter((c) => c.id !== id) }));
    } catch (e) {
      alert("Não foi possível excluir a cotação: " + e.message);
    }
  };

  // --- Links Úteis ---
  const saveLink = async (link) => {
    try {
      if (link.id) {
        const { data, error } = await supabase.from("links_uteis").update(linkToRow(link)).eq("id", link.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, linksUteis: prev.linksUteis.map((l) => (l.id === data.id ? rowToLink(data) : l)) }));
      } else {
        const { data, error } = await supabase.from("links_uteis").insert(linkToRow(link)).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, linksUteis: [...prev.linksUteis, rowToLink(data)] }));
      }
      closeModal();
    } catch (e) {
      alert("Não foi possível salvar o link: " + e.message);
    }
  };
  const deleteLink = async (id) => {
    if (!window.confirm("Excluir este link?")) return;
    try {
      const { error } = await supabase.from("links_uteis").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, linksUteis: prev.linksUteis.filter((l) => l.id !== id) }));
    } catch (e) {
      alert("Não foi possível excluir o link: " + e.message);
    }
  };

  // --- Consultoras ---
  const saveConsultora = async (consultora) => {
    try {
      if (consultora.id) {
        const { data, error } = await supabase.from("consultoras").update(consultoraToRow(consultora)).eq("id", consultora.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, consultoras: prev.consultoras.map((c) => (c.id === data.id ? rowToConsultora(data) : c)) }));
      } else {
        const { data, error } = await supabase.from("consultoras").insert(consultoraToRow(consultora)).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, consultoras: [...prev.consultoras, rowToConsultora(data)] }));
      }
      closeModal();
    } catch (e) {
      alert("Não foi possível salvar a consultora: " + e.message);
    }
  };
  const deleteConsultora = async (id) => {
    if (!window.confirm("Excluir esta consultora? Adesões e comissões vinculadas a ela também serão removidas.")) return;
    try {
      const { error } = await supabase.from("consultoras").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({
        ...prev,
        consultoras: prev.consultoras.filter((c) => c.id !== id),
        adesoes: prev.adesoes.filter((a) => a.consultoraId !== id),
        comissoes: prev.comissoes.filter((c) => c.consultoraId !== id),
      }));
    } catch (e) {
      alert("Não foi possível excluir a consultora: " + e.message);
    }
  };

  // --- Adesões ---
  const saveAdesao = async (adesao) => {
    try {
      if (adesao.id) {
        const { data, error } = await supabase.from("adesoes").update(adesaoToRow(adesao)).eq("id", adesao.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, adesoes: prev.adesoes.map((a) => (a.id === data.id ? rowToAdesao(data) : a)) }));
      } else {
        const { data, error } = await supabase.from("adesoes").insert(adesaoToRow(adesao)).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, adesoes: [...prev.adesoes, rowToAdesao(data)] }));
      }
      closeModal();
    } catch (e) {
      alert("Não foi possível salvar a adesão: " + e.message);
    }
  };
  const deleteAdesao = async (id) => {
    if (!window.confirm("Excluir esta adesão?")) return;
    try {
      const { error } = await supabase.from("adesoes").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, adesoes: prev.adesoes.filter((a) => a.id !== id) }));
    } catch (e) {
      alert("Não foi possível excluir a adesão: " + e.message);
    }
  };
  const marcarRecebidaAdesao = async (id) => {
    try {
      const adesao = db.adesoes.find((a) => a.id === id);
      const { data, error } = await supabase
        .from("adesoes")
        .update({ status: "Recebida", data_recebimento: todayISO(), valor_recebido: adesao?.valorAdesao ?? null })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setDb((prev) => ({ ...prev, adesoes: prev.adesoes.map((a) => (a.id === id ? rowToAdesao(data) : a)) }));
    } catch (e) {
      alert("Não foi possível atualizar a adesão: " + e.message);
    }
  };

  // --- Comissões ---
  const saveComissao = async (comissao) => {
    try {
      if (comissao.id) {
        const { data, error } = await supabase.from("comissoes").update(comissaoToRow(comissao)).eq("id", comissao.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, comissoes: prev.comissoes.map((c) => (c.id === data.id ? rowToComissao(data) : c)) }));
      } else {
        const { data, error } = await supabase.from("comissoes").insert(comissaoToRow(comissao)).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, comissoes: [...prev.comissoes, rowToComissao(data)] }));
      }
      closeModal();
    } catch (e) {
      alert("Não foi possível salvar a comissão: " + e.message);
    }
  };
  const deleteComissao = async (id) => {
    if (!window.confirm("Excluir esta comissão?")) return;
    try {
      const { error } = await supabase.from("comissoes").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, comissoes: prev.comissoes.filter((c) => c.id !== id) }));
    } catch (e) {
      alert("Não foi possível excluir a comissão: " + e.message);
    }
  };
  const marcarPagaComissao = async (id) => {
    try {
      const { data, error } = await supabase.from("comissoes").update({ status: "Pago", data_efetiva_pagamento: todayISO() }).eq("id", id).select().single();
      if (error) throw error;
      setDb((prev) => ({ ...prev, comissoes: prev.comissoes.map((c) => (c.id === id ? rowToComissao(data) : c)) }));
    } catch (e) {
      alert("Não foi possível atualizar a comissão: " + e.message);
    }
  };

  // --- Importação em massa (CSV) ---
  const importarClientesCSV = async (linhas) => {
    if (linhas.length === 0) return;
    try {
      const payload = linhas.map((l) => clienteToRow({ ...l, status: l.status || "Ativo" }));
      const { data, error } = await supabase.from("clientes").insert(payload).select();
      if (error) throw error;
      setDb((prev) => ({ ...prev, clientes: [...prev.clientes, ...(data || []).map(rowToCliente)] }));
      alert(`${data?.length || 0} cliente(s) importado(s) com sucesso.`);
    } catch (e) {
      alert("Não foi possível importar os clientes: " + e.message);
    }
  };

  // Importa clientes e seus veículos em uma única planilha (uma linha = um veículo;
  // repita o CPF em várias linhas para cadastrar mais de um veículo do mesmo cliente).
  // Se o cliente já existir (mesmo CPF), reaproveita o cadastro em vez de duplicá-lo.
  const importarClientesEVeiculosCSV = async (linhas) => {
    if (linhas.length === 0) return;
    try {
      const cpfParaId = new Map(db.clientes.map((c) => [c.cpf.replace(/\D/g, ""), c.id]));
      const placasExistentes = new Set(db.veiculos.map((v) => v.placa.replace(/[^a-z0-9]/gi, "").toLowerCase()));
      const dadosClientePorCpf = new Map();
      const ignoradas = [];

      linhas.forEach((l, idx) => {
        const cpfNumerico = (l.cpf || "").replace(/\D/g, "");
        if (!l.nome || !cpfNumerico) { ignoradas.push(`Linha ${idx + 2}: sem nome ou CPF/CNPJ válido`); return; }
        if (!dadosClientePorCpf.has(cpfNumerico)) {
          dadosClientePorCpf.set(cpfNumerico, {
            nome: l.nome, cpf: l.cpf, nascimento: l.nascimento, sexo: l.sexo, telefone: l.telefone,
            whatsapp: l.whatsapp, email: l.email, cep: l.cep, endereco: l.endereco, status: l.status || "Ativo",
          });
        }
      });

      // Cria só os clientes cujo CPF ainda não existe no Nexo.
      const cpfsNovos = [...dadosClientePorCpf.keys()].filter((cpf) => !cpfParaId.has(cpf));
      let clientesNovosCriados = [];
      if (cpfsNovos.length > 0) {
        const payloadClientes = cpfsNovos.map((cpf) => clienteToRow(dadosClientePorCpf.get(cpf)));
        const { data, error } = await supabase.from("clientes").insert(payloadClientes).select();
        if (error) throw error;
        clientesNovosCriados = data || [];
        clientesNovosCriados.forEach((c) => cpfParaId.set((c.cpf || "").replace(/\D/g, ""), c.id));
      }

      // Monta os veículos, ligando cada um ao cliente (novo ou já existente).
      const veiculosIgnorados = [];
      const payloadVeiculos = [];
      linhas.forEach((l, idx) => {
        if (!l.placa) return; // linha só de cliente, sem veículo — tudo bem, não é erro
        const cpfNumerico = (l.cpf || "").replace(/\D/g, "");
        const clienteId = cpfParaId.get(cpfNumerico);
        if (!clienteId) { veiculosIgnorados.push(`Linha ${idx + 2}: veículo "${l.placa}" sem cliente válido`); return; }
        const placaNorm = l.placa.replace(/[^a-z0-9]/gi, "").toLowerCase();
        if (placasExistentes.has(placaNorm)) { veiculosIgnorados.push(`Linha ${idx + 2}: placa "${l.placa}" já cadastrada`); return; }
        placasExistentes.add(placaNorm);
        payloadVeiculos.push(veiculoToRow({
          clienteId, tipoVeiculo: l.tipoVeiculo || "Carro ou utilitário", marca: l.marca, modelo: l.modelo,
          ano: l.ano, anoFabricacao: l.anoFabricacao, placa: l.placa, renavam: l.renavam, chassi: l.chassi, cor: l.cor,
          status: "Ativo",
        }));
      });

      let veiculosNovosCriados = [];
      if (payloadVeiculos.length > 0) {
        const { data, error } = await supabase.from("veiculos").insert(payloadVeiculos).select();
        if (error) throw error;
        veiculosNovosCriados = data || [];
      }

      setDb((prev) => ({
        ...prev,
        clientes: [...prev.clientes, ...clientesNovosCriados.map(rowToCliente)],
        veiculos: [...prev.veiculos, ...veiculosNovosCriados.map(rowToVeiculo)],
      }));

      const clientesReaproveitados = dadosClientePorCpf.size - cpfsNovos.length;
      let msg = `Importação concluída: ${clientesNovosCriados.length} cliente(s) novo(s), ${clientesReaproveitados} cliente(s) já existente(s) reaproveitado(s), ${veiculosNovosCriados.length} veículo(s) novo(s).`;
      if (ignoradas.length) msg += `\n\n${ignoradas.length} linha(s) sem nome/CPF ignorada(s):\n` + ignoradas.join("\n");
      if (veiculosIgnorados.length) msg += `\n\n${veiculosIgnorados.length} veículo(s) não importado(s):\n` + veiculosIgnorados.join("\n");
      alert(msg);
    } catch (e) {
      alert("Não foi possível importar clientes e veículos: " + e.message);
    }
  };

  const importarPlanosCSV = async (linhas) => {
    if (linhas.length === 0) return;
    try {
      const nomesExistentes = new Map(db.seguradoras.map((s) => [normalizarTexto(s.nome), s.id]));
      const nomesNovos = [...new Set(linhas.map((l) => l.seguradoraNome).filter((n) => n && !nomesExistentes.has(normalizarTexto(n))))];
      let seguradorasNovasCriadas = [];
      if (nomesNovos.length > 0) {
        const { data, error } = await supabase.from("seguradoras").insert(nomesNovos.map((nome) => ({ nome }))).select();
        if (error) throw error;
        seguradorasNovasCriadas = data || [];
        seguradorasNovasCriadas.forEach((s) => nomesExistentes.set(normalizarTexto(s.nome), s.id));
      }
      const payloadPlanos = linhas
        .filter((l) => l.seguradoraNome)
        .map((l) =>
          planoToRow({
            seguradoraId: nomesExistentes.get(normalizarTexto(l.seguradoraNome)),
            nome: l.planoNome,
            valorMensal: l.valorMensal,
            valorFranquia: l.valorFranquia,
            beneficios: l.beneficios,
          })
        );
      const { data: planosData, error: planosError } = await supabase.from("planos").insert(payloadPlanos).select();
      if (planosError) throw planosError;
      setDb((prev) => ({
        ...prev,
        seguradoras: [...prev.seguradoras, ...seguradorasNovasCriadas.map(rowToSeguradora)],
        planos: [...prev.planos, ...(planosData || []).map(rowToPlano)],
      }));
      alert(`${planosData?.length || 0} plano(s) importado(s), em ${seguradorasNovasCriadas.length} seguradora(s) nova(s).`);
    } catch (e) {
      alert("Não foi possível importar a tabela de preços: " + e.message);
    }
  };

  // Cadastro em lote de boletos (planilha com Nome/CPF do cliente, Placa, Nosso Número e Valor)
  const importarBoletosCSV = async (linhas) => {
    if (linhas.length === 0) return;
    try {
      const rejeitadas = [];
      const payload = [];
      const nossosNumerosDoArquivo = new Set();
      linhas.forEach((l, idx) => {
        const linhaRef = `Linha ${idx + 2}`;
        const cpfNumerico = (l.cpf || "").replace(/\D/g, "");
        const cliente = db.clientes.find((c) => (cpfNumerico && c.cpf.replace(/\D/g, "") === cpfNumerico) || (!cpfNumerico && l.nome && normalizarTexto(c.nome) === normalizarTexto(l.nome)));
        if (!cliente) { rejeitadas.push(`${linhaRef}: cliente "${l.nome || l.cpf}" não encontrado`); return; }
        const nossoNumero = (l.nossoNumero || "").trim();
        if (nossoNumero) {
          if (nossosNumerosDoArquivo.has(nossoNumero) || db.boletos.some((b) => (b.nossoNumero || "").trim() === nossoNumero)) {
            rejeitadas.push(`${linhaRef}: Nosso Número "${nossoNumero}" já usado em outro boleto`);
            return;
          }
          nossosNumerosDoArquivo.add(nossoNumero);
        }
        const veiculo = l.placa
          ? db.veiculos.find((v) => v.clienteId === cliente.id && v.placa.replace(/[^a-z0-9]/gi, "").toLowerCase() === l.placa.replace(/[^a-z0-9]/gi, "").toLowerCase())
          : null;
        payload.push(
          boletoToRow({
            clienteId: cliente.id,
            veiculoId: veiculo ? veiculo.id : "",
            numero: nossoNumero || `IMP-${Date.now()}-${idx}`,
            nossoNumero,
            dataEmissao: todayISO(),
            dataVencimento: l.dataVencimento || todayISO(),
            valor: l.valor,
            dataPagamento: "",
          })
        );
      });
      if (payload.length === 0) {
        alert("Nenhuma linha pôde ser importada.\n\n" + rejeitadas.join("\n"));
        return;
      }
      const { data, error } = await supabase.from("boletos").insert(payload).select();
      if (error) throw error;
      setDb((prev) => ({ ...prev, boletos: [...prev.boletos, ...(data || []).map(rowToBoleto)] }));
      let msg = `${data?.length || 0} boleto(s) importado(s) com sucesso.`;
      if (rejeitadas.length) msg += `\n\n${rejeitadas.length} linha(s) não importada(s):\n` + rejeitadas.join("\n");
      alert(msg);
    } catch (e) {
      alert("Não foi possível importar os boletos: " + e.message);
    }
  };

  // Importação do relatório de baixa da seguradora/corretora (conciliação pelo Nosso Número).
  // O relatório pode vir só com "Baixado", só com "Aberto", ou misto — mesma estrutura de colunas.
  // Regra: "Baixado" grava a baixa; "Aberto" não altera (não reverte uma baixa já registrada).
  const importarBaixasCSV = async (linhas) => {
    if (linhas.length === 0) return;
    try {
      const naoEncontrados = [];
      let baixados = 0;
      let mantidosAbertos = 0;
      for (const l of linhas) {
        const nossoNumero = (l.nossoNumero || "").trim();
        if (!nossoNumero) continue;
        const boleto = db.boletos.find((b) => (b.nossoNumero || "").trim() === nossoNumero);
        if (!boleto) { naoEncontrados.push(`${nossoNumero}${l.nome ? " (" + l.nome + ")" : ""}`); continue; }
        const situacaoNorm = normalizarTexto(l.situacao);
        const veioBaixado = situacaoNorm.startsWith("baix") || situacaoNorm.startsWith("pag");
        if (veioBaixado) {
          const { data, error } = await supabase
            .from("boletos")
            .update({ data_pagamento: l.dataPagamento || todayISO() })
            .eq("id", boleto.id)
            .select()
            .single();
          if (error) throw error;
          setDb((prev) => ({ ...prev, boletos: prev.boletos.map((b) => (b.id === boleto.id ? rowToBoleto(data) : b)) }));
          baixados++;
        } else {
          // Situação "Aberto": mantém como está no Nexo (não desfaz uma baixa manual anterior)
          mantidosAbertos++;
        }
      }
      let msg = `Importação do relatório concluída: ${baixados} boleto(s) baixado(s), ${mantidosAbertos} confirmado(s) em aberto.`;
      if (naoEncontrados.length) msg += `\n\n${naoEncontrados.length} Nosso Número não encontrado(s) no Nexo:\n` + naoEncontrados.join("\n");
      alert(msg);
    } catch (e) {
      alert("Não foi possível importar o relatório de baixa: " + e.message);
    }
  };

  const goTo = (v) => { setView(v); setSidebarOpen(false); };

  const titleMap = {
    dashboard: "Dashboard", clientes: "Clientes", veiculos: "Veículos", financeiro: "Financeiro", relatorios: "Relatórios",
    cotacoes: "Cotação de seguros", consultoras: "Consultoras", adesoes: "Adesões", comissoes: "Comissões",
    links: "Links Úteis",
    clienteDetail: "Detalhes do cliente",
  };

  if (sessao === undefined) {
    return (
      <div className="nexo">
        <style>{STYLE}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--text-dim)", fontSize: 13 }}>
          Verificando acesso…
        </div>
      </div>
    );
  }

  if (recuperandoSenha) {
    return (
      <div className="nexo">
        <style>{STYLE}</style>
        <RedefinirSenhaScreen onConcluido={() => setRecuperandoSenha(false)} />
      </div>
    );
  }

  if (!sessao) {
    return (
      <div className="nexo">
        <style>{STYLE}</style>
        <LoginScreen onEntrar={() => {}} />
      </div>
    );
  }

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
              <div className="nexo-brand-mark">SS</div>
              <div>
                <div className="nexo-brand-name">Seu Seguro Corretora</div>
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
            <div className="nexo-sidebar-foot">
              <div style={{ marginBottom: 8, wordBreak: "break-all" }}>{sessao?.user?.email}</div>
              <button className="nexo-btn nexo-btn-ghost nexo-btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => supabase.auth.signOut()}>
                Sair
              </button>
            </div>
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
                <ClientesView db={db} onOpenModal={openModal} onDeleteCliente={deleteCliente} onOpenDetail={openDetail} onImportarClientes={importarClientesCSV} onImportarClientesEVeiculos={importarClientesEVeiculosCSV} />
              )}
              {view === "veiculos" && (
                <VeiculosView db={db} onOpenModal={openModal} onDeleteVeiculo={deleteVeiculo} onOpenDetail={openDetail} />
              )}
              {view === "financeiro" && (
                <FinanceiroView
                  db={db}
                  onOpenModal={openModal}
                  onDeleteBoleto={deleteBoleto}
                  onMarcarPago={marcarPago}
                  onImportarBoletos={importarBoletosCSV}
                  onImportarBaixas={importarBaixasCSV}
                />
              )}
              {view === "relatorios" && <RelatoriosView db={db} />}
              {view === "cotacoes" && (
                <CotacoesView
                  db={db}
                  onOpenModal={openModal}
                  onSaveSeguradora={saveSeguradora}
                  onDeleteSeguradora={deleteSeguradora}
                  onDeletePlano={deletePlano}
                  onDeleteCotacao={deleteCotacao}
                  onImportarPlanos={importarPlanosCSV}
                />
              )}
              {view === "consultoras" && <ConsultorasView db={db} onOpenModal={openModal} onDeleteConsultora={deleteConsultora} />}
              {view === "adesoes" && <AdesoesView db={db} onOpenModal={openModal} onDeleteAdesao={deleteAdesao} onMarcarRecebida={marcarRecebidaAdesao} />}
              {view === "comissoes" && (
                <ComissoesView db={db} onOpenModal={openModal} onDeleteComissao={deleteComissao} onMarcarPagaComissao={marcarPagaComissao} />
              )}
              {view === "links" && <LinksUteisView db={db} onOpenModal={openModal} onDeleteLink={deleteLink} />}
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
            boletos={db.boletos}
            defaultClienteId={modal.defaultClienteId}
            defaultVeiculoId={modal.defaultVeiculoId}
            onSave={saveBoleto}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {modal && modal.type === "plano" && (
        <Modal title={modal.data ? "Editar plano" : "Novo plano"} onClose={closeModal} wide>
          <PlanoForm
            initial={modal.data}
            seguradoras={db.seguradoras}
            defaultSeguradoraId={modal.defaultSeguradoraId}
            onSave={savePlano}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {modal && modal.type === "cotacao" && (
        <Modal title={modal.data ? "Editar cotação" : "Nova cotação"} onClose={closeModal} wide>
          <CotacaoForm
            initial={modal.data}
            clientes={db.clientes}
            veiculos={db.veiculos}
            seguradoras={db.seguradoras}
            planos={db.planos}
            defaultClienteId={modal.defaultClienteId}
            onSave={saveCotacao}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {modal && modal.type === "consultora" && (
        <Modal title={modal.data ? "Editar consultora" : "Nova consultora"} onClose={closeModal}>
          <ConsultoraForm initial={modal.data} onSave={saveConsultora} onCancel={closeModal} />
        </Modal>
      )}
      {modal && modal.type === "link" && (
        <Modal title={modal.data ? "Editar link" : "Novo link"} onClose={closeModal}>
          <LinkForm initial={modal.data} onSave={saveLink} onCancel={closeModal} />
        </Modal>
      )}
      {modal && modal.type === "adesao" && (
        <Modal title={modal.data ? "Editar adesão" : "Nova adesão"} onClose={closeModal} wide>
          <AdesaoForm initial={modal.data} clientes={db.clientes} consultoras={db.consultoras} onSave={saveAdesao} onCancel={closeModal} />
        </Modal>
      )}
      {modal && modal.type === "comissao" && (
        <Modal title={modal.data ? "Editar comissão" : "Nova comissão"} onClose={closeModal} wide>
          <ComissaoForm initial={modal.data} clientes={db.clientes} consultoras={db.consultoras} onSave={saveComissao} onCancel={closeModal} />
        </Modal>
      )}
    </div>
  );
}
