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
  Bell, Sun, Moon, LogOut, PanelLeftClose, PanelLeftOpen, Info
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Tokens & global style                                               */
/* ------------------------------------------------------------------ */

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

.nexo {
  /* ---------- Tema escuro (padrão) ---------- */
  --ink: #070B11;
  --surface: #0E141C;
  --surface-2: #141C27;
  --surface-3: #1B2532;
  --border: #25324A;
  --border-soft: #1A2431;
  --text: #EAF0F7;
  --text-dim: #9AABBE;
  --text-faint: #62758B;
  --accent: #4C97E6;
  --accent-dim: #2F6FB3;
  --accent-strong: #3A82D8;
  --accent-soft: rgba(76,151,230,0.14);
  --success: #34D399;
  --success-soft: rgba(52,211,153,0.13);
  --warning: #F5B544;
  --warning-soft: rgba(245,181,68,0.13);
  --danger: #F36B5F;
  --danger-soft: rgba(243,107,95,0.13);
  --info: #8FA6C9;
  --info-soft: rgba(143,166,201,0.15);
  --violet: #B79CFF;
  --glass: rgba(14,20,28,0.74);
  --sheen: linear-gradient(180deg, rgba(255,255,255,0.028), transparent 46%);
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.35);
  --shadow-md: 0 10px 28px -10px rgba(0,0,0,0.6);
  --shadow-lg: 0 28px 70px -14px rgba(0,0,0,0.7);
  --ring: 0 0 0 3px rgba(76,151,230,0.30);
  --glow: radial-gradient(900px 420px at 88% -8%, rgba(76,151,230,0.12), transparent 65%), radial-gradient(700px 380px at -6% 0%, rgba(52,211,153,0.05), transparent 60%);
  --overlay: rgba(4,7,11,0.64);
  --sidebar-w: 248px;
  color-scheme: dark;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--glow), var(--ink);
  background-attachment: fixed;
  color: var(--text);
  min-height: 100vh;
  width: 100%;
  position: relative;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: "cv11", "ss01";
}
/* ---------- Tema claro ---------- */
.nexo[data-theme="light"] {
  --ink: #EDF1F7;
  --surface: #FFFFFF;
  --surface-2: #F5F7FB;
  --surface-3: #EBEFF6;
  --border: #D6DEE9;
  --border-soft: #E5EAF2;
  --text: #0D1A2C;
  --text-dim: #46586F;
  --text-faint: #7A8BA1;
  --accent: #2563EB;
  --accent-dim: #1E4FC4;
  --accent-strong: #1D4ED8;
  --accent-soft: rgba(37,99,235,0.09);
  --success: #0F9F6E;
  --success-soft: rgba(15,159,110,0.11);
  --warning: #B7791F;
  --warning-soft: rgba(183,121,31,0.12);
  --danger: #D63A2E;
  --danger-soft: rgba(214,58,46,0.10);
  --info: #5B7090;
  --info-soft: rgba(91,112,144,0.12);
  --violet: #7C5CE0;
  --glass: rgba(255,255,255,0.80);
  --sheen: none;
  --shadow-sm: 0 1px 2px rgba(16,24,40,0.06);
  --shadow-md: 0 10px 28px -12px rgba(16,24,40,0.20);
  --shadow-lg: 0 28px 70px -18px rgba(16,24,40,0.30);
  --ring: 0 0 0 3px rgba(37,99,235,0.22);
  --glow: radial-gradient(900px 420px at 88% -8%, rgba(37,99,235,0.08), transparent 65%);
  --overlay: rgba(13,26,44,0.38);
  color-scheme: light;
}
.nexo * { box-sizing: border-box; }
.nexo .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
.nexo ::selection { background: var(--accent-soft); }
.nexo ::-webkit-scrollbar { width: 10px; height: 10px; }
.nexo ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
.nexo ::-webkit-scrollbar-thumb:hover { background: var(--text-faint); background-clip: padding-box; border: 2px solid transparent; }
.nexo ::-webkit-scrollbar-track { background: transparent; }
.nexo button:focus-visible, .nexo a:focus-visible, .nexo [tabindex]:focus-visible { outline: none; box-shadow: var(--ring); }

/* ---------- Layout ---------- */
.nexo-shell { display: flex; min-height: 100vh; --sidebar-w: 248px; }
.nexo-shell.collapsed { --sidebar-w: 78px; }
.nexo-sidebar {
  width: var(--sidebar-w); flex-shrink: 0; background: var(--surface);
  border-right: 1px solid var(--border-soft); padding: 16px 12px 14px;
  display: flex; flex-direction: column; gap: 14px;
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 40;
  transition: width .22s ease, transform .25s ease;
}
.nexo-brand { display: flex; align-items: center; gap: 11px; padding: 4px 6px 12px; border-bottom: 1px solid var(--border-soft); }
.nexo-brand-mark {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), var(--accent-dim));
  box-shadow: 0 8px 20px -8px var(--accent), inset 0 1px 0 rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 15px; color: #fff; letter-spacing: -0.5px;
}
.nexo-brand-text { min-width: 0; flex: 1; }
.nexo-brand-name { font-weight: 700; font-size: 14.5px; letter-spacing: -0.2px; line-height: 1.15; white-space: nowrap; }
.nexo-brand-tag { font-size: 10.5px; color: var(--text-faint); margin-top: 3px; white-space: nowrap; }
.nexo-collapse-btn { margin-left: auto; width: 28px; height: 28px; border-radius: 8px; border: none; background: transparent; color: var(--text-faint); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nexo-collapse-btn:hover { background: var(--surface-2); color: var(--text); }
.nexo-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; overflow-y: auto; margin: 0 -4px; padding: 0 4px; }
.nexo-nav-section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.9px; text-transform: uppercase; color: var(--text-faint); padding: 14px 12px 6px; white-space: nowrap; }
.nexo-nav-item {
  position: relative; display: flex; align-items: center; gap: 12px; padding: 9px 12px;
  border-radius: 10px; color: var(--text-dim); font-size: 13.5px; font-weight: 500;
  cursor: pointer; border: 1px solid transparent; user-select: none; white-space: nowrap;
  transition: background .15s, color .15s;
}
.nexo-nav-item svg { flex-shrink: 0; transition: color .15s; }
.nexo-nav-item:hover { background: var(--surface-2); color: var(--text); }
.nexo-nav-item.active { background: var(--accent-soft); color: var(--text); font-weight: 600; }
.nexo-nav-item.active svg { color: var(--accent); }
.nexo-nav-item.active::before { content: ""; position: absolute; left: 3px; top: 10px; bottom: 10px; width: 3px; border-radius: 3px; background: var(--accent); box-shadow: 0 0 12px var(--accent); }
.nexo-user { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--border-soft); border-radius: 14px; background: var(--surface-2); }
.nexo-user-avatar { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #fff; background: linear-gradient(135deg, var(--accent), var(--violet)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.25); }
.nexo-user-meta { min-width: 0; flex: 1; }
.nexo-user-name { font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nexo-user-role { font-size: 10.5px; color: var(--text-faint); margin-top: 2px; }
.nexo-shell.collapsed .nexo-brand-text,
.nexo-shell.collapsed .nexo-nav-label,
.nexo-shell.collapsed .nexo-nav-section-title,
.nexo-shell.collapsed .nexo-user-meta { display: none; }
.nexo-shell.collapsed .nexo-brand { flex-direction: column; gap: 8px; padding-bottom: 12px; }
.nexo-shell.collapsed .nexo-collapse-btn { margin-left: 0; }
.nexo-shell.collapsed .nexo-nav-item { justify-content: center; padding: 11px 0; }
.nexo-shell.collapsed .nexo-user { flex-direction: column; padding: 8px 4px; }

.nexo-main { margin-left: var(--sidebar-w); flex: 1; min-width: 0; display: flex; flex-direction: column; transition: margin-left .22s ease; }
.nexo-topbar {
  height: 64px; border-bottom: 1px solid var(--border-soft); background: var(--glass);
  backdrop-filter: blur(16px) saturate(1.4); -webkit-backdrop-filter: blur(16px) saturate(1.4);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; position: sticky; top: 0; z-index: 30; gap: 16px;
}
.nexo-topbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.nexo-topbar-title { font-size: 16px; font-weight: 700; letter-spacing: -0.25px; display: flex; flex-direction: column; line-height: 1.15; white-space: nowrap; }
.nexo-topbar-sub { font-size: 11.5px; font-weight: 500; color: var(--text-faint); letter-spacing: 0; margin-top: 2px; }
.nexo-topbar-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; align-items: center; }
.nexo-hamburger { display: none; background: none; border: none; color: var(--text); cursor: pointer; padding: 6px; }
.nexo-content { padding: 26px 28px 64px; flex: 1; animation: nexo-fade .28s ease both; }
.nexo-overlay { display: none; }
@keyframes nexo-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* ---------- Busca global ---------- */
.nexo-gsearch { position: relative; flex: 1; max-width: 460px; min-width: 0; }
.nexo-gsearch-box { display: flex; align-items: center; gap: 9px; background: var(--surface-2); border: 1px solid var(--border-soft); border-radius: 12px; padding: 0 12px; height: 40px; transition: border-color .15s, box-shadow .15s, background .15s; }
.nexo-gsearch-box:focus-within { border-color: var(--accent); box-shadow: var(--ring); background: var(--surface); }
.nexo-gsearch-box svg { color: var(--text-faint); flex-shrink: 0; }
.nexo-gsearch-box input { background: none; border: none; outline: none; color: var(--text); font-size: 13px; width: 100%; font-family: inherit; }
.nexo-gsearch-box input::placeholder { color: var(--text-faint); }
.nexo-kbd { font-size: 10.5px; font-weight: 600; color: var(--text-faint); border: 1px solid var(--border); border-radius: 6px; padding: 2px 6px; background: var(--surface); font-family: inherit; flex-shrink: 0; }
.nexo-gsearch .nexo-gsearch-iconbtn { display: none; }
.nexo-pop { position: absolute; top: calc(100% + 10px); background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow-lg); z-index: 60; overflow: hidden; animation: nexo-pop-in .16s ease both; }
@keyframes nexo-pop-in { from { opacity: 0; transform: translateY(-6px) scale(.985); } to { opacity: 1; transform: none; } }
.nexo-gsearch-panel { left: 0; right: 0; max-height: 70vh; overflow-y: auto; padding: 6px; }
.nexo-gsearch-group { font-size: 10px; font-weight: 700; letter-spacing: 0.9px; text-transform: uppercase; color: var(--text-faint); padding: 10px 10px 4px; }
.nexo-gsearch-item { display: flex; align-items: center; gap: 11px; padding: 9px 10px; border-radius: 10px; cursor: pointer; }
.nexo-gsearch-item:hover, .nexo-gsearch-item.sel { background: var(--surface-2); }
.nexo-gsearch-ico { width: 32px; height: 32px; border-radius: 9px; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nexo-gsearch-main { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nexo-gsearch-sub { font-size: 11.5px; color: var(--text-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
.nexo-gsearch-empty { padding: 26px 16px; text-align: center; color: var(--text-faint); font-size: 12.5px; }

/* ---------- Sino de avisos ---------- */
.nexo-bell-wrap { position: relative; }
.nexo-bell-badge { position: absolute; top: -5px; right: -5px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: var(--danger); color: #fff; font-size: 10.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid var(--surface); }
.nexo-bell-panel { right: 0; width: 340px; max-width: calc(100vw - 24px); }
.nexo-bell-head { padding: 14px 16px 10px; font-weight: 700; font-size: 13.5px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-soft); }
.nexo-aviso { display: flex; gap: 12px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border-soft); }
.nexo-aviso:last-child { border-bottom: none; }
.nexo-aviso:hover { background: var(--surface-2); }
.nexo-aviso-ico { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nexo-aviso-title { font-size: 13px; font-weight: 600; }
.nexo-aviso-sub { font-size: 11.5px; color: var(--text-faint); margin-top: 2px; }

/* ---------- Botões ---------- */
.nexo-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-family: inherit;
  font-size: 13px; font-weight: 600; padding: 9px 15px; border-radius: 10px;
  border: 1px solid var(--border); background: var(--surface-2); color: var(--text);
  cursor: pointer; white-space: nowrap; box-shadow: var(--shadow-sm);
  transition: border-color .15s, background .15s, transform .08s, box-shadow .15s, filter .15s;
}
.nexo-btn:hover { border-color: var(--accent-dim); background: var(--surface-3); }
.nexo-btn:active { transform: translateY(1px); }
.nexo-btn:disabled { opacity: .55; cursor: not-allowed; }
.nexo-btn-primary { background: linear-gradient(180deg, var(--accent), var(--accent-strong)); border-color: var(--accent-strong); color: #fff; box-shadow: 0 8px 18px -8px var(--accent), inset 0 1px 0 rgba(255,255,255,0.22); }
.nexo-btn-primary:hover { filter: brightness(1.08); background: linear-gradient(180deg, var(--accent), var(--accent-strong)); border-color: var(--accent-strong); }
.nexo-btn-ghost { background: transparent; border-color: transparent; color: var(--text-dim); box-shadow: none; }
.nexo-btn-ghost:hover { background: var(--surface-2); color: var(--text); border-color: transparent; }
.nexo-btn-danger { color: var(--danger); }
.nexo-btn-danger:hover { border-color: var(--danger); background: var(--danger-soft); }
.nexo-btn-danger-solid { background: linear-gradient(180deg, var(--danger), #D2493E); border-color: #D2493E; color: #fff; }
.nexo-btn-danger-solid:hover { filter: brightness(1.08); background: linear-gradient(180deg, var(--danger), #D2493E); border-color: #D2493E; }
.nexo-btn-sm { padding: 6px 11px; font-size: 12px; border-radius: 9px; }
.nexo-icon-btn {
  position: relative; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 10px; border: 1px solid var(--border-soft); background: var(--surface-2); color: var(--text-dim);
  cursor: pointer; transition: color .15s, border-color .15s, background .15s;
}
.nexo-icon-btn:hover { color: var(--text); border-color: var(--accent-dim); background: var(--surface-3); }
.nexo-table .nexo-icon-btn, .nexo-veiculo-card .nexo-icon-btn, .nexo-modal .nexo-icon-btn { width: 30px; height: 30px; border-radius: 8px; }

/* ---------- Cards ---------- */
.nexo-card { background: var(--sheen), var(--surface); border: 1px solid var(--border-soft); border-radius: 16px; padding: 20px; box-shadow: var(--shadow-sm); }
.nexo-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px; }
.nexo-kpi { background: var(--sheen), var(--surface); border: 1px solid var(--border-soft); border-radius: 16px; padding: 18px 18px 16px; position: relative; overflow: hidden; box-shadow: var(--shadow-sm); transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
.nexo-kpi:hover { transform: translateY(-2px); border-color: var(--border); box-shadow: var(--shadow-md); }
.nexo-kpi-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.nexo-kpi.wide { grid-column: 1 / -1; display: grid; grid-template-columns: auto 1fr auto; align-items: center; column-gap: 16px; padding: 16px 22px; background: linear-gradient(100deg, var(--accent-soft), transparent 60%), var(--surface); }
.nexo-kpi.wide .nexo-kpi-icon { margin: 0; }
.nexo-kpi.wide .nexo-kpi-label { margin: 0; font-size: 13px; }
.nexo-kpi.wide .nexo-kpi-value { font-size: 28px; }
.nexo-kpi-label { font-size: 12px; color: var(--text-dim); font-weight: 500; margin-bottom: 5px; }
.nexo-kpi-value { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; font-variant-numeric: tabular-nums; }
.nexo-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.nexo-charts-grid > :last-child:nth-child(odd) { grid-column: 1 / -1; }
@media (min-width: 1280px) {
  .nexo-charts-grid { grid-template-columns: 1.5fr 1fr 1fr; }
  .nexo-charts-grid > :last-child:nth-child(odd) { grid-column: auto; }
}
.nexo-chart-title { font-size: 14px; font-weight: 650; margin-bottom: 3px; letter-spacing: -0.15px; }
.nexo-chart-sub { font-size: 11.5px; color: var(--text-faint); margin-bottom: 16px; }

/* ---------- Cabeçalho de seção ---------- */
.nexo-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 12px; }
.nexo-section-title { font-size: 20px; font-weight: 700; letter-spacing: -0.4px; }
.nexo-section-count { font-size: 12px; color: var(--text-dim); font-weight: 600; margin-left: 10px; background: var(--surface-2); border: 1px solid var(--border-soft); padding: 3px 9px; border-radius: 20px; vertical-align: middle; }

/* ---------- Busca e filtros ---------- */
.nexo-searchbar { display: flex; align-items: center; gap: 9px; background: var(--surface); border: 1px solid var(--border-soft); border-radius: 12px; padding: 0 13px; height: 42px; max-width: 420px; flex: 1; box-shadow: var(--shadow-sm); transition: border-color .15s, box-shadow .15s; }
.nexo-searchbar:focus-within { border-color: var(--accent); box-shadow: var(--ring); }
.nexo-searchbar svg { color: var(--text-faint); }
.nexo-searchbar input { background: none; border: none; outline: none; color: var(--text); font-size: 13px; width: 100%; font-family: inherit; }
.nexo-searchbar input::placeholder { color: var(--text-faint); }
.nexo-filters { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 16px; padding: 16px 18px; margin-bottom: 18px; display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; box-shadow: var(--shadow-sm); }
.nexo-filter-field { display: flex; flex-direction: column; gap: 6px; min-width: 130px; flex: 1; }
.nexo-filter-field label { font-size: 10.5px; text-transform: uppercase; letter-spacing: .6px; color: var(--text-faint); font-weight: 700; }

/* ---------- Campos ---------- */
.nexo-input, .nexo-select, .nexo-textarea {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
  border-radius: 10px; padding: 9px 12px; font-size: 13px; font-family: inherit; outline: none; width: 100%;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.nexo-input:hover, .nexo-select:hover, .nexo-textarea:hover { border-color: var(--text-faint); }
.nexo-input:focus, .nexo-select:focus, .nexo-textarea:focus { border-color: var(--accent); box-shadow: var(--ring); background: var(--surface); }
.nexo-textarea { resize: vertical; min-height: 64px; }
.nexo-field { display: flex; flex-direction: column; gap: 6px; }
.nexo-field label { font-size: 12px; color: var(--text-dim); font-weight: 600; }
.nexo-field-error { font-size: 11px; color: var(--danger); }
.nexo-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.nexo-field-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

/* ---------- Tabelas ---------- */
.nexo-table-wrap { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); }
.nexo-table-scroll { overflow-x: auto; }
.nexo-table { width: 100%; border-collapse: collapse; min-width: 640px; }
.nexo-table th {
  text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .7px;
  color: var(--text-faint); font-weight: 700; padding: 13px 16px; border-bottom: 1px solid var(--border-soft);
  white-space: nowrap; background: var(--surface-2);
}
.nexo-table td.mono, .nexo-table td.nexo-cell-muted { white-space: nowrap; }
.nexo-table td { padding: 13px 16px; font-size: 13px; border-bottom: 1px solid var(--border-soft); vertical-align: middle; }
.nexo-table tr:last-child td { border-bottom: none; }
.nexo-table tbody tr { transition: background .12s; }
.nexo-table tbody tr:hover { background: var(--accent-soft); }
.nexo-row-link { cursor: pointer; }
.nexo-cell-muted { color: var(--text-faint); font-size: 12px; }
.nexo-actions-cell { display: flex; gap: 6px; justify-content: flex-end; }

/* ---------- Selos ---------- */
.nexo-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
.nexo-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

/* ---------- Estado vazio ---------- */
.nexo-empty { text-align: center; padding: 64px 20px; color: var(--text-faint); }
.nexo-empty svg { margin-bottom: 14px; opacity: .55; }
.nexo-empty-title { color: var(--text-dim); font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.nexo-empty-sub { font-size: 12.5px; }

/* ---------- Modal ---------- */
.nexo-modal-overlay { position: fixed; inset: 0; background: var(--overlay); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 40px 16px; animation: nexo-fade-only .18s ease both; }
@keyframes nexo-fade-only { from { opacity: 0; } to { opacity: 1; } }
.nexo-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; width: 100%; max-width: 500px; box-shadow: var(--shadow-lg); animation: nexo-pop-in .2s ease both; }
.nexo-modal.wide { max-width: 640px; }
.nexo-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border-soft); }
.nexo-modal-head h3 { font-size: 16px; font-weight: 700; margin: 0; letter-spacing: -0.2px; }
.nexo-modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; }
.nexo-modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; border-top: 1px solid var(--border-soft); }

/* ---------- Mensagens (toasts) e confirmações ---------- */
.nexo-toasts { position: fixed; top: 76px; right: 20px; z-index: 300; display: flex; flex-direction: column; gap: 10px; width: min(380px, calc(100vw - 32px)); pointer-events: none; }
.nexo-toast { pointer-events: auto; display: flex; align-items: flex-start; gap: 12px; padding: 13px 14px; border-radius: 14px; background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--tone); box-shadow: var(--shadow-lg); animation: nexo-toast-in .26s cubic-bezier(.2,.9,.3,1.2) both; }
@keyframes nexo-toast-in { from { opacity: 0; transform: translateX(24px) scale(.97); } to { opacity: 1; transform: none; } }
.nexo-toast-ico { width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--tone) 16%, transparent); color: var(--tone); }
.nexo-toast-msg { font-size: 13px; line-height: 1.45; flex: 1; padding-top: 5px; word-break: break-word; }
.nexo-toast-x { background: none; border: none; color: var(--text-faint); cursor: pointer; padding: 4px; border-radius: 6px; }
.nexo-toast-x:hover { color: var(--text); background: var(--surface-2); }
.nexo-dialog-overlay { position: fixed; inset: 0; background: var(--overlay); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index: 400; display: flex; align-items: center; justify-content: center; padding: 20px; animation: nexo-fade-only .16s ease both; }
.nexo-dialog { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; width: 100%; max-width: 440px; box-shadow: var(--shadow-lg); padding: 26px 26px 20px; animation: nexo-pop-in .2s ease both; }
.nexo-dialog-ico { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; background: color-mix(in srgb, var(--tone) 15%, transparent); color: var(--tone); }
.nexo-dialog h3 { margin: 0 0 8px; font-size: 16.5px; font-weight: 700; letter-spacing: -0.2px; }
.nexo-dialog-msg { font-size: 13.5px; line-height: 1.55; color: var(--text-dim); white-space: pre-line; max-height: 50vh; overflow-y: auto; }
.nexo-dialog-foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 22px; }

/* ---------- Carregando ---------- */
.nexo-loading { display: flex; flex-direction: column; gap: 16px; align-items: center; justify-content: center; height: 100vh; color: var(--text-dim); font-size: 13px; }
.nexo-spinner { width: 34px; height: 34px; border-radius: 50%; border: 3px solid var(--border); border-top-color: var(--accent); animation: nexo-spin .8s linear infinite; }
@keyframes nexo-spin { to { transform: rotate(360deg); } }

/* ---------- Detalhe do cliente ---------- */
.nexo-detail-grid { display: grid; grid-template-columns: 310px 1fr; gap: 18px; align-items: start; }
.nexo-info-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-dim); padding: 8px 0; border-bottom: 1px solid var(--border-soft); }
.nexo-info-row:last-child { border-bottom: none; }
.nexo-info-row svg { color: var(--text-faint); flex-shrink: 0; }
.nexo-avatar { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, var(--accent-soft), var(--surface-3)); border: 1px solid var(--border-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; }
.nexo-veiculo-card { border: 1px solid var(--border-soft); border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; background: var(--surface-2); transition: border-color .15s; }
.nexo-veiculo-card:hover { border-color: var(--border); }
.nexo-veiculo-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.nexo-mini-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
.nexo-mini-kpi { background: var(--surface-2); border: 1px solid var(--border-soft); border-radius: 14px; padding: 14px 16px; }
.nexo-mini-kpi-label { font-size: 11px; color: var(--text-faint); margin-bottom: 5px; font-weight: 500; }
.nexo-mini-kpi-value { font-size: 17px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.3px; }
.nexo-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border-soft); margin-bottom: 16px; }
.nexo-tab { padding: 10px 4px; margin-right: 20px; font-size: 13px; font-weight: 600; color: var(--text-faint); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color .15s; }
.nexo-tab:hover { color: var(--text-dim); }
.nexo-tab.active { color: var(--text); border-color: var(--accent); }

/* ---------- Avatares, chips, placa, grupos de veículos ---------- */
.nexo-av { --av-h: 210; width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; letter-spacing: .2px; background: hsl(var(--av-h) 70% 55% / 0.16); color: hsl(var(--av-h) 85% 70%); border: 1px solid hsl(var(--av-h) 70% 55% / 0.24); }
.nexo[data-theme="light"] .nexo-av { color: hsl(var(--av-h) 65% 34%); background: hsl(var(--av-h) 70% 50% / 0.12); border-color: hsl(var(--av-h) 70% 50% / 0.26); }
.nexo-cliente-cell { display: flex; align-items: center; gap: 12px; min-width: 0; }
.nexo-cliente-nome { font-weight: 600; font-size: 13px; line-height: 1.25; }
.nexo-cliente-sub { font-size: 11.5px; color: var(--text-faint); margin-top: 2px; }
.nexo-toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
.nexo-toolbar .nexo-searchbar { margin-bottom: 0 !important; }
.nexo-chips { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
.nexo-chip { display: inline-flex; align-items: center; gap: 8px; padding: 7px 8px 7px 13px; border-radius: 999px; border: 1px solid var(--border-soft); background: var(--surface); color: var(--text-dim); font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: border-color .15s, color .15s, background .15s; }
.nexo-chip:hover { border-color: var(--border); color: var(--text); }
.nexo-chip.on { background: var(--accent-soft); border-color: var(--accent-dim); color: var(--text); }
.nexo-chip-n { font-size: 11px; font-weight: 700; padding: 1px 8px; border-radius: 999px; background: var(--surface-3); color: var(--text-dim); font-variant-numeric: tabular-nums; }
.nexo-chip.on .nexo-chip-n { background: var(--accent); color: #fff; }
.nexo-chip-link { background: none; border: none; color: var(--accent); font-size: 12.5px; font-weight: 600; cursor: pointer; padding: 6px 4px; font-family: inherit; }
.nexo-chip-link:hover { text-decoration: underline; }
.nexo-seg { display: inline-flex; padding: 3px; border-radius: 11px; background: var(--surface-2); border: 1px solid var(--border-soft); margin-left: auto; }
.nexo-seg button { border: none; background: transparent; color: var(--text-dim); font-size: 12.5px; font-weight: 600; padding: 7px 14px; border-radius: 8px; cursor: pointer; font-family: inherit; }
.nexo-seg button.on { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); }
.nexo-placa { display: inline-flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12.5px; font-weight: 700; letter-spacing: 1.3px; color: #11181F; background: linear-gradient(180deg, #FAFBFC, #E8ECF0); border: 1px solid #B6C0CB; border-top: 5px solid #1F55B8; border-radius: 6px; padding: 1px 9px; line-height: 1.55; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.25); }
.nexo-tag-vazio { display: inline-flex; font-size: 11px; font-weight: 600; color: var(--text-faint); border: 1px dashed var(--border); border-radius: 999px; padding: 2px 9px; white-space: nowrap; }
.nexo-vgroup { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 16px; margin-bottom: 10px; overflow: hidden; box-shadow: var(--shadow-sm); }
.nexo-vgroup-head { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background .12s; }
.nexo-vgroup-head:hover { background: var(--surface-2); }
.nexo-chev { color: var(--text-faint); transition: transform .2s ease; flex-shrink: 0; }
.nexo-chev.open { transform: rotate(90deg); }
.nexo-vgroup-mensal { display: flex; align-items: baseline; gap: 8px; font-size: 13px; white-space: nowrap; }
.nexo-vgroup-body { border-top: 1px solid var(--border-soft); }
.nexo-vrow { display: grid; grid-template-columns: 112px minmax(0, 1.6fr) 130px 120px 90px auto; gap: 12px; align-items: center; padding: 10px 16px 10px 60px; border-bottom: 1px solid var(--border-soft); transition: background .12s; }
.nexo-vrow:last-child { border-bottom: none; }
.nexo-vrow:hover { background: var(--accent-soft); }
.nexo-vrow.plano { padding: 10px 4px; }
.nexo-vrow-nome { font-size: 13px; font-weight: 600; }
.nexo-btn { text-decoration: none; }
.nexo-vrow > .nexo-placa { justify-self: start; }
.nexo-vrow .nexo-icon-btn, .nexo-vgroup-head .nexo-icon-btn { width: 30px; height: 30px; border-radius: 8px; }
.nexo-tag-vazio { font-family: inherit; }
.nexo-table tr.venc td:first-child { box-shadow: inset 3px 0 0 var(--danger); }
.nexo-table tr.avencer td:first-child { box-shadow: inset 3px 0 0 var(--warning); }
.nexo-table-foot { display: flex; flex-wrap: wrap; gap: 8px 28px; align-items: center; padding: 14px 18px; border-top: 1px solid var(--border-soft); background: var(--surface-2); font-size: 12.5px; color: var(--text-dim); }
.nexo-table-foot strong { color: var(--text); font-variant-numeric: tabular-nums; }
.nexo-table-foot .tot { margin-left: auto; font-size: 14px; }
.nexo-tag-frota { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; color: var(--violet); background: color-mix(in srgb, var(--violet) 14%, transparent); border-radius: 999px; padding: 3px 10px; white-space: nowrap; }
.nexo-venc-sub { font-size: 11px; margin-top: 2px; font-weight: 600; }
.nexo-trend { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 700; margin-top: 5px; padding: 2px 9px; border-radius: 999px; }
.nexo-trend.up { color: var(--success); background: var(--success-soft); }
.nexo-trend.down { color: var(--danger); background: var(--danger-soft); }
.nexo-two-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.nexo-lista-item { display: flex; align-items: center; gap: 12px; padding: 10px 8px; border-radius: 12px; cursor: pointer; transition: background .12s; }
.nexo-lista-item:hover { background: var(--surface-2); }
.nexo-empty-mini { display: flex; align-items: center; gap: 10px; padding: 20px 8px; color: var(--text-faint); font-size: 12.5px; }
.nexo-toolbar-fin { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
@media (max-width: 1024px) { .nexo-two-grid { grid-template-columns: 1fr; } }
@media (max-width: 768px) { .nexo-table-foot .tot { margin-left: 0; width: 100%; } }
.nexo-kpi-grid.c3 { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 940px) { .nexo-kpi-grid.c3 { grid-template-columns: 1fr; } }
.nexo-bar { height: 8px; border-radius: 999px; background: var(--surface-3); overflow: hidden; min-width: 90px; }
.nexo-bar > span { display: block; height: 100%; border-radius: 999px; transition: width .45s ease; }
.nexo-evo { display: flex; align-items: stretch; gap: 14px; }
.nexo-evo-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; min-width: 0; }
.nexo-evo-bars { display: flex; align-items: flex-end; gap: 4px; height: 110px; width: 100%; justify-content: center; }
.nexo-evo-bar { width: 34%; max-width: 30px; border-radius: 7px 7px 0 0; transition: height .45s ease; }
.nexo-evo-lab { font-size: 11px; color: var(--text-faint); font-weight: 600; }
.nexo-evo-val { font-size: 10.5px; color: var(--text-dim); font-weight: 600; height: 14px; white-space: nowrap; }
.nexo-evo-legend { display: flex; gap: 16px; font-size: 11.5px; color: var(--text-faint); margin-top: 10px; }
.nexo-evo-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }
.nexo-fontes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.nexo-fonte-regra { font-size: 13px; font-weight: 600; margin: 14px 0 8px; }
.nexo-fonte-linha { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-dim); padding: 7px 0; border-top: 1px solid var(--border-soft); }
.nexo-rank { display: grid; grid-template-columns: 40px minmax(0, 1.5fr) repeat(3, minmax(0, 1fr)) minmax(150px, 1.2fr) auto; gap: 16px; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--border-soft); transition: background .12s; }
.nexo-rank:last-child { border-bottom: none; }
.nexo-rank:hover { background: var(--accent-soft); }
.nexo-rank-pos { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12.5px; background: var(--surface-3); color: var(--text-dim); }
.nexo-rank-pos.p1 { background: linear-gradient(135deg, #F7CF63, #E39A1D); color: #3A2600; }
.nexo-rank-pos.p2 { background: linear-gradient(135deg, #DDE3EA, #AEB8C4); color: #243040; }
.nexo-rank-pos.p3 { background: linear-gradient(135deg, #E6B48A, #BE7B45); color: #3A1F08; }
.nexo-rank-metric small { display: block; font-size: 10.5px; color: var(--text-faint); text-transform: uppercase; letter-spacing: .6px; font-weight: 700; margin-bottom: 4px; }
.nexo-rank-metric strong { font-size: 14px; }
@media (max-width: 1100px) {
  .nexo-rank { display: flex; flex-wrap: wrap; gap: 12px 18px; }
  .nexo-rank > .nexo-cliente-cell { flex: 1 1 220px; }
  .nexo-rank > .nexo-rank-metric { flex: 1 1 28%; }
  .nexo-rank > .nexo-rank-metric.meta { flex: 1 1 100%; }
}
.nexo-tab-n { font-size: 11px; font-weight: 700; margin-left: 6px; padding: 1px 8px; border-radius: 999px; background: var(--surface-3); color: var(--text-dim); }
.nexo-tab.active .nexo-tab-n { background: var(--accent); color: #fff; }
.nexo-tabs { align-items: center; }
html .nexo-nav { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.nexo .nexo-nav::-webkit-scrollbar { width: 6px; }
@media (max-width: 768px) {
  .nexo-vrow { display: flex; flex-wrap: wrap; padding-left: 16px; row-gap: 6px; }
  .nexo-vrow > .nexo-vrow-main { flex: 1; min-width: 0; }
  .nexo-vrow > .nexo-actions-cell { order: 3; }
  .nexo-vrow > .nexo-vrow-val { order: 4; flex-basis: 100%; }
  .nexo-vrow-fipe, .nexo-vrow-status { display: none; }
  .nexo-seg { margin-left: 0; }
  .nexo-vgroup-head { gap: 10px; padding: 12px; }
  .nexo-vgroup-head .nexo-av { display: none; }
  .nexo-vgroup-head .nexo-actions-cell .nexo-icon-btn:first-child:not(:last-child) { display: none; }
  .nexo-vgroup-mensal .nexo-cell-muted { display: none; }
}

/* ---------- Responsivo ---------- */
.nexo-novo-wide { display: flex; gap: 8px; }
.nexo-novo-menu { display: none; position: relative; }
.nexo-pop-right { right: 0; min-width: 210px; padding: 6px; }
@media (max-width: 1240px) {
  .nexo-novo-wide { display: none; }
  .nexo-novo-menu { display: block; }
}
@media (max-width: 1100px) {
  .nexo-kbd { display: none; }
  .nexo-topbar { padding: 0 16px; gap: 10px; }
}
@media (max-width: 1024px) and (min-width: 941px) {
  .nexo-kpi-grid { gap: 12px; }
  .nexo-kpi { padding: 14px; }
  .nexo-kpi-value { font-size: 19px; }
}
@media (max-width: 940px) {
  .nexo-kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 1024px) {
  .nexo-charts-grid { grid-template-columns: 1fr; }
  .nexo-detail-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .hide-mobile { display: none !important; }
  .nexo-shell, .nexo-shell.collapsed { --sidebar-w: 270px; }
  .nexo-sidebar { transform: translateX(-100%); box-shadow: 24px 0 48px rgba(0,0,0,0.35); }
  .nexo-sidebar.open { transform: translateX(0); }
  .nexo-main { margin-left: 0; }
  .nexo-hamburger { display: inline-flex; align-items: center; justify-content: center; }
  .nexo-content { padding: 18px 14px 48px; }
  .nexo-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .nexo-kpi-value { font-size: 20px; }
  .nexo-mini-kpis { grid-template-columns: repeat(2, 1fr); }
  .nexo-field-row, .nexo-field-row3 { grid-template-columns: 1fr; }
  .nexo-overlay.open { display: block; position: fixed; inset: 0; background: var(--overlay); z-index: 39; }
  .nexo-topbar { padding: 0 12px; }
  .nexo-topbar-sub { display: none; }
  .nexo-topbar-title { font-size: 15px; overflow: hidden; text-overflow: ellipsis; }
  .nexo-topbar-left { overflow: hidden; }
  .nexo-collapse-btn { display: none; }
  .nexo-shell.collapsed .nexo-brand-text, .nexo-shell.collapsed .nexo-nav-label, .nexo-shell.collapsed .nexo-nav-section-title, .nexo-shell.collapsed .nexo-user-meta { display: revert; }
  .nexo-shell.collapsed .nexo-nav-item { justify-content: flex-start; padding: 9px 12px; }
  .nexo-shell.collapsed .nexo-brand { flex-direction: row; }
  .nexo-shell.collapsed .nexo-user { flex-direction: row; padding: 10px; }
  .nexo-gsearch { flex: 0 0 auto; max-width: none; }
  .nexo-gsearch-box { display: none; }
  .nexo-gsearch .nexo-gsearch-iconbtn { display: inline-flex; }
  .nexo-gsearch.open .nexo-gsearch-box { display: flex; position: fixed; left: 12px; right: 12px; top: 12px; z-index: 70; box-shadow: var(--shadow-lg); background: var(--surface); }
  .nexo-gsearch.open .nexo-gsearch-panel { position: fixed; left: 12px; right: 12px; top: 62px; }
  .nexo-toasts { top: 70px; right: 12px; }
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

/** Converte "R$ 1.234,56", "1234,56", "209.00" ou número para number. Se não entender, devolve 0. */
function paraNumeroBR(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = String(v ?? "").replace(/[^\d,.-]/g, "");
  if (!s) return 0;
  const normalizado = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : 0;
}

/** Converte dd/mm/aaaa (ou aaaa-mm-dd já pronto) para o formato aaaa-mm-dd usado nos inputs de data. */
function paraDataISO(v) {
  const s = (v || "").toString().trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const m2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (m2) return `20${m2[3]}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
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

/**
 * Alguns sistemas (como o SGA da Hinova) exportam "relatório em Excel"
 * que na verdade é uma página HTML salva com extensão .xls — com um
 * título mesclado na primeira linha, uma linha em branco, os dados, e
 * um rodapé de resumo no final. Esse parser acha a linha de cabeçalho
 * de verdade (a que tem "Nome" e "Nosso Numero", por exemplo) e para
 * de ler assim que bate no resumo final, devolvendo o mesmo formato
 * {cabecalhos, linhas} do parser de CSV, pra poder reaproveitar o
 * resto da lógica de importação sem mudar nada.
 */
function parseTabelaHTML(texto) {
  const doc = new DOMParser().parseFromString(texto, "text/html");
  // Células com várias linhas (ex.: várias placas num boleto de frota) usam <br>; viram " | ".
  doc.querySelectorAll("br").forEach((br) => br.replaceWith(doc.createTextNode(" | ")));
  const todasLinhas = Array.from(doc.querySelectorAll("tr")).map((tr) =>
    Array.from(tr.querySelectorAll("td,th")).map((cel) =>
      (cel.textContent || "").replace(/\s+/g, " ").replace(/^(\s*\|\s*)+|(\s*\|\s*)+$/g, "").trim()
    )
  );
  return matrizParaTabela(todasLinhas);
}

/** Detecta automaticamente se o arquivo é HTML (tipo o relatório do SGA) ou um CSV de verdade. */
function parseRelatorioTexto(texto) {
  const amostra = texto.slice(0, 2000).toLowerCase();
  if (amostra.includes("<html") || amostra.includes("<table") || amostra.includes("<!doctype")) {
    return parseTabelaHTML(texto);
  }
  return parseCSVTexto(texto);
}


/* ------------------------------------------------------------------ */
/* Leitor universal de arquivos de importação                          */
/* (Excel .xlsx/.xls de verdade, PDF, HTML do SGA e CSV)               */
/* ------------------------------------------------------------------ */

const PALAVRAS_CABECALHO = ["nome", "nossonumero", "cpf", "cpfcnpj", "placa", "seguradora", "plano", "cliente", "valor", "situacao", "datapagamento", "vencimento", "status", "telefone", "modelo", "renavam", "montadora", "marca"];

/**
 * Recebe uma matriz (linhas x colunas de texto) e devolve {cabecalhos, linhas}
 * no mesmo formato do parser de CSV: acha a linha de cabeçalho de verdade
 * (ignora títulos no topo), pula linhas vazias, cabeçalhos repetidos (PDF com
 * várias páginas) e para no resumo/rodapé.
 */
function matrizParaTabela(matriz) {
  const limpa = matriz.map((l) => l.map((c) => String(c ?? "").replace(/\s+/g, " ").trim()));
  let idx = limpa.findIndex((l) => l.some((c) => PALAVRAS_CABECALHO.includes(normalizarCabecalho(c))) && l.filter(Boolean).length >= 2);
  if (idx === -1) idx = limpa.findIndex((l) => l.filter(Boolean).length >= 2);
  if (idx === -1) return { cabecalhos: [], linhas: [] };

  const cabecalhos = limpa[idx].map(normalizarCabecalho);
  const chaveCab = cabecalhos.join("|");
  const linhas = [];
  for (let i = idx + 1; i < limpa.length; i++) {
    const linha = limpa[i];
    if (linha.every((c) => !c)) continue;
    if (linha.length > cabecalhos.length * 2) continue; // linha "gigante" = artefato de HTML mal formado
    if (linha.map(normalizarCabecalho).join("|") === chaveCab) continue; // cabeçalho repetido em outra página
    const primeira = normalizarTexto(linha[0] || "");
    if (primeira.startsWith("resumo") || primeira.startsWith("total de")) break;
    linhas.push(linha);
  }
  return { cabecalhos, linhas };
}

async function lerExcelBinario(buffer) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buffer, { type: "array" });
  // usa a primeira aba que tiver conteúdo
  for (const nomeAba of wb.SheetNames) {
    const matriz = XLSX.utils.sheet_to_json(wb.Sheets[nomeAba], { header: 1, raw: false, defval: "", dateNF: "dd/mm/yyyy" });
    const tabela = matrizParaTabela(matriz);
    if (tabela.linhas.length > 0) return tabela;
  }
  return { cabecalhos: [], linhas: [] };
}

async function lerPdfComoTabela(file) {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.js?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;

  const matriz = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const pagina = await pdf.getPage(p);
    const conteudo = await pagina.getTextContent();
    const itens = conteudo.items
      .filter((it) => it.str && it.str.trim())
      .map((it) => ({ texto: it.str, x: it.transform[4], y: it.transform[5], w: it.width || 0 }))
      .sort((a, b) => b.y - a.y || a.x - b.x);

    // agrupa por linha (mesma altura, com tolerância)
    const linhasPdf = [];
    for (const it of itens) {
      const atual = linhasPdf[linhasPdf.length - 1];
      if (atual && Math.abs(atual.y - it.y) <= 3) atual.itens.push(it);
      else linhasPdf.push({ y: it.y, itens: [it] });
    }
    // dentro de cada linha, separa em colunas pelos "buracos" horizontais
    for (const l of linhasPdf) {
      l.itens.sort((a, b) => a.x - b.x);
      const celulas = [];
      let celula = "";
      let fimAnterior = null;
      for (const it of l.itens) {
        if (fimAnterior !== null && it.x - fimAnterior > 8) { celulas.push(celula.trim()); celula = ""; }
        celula += (celula && !celula.endsWith(" ") && !it.texto.startsWith(" ") ? " " : "") + it.texto;
        fimAnterior = it.x + it.w;
      }
      celulas.push(celula.trim());
      matriz.push(celulas);
    }
  }
  return matrizParaTabela(matriz);
}

/** Aceita CSV, HTML do SGA (.xls "disfarçado"), Excel de verdade (.xlsx/.xls/.ods) e PDF. */
async function lerArquivoComoTabela(file) {
  const nome = (file.name || "").toLowerCase();
  if (nome.endsWith(".pdf") || file.type === "application/pdf") return lerPdfComoTabela(file);

  if (/\.(xlsx|xlsm|xlsb|xls|ods)$/.test(nome)) {
    const buffer = await file.arrayBuffer();
    const b = new Uint8Array(buffer.slice(0, 4));
    const ehZip = b[0] === 0x50 && b[1] === 0x4b; // .xlsx / .ods
    const ehOle = b[0] === 0xd0 && b[1] === 0xcf; // .xls binário antigo
    if (ehZip || ehOle) return lerExcelBinario(buffer);
    // não é binário: provavelmente HTML/CSV com extensão .xls (caso do SGA)
  }
  const texto = await lerArquivoTexto(file);
  return parseRelatorioTexto(texto);
}

const normPlaca = (p) => String(p || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const semSeparador = (s) => String(s || "").replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
const PLACA_REGEX = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/;

/** Extrai uma ou várias placas de uma célula ("ABC1D23 | XYZ9K88", "ABC-1234", placas coladas...). */
function separarPlacas(texto) {
  const t = String(texto || "").toUpperCase().replace(/([A-Z]{3})\s*-\s*(\d[A-Z0-9]\d{2})/g, "$1$2");
  const achadas = [];
  for (const tok of t.split(/[^A-Z0-9]+/)) {
    if (PLACA_REGEX.test(tok)) achadas.push(tok);
    else if (tok.length > 7 && tok.length % 7 === 0) {
      const partes = tok.match(/.{7}/g);
      if (partes.every((p) => PLACA_REGEX.test(p))) achadas.push(...partes);
    }
  }
  if (achadas.length > 0) return Array.from(new Set(achadas));
  const unica = normPlaca(t);
  return unica.length >= 5 && unica.length <= 8 ? [unica] : [];
}

function valorDaColuna(cabecalhos, linha, candidatos) {
  for (const cand of candidatos) {
    const idx = cabecalhos.indexOf(cand);
    if (idx !== -1 && linha[idx] !== undefined) return linha[idx];
  }
  return "";
}

async function lerArquivoTexto(file) {
  // Muitos sistemas antigos (como o SGA) exportam em latin-1 (ISO-8859). Tenta UTF-8 "estrito";
  // se o arquivo não for UTF-8 válido, lê como windows-1252 pra não corromper acentos.
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
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

function Kpi({ icon, label, value, tone, wide, extra }) {
  const Icon = icon;
  const colors = {
    accent: ["var(--accent)", "var(--accent-soft)"],
    success: ["var(--success)", "var(--success-soft)"],
    warning: ["var(--warning)", "var(--warning-soft)"],
    danger: ["var(--danger)", "var(--danger-soft)"],
    info: ["var(--info)", "var(--info-soft)"],
  }[tone || "accent"];
  return (
    <div className={`nexo-kpi ${wide ? "wide" : ""}`}>
      <div className="nexo-kpi-icon" style={{ background: colors[1], color: colors[0] }}>
        <Icon size={16} />
      </div>
      <div className="nexo-kpi-label">{label}{extra && <div>{extra}</div>}</div>
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
      codigoSga: "", ultimoContato: "", indicadoPor: "",
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
      <div className="nexo-field-row3">
        <Field label="Código do cliente no SGA">
          <input className="nexo-input mono" value={f.codigoSga} onChange={set("codigoSga")} placeholder="Código de conciliação" />
        </Field>
        <Field label="Último contato">
          <input type="date" className="nexo-input" value={f.ultimoContato} onChange={set("ultimoContato")} />
        </Field>
        <Field label="Indicado por">
          <input className="nexo-input" value={f.indicadoPor} onChange={set("indicadoPor")} placeholder="Quem trouxe esse cliente" />
        </Field>
      </div>
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

function BoletoForm({ initial, clientes, veiculos, defaultClienteId, defaultVeiculoId, onSave, onCancel }) {
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
        <Field label="Nosso Número (SGA)">
          <input className="nexo-input mono" value={f.nossoNumero} onChange={set("nossoNumero")} placeholder="Código de conciliação do SGA" />
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

const PALETA_GRAFICOS = {
  dark:  { border: "#25324A", textFaint: "#62758B", accent: "#4C97E6", violet: "#B79CFF", surface3: "#1B2532", success: "#34D399", info: "#8FA6C9", danger: "#F36B5F", warning: "#F5B544" },
  light: { border: "#D6DEE9", textFaint: "#7A8BA1", accent: "#2563EB", violet: "#7C5CE0", surface3: "#EBEFF6", success: "#0F9F6E", info: "#5B7090", danger: "#D63A2E", warning: "#B7791F" },
};

function Dashboard({ db, onOpenModal, tema, onOpenDetail, onIr }) {
  const pal = PALETA_GRAFICOS[tema === "light" ? "light" : "dark"];
  const fonteAuto = db.seguradoras.find((s) => s.comissaoAutomatica && s.tipoComissao === "mensalidade");
  const pctComissao = fonteAuto && Number(fonteAuto.percentualComissao) > 0 ? Number(fonteAuto.percentualComissao) : COMISSAO_CORRETORA_PERCENTUAL;
  const boletosComStatus = useMemo(() => db.boletos.map((b) => ({ ...b, status: computeBoletoStatus(b) })), [db.boletos]);

  const clientesAtivos = db.clientes.filter((c) => c.status === "Ativo").length;
  const veiculosAtivos = db.veiculos.filter((v) => v.status === "Ativo").length;
  const veiculosInativos = db.veiculos.filter((v) => v.status === "Inativo").length;
  const emAberto = boletosComStatus.filter((b) => b.status !== "Pago");
  const aVencer = boletosComStatus.filter((b) => b.status === "A vencer");
  const valorEmAberto = sum(emAberto.map((b) => b.valor));
  const valorAReceber = sum(boletosComStatus.filter((b) => b.status === "A vencer" || b.status === "Em aberto").map((b) => b.valor));
  const valorRecebido = sum(boletosComStatus.filter((b) => b.status === "Pago").map((b) => b.valor));

  // Comissão recorrente da corretora: 10% sobre os boletos BAIXADOS (pagos) no mês escolhido.
  // Por padrão mostra o mês atual; se ele ainda não tem pagamentos (ex.: você importa o relatório de
  // setembro só em outubro), mostra automaticamente o último mês que tem boletos pagos.
  // Dá pra trocar o mês no seletor do topo pra fechar qualquer mês.
  const chaveMesAtual = mesRefDe(todayISO());
  const [mesComissao, setMesComissao] = useState("auto");
  const mesesComPagamento = Array.from(
    new Set(boletosComStatus.filter((b) => b.status === "Pago" && b.dataPagamento).map((b) => mesRefDe(b.dataPagamento)))
  ).sort().reverse();
  const mesPadrao = mesesComPagamento.includes(chaveMesAtual) ? chaveMesAtual : (mesesComPagamento[0] || chaveMesAtual);
  const mesEfetivo = mesComissao === "auto" ? mesPadrao : mesComissao;
  const boletosPagosDoMes = boletosComStatus.filter((b) => b.status === "Pago" && mesRefDe(b.dataPagamento) === mesEfetivo);
  const valorBaseComissao = sum(boletosPagosDoMes.map((b) => b.valor));
  // comparação com o mês anterior ao mês escolhido
  const mesAnteriorChave = (() => {
    const [ano, mes] = mesEfetivo.split("-").map(Number);
    const d = new Date(ano, mes - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();
  const baseMesAnterior = sum(boletosComStatus.filter((b) => b.status === "Pago" && mesRefDe(b.dataPagamento) === mesAnteriorChave).map((b) => b.valor));
  const variacaoMes = baseMesAnterior > 0 ? ((valorBaseComissao - baseMesAnterior) / baseMesAnterior) * 100 : null;
  // listas de ação: próximos vencimentos e maiores atrasos
  const hojeZ = new Date(); hojeZ.setHours(0, 0, 0, 0);
  const diasAte = (iso) => Math.round((parseISODate(iso) - hojeZ) / 86400000);
  const nomeCli = (id) => db.clientes.find((c) => c.id === id)?.nome || "—";
  const proximos = boletosComStatus
    .filter((b) => b.status !== "Pago" && b.dataVencimento && diasAte(b.dataVencimento) >= 0)
    .sort((x, y) => x.dataVencimento.localeCompare(y.dataVencimento))
    .slice(0, 6);
  const devedores = (() => {
    const m = new Map();
    boletosComStatus.filter((b) => b.status === "Vencido").forEach((b) => {
      const x = m.get(b.clienteId) || { clienteId: b.clienteId, qtd: 0, total: 0, maxDias: 0 };
      x.qtd++; x.total += Number(b.valor) || 0; x.maxDias = Math.max(x.maxDias, Math.abs(diasAte(b.dataVencimento)));
      m.set(b.clienteId, x);
    });
    return Array.from(m.values()).sort((x, y) => y.total - x.total).slice(0, 6);
  })();
  const comissaoCorretora = valorBaseComissao * (pctComissao / 100);

  const valoresData = [
    { name: "Recebido", valor: valorRecebido, color: pal.success },
    { name: "Em aberto", valor: valorEmAberto, color: pal.info },
    { name: "A vencer", valor: valorAReceber, color: pal.warning },
    { name: `Comissão (${pctComissao}%)`, valor: comissaoCorretora, color: pal.violet },
  ];

  const contagem = { Pago: 0, "Em aberto": 0, Vencido: 0, "A vencer": 0 };
  boletosComStatus.forEach((b) => { contagem[b.status] = (contagem[b.status] || 0) + 1; });
  const qtdData = [
    { name: "Pagos", value: contagem["Pago"], fill: pal.success },
    { name: "Em aberto", value: contagem["Em aberto"], fill: pal.info },
    { name: "Vencidos", value: contagem["Vencido"], fill: pal.danger },
    { name: "A vencer", value: contagem["A vencer"], fill: pal.warning },
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
          <select
            className="nexo-select"
            style={{ width: "auto", minWidth: 190 }}
            title="Mês usado no cálculo da comissão da corretora (boletos pagos nesse mês)"
            value={mesComissao === "auto" ? mesPadrao : mesComissao}
            onChange={(e) => setMesComissao(e.target.value)}
          >
            {Array.from(new Set([...mesesComPagamento, chaveMesAtual])).sort().reverse().map((m) => (
              <option key={m} value={m}>Comissão de {rotuloMes(m)}</option>
            ))}
          </select>
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
        <Kpi icon={CreditCard} label={`Comissão da corretora (${pctComissao}% de ${rotuloMes(mesEfetivo)})`} value={formatBRL(comissaoCorretora)} tone="accent" wide
          extra={variacaoMes !== null && (
            <span className={`nexo-trend ${variacaoMes >= 0 ? "up" : "down"}`}>
              {variacaoMes >= 0 ? "▲" : "▼"} {Math.abs(variacaoMes).toFixed(1).replace(".", ",")}% em relação a {rotuloMes(mesAnteriorChave)}
            </span>
          )} />
      </div>

      <div className="nexo-two-grid">
        <div className="nexo-card">
          <div className="nexo-section-head" style={{ marginBottom: 8 }}>
            <div>
              <div className="nexo-chart-title">Próximos vencimentos</div>
              <div className="nexo-chart-sub" style={{ marginBottom: 0 }}>Boletos a receber, do mais próximo ao mais distante</div>
            </div>
            <button className="nexo-btn nexo-btn-ghost nexo-btn-sm" onClick={() => onIr("financeiro")}>Ver financeiro</button>
          </div>
          {proximos.length === 0 ? (
            <div className="nexo-empty-mini"><CheckCircle2 size={18} style={{ color: "var(--success)" }} /> Nenhum boleto a vencer por enquanto.</div>
          ) : proximos.map((b) => {
            const d = diasAte(b.dataVencimento);
            return (
              <div key={b.id} className="nexo-lista-item" onClick={() => onOpenDetail(b.clienteId)}>
                <AvatarNome nome={nomeCli(b.clienteId)} tamanho={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nexo-cliente-nome">{nomeCli(b.clienteId)}</div>
                  <div className="nexo-cliente-sub">vence {formatDateBR(b.dataVencimento)} · {d === 0 ? "hoje" : `em ${d} dia(s)`}</div>
                </div>
                <strong className="mono" style={{ color: d <= 7 ? "var(--warning)" : "var(--text)" }}>{formatBRL(b.valor)}</strong>
              </div>
            );
          })}
        </div>
        <div className="nexo-card">
          <div className="nexo-section-head" style={{ marginBottom: 8 }}>
            <div>
              <div className="nexo-chart-title">Maiores atrasos</div>
              <div className="nexo-chart-sub" style={{ marginBottom: 0 }}>Clientes com boletos vencidos, do maior valor ao menor</div>
            </div>
            <button className="nexo-btn nexo-btn-ghost nexo-btn-sm" onClick={() => onIr("financeiro")}>Ver financeiro</button>
          </div>
          {devedores.length === 0 ? (
            <div className="nexo-empty-mini"><CheckCircle2 size={18} style={{ color: "var(--success)" }} /> Ninguém em atraso. Tudo em dia!</div>
          ) : devedores.map((x) => (
            <div key={x.clienteId} className="nexo-lista-item" onClick={() => onOpenDetail(x.clienteId)}>
              <AvatarNome nome={nomeCli(x.clienteId)} tamanho={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="nexo-cliente-nome">{nomeCli(x.clienteId)}</div>
                <div className="nexo-cliente-sub">{x.qtd} boleto(s) vencido(s) · há até {x.maxDias} dia(s)</div>
              </div>
              <strong className="mono" style={{ color: "var(--danger)" }}>{formatBRL(x.total)}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="nexo-charts-grid">
        <div className="nexo-card">
          <div className="nexo-chart-title">Panorama financeiro</div>
          <div className="nexo-chart-sub">Recebido, em aberto e a vencer</div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valoresData} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={pal.border} vertical={false} />
                <XAxis dataKey="name" stroke={pal.textFaint} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={pal.textFaint} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} width={54} />
                <Tooltip
                  contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, boxShadow: "var(--shadow-md)", color: "var(--text)" }}
                  labelStyle={{ color: "var(--text)" }}
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
                  formatter={(v) => <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{v}</span>}
                />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, boxShadow: "var(--shadow-md)", color: "var(--text)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="nexo-card">
          <div className="nexo-chart-title">Comissão da corretora</div>
          <div className="nexo-chart-sub">{pctComissao}% sobre os boletos pagos em {rotuloMes(mesEfetivo)}</div>
          <div style={{ height: 240, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: `Comissão (${pctComissao}%)`, value: pctComissao },
                    { name: "Restante", value: 100 - pctComissao },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={82}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={0}
                >
                  <Cell fill={pal.violet} stroke="none" />
                  <Cell fill={pal.surface3} stroke="none" />
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, boxShadow: "var(--shadow-md)", color: "var(--text)" }}
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
              <div style={{ fontSize: 26, fontWeight: 800, color: "var(--violet)", lineHeight: 1 }}>{pctComissao}%</div>
              <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>recorrência mensal</div>
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: 15, fontWeight: 700, marginTop: 4 }}>{formatBRL(comissaoCorretora)}</div>
          <div className="nexo-cell-muted" style={{ textAlign: "center", marginTop: 2 }}>sobre {formatBRL(valorBaseComissao)} em {boletosPagosDoMes.length} boleto(s) pago(s)</div>
        </div>
      </div>

      <div className="nexo-card">
        <div className="nexo-chart-title">Evolução mensal dos recebimentos</div>
        <div className="nexo-chart-sub">Total pago por mês, últimos 6 meses</div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucao} margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={pal.border} vertical={false} />
              <XAxis dataKey="label" stroke={pal.textFaint} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={pal.textFaint} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} width={54} />
              <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, boxShadow: "var(--shadow-md)", color: "var(--text)" }} formatter={(v) => formatBRL(v)} />
              <Line type="monotone" dataKey="total" stroke={pal.accent} strokeWidth={2.5} dot={{ r: 3, fill: pal.accent }} activeDot={{ r: 5 }} />
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

function ClientesView({ db, onOpenModal, onDeleteCliente, onOpenDetail, onImportarClientes }) {
  const [query, setQuery] = useState("");
  const [importando, setImportando] = useState(false);
  const fileInputRef = useRef(null);

  const [filtro, setFiltro] = useState("todos");

  // Índice por cliente (veículos, boletos, totais e situação) calculado uma vez, não a cada linha.
  const info = useMemo(() => {
    const veic = new Map();
    db.veiculos.forEach((v) => { if (!veic.has(v.clienteId)) veic.set(v.clienteId, []); veic.get(v.clienteId).push(v); });
    const bol = new Map();
    db.boletos.forEach((b) => { if (!bol.has(b.clienteId)) bol.set(b.clienteId, []); bol.get(b.clienteId).push({ ...b, status: computeBoletoStatus(b) }); });
    const mapa = new Map();
    db.clientes.forEach((c) => {
      const veiculos = veic.get(c.id) || [];
      const boletos = bol.get(c.id) || [];
      mapa.set(c.id, {
        veiculos, boletos,
        emAberto: sum(boletos.filter((x) => x.status !== "Pago").map((x) => x.valor)),
        recebido: sum(boletos.filter((x) => x.status === "Pago").map((x) => x.valor)),
        mensal: sum(veiculos.filter((v) => v.status === "Ativo").map((v) => v.valorMensal)),
        sit: situacaoFinanceira(c, boletos),
      });
    });
    return mapa;
  }, [db.clientes, db.veiculos, db.boletos]);

  const contagens = useMemo(() => {
    const n = { todos: db.clientes.length, emdia: 0, aberto: 0, inadimplente: 0, semcpf: 0, inativo: 0 };
    db.clientes.forEach((c) => {
      const chave = info.get(c.id)?.sit.chave;
      if (chave && n[chave] !== undefined) n[chave]++;
      if (!c.cpf) n.semcpf++;
    });
    return n;
  }, [db.clientes, info]);

  const filtered = db.clientes.filter((c) => {
    const s = info.get(c.id);
    if (filtro === "semcpf") { if (c.cpf) return false; }
    else if (filtro !== "todos" && s?.sit.chave !== filtro) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    const digitos = q.replace(/\D/g, "");
    const placa = normPlaca(query);
    return (
      c.nome.toLowerCase().includes(q) ||
      (digitos.length >= 3 && (c.cpf || "").replace(/\D/g, "").includes(digitos)) ||
      (placa.length >= 2 && (s?.veiculos || []).some((v) => normPlaca(v.placa).includes(placa)))
    );
  });

  async function handleArquivoSelecionado(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setImportando(true);
    try {
      const { cabecalhos, linhas } = await lerArquivoComoTabela(arquivo);
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
        notify("Nenhuma linha válida encontrada. Confira se o arquivo tem as colunas Nome e CPF/CNPJ.");
      } else {
        await onImportarClientes(clientesNovos);
      }
    } catch (err) {
      notify("Não foi possível ler o arquivo: " + err.message);
    } finally {
      setImportando(false);
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
            {importando ? "Importando…" : "Importar arquivo"}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx,.ods,.html,.pdf" style={{ display: "none" }} onChange={handleArquivoSelecionado} />
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

      <div className="nexo-toolbar">
        <div className="nexo-searchbar">
          <Search size={15} />
          <input placeholder="Pesquisar por nome, CPF ou placa" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      <div className="nexo-chips">
        {[["todos", "Todos"], ["emdia", "Em dia"], ["aberto", "Em aberto"], ["inadimplente", "Inadimplentes"], ["semcpf", "Sem CPF"], ["inativo", "Inativos"]].map(([k, rotulo]) => (
          <button key={k} className={`nexo-chip ${filtro === k ? "on" : ""}`} onClick={() => setFiltro(k)}>
            {rotulo}<span className="nexo-chip-n">{contagens[k]}</span>
          </button>
        ))}
      </div>
      {db.clientes.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Users} title="Nenhum cliente cadastrado" sub="Clique em “Novo cliente” para começar." /></div>
      ) : filtered.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Search} title="Nenhum resultado" sub="Tente outro nome, CPF ou placa, ou troque o filtro acima." /></div>
      ) : (
        <div className="nexo-table-wrap">
          <div className="nexo-table-scroll">
            <table className="nexo-table">
              <thead>
                <tr>
                  <th>Cliente</th><th>Contato</th><th>Veículos</th><th>Mensal</th><th>Em aberto</th><th>Recebido</th><th>Situação</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const s = info.get(c.id);
                  return (
                    <tr key={c.id} className="nexo-row-link" style={c.status === "Inativo" ? { opacity: 0.66 } : undefined} onClick={() => onOpenDetail(c.id)}>
                      <td>
                        <div className="nexo-cliente-cell">
                          <AvatarNome nome={c.nome} />
                          <div style={{ minWidth: 0 }}>
                            <div className="nexo-cliente-nome">{c.nome}</div>
                            <div className="nexo-cliente-sub mono">{c.cpf || "CPF não informado"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="nexo-cell-muted">{c.telefone || c.whatsapp || "—"}</td>
                      <td>{s.veiculos.length > 0 ? s.veiculos.length : <span className="nexo-cell-muted">—</span>}</td>
                      <td className="mono">{s.mensal > 0 ? formatBRL(s.mensal) : <SemValor />}</td>
                      <td className="mono" style={{ color: s.emAberto > 0 ? "var(--warning)" : "var(--text-faint)" }}>{s.emAberto > 0 ? formatBRL(s.emAberto) : "—"}</td>
                      <td className="mono" style={{ color: s.recebido > 0 ? "var(--success)" : "var(--text-faint)" }}>{s.recebido > 0 ? formatBRL(s.recebido) : "—"}</td>
                      <td><PillTom tom={s.sit.tom}>{s.sit.rotulo}</PillTom></td>
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

function VeiculosView({ db, onOpenModal, onDeleteVeiculo, onOpenDetail, onImportarVeiculos }) {
  const [query, setQuery] = useState("");
  const [importando, setImportando] = useState(false);
  const fileInputRef = useRef(null);
  const [filtro, setFiltro] = useState("todos");
  const [modo, setModo] = useState("clientes"); // clientes | lista
  const [expandir, setExpandir] = useState("auto"); // auto | todos | nenhum
  const [overrides, setOverrides] = useState({});
  const getCliente = (id) => db.clientes.find((c) => c.id === id);

  async function handleArquivoVeiculos(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setImportando(true);
    try {
      const { cabecalhos, linhas } = await lerArquivoComoTabela(arquivo);
      const ehRelatorioBoletos = cabecalhos.includes("nossonumero");
      const todos = [];
      let semPlaca = 0;
      for (const linha of linhas) {
        const col = (...candidatos) => valorDaColuna(cabecalhos, linha, candidatos);
        const placas = separarPlacas(col("placas", "placa", "placadoveiculo"));
        if (placas.length === 0) { semPlaca++; continue; }
        const statusLista = String(col("situacaoveiculo")).split("|").map((s) => s.trim()).filter(Boolean);
        // Em relatório de boletos, o "Valor" é do boleto: só vale como valor mensal quando o boleto é de 1 veículo.
        const valorBoleto = ehRelatorioBoletos && placas.length === 1 ? col("valor") : "";
        placas.forEach((placa, i) => {
          todos.push({
            placa,
            marca: semSeparador(col("marca", "montadora", "fabricante")),
            modelo: semSeparador(col("modelo", "veiculo", "descricao", "descricaodoveiculo")),
            ano: col("anomodelo", "ano", "anomod"),
            anoFabricacao: col("anofabricacao", "anofab"),
            chassi: col("chassi"),
            renavam: col("renavam"),
            cor: semSeparador(col("cor")),
            combustivel: col("combustivel"),
            codigoFipe: col("codigofipe", "codfipe"),
            dataContrato: paraDataISO(col("datacontrato", "datacadastro", "dataadesao")),
            valorMensal: col("valormensal", "mensalidade") || valorBoleto,
            status: statusLista.length === placas.length ? statusLista[i] : (col("situacaoveiculo") || (ehRelatorioBoletos ? "" : col("situacao", "status"))),
            proprietario: semSeparador(col("proprietario", "nomedoproprietario", "nomedocliente", "cliente", "associado", "nome")),
            cpf: col("cpfcnpj", "cpf", "cnpj", "cpfdoproprietario", "cpfproprietario"),
            codigoSga: col("codigosga", "codigocliente", "matricula", "codigo"),
          });
        });
      }
      if (todos.length === 0) {
        notify("Nenhuma linha válida encontrada. Confira se o arquivo tem a coluna Placa (ou Placas).");
      } else {
        await onImportarVeiculos(todos, semPlaca);
      }
    } catch (err) {
      notify("Não foi possível ler o arquivo: " + err.message);
    } finally {
      setImportando(false);
    }
  }

  const contagens = {
    todos: db.veiculos.length,
    ativos: db.veiculos.filter((v) => v.status === "Ativo").length,
    inativos: db.veiculos.filter((v) => v.status !== "Ativo").length,
    semvalor: db.veiculos.filter((v) => !(Number(v.valorMensal) > 0)).length,
    semfipe: db.veiculos.filter((v) => !v.codigoFipe).length,
  };
  const filtered = db.veiculos.filter((v) => {
    if (filtro === "ativos" && v.status !== "Ativo") return false;
    if (filtro === "inativos" && v.status === "Ativo") return false;
    if (filtro === "semvalor" && Number(v.valorMensal) > 0) return false;
    if (filtro === "semfipe" && v.codigoFipe) return false;
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
  const grupos = (() => {
    const m = new Map();
    filtered.forEach((v) => { const k = v.clienteId || "sem"; if (!m.has(k)) m.set(k, []); m.get(k).push(v); });
    return Array.from(m.entries())
      .map(([clienteId, veiculos]) => ({
        clienteId, cliente: getCliente(clienteId), veiculos,
        mensal: sum(veiculos.filter((v) => v.status === "Ativo").map((v) => v.valorMensal)),
      }))
      .sort((x, y) => (x.cliente?.nome || "~").localeCompare(y.cliente?.nome || "~", "pt-BR"));
  })();
  const estaAberto = (g) => {
    if (overrides[g.clienteId] !== undefined) return overrides[g.clienteId];
    if (query) return true; // ao buscar, os resultados sempre aparecem abertos
    if (expandir === "todos") return true;
    if (expandir === "nenhum") return false;
    return g.veiculos.length <= 3; // frotas grandes começam recolhidas
  };
  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Veículos<span className="nexo-section-count">{db.veiculos.length} cadastrados</span></div>
        <div className="nexo-topbar-actions">
          <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx,.ods,.html,.pdf" style={{ display: "none" }} onChange={handleArquivoVeiculos} />
          <button
            className="nexo-btn nexo-btn-ghost"
            title="Baixa uma planilha de exemplo com as colunas que o sistema entende"
            onClick={() =>
              exportarCSV(
                "modelo-importacao-veiculos.csv",
                ["Placa", "Marca", "Modelo", "Ano modelo", "Ano fabricação", "Chassi", "Renavam", "Cor", "Proprietário", "CPF/CNPJ", "Código SGA"].map((t) => ({ titulo: t, valor: () => "" })),
                []
              )
            }
          >
            Baixar modelo
          </button>
          <button
            className="nexo-btn"
            disabled={importando}
            title="Importa uma lista de veículos (Excel, PDF, CSV) e cadastra cada um direto no proprietário"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} /> {importando ? "Importando…" : "Importar veículos"}
          </button>
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

      <div className="nexo-toolbar">
        <div className="nexo-searchbar">
          <Search size={15} />
          <input placeholder="Pesquisar por placa, modelo ou cliente" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="nexo-seg">
          <button className={modo === "clientes" ? "on" : ""} onClick={() => setModo("clientes")}>Por cliente</button>
          <button className={modo === "lista" ? "on" : ""} onClick={() => setModo("lista")}>Lista</button>
        </div>
      </div>
      <div className="nexo-chips">
        {[["todos", "Todos"], ["ativos", "Ativos"], ["inativos", "Inativos"], ["semvalor", "Sem valor mensal"], ["semfipe", "Sem Fipe"]].map(([k, rotulo]) => (
          <button key={k} className={`nexo-chip ${filtro === k ? "on" : ""}`} onClick={() => setFiltro(k)}>
            {rotulo}<span className="nexo-chip-n">{contagens[k]}</span>
          </button>
        ))}
        {modo === "clientes" && (
          <>
            <button className="nexo-chip-link" onClick={() => { setExpandir("todos"); setOverrides({}); }}>Expandir tudo</button>
            <button className="nexo-chip-link" onClick={() => { setExpandir("nenhum"); setOverrides({}); }}>Recolher tudo</button>
          </>
        )}
      </div>
      {db.veiculos.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Car} title="Nenhum veículo cadastrado" sub="Clique em “Novo veículo” para começar." /></div>
      ) : filtered.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Search} title="Nenhum resultado" sub="Tente outro termo ou troque o filtro acima." /></div>
      ) : modo === "clientes" ? (
        <div>
          {grupos.map((g) => {
            const aberto = estaAberto(g);
            return (
              <div className="nexo-vgroup" key={g.clienteId}>
                <div className="nexo-vgroup-head" onClick={() => setOverrides((o) => ({ ...o, [g.clienteId]: !aberto }))}>
                  <ChevronRight size={16} className={`nexo-chev ${aberto ? "open" : ""}`} />
                  <AvatarNome nome={g.cliente?.nome || "?"} tamanho={36} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="nexo-cliente-nome">{g.cliente ? g.cliente.nome : "Sem proprietário"}</div>
                    <div className="nexo-cliente-sub">
                      {g.veiculos.length} veículo(s)
                      {!aberto && ` · ${g.veiculos.slice(0, 3).map((v) => v.placa).join(", ")}${g.veiculos.length > 3 ? "…" : ""}`}
                    </div>
                  </div>
                  <div className="nexo-vgroup-mensal">
                    {g.mensal > 0 ? (<><span className="nexo-cell-muted">mensal</span><strong className="mono">{formatBRL(g.mensal)}</strong></>) : <SemValor />}
                  </div>
                  <div className="nexo-actions-cell" onClick={(e) => e.stopPropagation()}>
                    {g.cliente && <button className="nexo-icon-btn" title="Novo veículo para este cliente" onClick={() => onOpenModal("veiculo", null, g.clienteId)}><Plus size={13} /></button>}
                    {g.cliente && <button className="nexo-icon-btn" title="Abrir cliente" onClick={() => onOpenDetail(g.clienteId)}><Eye size={13} /></button>}
                  </div>
                </div>
                {aberto && (
                  <div className="nexo-vgroup-body">
                    {g.veiculos.map((v) => (
                      <VeiculoLinha key={v.id} v={v} onEditar={() => onOpenModal("veiculo", v)} onExcluir={() => onDeleteVeiculo(v.id)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
                      <td>
                        <div className="nexo-cliente-cell">
                          <AvatarNome nome={cliente ? cliente.nome : "?"} tamanho={30} />
                          <span className="nexo-cliente-nome">{cliente ? cliente.nome : "—"}</span>
                        </div>
                      </td>
                      <td>{v.marca} {v.modelo}</td>
                      <td><PlacaChip placa={v.placa} /></td>
                      <td className="nexo-cell-muted">{v.anoFabricacao || v.ano ? `${v.anoFabricacao || "—"}/${v.ano || "—"}` : "—"}</td>
                      <td className="mono">{Number(v.valorMensal) > 0 ? formatBRL(v.valorMensal) : <SemValor />}</td>
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

function FinanceiroView({ db, onOpenModal, onDeleteBoleto, onMarcarPago, onImportarBaixa }) {
  const [fCliente, setFCliente] = useState("");
  const [fCpf, setFCpf] = useState("");
  const [fPlaca, setFPlaca] = useState("");
  const [fStatus, setFStatus] = useState("Todos");
  const [fDe, setFDe] = useState("");
  const [fAte, setFAte] = useState("");
  const [fVencimento, setFVencimento] = useState("Todos");
  const [fMes, setFMes] = useState("todos");
  const [ordem, setOrdem] = useState("prioridade");
  const [importandoBaixa, setImportandoBaixa] = useState(false);
  const fileInputBaixaRef = useRef(null);

  async function handleArquivoBaixa(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setImportandoBaixa(true);
    try {
      const { cabecalhos, linhas } = await lerArquivoComoTabela(arquivo);
      const linhasBaixa = linhas
        .map((linha) => ({
          nomeCliente: semSeparador(valorDaColuna(cabecalhos, linha, ["nomedocliente", "nome", "cliente"])),
          cpf: valorDaColuna(cabecalhos, linha, ["cpfcnpj", "cpf", "cnpj"]),
          codigoSga: valorDaColuna(cabecalhos, linha, ["codigosga", "codigocliente", "codigo"]),
          nossoNumero: valorDaColuna(cabecalhos, linha, ["nossonumero", "nossonumer"]),
          situacao: valorDaColuna(cabecalhos, linha, ["situacao", "status"]),
          dataPagamento: paraDataISO(valorDaColuna(cabecalhos, linha, ["datadopagamento", "datapagamento", "databaixa"])),
          valor: valorDaColuna(cabecalhos, linha, ["valor", "valordoboleto", "valorboleto", "valorpago", "valorrecebido", "valornominal", "valortitulo", "valordabaixa", "mensalidade"]),
          dataVencimento: paraDataISO(valorDaColuna(cabecalhos, linha, ["vencimento", "datadevencimento", "datavencimento", "venc"])),
          placa: valorDaColuna(cabecalhos, linha, ["placas", "placa"]),
        }))
        .filter((l) => l.nossoNumero);
      if (linhasBaixa.length === 0) {
        notify("Nenhuma linha válida encontrada. Confira se o arquivo tem a coluna Nosso Número.");
      } else {
        await onImportarBaixa(linhasBaixa);
      }
    } catch (err) {
      notify("Não foi possível ler o arquivo: " + err.message);
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

  const clientePorId = useMemo(() => new Map(db.clientes.map((c) => [c.id, c])), [db.clientes]);
  const veiculoPorId = useMemo(() => new Map(db.veiculos.map((v) => [v.id, v])), [db.veiculos]);
  const qtdVeiculosCliente = useMemo(() => {
    const m = new Map();
    db.veiculos.forEach((v) => m.set(v.clienteId, (m.get(v.clienteId) || 0) + 1));
    return m;
  }, [db.veiculos]);
  const mesesVenc = Array.from(new Set(boletosComStatus.map((x) => (x.dataVencimento || "").slice(0, 7)).filter(Boolean))).sort().reverse();
  const contagemStatus = {
    Todos: boletosComStatus.length,
    Vencido: boletosComStatus.filter((x) => x.status === "Vencido").length,
    "A vencer": aVencer.length,
    "Em aberto": boletosComStatus.filter((x) => x.status === "Em aberto").length,
    Pago: boletosComStatus.filter((x) => x.status === "Pago").length,
  };
  const hojeZero = new Date(); hojeZero.setHours(0, 0, 0, 0);
  const nomeDe = (x) => clientePorId.get(x.clienteId)?.nome || "";
  const peso = { Vencido: 0, "A vencer": 1, "Em aberto": 2, Pago: 3 };

  const filtered = boletosComStatus.filter((b) => {
    const cliente = clientePorId.get(b.clienteId);
    const veiculo = veiculoPorId.get(b.veiculoId);
    if (fCliente && !(cliente && cliente.nome.toLowerCase().includes(fCliente.toLowerCase()))) return false;
    if (fCpf && !(cliente && cliente.cpf.replace(/\D/g, "").includes(fCpf.replace(/\D/g, "")))) return false;
    if (fPlaca && !(veiculo && veiculo.placa.toLowerCase().includes(fPlaca.toLowerCase()))) return false;
    if (fStatus !== "Todos" && b.status !== fStatus) return false;
    if (fMes !== "todos" && (b.dataVencimento || "").slice(0, 7) !== fMes) return false;
    if (fDe && b.dataVencimento && b.dataVencimento < fDe) return false;
    if (fAte && b.dataVencimento && b.dataVencimento > fAte) return false;
    if (fVencimento !== "Todos" && b.dataVencimento) {
      const diffDays = Math.round((parseISODate(b.dataVencimento) - hojeZero) / 86400000);
      if (fVencimento === "Vencidos" && diffDays >= 0) return false;
      if (fVencimento === "Hoje" && diffDays !== 0) return false;
      if (fVencimento === "Proximos7" && (diffDays < 0 || diffDays > 7)) return false;
      if (fVencimento === "Proximos30" && (diffDays < 0 || diffDays > 30)) return false;
    }
    return true;
  }).sort((x, y) => {
    if (ordem === "venc-asc") return (x.dataVencimento || "").localeCompare(y.dataVencimento || "");
    if (ordem === "venc-desc") return (y.dataVencimento || "").localeCompare(x.dataVencimento || "");
    if (ordem === "valor") return Number(y.valor) - Number(x.valor);
    if (ordem === "cliente") return nomeDe(x).localeCompare(nomeDe(y), "pt-BR");
    // prioridade: o que precisa de atenção vem primeiro; pagos por último (os mais recentes antes)
    const d = peso[x.status] - peso[y.status];
    if (d !== 0) return d;
    return x.status === "Pago"
      ? (y.dataVencimento || "").localeCompare(x.dataVencimento || "")
      : (x.dataVencimento || "").localeCompare(y.dataVencimento || "");
  });
  const totalSelecao = sum(filtered.map((x) => x.valor));
  const totalPagoSel = sum(filtered.filter((x) => x.status === "Pago").map((x) => x.valor));
  const totalAbertoSel = sum(filtered.filter((x) => x.status !== "Pago").map((x) => x.valor));
  function limparFiltros() {
    setFCliente(""); setFCpf(""); setFPlaca(""); setFStatus("Todos"); setFDe(""); setFAte(""); setFVencimento("Todos"); setFMes("todos");
  }

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Financeiro<span className="nexo-section-count">{db.boletos.length} boletos</span></div>
        <div className="nexo-topbar-actions">
          <input ref={fileInputBaixaRef} type="file" accept=".csv,.xls,.xlsx,.ods,.html,.pdf" style={{ display: "none" }} onChange={handleArquivoBaixa} />
          <button
            className="nexo-btn"
            disabled={importandoBaixa}
            title="Importa o relatório do SGA/Invicta Mais: dá baixa nos boletos existentes pelo Nosso Número e cadastra sozinho clientes/boletos que ainda não existem no sistema"
            onClick={() => fileInputBaixaRef.current?.click()}
          >
            <Upload size={14} /> {importandoBaixa ? "Importando…" : "Importar baixa (SGA)"}
          </button>
          <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("boleto")}><Plus size={15} /> Novo boleto</button>
        </div>
      </div>

      <div className="nexo-kpi-grid">
        <Kpi icon={FileText} label="Boletos em aberto" value={emAberto.length} tone="info" />
        <Kpi icon={Clock} label="Boletos a vencer" value={aVencer.length} tone="warning" />
        <Kpi icon={Wallet} label="Valor em aberto" value={formatBRL(valorEmAberto)} tone="info" />
        <Kpi icon={Receipt} label="Valor recebido" value={formatBRL(valorRecebido)} tone="success" />
      </div>

      <div className="nexo-toolbar-fin">
        <div className="nexo-chips" style={{ marginBottom: 0 }}>
          {[["Todos", "Todos"], ["Vencido", "Vencidos"], ["A vencer", "A vencer"], ["Em aberto", "Em aberto"], ["Pago", "Pagos"]].map(([k, rotulo]) => (
            <button key={k} className={`nexo-chip ${fStatus === k ? "on" : ""}`} onClick={() => setFStatus(k)}>
              {rotulo}<span className="nexo-chip-n">{contagemStatus[k]}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select className="nexo-select" style={{ width: "auto" }} value={fMes} onChange={(e) => setFMes(e.target.value)} title="Filtra pelo mês de vencimento">
            <option value="todos">Todos os meses</option>
            {mesesVenc.map((m) => <option key={m} value={m}>Vence em {rotuloMes(m)}</option>)}
          </select>
          <select className="nexo-select" style={{ width: "auto" }} value={ordem} onChange={(e) => setOrdem(e.target.value)} title="Ordenação da lista">
            <option value="prioridade">Prioridade (vencidos primeiro)</option>
            <option value="venc-asc">Vencimento: mais antigo</option>
            <option value="venc-desc">Vencimento: mais recente</option>
            <option value="valor">Maior valor</option>
            <option value="cliente">Cliente (A–Z)</option>
          </select>
        </div>
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
                <tr><th>Cliente</th><th>Veículo</th><th>Nosso Número</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const cliente = clientePorId.get(b.clienteId);
                  const veiculo = veiculoPorId.get(b.veiculoId);
                  const nFrota = !veiculo ? (qtdVeiculosCliente.get(b.clienteId) || 0) : 0;
                  const dias = b.dataVencimento ? Math.round((parseISODate(b.dataVencimento) - hojeZero) / 86400000) : null;
                  return (
                    <tr key={b.id} className={b.status === "Vencido" ? "venc" : b.status === "A vencer" ? "avencer" : ""}>
                      <td>
                        <div className="nexo-cliente-cell">
                          <AvatarNome nome={cliente ? cliente.nome : "?"} tamanho={32} />
                          <span className="nexo-cliente-nome">{cliente ? cliente.nome : "—"}</span>
                        </div>
                      </td>
                      <td>
                        {veiculo ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <PlacaChip placa={veiculo.placa} />
                            <span className="nexo-cell-muted">{veiculo.marca} {veiculo.modelo}</span>
                          </div>
                        ) : nFrota > 1 ? (
                          <span className="nexo-tag-frota" title="Boleto sem veículo específico: cobre o cliente/frota">Frota · {nFrota} veículos</span>
                        ) : (
                          <span className="nexo-cell-muted">—</span>
                        )}
                      </td>
                      <td className="mono nexo-cell-muted">{b.nossoNumero || "—"}</td>
                      <td>
                        <div>{formatDateBR(b.dataVencimento)}</div>
                        {b.status === "Vencido" && dias !== null && <div className="nexo-venc-sub" style={{ color: "var(--danger)" }}>há {Math.abs(dias)} dia(s)</div>}
                        {b.status === "A vencer" && dias !== null && <div className="nexo-venc-sub" style={{ color: "var(--warning)" }}>{dias === 0 ? "vence hoje" : `em ${dias} dia(s)`}</div>}
                      </td>
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
          <div className="nexo-table-foot">
            <span><strong>{filtered.length}</strong> boleto(s) na seleção</span>
            <span>Pagos: <strong style={{ color: "var(--success)" }}>{formatBRL(totalPagoSel)}</strong></span>
            <span>Em aberto: <strong style={{ color: "var(--warning)" }}>{formatBRL(totalAbertoSel)}</strong></span>
            <span className="tot">Total da seleção: <strong>{formatBRL(totalSelecao)}</strong></span>
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
  const [aba, setAba] = useState(null);
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

  const abaAtual = aba || (veiculosDoCliente.length > 0 ? "veiculos" : "boletos");
  const digitosWhats = (cliente.whatsapp || cliente.telefone || "").replace(/\D/g, "");
  const linkWhats = digitosWhats.length >= 10 ? `https://wa.me/${digitosWhats.startsWith("55") && digitosWhats.length >= 12 ? digitosWhats : "55" + digitosWhats}` : "";
  const boletosOrdenados = [...boletosDoCliente].sort((x, y) => (y.dataVencimento || "").localeCompare(x.dataVencimento || ""));

  return (
    <div>
      <button className="nexo-btn nexo-btn-ghost" style={{ marginBottom: 14 }} onClick={onBack}><ArrowLeft size={15} /> Voltar para clientes</button>

      <div className="nexo-detail-grid">
        <div className="nexo-card">
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <AvatarNome nome={cliente.nome} tamanho={56} />
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
          {cliente.codigoSga && <div className="nexo-info-row"><CreditCard size={14} /> Código SGA: <span className="mono">{cliente.codigoSga}</span></div>}
          {cliente.ultimoContato && <div className="nexo-info-row"><Clock size={14} /> Último contato: {formatDateBR(cliente.ultimoContato)}</div>}
          {cliente.indicadoPor && <div className="nexo-info-row"><Users size={14} /> Indicado por: {cliente.indicadoPor}</div>}
          <button className="nexo-btn" style={{ width: "100%", justifyContent: "center", marginTop: 14 }} onClick={() => onOpenModal("cliente", cliente)}>
            <Pencil size={14} /> Editar dados pessoais
          </button>
          {linkWhats && (
            <a className="nexo-btn" style={{ width: "100%", marginTop: 8 }} href={linkWhats} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={14} /> Chamar no WhatsApp
            </a>
          )}
        </div>

        <div>
          <div className="nexo-mini-kpis">
            <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Boletos pagos</div><div className="nexo-mini-kpi-value">{pagos.length}</div></div>
            <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Boletos em aberto</div><div className="nexo-mini-kpi-value">{emAberto.length}</div></div>
            <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Total em aberto</div><div className="nexo-mini-kpi-value">{formatBRL(totalEmAberto)}</div></div>
            <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Total recebido</div><div className="nexo-mini-kpi-value">{formatBRL(totalRecebido)}</div></div>
          </div>

          <div className="nexo-card">
            <div className="nexo-tabs">
              <div className={`nexo-tab ${abaAtual === "veiculos" ? "active" : ""}`} onClick={() => setAba("veiculos")}>Veículos<span className="nexo-tab-n">{veiculosDoCliente.length}</span></div>
              <div className={`nexo-tab ${abaAtual === "boletos" ? "active" : ""}`} onClick={() => setAba("boletos")}>Boletos<span className="nexo-tab-n">{boletosDoCliente.length}</span></div>
              <div style={{ marginLeft: "auto", paddingBottom: 6 }}>
                {abaAtual === "veiculos" ? (
                  <button className="nexo-btn nexo-btn-sm" onClick={() => onOpenModal("veiculo", null, clienteId)}><Plus size={13} /> Novo veículo</button>
                ) : (
                  <button className="nexo-btn nexo-btn-sm" onClick={() => onOpenModal("boleto", null, clienteId)}><Plus size={13} /> Novo boleto</button>
                )}
              </div>
            </div>
            {abaAtual === "veiculos" ? (
              veiculosDoCliente.length === 0 ? (
                <div className="nexo-empty-sub">Nenhum veículo vinculado a este cliente.</div>
              ) : (
                <div>
                  {veiculosDoCliente.map((v) => (
                    <VeiculoLinha
                      key={v.id} v={v} plano
                      onEditar={() => onOpenModal("veiculo", v)}
                      onExcluir={() => onDeleteVeiculo(v.id)}
                      onNovoBoleto={() => onOpenModal("boleto", null, clienteId, v.id)}
                    />
                  ))}
                </div>
              )
            ) : boletosDoCliente.length === 0 ? (
              <div className="nexo-empty-sub">Nenhum boleto lançado para este cliente ainda.</div>
            ) : (
              <div className="nexo-table-scroll">
                <table className="nexo-table">
                  <thead><tr><th>Número</th><th>Veículo</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {boletosOrdenados.map((b) => {
                      const veic = veiculosDoCliente.find((v) => v.id === b.veiculoId);
                      return (
                        <tr key={b.id}>
                          <td>
                            <div className="mono">{b.numero}</div>
                            {b.nossoNumero && <div className="nexo-cliente-sub mono">Nosso nº {b.nossoNumero}</div>}
                          </td>
                          <td>{veic ? <PlacaChip placa={veic.placa} /> : <span className="nexo-cell-muted">—</span>}</td>
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
                      );
                    })}
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

function CotacoesView({ db, onOpenModal, onSaveSeguradora, onDeleteSeguradora, onDeletePlano, onDeleteCotacao, onImportarPlanos, onAtualizarLinkPortal }) {
  const [nomeSeguradora, setNomeSeguradora] = useState("");
  const [linkPortalNovo, setLinkPortalNovo] = useState("");
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
    await onSaveSeguradora(nomeSeguradora.trim(), linkPortalNovo.trim());
    setNomeSeguradora("");
    setLinkPortalNovo("");
  }

  function linkComProtocolo(url) {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  function editarLinkPortal(s) {
    const novo = window.prompt(`Link do portal da ${s.nome} (deixe em branco para remover):`, s.linkPortal || "");
    if (novo === null) return; // cancelou
    onAtualizarLinkPortal(s.id, novo.trim());
  }

  async function handleArquivoSelecionado(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setImportando(true);
    try {
      const { cabecalhos, linhas } = await lerArquivoComoTabela(arquivo);
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
        notify("Nenhuma linha válida encontrada. Confira as colunas Seguradora e Plano.");
      } else {
        await onImportarPlanos(planosNovos);
      }
    } catch (err) {
      notify("Não foi possível ler o arquivo: " + err.message);
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
              {importando ? "Importando…" : "Importar tabela (Excel/PDF/CSV)"}
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx,.ods,.html,.pdf" style={{ display: "none" }} onChange={handleArquivoSelecionado} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            className="nexo-input"
            style={{ maxWidth: 240 }}
            placeholder="Nome da nova seguradora"
            value={nomeSeguradora}
            onChange={(e) => setNomeSeguradora(e.target.value)}
          />
          <input
            className="nexo-input"
            style={{ maxWidth: 280 }}
            placeholder="Link do portal (opcional)"
            value={linkPortalNovo}
            onChange={(e) => setLinkPortalNovo(e.target.value)}
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
                    {s.linkPortal ? (
                      <a
                        className="nexo-btn nexo-btn-sm"
                        href={linkComProtocolo(s.linkPortal)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abre o site da seguradora numa aba nova — você faz login lá"
                      >
                        Acessar portal ↗
                      </a>
                    ) : (
                      <button className="nexo-btn nexo-btn-sm nexo-btn-ghost" onClick={() => editarLinkPortal(s)}>
                        + Link do portal
                      </button>
                    )}
                    {s.linkPortal && (
                      <button className="nexo-icon-btn" title="Editar link do portal" onClick={() => editarLinkPortal(s)}><Pencil size={13} /></button>
                    )}
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
/* Login                                                                */
/* ------------------------------------------------------------------ */

function LoginScreen({ onEntrar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit() {
    if (!email.trim() || !senha.trim()) {
      setErro("Preencha e-mail e senha.");
      return;
    }
    setCarregando(true);
    setErro("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }
    onEntrar();
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 }}>
      <div className="nexo-card" style={{ maxWidth: 360, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div className="nexo-brand-mark">SS</div>
          <div>
            <div className="nexo-brand-name">Seu Seguro Corretora</div>
            <div className="nexo-brand-tag">Acesso restrito</div>
          </div>
        </div>
        <Field label="E-mail">
          <input
            type="email"
            className="nexo-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="seu@email.com"
            autoFocus
          />
        </Field>
        <div style={{ height: 12 }} />
        <Field label="Senha">
          <input
            type="password"
            className="nexo-input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••"
          />
        </Field>
        {erro && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{erro}</div>}
        <button
          className="nexo-btn nexo-btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
          disabled={carregando}
          onClick={handleSubmit}
        >
          {carregando ? "Entrando…" : "Entrar"}
        </button>
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
  const [f, setF] = useState({
    nome: "", telefone: "", email: "", status: "Ativa", percentualAdesao: "", valorFixoContrato: "", percentualRecorrente: "", metaMensal: "",
    ...(initial || {}),
  });
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
      <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>Quanto ela ganha</div>
      <div className="nexo-cliente-sub" style={{ marginTop: -8 }}>Preencha o que se aplica. Dá para ajustar o valor em cada adesão.</div>
      <div className="nexo-field-row3">
        <Field label="% da adesão">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.percentualAdesao} onChange={set("percentualAdesao")} placeholder="Ex.: 30" />
        </Field>
        <Field label="Valor fixo por contrato (R$)">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorFixoContrato} onChange={set("valorFixoContrato")} placeholder="Ex.: 50" />
        </Field>
        <Field label="% recorrente (mensalidades)">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.percentualRecorrente} onChange={set("percentualRecorrente")} placeholder="Ex.: 2" />
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Meta mensal (nº de adesões)">
          <input type="number" min="0" className="nexo-input" value={f.metaMensal} onChange={set("metaMensal")} placeholder="Ex.: 10" />
        </Field>
        <Field label="Status">
          <select className="nexo-select" value={f.status} onChange={set("status")}>
            <option>Ativa</option>
            <option>Inativa</option>
          </select>
        </Field>
      </div>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar consultora</button>
      </div>
    </>
  );
}

function ConsultorasView({ db, onOpenModal, onDeleteConsultora, onDeleteComissao, onMarcarPagaComissao }) {
  const [aba, setAba] = useState("desempenho");
  const [mesEscolhido, setMesEscolhido] = useState(null);
  const mesAtual = mesRefDe(todayISO());
  const mesesOpcoes = opcoesMeses(db.adesoes.map((a) => mesRefDe(a.dataVenda)));
  const mesPadrao = mesesOpcoes.find((m) => db.adesoes.some((a) => mesRefDe(a.dataVenda) === m && a.status !== "Cancelada")) || mesAtual;
  const mes = mesEscolhido || mesPadrao;

  const ranking = db.consultoras
    .map((c) => ({ c, d: desempenhoConsultora(db, c, mes) }))
    .sort((x, y) => y.d.valor - x.d.valor || y.d.qtd - x.d.qtd || x.c.nome.localeCompare(y.c.nome, "pt-BR"));
  const totQtd = sum(ranking.map((r) => r.d.qtd));
  const totValor = round2(sum(ranking.map((r) => r.d.valor)));
  const totGanho = round2(sum(ranking.map((r) => r.d.total)));
  const aPagar = round2(sum(db.comissoes.filter((c) => c.status === "A pagar").map((c) => c.valorComissao)));

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Consultoras<span className="nexo-section-count">{db.consultoras.length} cadastradas</span></div>
        <div className="nexo-topbar-actions">
          {aba === "desempenho" && (
            <select className="nexo-select" style={{ width: "auto" }} value={mes} onChange={(e) => setMesEscolhido(e.target.value)} title="Mês de referência">
              {mesesOpcoes.map((m) => <option key={m} value={m}>{rotuloMes(m)}</option>)}
            </select>
          )}
          <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("consultora")}><Plus size={15} /> Nova consultora</button>
        </div>
      </div>

      <div className="nexo-tabs">
        <div className={`nexo-tab ${aba === "desempenho" ? "active" : ""}`} onClick={() => setAba("desempenho")}>Desempenho do mês</div>
        <div className={`nexo-tab ${aba === "pagamentos" ? "active" : ""}`} onClick={() => setAba("pagamentos")}>Pagamentos<span className="nexo-tab-n">{db.comissoes.length}</span></div>
      </div>

      {aba === "pagamentos" ? (
        <PagamentosConsultoresView db={db} onOpenModal={onOpenModal} onDeleteComissao={onDeleteComissao} onMarcarPagaComissao={onMarcarPagaComissao} />
      ) : db.consultoras.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Users} title="Nenhuma consultora cadastrada" sub="Clique em “Nova consultora” para começar." /></div>
      ) : (
        <>
          <div className="nexo-kpi-grid">
            <Kpi icon={FileText} label={`Adesões em ${rotuloMes(mes)}`} value={totQtd} tone="accent" />
            <Kpi icon={Wallet} label="Valor das adesões" value={formatBRL(totValor)} tone="success" />
            <Kpi icon={TrendingUp} label="Ganho dos consultores no mês" value={formatBRL(totGanho)} tone="warning" />
            <Kpi icon={Clock} label="Pagamentos a fazer" value={formatBRL(aPagar)} tone="info" />
          </div>
          <div className="nexo-table-wrap">
            {ranking.map(({ c, d }, i) => (
              <div className="nexo-rank" key={c.id} style={c.status === "Inativa" ? { opacity: 0.6 } : undefined}>
                <div className={`nexo-rank-pos ${d.qtd > 0 && i < 3 ? "p" + (i + 1) : ""}`}>{i + 1}º</div>
                <div className="nexo-cliente-cell">
                  <AvatarNome nome={c.nome} tamanho={40} />
                  <div style={{ minWidth: 0 }}>
                    <div className="nexo-cliente-nome" style={{ fontSize: 14 }}>{c.nome}</div>
                    <div className="nexo-cliente-sub">{[Number(c.percentualAdesao) > 0 && `${pctTexto(c.percentualAdesao)} da adesão`, Number(c.valorFixoContrato) > 0 && `${formatBRL(c.valorFixoContrato)} fixo`, Number(c.percentualRecorrente) > 0 && `${pctTexto(c.percentualRecorrente)} recorrente`].filter(Boolean).join(" · ") || "Regras de ganho não definidas"}</div>
                  </div>
                </div>
                <div className="nexo-rank-metric"><small>Adesões</small><strong className="mono">{d.qtd}</strong><div className="nexo-cliente-sub">{formatBRL(d.valor)}</div></div>
                <div className="nexo-rank-metric"><small>Ganho (adesões)</small><strong className="mono">{formatBRL(d.comissaoAdesoes)}</strong></div>
                <div className="nexo-rank-metric"><small>Recorrente</small><strong className="mono">{formatBRL(d.recorrente)}</strong><div className="nexo-cliente-sub">total {formatBRL(d.total)}</div></div>
                <div className="nexo-rank-metric meta">
                  <small>Meta</small>
                  {d.meta > 0 ? (
                    <>
                      <BarraProgresso valor={d.qtd} max={d.meta} cor={d.qtd >= d.meta ? "var(--success)" : "var(--accent)"} />
                      <div className="nexo-cliente-sub">{d.qtd} de {d.meta} ({d.pctMeta}%)</div>
                    </>
                  ) : <div className="nexo-cliente-sub">Sem meta definida</div>}
                </div>
                <div className="nexo-actions-cell">
                  <button className="nexo-icon-btn" title="Nova adesão desta consultora" onClick={() => onOpenModal("adesao", { consultoraId: c.id })}><Plus size={13} /></button>
                  <button className="nexo-icon-btn" title="Editar" onClick={() => onOpenModal("consultora", c)}><Pencil size={13} /></button>
                  <button className="nexo-icon-btn" title="Excluir" onClick={() => onDeleteConsultora(c.id)}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Adesões                                                               */
/* ------------------------------------------------------------------ */

function AdesaoForm({ initial, clientes, consultoras, seguradoras, onSave, onCancel }) {
  const [f, setF] = useState({
    clienteId: "", consultoraId: "", seguradoraId: "", dataVenda: todayISO(), valorAdesao: "", comissaoConsultora: "",
    valorRecebido: "", dataRecebimento: "", status: "Pendente", ...(initial || {}),
  });
  const [errors, setErrors] = useState({});
  const [comissaoManual, setComissaoManual] = useState(false);
  const consultora = consultoras.find((c) => c.id === f.consultoraId);

  function recalcular(next) {
    if (comissaoManual) return next;
    const c = consultoras.find((x) => x.id === next.consultoraId);
    return { ...next, comissaoConsultora: c ? String(calcComissaoAdesao(c, next.valorAdesao) || "") : next.comissaoConsultora };
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setCalc = (k) => (e) => setF(recalcular({ ...f, [k]: e.target.value }));
  function submit() {
    const errs = {};
    if (!f.clienteId) errs.clienteId = "Selecione o cliente.";
    if (!f.consultoraId) errs.consultoraId = "Selecione a consultora.";
    if (!f.valorAdesao || Number(f.valorAdesao) <= 0) errs.valorAdesao = "Informe um valor válido.";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, id: initial?.id });
  }
  const valor = Number(f.valorAdesao) || 0;
  const ganho = Number(f.comissaoConsultora) || 0;
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
          <select className="nexo-select" value={f.consultoraId} onChange={setCalc("consultoraId")}>
            <option value="">Selecione</option>
            {consultoras.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Seguradora / associação">
          <select className="nexo-select" value={f.seguradoraId || ""} onChange={set("seguradoraId")}>
            <option value="">—</option>
            {seguradoras.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </Field>
        <Field label="Data da venda">
          <input type="date" className="nexo-input" value={f.dataVenda} onChange={set("dataVenda")} />
        </Field>
      </div>
      <div className="nexo-field-row">
        <Field label="Valor da adesão (R$) *" error={errors.valorAdesao}>
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorAdesao} onChange={setCalc("valorAdesao")} placeholder="0,00" />
        </Field>
        <Field label="Ganho da consultora (R$)">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.comissaoConsultora} onChange={(e) => { setComissaoManual(true); setF({ ...f, comissaoConsultora: e.target.value }); }} placeholder="Calculado pelas regras dela" />
        </Field>
      </div>
      {valor > 0 && (
        <div className="nexo-card" style={{ padding: "12px 16px", display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13, background: "var(--surface-2)" }}>
          <span>Consultora fica com <strong className="mono" style={{ color: "var(--warning)" }}>{formatBRL(ganho)}</strong></span>
          <span>Corretora fica com <strong className="mono" style={{ color: "var(--success)" }}>{formatBRL(Math.max(0, valor - ganho))}</strong></span>
          {consultora && !comissaoManual && <span className="nexo-cliente-sub">calculado pelas regras de {consultora.nome.split(" ")[0]}</span>}
        </div>
      )}
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

function mesRefDe(dataISO) {
  return (dataISO || "").slice(0, 7); // "AAAA-MM"
}
function rotuloMes(chaveAAAAMM) {
  if (!chaveAAAAMM) return "Sem data";
  const [ano, mes] = chaveAAAAMM.split("-").map(Number);
  const d = new Date(ano, mes - 1, 1);
  const rotulo = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return rotulo.charAt(0).toUpperCase() + rotulo.slice(1);
}

function AdesoesView({ db, onOpenModal, onDeleteAdesao, onMarcarRecebida, onGerarPagamento }) {
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const chaveMesAtual = mesRefDe(todayISO());
  const [mesSelecionado, setMesSelecionado] = useState(chaveMesAtual);
  const [aba, setAba] = useState("lancamentos"); // lancamentos | fechamento

  const consultoraPorId = useMemo(() => new Map(db.consultoras.map((c) => [c.id, c])), [db.consultoras]);
  const nomeCliente = (id) => db.clientes.find((c) => c.id === id)?.nome || "—";
  const nomeConsultora = (id) => consultoraPorId.get(id)?.nome || "—";
  const nomeFonte = (id) => db.seguradoras.find((s) => s.id === id)?.nome || "";
  const ganhoDe = (a) => comissaoDaAdesao(a, consultoraPorId.get(a.consultoraId));
  const pagamentoGerado = (a) => db.comissoes.some((c) => c.referencia === `adesao:${a.id}`);

  const mesesDisponiveis = useMemo(() => {
    const chaves = new Set(db.adesoes.map((a) => mesRefDe(a.dataVenda)).filter(Boolean));
    chaves.add(chaveMesAtual);
    return Array.from(chaves).sort().reverse();
  }, [db.adesoes]);

  const adesoesDoMes = mesSelecionado === "todos" ? db.adesoes : db.adesoes.filter((a) => mesRefDe(a.dataVenda) === mesSelecionado);
  const recebidas = adesoesDoMes.filter((a) => a.status === "Recebida");
  const pendentes = adesoesDoMes.filter((a) => a.status === "Pendente");
  const canceladas = adesoesDoMes.filter((a) => a.status === "Cancelada");
  const filtradas = filtroStatus === "Todos" ? adesoesDoMes : adesoesDoMes.filter((a) => a.status === filtroStatus);

  const validas = adesoesDoMes.filter((a) => a.status !== "Cancelada");
  const totalValidas = round2(sum(validas.map((a) => a.valorAdesao)));
  const parteConsultoras = round2(sum(validas.map(ganhoDe)));
  const parteCorretora = round2(totalValidas - parteConsultoras);
  const sufixo = mesSelecionado !== "todos" ? " no mês" : "";

  const colunasExportacao = [
    { titulo: "Cliente", valor: (a) => nomeCliente(a.clienteId) },
    { titulo: "Consultora", valor: (a) => nomeConsultora(a.consultoraId) },
    { titulo: "Seguradora/associação", valor: (a) => nomeFonte(a.seguradoraId) },
    { titulo: "Data da venda", valor: (a) => formatDateBR(a.dataVenda) },
    { titulo: "Valor da adesão", valor: (a) => a.valorAdesao },
    { titulo: "Ganho da consultora", valor: (a) => ganhoDe(a) },
    { titulo: "Fica com a corretora", valor: (a) => round2((Number(a.valorAdesao) || 0) - ganhoDe(a)) },
    { titulo: "Valor recebido", valor: (a) => a.valorRecebido },
    { titulo: "Status", valor: (a) => a.status },
  ];

  const fechamentoPorMes = useMemo(() => {
    const chaves = Array.from(new Set(db.adesoes.map((a) => mesRefDe(a.dataVenda)))).sort().reverse();
    return chaves.map((chave) => {
      const doMes = db.adesoes.filter((a) => mesRefDe(a.dataVenda) === chave);
      const vals = doMes.filter((a) => a.status !== "Cancelada");
      const ganho = round2(sum(vals.map((a) => comissaoDaAdesao(a, consultoraPorId.get(a.consultoraId)))));
      return {
        chave, total: doMes.length,
        valorRecebido: sum(doMes.filter((a) => a.status === "Recebida").map((a) => a.valorRecebido || a.valorAdesao)),
        valorPendente: sum(doMes.filter((a) => a.status === "Pendente").map((a) => a.valorAdesao)),
        valorCancelado: sum(doMes.filter((a) => a.status === "Cancelada").map((a) => a.valorAdesao)),
        ganhoConsultoras: ganho,
        ficaCorretora: round2(sum(vals.map((a) => a.valorAdesao)) - ganho),
        linhas: doMes,
      };
    });
  }, [db.adesoes, consultoraPorId]);

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Adesões<span className="nexo-section-count">{db.adesoes.length} lançadas</span></div>
        <div className="nexo-topbar-actions">
          <button
            className="nexo-btn"
            disabled={filtradas.length === 0}
            onClick={() => exportarCSV(`adesoes-${mesSelecionado === "todos" ? "todas" : mesSelecionado}.csv`, colunasExportacao, filtradas)}
          >
            Exportar CSV
          </button>
          <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("adesao")}><Plus size={15} /> Nova adesão</button>
        </div>
      </div>

      <div className="nexo-tabs">
        <div className={`nexo-tab ${aba === "lancamentos" ? "active" : ""}`} onClick={() => setAba("lancamentos")}>Lançamentos</div>
        <div className={`nexo-tab ${aba === "fechamento" ? "active" : ""}`} onClick={() => setAba("fechamento")}>Fechamento mensal</div>
      </div>

      {aba === "lancamentos" ? (
        <>
          <div className="nexo-filters">
            <div className="nexo-filter-field">
              <label>Mês</label>
              <select className="nexo-select" value={mesSelecionado} onChange={(e) => setMesSelecionado(e.target.value)}>
                <option value="todos">Todos os meses</option>
                {mesesDisponiveis.map((m) => <option key={m} value={m}>{rotuloMes(m)}</option>)}
              </select>
            </div>
            <div className="nexo-filter-field">
              <label>Status</label>
              <select className="nexo-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                <option>Todos</option><option>Pendente</option><option>Recebida</option><option>Cancelada</option>
              </select>
            </div>
          </div>

          <div className="nexo-kpi-grid c3">
            <Kpi icon={CheckCircle2} label={`Recebidas${sufixo}`} value={formatBRL(sum(recebidas.map((a) => a.valorRecebido || a.valorAdesao)))} tone="success" />
            <Kpi icon={Clock} label={`Pendentes${sufixo}`} value={formatBRL(sum(pendentes.map((a) => a.valorAdesao)))} tone="warning" />
            <Kpi icon={XCircle} label={`Canceladas${sufixo}`} value={formatBRL(sum(canceladas.map((a) => a.valorAdesao)))} tone="danger" />
          </div>
          <div className="nexo-kpi-grid">
            <Kpi
              icon={Wallet} wide tone="accent"
              label={`Fica com a corretora${sufixo} (sem as canceladas)`}
              value={formatBRL(parteCorretora)}
              extra={<span className="nexo-trend up">Total de {formatBRL(totalValidas)} · consultores ficam com {formatBRL(parteConsultoras)}</span>}
            />
          </div>

          {adesoesDoMes.length === 0 ? (
            <div className="nexo-table-wrap"><EmptyState icon={FileText} title="Nenhuma adesão neste período" sub="Troque o mês no filtro ou clique em “Nova adesão”." /></div>
          ) : (
            <div className="nexo-table-wrap">
              <div className="nexo-table-scroll">
                <table className="nexo-table">
                  <thead><tr><th>Cliente</th><th>Consultora</th><th>Data</th><th>Valor</th><th>Divisão</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {filtradas.map((a) => {
                      const ganho = ganhoDe(a);
                      return (
                        <tr key={a.id}>
                          <td>
                            <div className="nexo-cliente-cell">
                              <AvatarNome nome={nomeCliente(a.clienteId)} tamanho={32} />
                              <span className="nexo-cliente-nome">{nomeCliente(a.clienteId)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="nexo-cliente-nome">{nomeConsultora(a.consultoraId)}</div>
                            {nomeFonte(a.seguradoraId) && <div className="nexo-cliente-sub">{nomeFonte(a.seguradoraId)}</div>}
                          </td>
                          <td>{formatDateBR(a.dataVenda)}</td>
                          <td className="mono">{formatBRL(a.valorAdesao)}</td>
                          <td className="mono">
                            <div style={{ color: ganho > 0 ? "var(--warning)" : "var(--text-faint)" }}>{ganho > 0 ? formatBRL(ganho) : "—"} <span className="nexo-cliente-sub">consultora</span></div>
                            <div style={{ color: "var(--success)" }}>{formatBRL(round2((Number(a.valorAdesao) || 0) - ganho))} <span className="nexo-cliente-sub">corretora</span></div>
                          </td>
                          <td><StatusPill status={a.status} /></td>
                          <td>
                            <div className="nexo-actions-cell">
                              {a.status === "Pendente" && <button className="nexo-btn nexo-btn-sm" onClick={() => onMarcarRecebida(a.id)}>Marcar recebida</button>}
                              {a.status === "Recebida" && ganho > 0 && (
                                pagamentoGerado(a)
                                  ? <span className="nexo-tag-frota" title="O pagamento desta adesão já está na aba Pagamentos das consultoras">pagamento gerado</span>
                                  : <button className="nexo-btn nexo-btn-sm" title="Cria o pagamento do consultor na aba Pagamentos" onClick={() => onGerarPagamento(a)}>Gerar pagamento</button>
                              )}
                              <button className="nexo-icon-btn" onClick={() => onOpenModal("adesao", a)}><Pencil size={13} /></button>
                              <button className="nexo-icon-btn" onClick={() => onDeleteAdesao(a.id)}><Trash2 size={13} /></button>
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
        </>
      ) : (
        <div className="nexo-table-wrap">
          <div className="nexo-table-scroll">
            <table className="nexo-table">
              <thead><tr><th>Mês</th><th>Qtd.</th><th>Recebido</th><th>Pendente</th><th>Cancelado</th><th>Consultores</th><th>Corretora</th><th></th></tr></thead>
              <tbody>
                {fechamentoPorMes.length === 0 ? (
                  <tr><td colSpan={8} className="nexo-cell-muted" style={{ textAlign: "center", padding: 24 }}>Nenhuma adesão lançada ainda.</td></tr>
                ) : fechamentoPorMes.map((x) => (
                  <tr key={x.chave}>
                    <td style={{ fontWeight: 600 }}>{rotuloMes(x.chave)}</td>
                    <td>{x.total}</td>
                    <td className="mono" style={{ color: "var(--success)" }}>{formatBRL(x.valorRecebido)}</td>
                    <td className="mono" style={{ color: "var(--warning)" }}>{formatBRL(x.valorPendente)}</td>
                    <td className="mono" style={{ color: "var(--danger)" }}>{formatBRL(x.valorCancelado)}</td>
                    <td className="mono">{formatBRL(x.ganhoConsultoras)}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{formatBRL(x.ficaCorretora)}</td>
                    <td>
                      <button className="nexo-btn nexo-btn-sm" onClick={() => exportarCSV(`adesoes-${x.chave}.csv`, colunasExportacao, x.linhas)}>Exportar CSV</button>
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

function PagamentosConsultoresView({ db, onOpenModal, onDeleteComissao, onMarcarPagaComissao }) {
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
        <div className="nexo-chart-title" style={{ marginBottom: 0 }}>Pagamentos aos consultores<span className="nexo-section-count">{db.comissoes.length} lançamentos</span></div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("comissao")}><Plus size={15} /> Novo pagamento</button>
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
/* Usuários (Administrador / Operador)                                  */
/* ------------------------------------------------------------------ */

function NovoUsuarioForm({ onCriado, sessao }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("operador");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function criar() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro("Preencha nome, e-mail e senha.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const resp = await fetch("/api/gerenciar-usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessao.access_token}` },
        body: JSON.stringify({ acao: "criar", nome, email, senha, role }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || "Não foi possível criar o usuário.");
      setNome(""); setEmail(""); setSenha(""); setRole("operador");
      onCriado();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="nexo-card" style={{ marginBottom: 16 }}>
      <div className="nexo-chart-title" style={{ marginBottom: 12 }}>Novo usuário</div>
      <div className="nexo-field-row3">
        <Field label="Nome">
          <input className="nexo-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
        </Field>
        <Field label="E-mail">
          <input type="email" className="nexo-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@email.com" />
        </Field>
        <Field label="Senha">
          <input type="password" className="nexo-input" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
        </Field>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginTop: 12 }}>
        <div style={{ maxWidth: 220 }}>
          <Field label="Perfil">
            <select className="nexo-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="operador">Operador (acesso limitado)</option>
              <option value="admin">Administrador (acesso total)</option>
            </select>
          </Field>
        </div>
        <button className="nexo-btn nexo-btn-primary" disabled={salvando} onClick={criar}>
          {salvando ? "Criando…" : "Criar usuário"}
        </button>
      </div>
      {erro && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 10 }}>{erro}</div>}
    </div>
  );
}

function UsuariosView({ db, sessao, meuUserId, onRecarregarUsuarios }) {
  const [alterando, setAlterando] = useState(null);

  async function alterarRole(userId, novoRole) {
    setAlterando(userId);
    try {
      const resp = await fetch("/api/gerenciar-usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessao.access_token}` },
        body: JSON.stringify({ acao: "alterar_role", userId, role: novoRole }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || "Não foi possível alterar o perfil.");
      onRecarregarUsuarios();
    } catch (e) {
      notify(e.message);
    } finally {
      setAlterando(null);
    }
  }

  async function excluirUsuario(userId, nome) {
    if (userId === meuUserId) {
      notify("Você não pode excluir seu próprio usuário.");
      return;
    }
    if (!await confirmDialog(`Excluir o acesso de "${nome}"? Essa ação não pode ser desfeita.`)) return;
    setAlterando(userId);
    try {
      const resp = await fetch("/api/gerenciar-usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessao.access_token}` },
        body: JSON.stringify({ acao: "excluir", userId }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || "Não foi possível excluir o usuário.");
      onRecarregarUsuarios();
    } catch (e) {
      notify(e.message);
    } finally {
      setAlterando(null);
    }
  }

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Usuários<span className="nexo-section-count">{db.usuarios.length} cadastrados</span></div>
      </div>

      <NovoUsuarioForm sessao={sessao} onCriado={onRecarregarUsuarios} />

      <div className="nexo-table-wrap">
        <div className="nexo-table-scroll">
          <table className="nexo-table">
            <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th></th></tr></thead>
            <tbody>
              {db.usuarios.map((u) => (
                <tr key={u.userId}>
                  <td style={{ fontWeight: 600 }}>{u.nome || "—"}{u.userId === meuUserId && <span className="nexo-cell-muted"> (você)</span>}</td>
                  <td className="nexo-cell-muted">{u.email}</td>
                  <td>
                    <select
                      className="nexo-select"
                      style={{ maxWidth: 200 }}
                      value={u.role}
                      disabled={alterando === u.userId || u.userId === meuUserId}
                      onChange={(e) => alterarRole(u.userId, e.target.value)}
                    >
                      <option value="operador">Operador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td>
                    <div className="nexo-actions-cell">
                      <button
                        className="nexo-icon-btn"
                        disabled={alterando === u.userId || u.userId === meuUserId}
                        onClick={() => excluirUsuario(u.userId, u.nome)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App shell                                                            */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Mensagens elegantes (toast) e confirmações — no lugar de alert()    */
/* ------------------------------------------------------------------ */

let _abrirToast = null;
let _abrirDialogo = null;

function showToast(mensagem, tipo = "info") {
  if (_abrirToast) _abrirToast(String(mensagem), tipo);
  else window.alert(String(mensagem));
}

/** Substitui alert(): mensagem curta vira aviso no canto; mensagem longa/com várias linhas vira uma janela. */
function notify(mensagem) {
  const texto = String(mensagem ?? "");
  const t = normalizarTexto(texto);
  const tipo = /nao foi possivel|erro|falha|invalid/.test(t) ? "error"
    : /conclu|sucesso|importad|cadastrad|salv|atualizad/.test(t) ? "success"
    : /preencha|confira|nenhuma|selecione|informe|nao pode|ja existe/.test(t) ? "warning" : "info";
  if ((texto.includes("\n") || texto.length > 150) && _abrirDialogo) {
    _abrirDialogo({
      tipo, mensagem: texto, somenteOk: true,
      titulo: tipo === "error" ? "Algo deu errado" : tipo === "success" ? "Tudo certo" : "Aviso",
    });
    return;
  }
  showToast(texto, tipo);
}

/** Substitui confirm(): devolve uma Promise<boolean>. Use com await. */
function confirmDialog(mensagem, opcoes = {}) {
  const ehExclusao = /^excluir/i.test(String(mensagem));
  return new Promise((resolve) => {
    if (!_abrirDialogo) { resolve(window.confirm(String(mensagem))); return; }
    _abrirDialogo({
      tipo: ehExclusao ? "error" : "warning", mensagem: String(mensagem),
      titulo: opcoes.titulo || (ehExclusao ? "Confirmar exclusão" : "Confirmar"),
      textoConfirmar: opcoes.textoConfirmar || (ehExclusao ? "Excluir" : "Confirmar"),
      textoCancelar: opcoes.textoCancelar || "Cancelar",
      perigo: opcoes.perigo ?? ehExclusao, resolve,
    });
  });
}

function MensagensHost() {
  const [toasts, setToasts] = useState([]);
  const [dialogo, setDialogo] = useState(null);

  useEffect(() => {
    _abrirToast = (mensagem, tipo) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-3), { id, mensagem, tipo }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), tipo === "error" ? 7000 : 4500);
    };
    _abrirDialogo = (d) => setDialogo(d);
    return () => { _abrirToast = null; _abrirDialogo = null; };
  }, []);

  useEffect(() => {
    if (!dialogo) return;
    const onKey = (e) => {
      if (e.key === "Escape") fechar(false);
      if (e.key === "Enter") fechar(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const tom = { success: "var(--success)", error: "var(--danger)", warning: "var(--warning)", info: "var(--accent)" };
  const Icone = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };

  function fechar(resultado) {
    if (dialogo?.resolve) dialogo.resolve(resultado);
    setDialogo(null);
  }

  const IconeDialogo = dialogo ? Icone[dialogo.tipo] || Info : Info;
  return (
    <>
      <div className="nexo-toasts">
        {toasts.map((t) => {
          const I = Icone[t.tipo] || Info;
          return (
            <div key={t.id} className="nexo-toast" style={{ "--tone": tom[t.tipo] }}>
              <div className="nexo-toast-ico"><I size={16} /></div>
              <div className="nexo-toast-msg">{t.mensagem}</div>
              <button className="nexo-toast-x" onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}><X size={14} /></button>
            </div>
          );
        })}
      </div>
      {dialogo && (
        <div className="nexo-dialog-overlay" onClick={() => fechar(false)}>
          <div className="nexo-dialog" style={{ "--tone": tom[dialogo.tipo] }} onClick={(e) => e.stopPropagation()}>
            <div className="nexo-dialog-ico"><IconeDialogo size={22} /></div>
            <h3>{dialogo.titulo}</h3>
            <div className="nexo-dialog-msg">{dialogo.mensagem}</div>
            <div className="nexo-dialog-foot">
              {!dialogo.somenteOk && <button className="nexo-btn" onClick={() => fechar(false)}>{dialogo.textoCancelar}</button>}
              <button className={`nexo-btn ${dialogo.perigo ? "nexo-btn-danger-solid" : "nexo-btn-primary"}`} autoFocus onClick={() => fechar(true)}>
                {dialogo.somenteOk ? "Entendi" : dialogo.textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Busca global, sino de avisos, menu "Novo" e alternância de tema     */
/* ------------------------------------------------------------------ */

function BuscaGlobal({ db, onAbrirCliente }) {
  const [q, setQ] = useState("");
  const [aberto, setAberto] = useState(false);
  const [mobileAberto, setMobileAberto] = useState(false);
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      const tag = (e.target?.tagName || "").toLowerCase();
      const digitando = tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable;
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !digitando)) {
        e.preventDefault();
        setMobileAberto(true);
        setAberto(true);
        setTimeout(() => inputRef.current?.focus(), 30);
      }
    }
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) { setAberto(false); setMobileAberto(false); }
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDoc); };
  }, []);

  const grupos = useMemo(() => {
    const termo = normalizarTexto(q);
    if (termo.length < 2) return null;
    const digitos = q.replace(/\D/g, "");
    const nomeDe = (id) => db.clientes.find((c) => c.id === id)?.nome || "—";
    const clientes = db.clientes
      .filter((c) =>
        normalizarTexto(c.nome).includes(termo) ||
        (digitos.length >= 3 && (c.cpf || "").replace(/\D/g, "").includes(digitos)) ||
        (c.codigoSga && normalizarTexto(c.codigoSga).includes(termo))
      )
      .slice(0, 6)
      .map((c) => ({ chave: "c" + c.id, clienteId: c.id, Icone: Users, titulo: c.nome, sub: [c.cpf, c.telefone || c.whatsapp].filter(Boolean).join(" · ") || "Cliente" }));
    const placa = normPlaca(q);
    const veiculos = db.veiculos
      .filter((v) => (placa.length >= 2 && normPlaca(v.placa).includes(placa)) || normalizarTexto(`${v.marca} ${v.modelo}`).includes(termo))
      .slice(0, 6)
      .map((v) => ({ chave: "v" + v.id, clienteId: v.clienteId, Icone: Car, titulo: `${v.placa} · ${v.marca} ${v.modelo}`.trim(), sub: nomeDe(v.clienteId) }));
    const boletos = db.boletos
      .filter((b) => (b.nossoNumero && normalizarTexto(b.nossoNumero).includes(termo)) || (b.numero && normalizarTexto(b.numero).includes(termo)))
      .slice(0, 6)
      .map((b) => ({ chave: "b" + b.id, clienteId: b.clienteId, Icone: Receipt, titulo: `Boleto ${b.nossoNumero || b.numero}`, sub: `${nomeDe(b.clienteId)} · ${formatBRL(b.valor)} · ${computeBoletoStatus(b)}` }));
    return [
      { titulo: "Clientes", itens: clientes },
      { titulo: "Veículos", itens: veiculos },
      { titulo: "Boletos", itens: boletos },
    ].filter((g) => g.itens.length > 0);
  }, [q, db.clientes, db.veiculos, db.boletos]);

  const lista = grupos ? grupos.flatMap((g) => g.itens) : [];

  function abrir(item) {
    if (!item) return;
    onAbrirCliente(item.clienteId);
    setQ(""); setAberto(false); setMobileAberto(false); setSel(0);
    inputRef.current?.blur();
  }
  function onKeyDown(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, Math.max(lista.length - 1, 0))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter") { abrir(lista[sel]); }
    else if (e.key === "Escape") { setQ(""); setAberto(false); setMobileAberto(false); inputRef.current?.blur(); }
  }

  let indice = -1;
  return (
    <div ref={wrapRef} className={`nexo-gsearch ${mobileAberto ? "open" : ""}`}>
      <button className="nexo-icon-btn nexo-gsearch-iconbtn" title="Buscar" onClick={() => { setMobileAberto(true); setAberto(true); setTimeout(() => inputRef.current?.focus(), 30); }}>
        <Search size={16} />
      </button>
      <div className="nexo-gsearch-box">
        <Search size={16} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setSel(0); setAberto(true); }}
          onFocus={() => setAberto(true)}
          onKeyDown={onKeyDown}
          placeholder="Buscar cliente, CPF, placa ou Nosso Número…"
        />
        {q ? (
          <button className="nexo-toast-x" onClick={() => { setQ(""); inputRef.current?.focus(); }}><X size={14} /></button>
        ) : (
          <span className="nexo-kbd">/</span>
        )}
      </div>
      {aberto && grupos && (
        <div className="nexo-pop nexo-gsearch-panel">
          {grupos.length === 0 ? (
            <div className="nexo-gsearch-empty">Nada encontrado para “{q}”.</div>
          ) : (
            grupos.map((g) => (
              <div key={g.titulo}>
                <div className="nexo-gsearch-group">{g.titulo}</div>
                {g.itens.map((item) => {
                  indice++;
                  const meuIndice = indice;
                  const Icone = item.Icone;
                  return (
                    <div key={item.chave} className={`nexo-gsearch-item ${meuIndice === sel ? "sel" : ""}`} onMouseEnter={() => setSel(meuIndice)} onClick={() => abrir(item)}>
                      <div className="nexo-gsearch-ico"><Icone size={15} /></div>
                      <div style={{ minWidth: 0 }}>
                        <div className="nexo-gsearch-main">{item.titulo}</div>
                        <div className="nexo-gsearch-sub">{item.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function calcularAvisos(db) {
  const hoje = todayISO();
  const base = new Date(hoje + "T00:00:00");
  const dias = (iso) => (iso ? Math.round((new Date(iso + "T00:00:00") - base) / 86400000) : null);
  const boletos = db.boletos.map((b) => ({ ...b, _st: computeBoletoStatus(b) }));
  const vencidos = boletos.filter((b) => b._st === "Vencido");
  const aVencer = boletos.filter((b) => b._st === "A vencer");
  const ativos = db.clientes.filter((c) => c.status !== "Inativo");
  const cnh = ativos.filter((c) => c.cnhValidade && dias(c.cnhValidade) !== null && dias(c.cnhValidade) <= 30);
  const aniversariantes = ativos.filter((c) => c.nascimento && c.nascimento.slice(5) === hoje.slice(5));
  const avisos = [];
  if (vencidos.length) avisos.push({ chave: "venc", tom: "danger", Icone: AlertTriangle, titulo: `${vencidos.length} boleto(s) vencido(s)`, sub: `${formatBRL(sum(vencidos.map((b) => b.valor)))} em atraso`, destino: "financeiro" });
  if (aVencer.length) avisos.push({ chave: "avencer", tom: "warning", Icone: Clock, titulo: `${aVencer.length} boleto(s) a vencer`, sub: `${formatBRL(sum(aVencer.map((b) => b.valor)))} nos próximos 7 dias`, destino: "financeiro" });
  if (cnh.length) avisos.push({ chave: "cnh", tom: "warning", Icone: CreditCard, titulo: `${cnh.length} CNH vencida(s) ou vencendo`, sub: "Vencem em até 30 dias", destino: "clientes" });
  if (aniversariantes.length) avisos.push({ chave: "aniv", tom: "accent", Icone: Calendar, titulo: `${aniversariantes.length} aniversariante(s) hoje`, sub: aniversariantes.slice(0, 3).map((c) => c.nome.split(" ")[0]).join(", "), destino: "clientes" });
  return avisos;
}

function SinoAvisos({ db, onIr }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);
  const avisos = useMemo(() => calcularAvisos(db), [db.boletos, db.clientes]);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const cor = { danger: ["var(--danger)", "var(--danger-soft)"], warning: ["var(--warning)", "var(--warning-soft)"], accent: ["var(--accent)", "var(--accent-soft)"] };
  return (
    <div ref={ref} className="nexo-bell-wrap">
      <button className="nexo-icon-btn" title="Avisos" onClick={() => setAberto((v) => !v)}>
        <Bell size={16} />
        {avisos.length > 0 && <span className="nexo-bell-badge">{avisos.length}</span>}
      </button>
      {aberto && (
        <div className="nexo-pop nexo-bell-panel">
          <div className="nexo-bell-head">Avisos</div>
          {avisos.length === 0 ? (
            <div className="nexo-gsearch-empty"><CheckCircle2 size={22} style={{ color: "var(--success)", marginBottom: 8 }} /><div>Tudo em dia. Nenhum aviso no momento.</div></div>
          ) : (
            avisos.map((a) => (
              <div key={a.chave} className="nexo-aviso" onClick={() => { setAberto(false); onIr(a.destino); }}>
                <div className="nexo-aviso-ico" style={{ background: cor[a.tom][1], color: cor[a.tom][0] }}><a.Icone size={16} /></div>
                <div style={{ minWidth: 0 }}>
                  <div className="nexo-aviso-title">{a.titulo}</div>
                  <div className="nexo-aviso-sub">{a.sub}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MenuNovo({ onNovo }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const itens = [["cliente", "Novo cliente", Users], ["veiculo", "Novo veículo", Car], ["boleto", "Novo boleto", Receipt]];
  return (
    <div ref={ref} className="nexo-novo-menu">
      <button className="nexo-btn nexo-btn-primary nexo-btn-sm" onClick={() => setAberto((v) => !v)}><Plus size={14} /> Novo</button>
      {aberto && (
        <div className="nexo-pop nexo-pop-right">
          {itens.map(([tipo, rotulo, Icone]) => (
            <div key={tipo} className="nexo-gsearch-item" onClick={() => { setAberto(false); onNovo(tipo); }}>
              <div className="nexo-gsearch-ico"><Icone size={15} /></div>
              <div className="nexo-gsearch-main">{rotulo}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Peças visuais compartilhadas: avatar, placa, selos, linha de veículo */
/* ------------------------------------------------------------------ */

function AvatarNome({ nome, tamanho = 38 }) {
  const ini = (nome || "?").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "?";
  let h = 0;
  for (const ch of nome || "") h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <div className="nexo-av" style={{ "--av-h": h, width: tamanho, height: tamanho, fontSize: Math.round(tamanho * 0.34), borderRadius: Math.round(tamanho * 0.32) }}>
      {ini}
    </div>
  );
}

function PlacaChip({ placa }) {
  return <span className="nexo-placa">{String(placa || "—").toUpperCase()}</span>;
}

function SemValor() {
  return <span className="nexo-tag-vazio">sem valor</span>;
}

function PillTom({ tom, children }) {
  const cor = { success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)", info: "var(--info)" }[tom] || "var(--info)";
  const fundo = { success: "var(--success-soft)", warning: "var(--warning-soft)", danger: "var(--danger-soft)", info: "var(--info-soft)" }[tom] || "var(--info-soft)";
  return (
    <span className="nexo-badge" style={{ color: cor, background: fundo }}>
      <span className="nexo-dot" style={{ background: cor }} />{children}
    </span>
  );
}

/** Situação financeira do cliente a partir dos boletos (já com status calculado). */
function situacaoFinanceira(cliente, boletos) {
  if (cliente.status === "Inativo") return { chave: "inativo", rotulo: "Inativo", tom: "info" };
  if (boletos.some((b) => b.status === "Vencido")) return { chave: "inadimplente", rotulo: "Inadimplente", tom: "danger" };
  if (boletos.some((b) => b.status !== "Pago")) return { chave: "aberto", rotulo: boletos.some((b) => b.status === "A vencer") ? "A vencer" : "Em aberto", tom: "warning" };
  if (boletos.length > 0) return { chave: "emdia", rotulo: "Em dia", tom: "success" };
  return { chave: "sem", rotulo: "Sem boletos", tom: "info" };
}

function VeiculoLinha({ v, onEditar, onExcluir, onNovoBoleto, plano }) {
  const temMensal = Number(v.valorMensal) > 0;
  const anos = v.anoFabricacao && v.ano ? `${v.anoFabricacao}/${v.ano}` : (v.ano || v.anoFabricacao || "");
  return (
    <div className={`nexo-vrow ${plano ? "plano" : ""}`}>
      <PlacaChip placa={v.placa} />
      <div className="nexo-vrow-main">
        <div className="nexo-vrow-nome">{v.marca} {v.modelo}</div>
        <div className="nexo-cliente-sub">{[anos, v.cor].filter(Boolean).join(" · ") || "—"}</div>
      </div>
      <div className="nexo-vrow-val">{temMensal ? <strong className="mono">{formatBRL(v.valorMensal)}</strong> : <SemValor />}</div>
      <div className="nexo-vrow-fipe nexo-cell-muted">{v.codigoFipe ? `Fipe ${formatBRL(v.valorFipe)}` : ""}</div>
      <div className="nexo-vrow-status"><AtivoInativoBadge ativo={v.status} /></div>
      <div className="nexo-actions-cell">
        {onNovoBoleto && <button className="nexo-icon-btn" title="Novo boleto deste veículo" onClick={onNovoBoleto}><Receipt size={13} /></button>}
        <button className="nexo-icon-btn" title="Editar" onClick={onEditar}><Pencil size={13} /></button>
        <button className="nexo-icon-btn" title="Excluir" onClick={onExcluir}><Trash2 size={13} /></button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Comissões da corretora, adesões e consultores: regras e cálculos     */
/* ------------------------------------------------------------------ */

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const numOuNull = (v) => (v === "" || v == null ? null : Number(v));
const pctTexto = (v) => `${String(Number(v) || 0).replace(".", ",")}%`;
const compactoBRL = (v) => {
  const n = Number(v) || 0;
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",")}k` : String(Math.round(n));
};

/** Texto curto que resume a regra de comissão de uma seguradora/associação. */
function resumoRegra(f) {
  if (!f || !f.tipoComissao) return "Sem regra definida";
  if (f.tipoComissao === "mensalidade") return `${pctTexto(f.percentualComissao)} sobre mensalidades pagas${f.comissaoAutomatica ? " · automático" : ""}`;
  if (f.tipoComissao === "premio") return `${pctTexto(f.percentualComissao)} na venda${Number(f.percentualRenovacao) > 0 ? ` · ${pctTexto(f.percentualRenovacao)} na renovação` : ""}`;
  return `${formatBRL(f.valorFixoComissao || 0)} por contrato`;
}

/** Soma dos boletos pagos no mês (base da comissão automática sobre mensalidades). */
function baseAutomatica(db, mes) {
  return round2(sum(db.boletos.filter((b) => b.dataPagamento && mesRefDe(b.dataPagamento) === mes).map((b) => b.valor)));
}

function situacaoLinhaComissao(l) {
  const prev = Number(l.valorPrevisto) || 0;
  if (l.valorRecebido === "" || l.valorRecebido == null) return { rotulo: "A receber", tom: "warning" };
  const rec = Number(l.valorRecebido) || 0;
  if (Math.abs(rec - prev) < 0.01) return { rotulo: "Recebida", tom: "success" };
  return rec < prev ? { rotulo: "Recebeu menos", tom: "danger" } : { rotulo: "Recebeu a mais", tom: "info" };
}

/**
 * Fechamento do mês: para cada seguradora/associação, o que era PREVISTO, o que foi RECEBIDO
 * e a diferença. Fontes com comissão automática calculam o previsto sobre os boletos pagos.
 */
function fechamentoComissoes(db, mes) {
  const linhas = db.comissoesCorretora.filter((l) => l.competencia === mes);
  return db.seguradoras
    .map((f) => {
      const doFonte = linhas.filter((l) => l.seguradoraId === f.id);
      const auto = !!f.comissaoAutomatica && f.tipoComissao === "mensalidade";
      const baseAuto = auto ? baseAutomatica(db, mes) : 0;
      const previsto = auto ? round2((baseAuto * (Number(f.percentualComissao) || 0)) / 100) : round2(sum(doFonte.map((l) => l.valorPrevisto)));
      const recebido = round2(sum(doFonte.map((l) => l.valorRecebido)));
      const estornos = round2(sum(doFonte.map((l) => l.estorno)));
      const diferenca = round2(previsto - recebido);
      let sit;
      if (previsto === 0 && recebido === 0) sit = { chave: "vazio", rotulo: "Sem movimento", tom: "info" };
      else if (recebido === 0) sit = { chave: "areceber", rotulo: "A receber", tom: "warning" };
      else if (Math.abs(diferenca) < 0.01) sit = { chave: "ok", rotulo: "Recebida", tom: "success" };
      else if (diferenca > 0) sit = { chave: "menos", rotulo: "Recebeu menos", tom: "danger" };
      else sit = { chave: "mais", rotulo: "Recebeu a mais", tom: "info" };
      return { fonte: f, auto, baseAuto, linhas: doFonte, previsto, recebido, estornos, diferenca, sit };
    })
    .filter((r) => r.fonte.tipoComissao || r.linhas.length > 0);
}

function calcComissaoAdesao(consultora, valor) {
  if (!consultora) return 0;
  const v = Number(valor) || 0;
  return round2(v * ((Number(consultora.percentualAdesao) || 0) / 100) + (Number(consultora.valorFixoContrato) || 0));
}

/** Comissão do consultor em uma adesão: o valor combinado na própria adesão, ou o calculado pelas regras dele. */
function comissaoDaAdesao(adesao, consultora) {
  if (adesao.comissaoConsultora !== "" && adesao.comissaoConsultora != null) return Number(adesao.comissaoConsultora) || 0;
  return calcComissaoAdesao(consultora, adesao.valorAdesao);
}

/** Comissão recorrente do consultor: % sobre as mensalidades pagas no mês pelos clientes que ele trouxe. */
function recorrenteDoMes(db, consultora, mes) {
  const pct = Number(consultora.percentualRecorrente) || 0;
  if (!pct) return 0;
  const clientes = new Set(db.adesoes.filter((a) => a.consultoraId === consultora.id && a.status !== "Cancelada").map((a) => a.clienteId));
  const base = sum(db.boletos.filter((b) => clientes.has(b.clienteId) && b.dataPagamento && mesRefDe(b.dataPagamento) === mes).map((b) => b.valor));
  return round2((base * pct) / 100);
}

function desempenhoConsultora(db, consultora, mes) {
  const adesoesMes = db.adesoes.filter((a) => a.consultoraId === consultora.id && mesRefDe(a.dataVenda) === mes && a.status !== "Cancelada");
  const valor = round2(sum(adesoesMes.map((a) => a.valorAdesao)));
  const comissaoAdesoes = round2(sum(adesoesMes.map((a) => comissaoDaAdesao(a, consultora))));
  const recorrente = recorrenteDoMes(db, consultora, mes);
  const meta = Number(consultora.metaMensal) || 0;
  return {
    adesoesMes, qtd: adesoesMes.length, valor, comissaoAdesoes, recorrente,
    total: round2(comissaoAdesoes + recorrente), meta,
    pctMeta: meta > 0 ? Math.min(100, Math.round((adesoesMes.length / meta) * 100)) : null,
  };
}

/** Os n meses até mesBase, em ordem cronológica. */
function ultimosMeses(mesBase, n) {
  const [a, m] = mesBase.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(a, m - 1 - (n - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}
function opcoesMeses(extras = []) {
  const hoje = mesRefDe(todayISO());
  return Array.from(new Set([...ultimosMeses(hoje, 18), ...extras].filter(Boolean))).sort().reverse();
}

function BarraProgresso({ valor, max, cor = "var(--accent)" }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (valor / max) * 100)) : 0;
  return <div className="nexo-bar"><span style={{ width: `${pct}%`, background: cor }} /></div>;
}

function EvolucaoComissoes({ dados }) {
  const max = Math.max(1, ...dados.map((d) => Math.max(d.previsto, d.recebido)));
  return (
    <div>
      <div className="nexo-evo">
        {dados.map((d) => (
          <div className="nexo-evo-col" key={d.mes}>
            <div className="nexo-evo-val">{d.recebido > 0 ? compactoBRL(d.recebido) : ""}</div>
            <div className="nexo-evo-bars">
              <div className="nexo-evo-bar" style={{ height: `${(d.previsto / max) * 100}%`, minHeight: d.previsto > 0 ? 4 : 0, background: "color-mix(in srgb, var(--accent) 28%, transparent)", border: d.previsto > 0 ? "1px solid var(--accent-dim)" : "none" }} title={`Previsto: ${formatBRL(d.previsto)}`} />
              <div className="nexo-evo-bar" style={{ height: `${(d.recebido / max) * 100}%`, minHeight: d.recebido > 0 ? 4 : 0, background: "var(--success)" }} title={`Recebido: ${formatBRL(d.recebido)}`} />
            </div>
            <div className="nexo-evo-lab">{rotuloMes(d.mes).slice(0, 3)}</div>
          </div>
        ))}
      </div>
      <div className="nexo-evo-legend">
        <span><i style={{ background: "color-mix(in srgb, var(--accent) 28%, transparent)", border: "1px solid var(--accent-dim)" }} />Previsto</span>
        <span><i style={{ background: "var(--success)" }} />Recebido</span>
      </div>
    </div>
  );
}

const TIPOS_REGRA = [
  ["mensalidade", "% sobre cada mensalidade/boleto pago"],
  ["premio", "% sobre o prêmio (venda e renovação)"],
  ["fixo", "Valor fixo por contrato"],
];
const TIPOS_LANCAMENTO = ["Mensalidade", "Venda", "Renovação", "Fixo", "Outro"];
const PRESET_INVICTA = { nome: "Invicta Mais", tipoComissao: "mensalidade", percentualComissao: 10, comissaoAutomatica: true };

function ComissoesCorretoraView({ db, onOpenModal, onDeleteLancamento }) {
  const [aba, setAba] = useState("fechamento");
  const [mesEscolhido, setMesEscolhido] = useState(null);
  const [filtroFonte, setFiltroFonte] = useState("todas");

  const mesAtual = mesRefDe(todayISO());
  const mesesOpcoes = opcoesMeses(db.comissoesCorretora.map((l) => l.competencia));
  const mesPadrao = mesesOpcoes.find((m) => fechamentoComissoes(db, m).some((r) => r.previsto > 0 || r.recebido > 0)) || mesAtual;
  const mes = mesEscolhido || mesPadrao;

  const fech = fechamentoComissoes(db, mes);
  const totPrev = round2(sum(fech.map((r) => r.previsto)));
  const totRec = round2(sum(fech.map((r) => r.recebido)));
  const totEst = round2(sum(fech.map((r) => r.estornos)));
  const falta = round2(totPrev - totRec);
  const evolucao = ultimosMeses(mes, 6).map((m) => {
    const f = fechamentoComissoes(db, m);
    return { mes: m, previsto: sum(f.map((r) => r.previsto)), recebido: sum(f.map((r) => r.recebido)) };
  });
  const nomeFonte = (id) => db.seguradoras.find((s) => s.id === id)?.nome || "—";
  const nomeCliente = (id) => db.clientes.find((c) => c.id === id)?.nome || "";
  const lancamentos = db.comissoesCorretora
    .filter((l) => l.competencia === mes && (filtroFonte === "todas" || l.seguradoraId === filtroFonte))
    .sort((x, y) => nomeFonte(x.seguradoraId).localeCompare(nomeFonte(y.seguradoraId), "pt-BR"));

  function registrarRecebimento(r) {
    if (r.auto) {
      onOpenModal("lancamento", {
        seguradoraId: r.fonte.id, competencia: mes, tipo: "Mensalidade", base: r.baseAuto, percentual: r.fonte.percentualComissao,
        valorPrevisto: r.previsto, valorRecebido: "", dataRecebimento: todayISO(), estorno: "", clienteId: "",
        referencia: `Boletos pagos em ${rotuloMes(mes)}`, observacoes: "",
      });
    } else {
      const tipo = r.fonte.tipoComissao === "fixo" ? "Fixo" : r.fonte.tipoComissao === "premio" ? "Venda" : "Mensalidade";
      onOpenModal("lancamento", { seguradoraId: r.fonte.id, competencia: mes, tipo });
    }
  }

  return (
    <div>
      <div className="nexo-section-head">
        <div className="nexo-section-title">Comissões<span className="nexo-section-count">o que a corretora recebe</span></div>
        <div className="nexo-topbar-actions">
          <select className="nexo-select" style={{ width: "auto" }} value={mes} onChange={(e) => setMesEscolhido(e.target.value)} title="Mês de referência">
            {mesesOpcoes.map((m) => <option key={m} value={m}>{rotuloMes(m)}</option>)}
          </select>
          <button className="nexo-btn" onClick={() => onOpenModal("fonte")}><Plus size={15} /> Nova fonte</button>
          <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("lancamento", { competencia: mes })}><Plus size={15} /> Novo lançamento</button>
        </div>
      </div>

      <div className="nexo-kpi-grid">
        <Kpi icon={TrendingUp} label={`Previsto em ${rotuloMes(mes)}`} value={formatBRL(totPrev)} tone="accent" />
        <Kpi icon={CheckCircle2} label="Recebido" value={formatBRL(totRec)} tone="success" />
        <Kpi icon={Clock} label={falta < -0.009 ? "Recebido a mais" : "Falta receber"} value={formatBRL(Math.abs(falta))} tone={falta > 0.009 ? "warning" : falta < -0.009 ? "info" : "success"} />
        <Kpi icon={AlertTriangle} label="Estornos no mês" value={formatBRL(totEst)} tone={totEst > 0 ? "danger" : "info"} />
      </div>

      <div className="nexo-card" style={{ marginBottom: 18 }}>
        <div className="nexo-chart-title">Previsto × recebido</div>
        <div className="nexo-chart-sub">Últimos 6 meses até {rotuloMes(mes)}</div>
        <EvolucaoComissoes dados={evolucao} />
      </div>

      <div className="nexo-tabs">
        <div className={`nexo-tab ${aba === "fechamento" ? "active" : ""}`} onClick={() => setAba("fechamento")}>Fechamento do mês</div>
        <div className={`nexo-tab ${aba === "lancamentos" ? "active" : ""}`} onClick={() => setAba("lancamentos")}>Lançamentos<span className="nexo-tab-n">{lancamentos.length}</span></div>
        <div className={`nexo-tab ${aba === "fontes" ? "active" : ""}`} onClick={() => setAba("fontes")}>Fontes e regras<span className="nexo-tab-n">{db.seguradoras.length}</span></div>
      </div>

      {aba === "fechamento" && (
        fech.length === 0 ? (
          <div className="nexo-table-wrap">
            <EmptyState icon={Wallet} title="Nenhuma fonte de comissão ainda" sub="Cadastre cada seguradora ou associação que paga comissão à corretora, com a regra de cada uma." />
            <div style={{ textAlign: "center", paddingBottom: 28 }}>
              <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("fonte", PRESET_INVICTA)}><Plus size={15} /> Criar “Invicta Mais” (10% automático)</button>
            </div>
          </div>
        ) : (
          <div className="nexo-table-wrap">
            <div className="nexo-table-scroll">
              <table className="nexo-table">
                <thead><tr><th>Fonte</th><th>Previsto</th><th>Recebido</th><th>Diferença</th><th>Andamento</th><th>Situação</th><th></th></tr></thead>
                <tbody>
                  {fech.map((r) => (
                    <tr key={r.fonte.id}>
                      <td>
                        <div className="nexo-cliente-cell">
                          <AvatarNome nome={r.fonte.nome} />
                          <div style={{ minWidth: 0 }}>
                            <div className="nexo-cliente-nome">{r.fonte.nome}</div>
                            <div className="nexo-cliente-sub">{resumoRegra(r.fonte)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="mono">
                        {r.previsto > 0 ? formatBRL(r.previsto) : "—"}
                        {r.auto && <div className="nexo-cliente-sub">base {formatBRL(r.baseAuto)}</div>}
                      </td>
                      <td className="mono" style={{ color: r.recebido > 0 ? "var(--success)" : "var(--text-faint)" }}>{r.recebido > 0 ? formatBRL(r.recebido) : "—"}</td>
                      <td className="mono">
                        {Math.abs(r.diferenca) < 0.01 ? <span className="nexo-cell-muted">—</span> : (
                          <>
                            <div style={{ color: r.diferenca > 0 ? "var(--warning)" : "var(--info)" }}>{formatBRL(Math.abs(r.diferenca))}</div>
                            <div className="nexo-cliente-sub">{r.diferenca > 0 ? "falta receber" : "recebeu a mais"}</div>
                          </>
                        )}
                      </td>
                      <td style={{ minWidth: 130 }}><BarraProgresso valor={r.recebido} max={r.previsto} cor={r.sit.chave === "menos" ? "var(--danger)" : "var(--success)"} /></td>
                      <td><PillTom tom={r.sit.tom}>{r.sit.rotulo}</PillTom></td>
                      <td>
                        <div className="nexo-actions-cell">
                          {!r.fonte.tipoComissao ? (
                            <button className="nexo-btn nexo-btn-sm" onClick={() => onOpenModal("fonte", r.fonte)}>Definir regra</button>
                          ) : (
                            <button className="nexo-btn nexo-btn-sm" onClick={() => registrarRecebimento(r)}>
                              {r.auto ? "Registrar recebimento" : <><Plus size={12} /> Lançamento</>}
                            </button>
                          )}
                          <button className="nexo-icon-btn" title="Editar regra" onClick={() => onOpenModal("fonte", r.fonte)}><Pencil size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="nexo-table-foot">
              <span><strong>{fech.length}</strong> fonte(s)</span>
              <span>Previsto: <strong>{formatBRL(totPrev)}</strong></span>
              <span>Recebido: <strong style={{ color: "var(--success)" }}>{formatBRL(totRec)}</strong></span>
              <span className="tot">{falta < -0.009 ? "Recebido a mais" : "Falta receber"}: <strong style={{ color: falta > 0.009 ? "var(--warning)" : "var(--text)" }}>{formatBRL(Math.abs(falta))}</strong></span>
            </div>
          </div>
        )
      )}

      {aba === "lancamentos" && (
        <>
          <div className="nexo-toolbar">
            <select className="nexo-select" style={{ width: "auto" }} value={filtroFonte} onChange={(e) => setFiltroFonte(e.target.value)}>
              <option value="todas">Todas as fontes</option>
              {db.seguradoras.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
          {lancamentos.length === 0 ? (
            <div className="nexo-table-wrap"><EmptyState icon={FileText} title={`Nenhum lançamento em ${rotuloMes(mes)}`} sub="Use “Novo lançamento” para registrar uma comissão a receber ou já recebida." /></div>
          ) : (
            <div className="nexo-table-wrap">
              <div className="nexo-table-scroll">
                <table className="nexo-table">
                  <thead><tr><th>Fonte</th><th>Tipo</th><th>Cliente / referência</th><th>Base</th><th>%</th><th>Previsto</th><th>Recebido</th><th>Situação</th><th></th></tr></thead>
                  <tbody>
                    {lancamentos.map((l) => {
                      const sit = situacaoLinhaComissao(l);
                      return (
                        <tr key={l.id}>
                          <td style={{ fontWeight: 600 }}>{nomeFonte(l.seguradoraId)}</td>
                          <td className="nexo-cell-muted">{l.tipo}</td>
                          <td>
                            <div>{nomeCliente(l.clienteId) || "—"}</div>
                            {l.referencia && <div className="nexo-cliente-sub">{l.referencia}</div>}
                          </td>
                          <td className="mono">{Number(l.base) > 0 ? formatBRL(l.base) : "—"}</td>
                          <td className="mono nexo-cell-muted">{Number(l.percentual) > 0 ? pctTexto(l.percentual) : "—"}</td>
                          <td className="mono">{formatBRL(l.valorPrevisto)}</td>
                          <td className="mono" style={{ color: l.valorRecebido !== "" ? "var(--success)" : "var(--text-faint)" }}>
                            {l.valorRecebido !== "" ? formatBRL(l.valorRecebido) : "—"}
                            {Number(l.estorno) > 0 && <div className="nexo-cliente-sub" style={{ color: "var(--danger)" }}>estorno {formatBRL(l.estorno)}</div>}
                          </td>
                          <td><PillTom tom={sit.tom}>{sit.rotulo}</PillTom></td>
                          <td>
                            <div className="nexo-actions-cell">
                              <button className="nexo-icon-btn" onClick={() => onOpenModal("lancamento", l)}><Pencil size={13} /></button>
                              <button className="nexo-icon-btn" onClick={() => onDeleteLancamento(l.id)}><Trash2 size={13} /></button>
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
        </>
      )}

      {aba === "fontes" && (
        db.seguradoras.length === 0 ? (
          <div className="nexo-table-wrap">
            <EmptyState icon={Wallet} title="Nenhuma fonte cadastrada" sub="Cadastre as seguradoras e associações que pagam comissão à corretora." />
            <div style={{ textAlign: "center", paddingBottom: 28 }}>
              <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("fonte", PRESET_INVICTA)}><Plus size={15} /> Criar “Invicta Mais” (10% automático)</button>
            </div>
          </div>
        ) : (
          <div className="nexo-fontes-grid">
            {db.seguradoras.map((f) => {
              const r = fech.find((x) => x.fonte.id === f.id);
              return (
                <div className="nexo-card" key={f.id}>
                  <div className="nexo-cliente-cell">
                    <AvatarNome nome={f.nome} tamanho={42} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="nexo-cliente-nome" style={{ fontSize: 14.5 }}>{f.nome}</div>
                      <div className="nexo-cliente-sub">{f.diaRepasse ? `Repasse todo dia ${f.diaRepasse}` : "Dia de repasse não informado"}</div>
                    </div>
                    {f.comissaoAutomatica && <span className="nexo-tag-frota">automático</span>}
                  </div>
                  <div className="nexo-fonte-regra" style={{ color: f.tipoComissao ? "var(--text)" : "var(--warning)" }}>{resumoRegra(f)}</div>
                  {f.regraEstorno && <div className="nexo-cliente-sub" style={{ marginBottom: 8 }}>Estorno: {f.regraEstorno}</div>}
                  <div className="nexo-fonte-linha"><span>Previsto em {rotuloMes(mes)}</span><strong className="mono">{r ? formatBRL(r.previsto) : "—"}</strong></div>
                  <div className="nexo-fonte-linha"><span>Recebido</span><strong className="mono" style={{ color: "var(--success)" }}>{r ? formatBRL(r.recebido) : "—"}</strong></div>
                  <div style={{ marginTop: 12 }}>
                    <button className="nexo-btn nexo-btn-sm" onClick={() => onOpenModal("fonte", f)}><Pencil size={12} /> Editar regra</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

function FonteForm({ initial, outraAutomatica, onSave, onCancel }) {
  const [f, setF] = useState({
    nome: "", percentualComissao: "", percentualRenovacao: "", valorFixoComissao: "",
    diaRepasse: "", regraEstorno: "", comissaoAutomatica: false, ...(initial || {}),
    tipoComissao: initial?.tipoComissao || "mensalidade",
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  function submit() {
    const errs = {};
    if (!f.nome.trim()) errs.nome = "Informe o nome da seguradora ou associação.";
    if ((f.tipoComissao === "mensalidade" || f.tipoComissao === "premio") && !(Number(f.percentualComissao) > 0)) errs.percentualComissao = "Informe o percentual.";
    if (f.tipoComissao === "fixo" && !(Number(f.valorFixoComissao) > 0)) errs.valorFixoComissao = "Informe o valor.";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, id: initial?.id, comissaoAutomatica: f.tipoComissao === "mensalidade" ? !!f.comissaoAutomatica : false });
  }
  return (
    <>
      <Field label="Seguradora / associação *" error={errors.nome}>
        <input className="nexo-input" value={f.nome} onChange={set("nome")} placeholder="Ex.: Invicta Mais, Suhai, Porto Seguro" />
      </Field>
      <Field label="Como ela paga a comissão da corretora?">
        <select className="nexo-select" value={f.tipoComissao} onChange={set("tipoComissao")}>
          {TIPOS_REGRA.map(([k, rotulo]) => <option key={k} value={k}>{rotulo}</option>)}
        </select>
      </Field>
      {(f.tipoComissao === "mensalidade" || f.tipoComissao === "premio") && (
        <div className="nexo-field-row">
          <Field label={f.tipoComissao === "premio" ? "Percentual na venda (%) *" : "Percentual (%) *"} error={errors.percentualComissao}>
            <input type="number" step="0.01" min="0" className="nexo-input" value={f.percentualComissao} onChange={set("percentualComissao")} placeholder="10" />
          </Field>
          {f.tipoComissao === "premio" && (
            <Field label="Percentual na renovação (%)">
              <input type="number" step="0.01" min="0" className="nexo-input" value={f.percentualRenovacao} onChange={set("percentualRenovacao")} placeholder="Se for diferente da venda" />
            </Field>
          )}
        </div>
      )}
      {f.tipoComissao === "fixo" && (
        <Field label="Valor fixo por contrato (R$) *" error={errors.valorFixoComissao}>
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorFixoComissao} onChange={set("valorFixoComissao")} placeholder="0,00" />
        </Field>
      )}
      <div className="nexo-field-row">
        <Field label="Dia do mês em que ela repassa">
          <input type="number" min="1" max="31" className="nexo-input" value={f.diaRepasse} onChange={set("diaRepasse")} placeholder="Ex.: 10" />
        </Field>
        <Field label="Regra de estorno (se cancelar)">
          <input className="nexo-input" value={f.regraEstorno} onChange={set("regraEstorno")} placeholder="Ex.: devolve proporcional se cancelar em 12 meses" />
        </Field>
      </div>
      {f.tipoComissao === "mensalidade" && (
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--text-dim)", cursor: "pointer" }}>
          <input type="checkbox" checked={!!f.comissaoAutomatica} onChange={(e) => setF({ ...f, comissaoAutomatica: e.target.checked })} style={{ marginTop: 3 }} />
          <span>
            <strong style={{ color: "var(--text)" }}>Calcular automaticamente sobre os boletos pagos no sistema</strong>
            <br />O previsto de cada mês passa a ser o percentual sobre tudo que foi pago nos boletos.
            {outraAutomatica && f.comissaoAutomatica && <span style={{ color: "var(--warning)" }}> A fonte que estava no automático passa a ser manual.</span>}
          </span>
        </label>
      )}
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar regra</button>
      </div>
    </>
  );
}

function LancamentoForm({ initial, seguradoras, clientes, onSave, onCancel }) {
  const [f, setF] = useState({
    seguradoraId: "", competencia: mesRefDe(todayISO()), tipo: "Mensalidade", clienteId: "", referencia: "",
    base: "", percentual: "", valorPrevisto: "", valorRecebido: "", dataRecebimento: "", estorno: "", observacoes: "",
    ...(initial || {}),
  });
  const [errors, setErrors] = useState({});
  const [previstoManual, setPrevistoManual] = useState(false);
  const fonte = seguradoras.find((s) => s.id === f.seguradoraId);

  function recalcular(next) {
    const fo = seguradoras.find((s) => s.id === next.seguradoraId);
    if (previstoManual || !fo) return next;
    if (fo.tipoComissao === "fixo") return { ...next, valorPrevisto: fo.valorFixoComissao !== "" ? String(fo.valorFixoComissao) : next.valorPrevisto };
    const base = Number(next.base) || 0;
    const pct = Number(next.percentual) || 0;
    return { ...next, valorPrevisto: base && pct ? String(round2((base * pct) / 100)) : next.valorPrevisto };
  }
  function regraPercentual(fo, tipo) {
    if (!fo) return "";
    if (tipo === "Renovação" && Number(fo.percentualRenovacao) > 0) return String(fo.percentualRenovacao);
    return fo.percentualComissao !== "" && fo.percentualComissao != null ? String(fo.percentualComissao) : "";
  }
  const set = (k) => (e) => setF(recalcular({ ...f, [k]: e.target.value }));
  function mudarFonteOuTipo(k) {
    return (e) => {
      const next = { ...f, [k]: e.target.value };
      const fo = seguradoras.find((s) => s.id === next.seguradoraId);
      if (fo) next.percentual = fo.tipoComissao === "fixo" ? "" : regraPercentual(fo, next.tipo);
      setF(recalcular(next));
    };
  }
  function submit() {
    const errs = {};
    if (!f.seguradoraId) errs.seguradoraId = "Selecione a seguradora ou associação.";
    if (!f.competencia) errs.competencia = "Selecione o mês.";
    if (Object.keys(errs).length) return setErrors(errs);
    onSave({ ...f, id: initial?.id });
  }
  const meses = opcoesMeses([f.competencia]);
  return (
    <>
      <div className="nexo-field-row">
        <Field label="Seguradora / associação *" error={errors.seguradoraId}>
          <select className="nexo-select" value={f.seguradoraId} onChange={mudarFonteOuTipo("seguradoraId")}>
            <option value="">Selecione</option>
            {seguradoras.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </Field>
        <Field label="Mês de referência *" error={errors.competencia}>
          <select className="nexo-select" value={f.competencia} onChange={set("competencia")}>
            {meses.map((m) => <option key={m} value={m}>{rotuloMes(m)}</option>)}
          </select>
        </Field>
      </div>
      {fonte && <div className="nexo-cliente-sub" style={{ marginTop: -6 }}>Regra: {resumoRegra(fonte)}</div>}
      <div className="nexo-field-row">
        <Field label="Tipo">
          <select className="nexo-select" value={f.tipo} onChange={mudarFonteOuTipo("tipo")}>
            {TIPOS_LANCAMENTO.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Cliente (opcional)">
          <select className="nexo-select" value={f.clienteId || ""} onChange={set("clienteId")}>
            <option value="">—</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Referência (contrato, apólice ou descrição)">
        <input className="nexo-input" value={f.referencia} onChange={set("referencia")} placeholder="Ex.: Apólice 12345" />
      </Field>
      <div className="nexo-field-row3">
        <Field label="Base (R$)">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.base} onChange={set("base")} placeholder="Prêmio ou boletos pagos" />
        </Field>
        <Field label="Percentual (%)">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.percentual} onChange={set("percentual")} placeholder="10" />
        </Field>
        <Field label="Comissão prevista (R$)">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorPrevisto} onChange={(e) => { setPrevistoManual(true); setF({ ...f, valorPrevisto: e.target.value }); }} placeholder="Calculada" />
        </Field>
      </div>
      <div className="nexo-field-row3">
        <Field label="Valor recebido (R$)">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.valorRecebido === null ? "" : f.valorRecebido} onChange={set("valorRecebido")} placeholder="O que caiu na conta" />
        </Field>
        <Field label="Data do recebimento">
          <input type="date" className="nexo-input" value={f.dataRecebimento} onChange={set("dataRecebimento")} />
        </Field>
        <Field label="Estorno (R$)">
          <input type="number" step="0.01" min="0" className="nexo-input" value={f.estorno === null ? "" : f.estorno} onChange={set("estorno")} placeholder="0,00" />
        </Field>
      </div>
      <Field label="Observações">
        <textarea className="nexo-textarea" value={f.observacoes} onChange={set("observacoes")} placeholder="Ex.: divergência com o extrato, cancelamento de apólice…" />
      </Field>
      <div className="nexo-modal-foot" style={{ padding: "4px 0 0", borderTop: "none" }}>
        <button className="nexo-btn" onClick={onCancel}>Cancelar</button>
        <button className="nexo-btn nexo-btn-primary" onClick={submit}>Salvar lançamento</button>
      </div>
    </>
  );
}

/** Se uma tela ou janela der erro, mostra um aviso no lugar dela em vez de derrubar o sistema inteiro. */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { erro: null }; }
  static getDerivedStateFromError(erro) { return { erro }; }
  componentDidCatch(erro) { console.error(erro); if (this.props.onError) this.props.onError(erro); }
  componentDidUpdate(anterior) {
    if (this.state.erro && anterior.resetKey !== this.props.resetKey) this.setState({ erro: null });
  }
  render() {
    if (!this.state.erro) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;
    return (
      <div className="nexo-card" style={{ maxWidth: 560, margin: "40px auto", textAlign: "center" }}>
        <div className="nexo-dialog-ico" style={{ "--tone": "var(--danger)", margin: "0 auto 14px" }}><AlertTriangle size={22} /></div>
        <div className="nexo-chart-title" style={{ fontSize: 16 }}>Algo deu errado nesta tela</div>
        <div className="nexo-chart-sub" style={{ marginBottom: 16 }}>O resto do sistema continua funcionando. Você pode tentar de novo ou abrir outra tela no menu.</div>
        <div className="nexo-cliente-sub mono" style={{ marginBottom: 16, wordBreak: "break-word" }}>{String(this.state.erro?.message || this.state.erro)}</div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => this.setState({ erro: null })}>Tentar de novo</button>
      </div>
    );
  }
}

const NAV_GRUPOS = [
  { titulo: "", chaves: ["dashboard"] },
  { titulo: "Cadastros", chaves: ["clientes", "veiculos"] },
  { titulo: "Financeiro", chaves: ["financeiro", "comissoes", "adesoes"] },
  { titulo: "Seguros", chaves: ["cotacoes", "consultoras"] },
  { titulo: "Gestão", chaves: ["relatorios", "usuarios"] },
];

const SUBTITULOS = {
  dashboard: "Visão geral do negócio", clientes: "Cadastro e histórico", veiculos: "Frota cadastrada",
  financeiro: "Boletos e recebimentos", relatorios: "Exportações", cotacoes: "Seguradoras, planos e cotações",
  consultoras: "Equipe de vendas", adesoes: "Adesões e recebimentos", comissoes: "O que a corretora recebe das seguradoras",
  usuarios: "Acessos e permissões", clienteDetail: "Dados, veículos e boletos",
};

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
  { key: "usuarios", label: "Usuários", Icon: Shield },
];

const EMPTY_DB = { clientes: [], veiculos: [], boletos: [], seguradoras: [], planos: [], cotacoes: [], consultoras: [], adesoes: [], comissoes: [], comissoesCorretora: [], usuarios: [] };
const rowToUsuario = (r) => ({ userId: r.user_id, nome: r.nome || "", email: r.email || "", role: r.role || "operador" });

const rowToConsultora = (r) => ({
  id: r.id, nome: r.nome || "", telefone: r.telefone || "", email: r.email || "", status: r.status || "Ativa",
  percentualAdesao: r.percentual_adesao ?? "", valorFixoContrato: r.valor_fixo_contrato ?? "",
  percentualRecorrente: r.percentual_recorrente ?? "", metaMensal: r.meta_mensal ?? "",
});
const consultoraToRow = (c) => ({
  nome: c.nome, telefone: c.telefone || null, email: c.email || null, status: c.status || "Ativa",
  percentual_adesao: numOuNull(c.percentualAdesao), valor_fixo_contrato: numOuNull(c.valorFixoContrato),
  percentual_recorrente: numOuNull(c.percentualRecorrente), meta_mensal: numOuNull(c.metaMensal),
});

const rowToAdesao = (r) => ({
  id: r.id, clienteId: r.cliente_id, consultoraId: r.consultora_id, dataVenda: r.data_venda || "",
  valorAdesao: r.valor_adesao ?? "", valorRecebido: r.valor_recebido ?? "", dataRecebimento: r.data_recebimento || "", status: r.status || "Pendente",
  seguradoraId: r.seguradora_id || "", comissaoConsultora: r.comissao_consultora ?? "",
});
const adesaoToRow = (a) => ({
  cliente_id: a.clienteId, consultora_id: a.consultoraId, data_venda: a.dataVenda || null,
  valor_adesao: a.valorAdesao === "" ? null : Number(a.valorAdesao),
  valor_recebido: a.valorRecebido === "" || a.valorRecebido == null ? null : Number(a.valorRecebido),
  data_recebimento: a.dataRecebimento || null, status: a.status || "Pendente",
  seguradora_id: a.seguradoraId || null, comissao_consultora: numOuNull(a.comissaoConsultora),
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

const rowToSeguradora = (r) => ({
  id: r.id, nome: r.nome || "", linkPortal: r.link_portal || "",
  tipoComissao: r.tipo_comissao || "", percentualComissao: r.percentual_comissao ?? "", percentualRenovacao: r.percentual_renovacao ?? "",
  valorFixoComissao: r.valor_fixo_comissao ?? "", diaRepasse: r.dia_repasse ?? "", regraEstorno: r.regra_estorno || "",
  comissaoAutomatica: !!r.comissao_automatica,
});
const regraComissaoToRow = (s) => ({
  nome: s.nome, tipo_comissao: s.tipoComissao || null, percentual_comissao: numOuNull(s.percentualComissao),
  percentual_renovacao: numOuNull(s.percentualRenovacao), valor_fixo_comissao: numOuNull(s.valorFixoComissao),
  dia_repasse: numOuNull(s.diaRepasse), regra_estorno: s.regraEstorno || null, comissao_automatica: !!s.comissaoAutomatica,
});
const rowToComissaoCorretora = (r) => ({
  id: r.id, seguradoraId: r.seguradora_id, competencia: r.competencia || "", tipo: r.tipo || "Mensalidade", clienteId: r.cliente_id || "",
  referencia: r.referencia || "", base: r.base ?? "", percentual: r.percentual ?? "", valorPrevisto: r.valor_previsto ?? "",
  valorRecebido: r.valor_recebido ?? "", dataRecebimento: r.data_recebimento || "", estorno: r.estorno ?? "", observacoes: r.observacoes || "",
});
const comissaoCorretoraToRow = (c) => ({
  seguradora_id: c.seguradoraId, competencia: c.competencia, tipo: c.tipo || "Mensalidade", cliente_id: c.clienteId || null,
  referencia: c.referencia || null, base: numOuNull(c.base), percentual: numOuNull(c.percentual), valor_previsto: numOuNull(c.valorPrevisto),
  valor_recebido: numOuNull(c.valorRecebido), data_recebimento: c.dataRecebimento || null,
  estorno: c.estorno === "" || c.estorno == null ? 0 : Number(c.estorno), observacoes: c.observacoes || null,
});
const seguradoraToRow = (s) => ({ nome: s.nome, link_portal: s.linkPortal || null });

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
  codigoSga: r.codigo_sga || "", ultimoContato: r.ultimo_contato || "", indicadoPor: r.indicado_por || "",
});
const clienteToRow = (c) => ({
  nome: c.nome, nascimento: c.nascimento || null, sexo: c.sexo || null, cpf: c.cpf || null,
  cnh_numero: c.cnhNumero || null, cnh_emissao: c.cnhEmissao || null, cnh_validade: c.cnhValidade || null,
  telefone: c.telefone || null, whatsapp: c.whatsapp || null, email: c.email || null,
  cep: c.cep || null, endereco: c.endereco || null, status: c.status || "Ativo",
  codigo_sga: c.codigoSga || null, ultimo_contato: c.ultimoContato || null, indicado_por: c.indicadoPor || null,
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
  id: r.id, clienteId: r.cliente_id, veiculoId: r.veiculo_id || "", numero: r.numero || "", nossoNumero: r.nosso_numero || "",
  dataEmissao: r.data_emissao || "", dataVencimento: r.data_vencimento || "", valor: r.valor ?? "",
  dataPagamento: r.data_pagamento || "",
});
const boletoToRow = (b) => ({
  cliente_id: b.clienteId, veiculo_id: b.veiculoId || null, numero: b.numero, nosso_numero: b.nossoNumero || null,
  data_emissao: b.dataEmissao || null,
  data_vencimento: b.dataVencimento || null, valor: paraNumeroBR(b.valor), data_pagamento: b.dataPagamento || null,
});

export default function App() {
  const [sessao, setSessao] = useState(undefined); // undefined = verificando, null = sem sessão, objeto = logado
  const [perfil, setPerfil] = useState(undefined); // undefined = carregando, null = sem perfil, objeto = { role, nome }
  const [db, setDb] = useState(EMPTY_DB);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState("dashboard");
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const [modal, setModal] = useState(null); // { type, data, defaultClienteId, defaultVeiculoId }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tema, setTema] = useState(() => {
    try { return localStorage.getItem("nexo-tema") === "light" ? "light" : "dark"; } catch { return "dark"; }
  });
  const [menuRecolhido, setMenuRecolhido] = useState(() => {
    try { return localStorage.getItem("nexo-menu") === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem("nexo-tema", tema); } catch {}
    document.body.style.background = tema === "light" ? "#EDF1F7" : "#070B11";
    document.documentElement.style.colorScheme = tema;
  }, [tema]);
  useEffect(() => {
    try { localStorage.setItem("nexo-menu", menuRecolhido ? "1" : "0"); } catch {}
  }, [menuRecolhido]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSessao(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessao) { setPerfil(sessao === null ? null : undefined); return; }
    supabase
      .from("perfis")
      .select("*")
      .eq("user_id", sessao.user.id)
      .single()
      .then(({ data }) => {
        setPerfil(data || null);
        if (data && data.role !== "admin") setView((v) => (v === "dashboard" ? "clientes" : v));
      });
  }, [sessao]);

  const ehAdmin = perfil?.role === "admin";
  const modulosDoOperador = ["clientes", "veiculos", "financeiro", "cotacoes", "clienteDetail"];
  const podeVer = (chave) => ehAdmin || modulosDoOperador.includes(chave);

  const carregarTudo = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [clientesRes, veiculosRes, boletosRes, seguradorasRes, planosRes, cotacoesRes, consultorasRes, adesoesRes, comissoesRes, usuariosRes, comissoesCorretoraRes] = await Promise.all([
        supabase.from("clientes").select("*").order("nome"),
        supabase.from("veiculos").select("*"),
        supabase.from("boletos").select("*"),
        supabase.from("seguradoras").select("*").order("nome"),
        supabase.from("planos").select("*"),
        supabase.from("cotacoes").select("*"),
        supabase.from("consultoras").select("*").order("nome"),
        supabase.from("adesoes").select("*"),
        supabase.from("comissoes").select("*"),
        supabase.from("perfis").select("*").order("nome"),
        supabase.from("comissoes_corretora").select("*"),
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
        usuarios: (usuariosRes.data || []).map(rowToUsuario),
        comissoesCorretora: comissoesCorretoraRes.error ? [] : (comissoesCorretoraRes.data || []).map(rowToComissaoCorretora),
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
      notify("Não foi possível salvar o cliente: " + e.message);
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
      notify("Não foi possível salvar o veículo: " + e.message);
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
      notify("Não foi possível salvar o boleto: " + e.message);
    }
  };

  const deleteCliente = async (id) => {
    if (!await confirmDialog("Excluir este cliente? Os veículos e boletos vinculados também serão removidos.")) return;
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
      notify("Não foi possível excluir o cliente: " + e.message);
    }
  };

  const deleteVeiculo = async (id) => {
    if (!await confirmDialog("Excluir este veículo? Os boletos vinculados também serão removidos.")) return;
    try {
      const { error } = await supabase.from("veiculos").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({
        ...prev,
        veiculos: prev.veiculos.filter((v) => v.id !== id),
        boletos: prev.boletos.filter((b) => b.veiculoId !== id),
      }));
    } catch (e) {
      notify("Não foi possível excluir o veículo: " + e.message);
    }
  };

  const deleteBoleto = async (id) => {
    if (!await confirmDialog("Excluir este boleto?")) return;
    try {
      const { error } = await supabase.from("boletos").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, boletos: prev.boletos.filter((b) => b.id !== id) }));
    } catch (e) {
      notify("Não foi possível excluir o boleto: " + e.message);
    }
  };

  const marcarPago = async (id) => {
    try {
      const { data, error } = await supabase.from("boletos").update({ data_pagamento: todayISO() }).eq("id", id).select().single();
      if (error) throw error;
      setDb((prev) => ({ ...prev, boletos: prev.boletos.map((b) => (b.id === id ? rowToBoleto(data) : b)) }));
    } catch (e) {
      notify("Não foi possível atualizar o boleto: " + e.message);
    }
  };

  const openDetail = (clienteId) => { setSelectedClienteId(clienteId); setView("clienteDetail"); };

  // --- Seguradoras, planos e cotações ---
  const saveSeguradora = async (nome, linkPortal) => {
    try {
      const { data, error } = await supabase.from("seguradoras").insert(seguradoraToRow({ nome, linkPortal })).select().single();
      if (error) throw error;
      setDb((prev) => ({ ...prev, seguradoras: [...prev.seguradoras, rowToSeguradora(data)] }));
      return data.id;
    } catch (e) {
      notify("Não foi possível salvar a seguradora: " + e.message);
      return null;
    }
  };

  const atualizarLinkPortalSeguradora = async (id, linkPortal) => {
    try {
      const { data, error } = await supabase.from("seguradoras").update({ link_portal: linkPortal || null }).eq("id", id).select().single();
      if (error) throw error;
      setDb((prev) => ({ ...prev, seguradoras: prev.seguradoras.map((s) => (s.id === id ? rowToSeguradora(data) : s)) }));
    } catch (e) {
      notify("Não foi possível salvar o link do portal: " + e.message);
    }
  };

  const deleteSeguradora = async (id) => {
    if (!await confirmDialog("Excluir esta seguradora? Os planos vinculados também serão removidos.")) return;
    try {
      const { error } = await supabase.from("seguradoras").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({
        ...prev,
        seguradoras: prev.seguradoras.filter((s) => s.id !== id),
        planos: prev.planos.filter((p) => p.seguradoraId !== id),
      }));
    } catch (e) {
      notify("Não foi possível excluir a seguradora: " + e.message);
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
      notify("Não foi possível salvar o plano: " + e.message);
    }
  };

  const deletePlano = async (id) => {
    if (!await confirmDialog("Excluir este plano?")) return;
    try {
      const { error } = await supabase.from("planos").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, planos: prev.planos.filter((p) => p.id !== id) }));
    } catch (e) {
      notify("Não foi possível excluir o plano: " + e.message);
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
      notify("Não foi possível salvar a cotação: " + e.message);
    }
  };

  const deleteCotacao = async (id) => {
    if (!await confirmDialog("Excluir esta cotação?")) return;
    try {
      const { error } = await supabase.from("cotacoes").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, cotacoes: prev.cotacoes.filter((c) => c.id !== id) }));
    } catch (e) {
      notify("Não foi possível excluir a cotação: " + e.message);
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
      notify("Não foi possível salvar a consultora: " + e.message);
    }
  };
  const deleteConsultora = async (id) => {
    if (!await confirmDialog("Excluir esta consultora? Adesões e comissões vinculadas a ela também serão removidas.")) return;
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
      notify("Não foi possível excluir a consultora: " + e.message);
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
      notify("Não foi possível salvar a adesão: " + e.message);
    }
  };
  const deleteAdesao = async (id) => {
    if (!await confirmDialog("Excluir esta adesão?")) return;
    try {
      const { error } = await supabase.from("adesoes").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, adesoes: prev.adesoes.filter((a) => a.id !== id) }));
    } catch (e) {
      notify("Não foi possível excluir a adesão: " + e.message);
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
      notify("Não foi possível atualizar a adesão: " + e.message);
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
      notify("Não foi possível salvar a comissão: " + e.message);
    }
  };
  const deleteComissao = async (id) => {
    if (!await confirmDialog("Excluir esta comissão?")) return;
    try {
      const { error } = await supabase.from("comissoes").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, comissoes: prev.comissoes.filter((c) => c.id !== id) }));
    } catch (e) {
      notify("Não foi possível excluir a comissão: " + e.message);
    }
  };
  const marcarPagaComissao = async (id) => {
    try {
      const { data, error } = await supabase.from("comissoes").update({ status: "Pago", data_efetiva_pagamento: todayISO() }).eq("id", id).select().single();
      if (error) throw error;
      setDb((prev) => ({ ...prev, comissoes: prev.comissoes.map((c) => (c.id === id ? rowToComissao(data) : c)) }));
    } catch (e) {
      notify("Não foi possível atualizar a comissão: " + e.message);
    }
  };

  // --- Comissões da corretora (regras por fonte e lançamentos) ---
  const saveFonteComissao = async (fonte) => {
    try {
      let salvo;
      if (fonte.id) {
        const { data, error } = await supabase.from("seguradoras").update(regraComissaoToRow(fonte)).eq("id", fonte.id).select().single();
        if (error) throw error;
        salvo = data;
      } else {
        const { data, error } = await supabase.from("seguradoras").insert(regraComissaoToRow(fonte)).select().single();
        if (error) throw error;
        salvo = data;
      }
      if (fonte.comissaoAutomatica) {
        // só pode haver uma fonte no automático
        const { error: e2 } = await supabase.from("seguradoras").update({ comissao_automatica: false }).neq("id", salvo.id).eq("comissao_automatica", true);
        if (e2) throw e2;
      }
      setDb((prev) => {
        const novo = rowToSeguradora(salvo);
        const existe = prev.seguradoras.some((s) => s.id === novo.id);
        const lista = existe ? prev.seguradoras.map((s) => (s.id === novo.id ? { ...novo, linkPortal: s.linkPortal || novo.linkPortal } : s)) : [...prev.seguradoras, novo];
        return { ...prev, seguradoras: lista.map((s) => (fonte.comissaoAutomatica && s.id !== novo.id ? { ...s, comissaoAutomatica: false } : s)) };
      });
      closeModal();
    } catch (e) {
      notify("Não foi possível salvar a regra de comissão: " + e.message);
    }
  };
  const saveLancamento = async (lanc) => {
    try {
      if (lanc.id) {
        const { data, error } = await supabase.from("comissoes_corretora").update(comissaoCorretoraToRow(lanc)).eq("id", lanc.id).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, comissoesCorretora: prev.comissoesCorretora.map((c) => (c.id === data.id ? rowToComissaoCorretora(data) : c)) }));
      } else {
        const { data, error } = await supabase.from("comissoes_corretora").insert(comissaoCorretoraToRow(lanc)).select().single();
        if (error) throw error;
        setDb((prev) => ({ ...prev, comissoesCorretora: [...prev.comissoesCorretora, rowToComissaoCorretora(data)] }));
      }
      closeModal();
    } catch (e) {
      notify("Não foi possível salvar o lançamento: " + e.message);
    }
  };
  const deleteLancamento = async (id) => {
    if (!await confirmDialog("Excluir este lançamento de comissão?")) return;
    try {
      const { error } = await supabase.from("comissoes_corretora").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, comissoesCorretora: prev.comissoesCorretora.filter((c) => c.id !== id) }));
    } catch (e) {
      notify("Não foi possível excluir o lançamento: " + e.message);
    }
  };
  const gerarPagamentoAdesao = async (adesao) => {
    const consultora = db.consultoras.find((c) => c.id === adesao.consultoraId);
    const valor = comissaoDaAdesao(adesao, consultora);
    if (!(valor > 0)) { notify("Defina o ganho da consultora nessa adesão (ou nas regras dela) antes de gerar o pagamento."); return; }
    const referencia = `adesao:${adesao.id}`;
    if (db.comissoes.some((c) => c.referencia === referencia)) { notify("Já existe um pagamento gerado para essa adesão."); return; }
    try {
      const base = Number(adesao.valorAdesao) || 0;
      const { data, error } = await supabase.from("comissoes").insert(comissaoToRow({
        consultoraId: adesao.consultoraId, clienteId: adesao.clienteId, tipo: "Adesão", referencia, dataVenda: adesao.dataVenda,
        valorBase: base, percentual: base > 0 ? round2((valor / base) * 100) : 0, valorComissao: valor,
        dataPrevistaPagamento: "", dataEfetivaPagamento: "", status: "A pagar",
      })).select().single();
      if (error) throw error;
      setDb((prev) => ({ ...prev, comissoes: [...prev.comissoes, rowToComissao(data)] }));
      notify("Pagamento gerado. Ele aparece em Consultoras › Pagamentos.");
    } catch (e) {
      notify("Não foi possível gerar o pagamento: " + e.message);
    }
  };
  // --- Importação em massa (CSV) ---
  const importarClientesCSV = async (linhas) => {
    if (linhas.length === 0) return;
    try {
      const cpfsExistentes = new Set(db.clientes.map((c) => c.cpf.replace(/\D/g, "")).filter(Boolean));
      const cpfsNestaImportacao = new Set();
      const novos = [];
      let duplicados = 0;
      for (const l of linhas) {
        const cpfLimpo = (l.cpf || "").replace(/\D/g, "");
        if (cpfLimpo && (cpfsExistentes.has(cpfLimpo) || cpfsNestaImportacao.has(cpfLimpo))) {
          duplicados++;
          continue;
        }
        if (cpfLimpo) cpfsNestaImportacao.add(cpfLimpo);
        novos.push(l);
      }
      let importados = 0;
      if (novos.length > 0) {
        const payload = novos.map((l) => clienteToRow({ ...l, status: l.status || "Ativo" }));
        const { data, error } = await supabase.from("clientes").insert(payload).select();
        if (error) throw error;
        importados = data?.length || 0;
        setDb((prev) => ({ ...prev, clientes: [...prev.clientes, ...(data || []).map(rowToCliente)] }));
      }
      notify(`${importados} cliente(s) importado(s) com sucesso.` + (duplicados > 0 ? `\n${duplicados} ignorado(s) por já existir um cliente com esse CPF/CNPJ.` : ""));
    } catch (e) {
      notify("Não foi possível importar os clientes: " + e.message);
    }
  };

  const importarBaixaBoletosCSV = async (linhas) => {
    if (linhas.length === 0) return;
    try {
      let baixados = 0, naoEncontrados = 0, jaBaixados = 0, ignoradosAberto = 0, valoresCorrigidos = 0;
      let clientesCriados = 0, boletosCriados = 0, semDadosParaCriarBoleto = 0;
      let cpfsPreenchidos = 0, veiculosVinculados = 0, valoresVeiculosPreenchidos = 0;
      const atualizacoes = [];
      const cpfsParaPreencher = new Map(); // clienteId -> cpf
      const valoresVeiculos = new Map(); // veiculoId -> valor mensal
      const cpfsEmUso = new Set(db.clientes.map((c) => (c.cpf || "").replace(/\D/g, "")).filter(Boolean));

      function registrarCpf(clienteObj, linha) {
        if (!clienteObj || clienteObj.cpf || !linha.cpf) return;
        const limpo = linha.cpf.replace(/\D/g, "");
        if (limpo.length < 11 || cpfsEmUso.has(limpo) || cpfsParaPreencher.has(clienteObj.id)) return;
        cpfsEmUso.add(limpo);
        cpfsParaPreencher.set(clienteObj.id, maskCpfCnpj(linha.cpf));
      }
      function veiculoUnicoDaLinha(linha) {
        const placas = separarPlacas(linha.placa);
        return placas.length === 1 ? db.veiculos.find((v) => normPlaca(v.placa) === placas[0]) || null : null;
      }
      function registrarValorMensal(veiculo, valor) {
        if (veiculo && valor > 0 && !(Number(veiculo.valorMensal) > 0)) valoresVeiculos.set(veiculo.id, valor);
      }
      const boletosParaCriar = [];

      // Cache local (nesta importação) de clientes já encontrados/criados, pra não duplicar
      // mesmo quando o mesmo cliente aparece em várias linhas do relatório.
      const clientesPorCpf = new Map(db.clientes.filter((c) => c.cpf).map((c) => [c.cpf.replace(/\D/g, ""), c]));
      const clientesPorCodigoSga = new Map(db.clientes.filter((c) => c.codigoSga).map((c) => [normalizarTexto(c.codigoSga), c]));
      const clientesPorNome = new Map(db.clientes.map((c) => [normalizarTexto(c.nome), c]));
      const clientesNovosCriados = [];

      async function buscarOuCriarCliente(linha) {
        const cpfLimpo = (linha.cpf || "").replace(/\D/g, "");
        const codigoSgaNorm = normalizarTexto(linha.codigoSga);
        const nomeNorm = normalizarTexto(linha.nomeCliente);
        let existente =
          (cpfLimpo && clientesPorCpf.get(cpfLimpo)) ||
          (codigoSgaNorm && clientesPorCodigoSga.get(codigoSgaNorm)) ||
          (nomeNorm && clientesPorNome.get(nomeNorm));
        if (existente) return existente;
        if (!linha.nomeCliente) return null;

        const { data, error } = await supabase
          .from("clientes")
          .insert(clienteToRow({ nome: linha.nomeCliente, cpf: linha.cpf, codigoSga: linha.codigoSga, status: "Ativo" }))
          .select()
          .single();
        if (error) throw error;
        const novo = rowToCliente(data);
        clientesNovosCriados.push(novo);
        if (cpfLimpo) clientesPorCpf.set(cpfLimpo, novo);
        if (codigoSgaNorm) clientesPorCodigoSga.set(codigoSgaNorm, novo);
        if (nomeNorm) clientesPorNome.set(nomeNorm, novo);
        clientesCriados++;
        return novo;
      }

      for (const linha of linhas) {
        const situacaoNorm = normalizarTexto(linha.situacao);
        const boleto = db.boletos.find((b) => b.nossoNumero && normalizarTexto(b.nossoNumero) === normalizarTexto(linha.nossoNumero));

        if (boleto) {
          const campos = {};
          // Corrige o valor quando o boleto foi criado sem valor (R$ 0,00) e o relatório traz o valor real.
          const valorRelatorio = paraNumeroBR(linha.valor);
          if (valorRelatorio > 0 && !(Number(boleto.valor) > 0)) { campos.valor = valorRelatorio; valoresCorrigidos++; }
          // Corrige o vencimento quando ele era só um "palpite" (igual à data de pagamento) ou estava vazio.
          if (linha.dataVencimento && linha.dataVencimento !== boleto.dataVencimento && (!boleto.dataVencimento || boleto.dataVencimento === boleto.dataPagamento)) {
            campos.data_vencimento = linha.dataVencimento;
          }
          if (situacaoNorm === "aberto") {
            ignoradosAberto++; // nunca reverte uma baixa já feita
          } else if (situacaoNorm === "baixado" || situacaoNorm === "pago") {
            if (boleto.dataPagamento) jaBaixados++;
            else { campos.data_pagamento = linha.dataPagamento || todayISO(); baixados++; }
          }
          // Boleto de 1 veículo só: vincula ao veículo e preenche o "valor mensal" dele.
          const veiculoUnico = veiculoUnicoDaLinha(linha);
          if (veiculoUnico) {
            registrarValorMensal(veiculoUnico, valorRelatorio);
            if (!boleto.veiculoId && veiculoUnico.clienteId === boleto.clienteId) { campos.veiculo_id = veiculoUnico.id; veiculosVinculados++; }
          }
          registrarCpf(db.clientes.find((cl) => cl.id === boleto.clienteId), linha);
          if (Object.keys(campos).length > 0) atualizacoes.push({ id: boleto.id, campos });
          continue;
        }

        // Boleto não existe ainda — garante que o cliente existe (cria se precisar).
        naoEncontrados++;
        const cliente = await buscarOuCriarCliente(linha);
        if (!cliente) continue; // sem nome do cliente na linha, não dá pra criar nada

        const estaPago = situacaoNorm === "baixado" || situacaoNorm === "pago";
        registrarCpf(cliente, linha);

        // Sempre que a linha já vier paga, criamos o boleto também — mesmo que o
        // relatório não traga valor/vencimento (relatórios de baixa do SGA
        // normalmente só confirmam o pagamento, sem repetir esses dados).
        // Nesse caso o valor fica 0,00 até você editar manualmente com o valor real.
        if (estaPago || (linha.valor && linha.dataVencimento)) {
          const veiculoUnico = veiculoUnicoDaLinha(linha);
          const veiculo = veiculoUnico && veiculoUnico.clienteId === cliente.id ? veiculoUnico : null;
          registrarValorMensal(veiculoUnico, paraNumeroBR(linha.valor));
          boletosParaCriar.push(
            boletoToRow({
              clienteId: cliente.id,
              veiculoId: veiculo?.id || null,
              numero: linha.nossoNumero,
              nossoNumero: linha.nossoNumero,
              dataVencimento: linha.dataVencimento || linha.dataPagamento || todayISO(),
              valor: linha.valor || 0,
              dataPagamento: estaPago ? linha.dataPagamento || todayISO() : "",
            })
          );
          boletosCriados++;
          if (!linha.valor) semDadosParaCriarBoleto++; // criado, mas sem valor real — precisa editar depois
        } else {
          semDadosParaCriarBoleto++;
        }
      }

      if (clientesNovosCriados.length > 0) {
        setDb((prev) => ({ ...prev, clientes: [...prev.clientes, ...clientesNovosCriados] }));
      }
      if (boletosParaCriar.length > 0) {
        const { data, error } = await supabase.from("boletos").insert(boletosParaCriar).select();
        if (error) throw error;
        setDb((prev) => ({ ...prev, boletos: [...prev.boletos, ...(data || []).map(rowToBoleto)] }));
      }
      if (atualizacoes.length > 0) {
        const resultados = await Promise.all(
          atualizacoes.map((a) => supabase.from("boletos").update(a.campos).eq("id", a.id).select().single())
        );
        const erro = resultados.find((r) => r.error);
        if (erro) throw erro.error;
        const atualizados = resultados.map((r) => rowToBoleto(r.data));
        setDb((prev) => ({
          ...prev,
          boletos: prev.boletos.map((b) => atualizados.find((a) => a.id === b.id) || b),
        }));
      }

      if (cpfsParaPreencher.size > 0) {
        const lista = Array.from(cpfsParaPreencher.entries());
        const res = await Promise.all(lista.map(([id, cpf]) => supabase.from("clientes").update({ cpf }).eq("id", id)));
        const erro = res.find((r) => r.error);
        if (erro) throw erro.error;
        cpfsPreenchidos = lista.length;
        setDb((prev) => ({ ...prev, clientes: prev.clientes.map((cl) => (cpfsParaPreencher.has(cl.id) ? { ...cl, cpf: cpfsParaPreencher.get(cl.id) } : cl)) }));
      }
      valoresVeiculosPreenchidos = await atualizarValoresMensaisVeiculos(valoresVeiculos);

      notify(
        `Importação concluída:\n` +
        `${baixados} boleto(s) existente(s) baixado(s) agora\n` +
        `${veiculosVinculados} boleto(s) vinculado(s) ao veículo (boletos de 1 veículo)\n` +
        `${valoresVeiculosPreenchidos} veículo(s) com o valor mensal preenchido\n` +
        `${cpfsPreenchidos} cliente(s) com CPF/CNPJ completado\n` +
        `${valoresCorrigidos} boleto(s) existente(s) com o valor corrigido pelo relatório\n` +
        `${jaBaixados} já estavam baixados (sem alteração)\n` +
        `${ignoradosAberto} ainda em aberto no relatório (sem alteração)\n` +
        `${naoEncontrados} não encontrado(s) pelo Nosso Número, sendo:\n` +
        `   • ${clientesCriados} cliente(s) novo(s) cadastrado(s)\n` +
        `   • ${boletosCriados} boleto(s) novo(s) criado(s) (tinham valor e vencimento no relatório)\n` +
        `   • ${semDadosParaCriarBoleto} criado(s) sem o valor real (o relatório não trouxe valor — edite esses boletos depois para corrigir o valor)`
      );
    } catch (e) {
      notify("Não foi possível importar a baixa de boletos: " + e.message);
    }
  };

  const atualizarValoresMensaisVeiculos = async (mapa) => {
    if (!mapa || mapa.size === 0) return 0;
    const lista = Array.from(mapa.entries());
    const resultados = await Promise.all(lista.map(([id, valor]) => supabase.from("veiculos").update({ valor_mensal: valor }).eq("id", id)));
    const erro = resultados.find((r) => r.error);
    if (erro) throw erro.error;
    setDb((prev) => ({ ...prev, veiculos: prev.veiculos.map((v) => (mapa.has(v.id) ? { ...v, valorMensal: mapa.get(v.id) } : v)) }));
    return lista.length;
  };

  const importarVeiculosCSV = async (linhas, semPlaca = 0) => {
    if (linhas.length === 0) return;
    try {
      const normPlaca = (p) => String(p || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const placasExistentes = new Set(db.veiculos.map((v) => normPlaca(v.placa)));

      const porCpf = new Map(db.clientes.filter((c) => c.cpf).map((c) => [c.cpf.replace(/\D/g, ""), c]));
      const porCodigo = new Map(db.clientes.filter((c) => c.codigoSga).map((c) => [normalizarTexto(c.codigoSga), c]));
      const normNome = (s) => normalizarTexto(s).replace(/\s+/g, " ");
      const porNome = new Map(db.clientes.map((c) => [normNome(c.nome), c]));

      const chaves = (l) => ({
        cpf: (l.cpf || "").replace(/\D/g, ""),
        codigo: normalizarTexto(l.codigoSga),
        nome: normNome(l.proprietario),
      });
      const acharDono = (l) => {
        const k = chaves(l);
        return (k.cpf && porCpf.get(k.cpf)) || (k.codigo && porCodigo.get(k.codigo)) || (k.nome && porNome.get(k.nome)) || null;
      };

      // 1) Proprietários que ainda não existem: cria todos de uma vez (sem duplicar)
      const novosDonos = new Map();
      for (const l of linhas) {
        if (acharDono(l) || !l.proprietario) continue;
        const k = chaves(l);
        const chave = k.cpf || (k.codigo ? "sga:" + k.codigo : "nome:" + k.nome);
        if (!novosDonos.has(chave)) novosDonos.set(chave, l);
      }
      let clientesCriados = 0;
      if (novosDonos.size > 0) {
        const payloadClientes = Array.from(novosDonos.values()).map((l) =>
          clienteToRow({ nome: l.proprietario, cpf: l.cpf ? maskCpfCnpj(l.cpf) : "", codigoSga: l.codigoSga, status: "Ativo" })
        );
        const { data, error } = await supabase.from("clientes").insert(payloadClientes).select();
        if (error) throw error;
        const criados = (data || []).map(rowToCliente);
        for (const novo of criados) {
          const cpfLimpo = (novo.cpf || "").replace(/\D/g, "");
          if (cpfLimpo) porCpf.set(cpfLimpo, novo);
          if (novo.codigoSga) porCodigo.set(normalizarTexto(novo.codigoSga), novo);
          porNome.set(normNome(novo.nome), novo);
        }
        clientesCriados = criados.length;
        setDb((prev) => ({ ...prev, clientes: [...prev.clientes, ...criados] }));
      }

      // 2) Veículos: pula placa repetida e linha sem proprietário
      const placasNoArquivo = new Set();
      let jaExistiam = 0, semProprietario = 0;
      const valoresAtualizar = new Map();
      const payload = [];
      for (const l of linhas) {
        const placa = normPlaca(l.placa);
        if (!placa) continue;
        if (placasExistentes.has(placa)) {
          jaExistiam++;
          const existente = db.veiculos.find((x) => normPlaca(x.placa) === placa);
          const valor = l.valorMensal ? paraNumeroBR(l.valorMensal) : 0;
          if (existente && valor > 0 && !(Number(existente.valorMensal) > 0)) valoresAtualizar.set(existente.id, valor);
          continue;
        }
        if (placasNoArquivo.has(placa)) { jaExistiam++; continue; }
        const dono = acharDono(l);
        if (!dono) { semProprietario++; continue; }
        placasNoArquivo.add(placa);
        const st = normalizarTexto(l.status);
        payload.push(
          veiculoToRow({
            clienteId: dono.id, tipoVeiculo: "Carro ou utilitário",
            marca: l.marca || "Não informada", modelo: l.modelo || "Não informado",
            ano: String(l.ano || "").slice(0, 4), anoFabricacao: String(l.anoFabricacao || "").slice(0, 4),
            placa, renavam: l.renavam, chassi: l.chassi, cor: l.cor, combustivel: l.combustivel, codigoFipe: l.codigoFipe,
            quilometragem: "", valorVeiculo: "", valorCoberto: "", valorFipe: "", diaVencimento: "",
            valorMensal: l.valorMensal ? paraNumeroBR(l.valorMensal) : "",
            dataCadastro: l.dataContrato || todayISO(),
            status: st.includes("inativ") || st.includes("cancel") || st.includes("perda") || st.includes("titularidade") ? "Inativo" : "Ativo",
          })
        );
      }

      let cadastrados = 0;
      for (let i = 0; i < payload.length; i += 500) {
        const { data, error } = await supabase.from("veiculos").insert(payload.slice(i, i + 500)).select();
        if (error) throw error;
        cadastrados += data?.length || 0;
        setDb((prev) => ({ ...prev, veiculos: [...prev.veiculos, ...(data || []).map(rowToVeiculo)] }));
      }

      const valoresAtualizados = await atualizarValoresMensaisVeiculos(valoresAtualizar);

      notify(
        `Importação de veículos concluída:\n` +
        `${cadastrados} veículo(s) cadastrado(s) no proprietário\n` +
        `${valoresAtualizados} veículo(s) já cadastrado(s) com o valor mensal preenchido\n` +
        `${clientesCriados} proprietário(s) novo(s) cadastrado(s) como cliente\n` +
        `${jaExistiam} ignorado(s) por já existir veículo com a mesma placa\n` +
        `${semProprietario} ignorado(s) sem proprietário identificado (falta nome, CPF/CNPJ ou código SGA)\n` +
        `${semPlaca} linha(s) sem placa ignorada(s)`
      );
    } catch (e) {
      notify("Não foi possível importar os veículos: " + e.message);
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
      notify(`${planosData?.length || 0} plano(s) importado(s), em ${seguradorasNovasCriadas.length} seguradora(s) nova(s).`);
    } catch (e) {
      notify("Não foi possível importar a tabela de preços: " + e.message);
    }
  };

  const goTo = (v) => { setView(v); setSidebarOpen(false); };

  const titleMap = {
    dashboard: "Dashboard", clientes: "Clientes", veiculos: "Veículos", financeiro: "Financeiro", relatorios: "Relatórios",
    cotacoes: "Cotação de seguros", consultoras: "Consultoras", adesoes: "Adesões", comissoes: "Comissões", usuarios: "Usuários",
    clienteDetail: "Detalhes do cliente",
  };

  const recarregarUsuarios = async () => {
    const { data } = await supabase.from("perfis").select("*").order("nome");
    setDb((prev) => ({ ...prev, usuarios: (data || []).map(rowToUsuario) }));
  };

  if (sessao === undefined) {
    return (
      <div className="nexo" data-theme={tema}>
        <style>{STYLE}</style>
        <div className="nexo-loading"><div className="nexo-spinner" />Verificando acesso…</div>
      </div>
    );
  }

  if (!sessao) {
    return (
      <div className="nexo" data-theme="dark">
        <style>{STYLE}</style>
        <LoginScreen onEntrar={() => {}} />
        <MensagensHost />
      </div>
    );
  }

  const iniciaisUsuario = (perfil?.nome || sessao?.user?.email || "?")
    .split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");

  return (
    <div className="nexo" data-theme={tema}>
      <style>{STYLE}</style>
      <MensagensHost />

      {loading ? (
        <div className="nexo-loading"><div className="nexo-spinner" />Carregando dados…</div>
      ) : loadError ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--text-dim)", fontSize: 13, padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--danger)", fontWeight: 600 }}>Não foi possível conectar ao banco de dados</div>
          <div style={{ maxWidth: 420 }}>{loadError}</div>
          <div style={{ fontSize: 12 }}>Confira se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretas e se as tabelas foram criadas.</div>
          <button className="nexo-btn nexo-btn-primary" onClick={carregarTudo}>Tentar novamente</button>
        </div>
      ) : (
        <div className={`nexo-shell ${menuRecolhido ? "collapsed" : ""}`}>
          <div className={`nexo-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
          <aside className={`nexo-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="nexo-brand">
              <div className="nexo-brand-mark">SS</div>
              <div className="nexo-brand-text">
                <div className="nexo-brand-name">Seu Seguro</div>
                <div className="nexo-brand-tag">Corretora · Gestão</div>
              </div>
              <button className="nexo-collapse-btn" onClick={() => setMenuRecolhido((v) => !v)} title={menuRecolhido ? "Expandir menu" : "Recolher menu"}>
                {menuRecolhido ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              </button>
            </div>
            <nav className="nexo-nav">
              {NAV_GRUPOS.map((grupo) => {
                const itens = grupo.chaves.map((k) => NAV_ITEMS.find((n) => n.key === k)).filter((n) => n && podeVer(n.key));
                if (itens.length === 0) return null;
                return (
                  <React.Fragment key={grupo.titulo || "inicio"}>
                    {grupo.titulo && <div className="nexo-nav-section-title">{grupo.titulo}</div>}
                    {itens.map(({ key, label, Icon }) => (
                      <div
                        key={key}
                        className={`nexo-nav-item ${view === key || (view === "clienteDetail" && key === "clientes") ? "active" : ""}`}
                        onClick={() => goTo(key)}
                        title={menuRecolhido ? label : undefined}
                      >
                        <Icon size={17} /> <span className="nexo-nav-label">{label}</span>
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </nav>
            <div className="nexo-user">
              <div className="nexo-user-avatar">{iniciaisUsuario}</div>
              <div className="nexo-user-meta">
                <div className="nexo-user-name" title={sessao?.user?.email}>{perfil?.nome || sessao?.user?.email}</div>
                <div className="nexo-user-role">{ehAdmin ? "Administrador" : "Operador"}</div>
              </div>
              <button className="nexo-icon-btn" title="Sair" onClick={() => supabase.auth.signOut()}><LogOut size={15} /></button>
            </div>
          </aside>

          <div className="nexo-main">
            <header className="nexo-topbar">
              <div className="nexo-topbar-left">
                <button className="nexo-hamburger" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
                <div className="nexo-topbar-title">
                  {titleMap[view]}
                  <span className="nexo-topbar-sub">{SUBTITULOS[view]}</span>
                </div>
              </div>
              <BuscaGlobal db={db} onAbrirCliente={openDetail} />
              <div className="nexo-topbar-actions">
                <div className="nexo-novo-wide hide-mobile">
                  <button className="nexo-btn nexo-btn-sm" onClick={() => openModal("cliente")}><Plus size={13} /> Cliente</button>
                  <button className="nexo-btn nexo-btn-sm" onClick={() => openModal("veiculo")}><Plus size={13} /> Veículo</button>
                  <button className="nexo-btn nexo-btn-sm nexo-btn-primary" onClick={() => openModal("boleto")}><Plus size={13} /> Boleto</button>
                </div>
                <MenuNovo onNovo={(tipo) => openModal(tipo)} />
                <SinoAvisos db={db} onIr={goTo} />
                <button className="nexo-icon-btn" onClick={() => setTema((t) => (t === "dark" ? "light" : "dark"))} title={tema === "dark" ? "Mudar para o modo claro" : "Mudar para o modo escuro"}>
                  {tema === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </header>

            <main key={view === "clienteDetail" ? "d" + selectedClienteId : view} className="nexo-content">
              <ErrorBoundary resetKey={view + (selectedClienteId || "")}>
              {view === "dashboard" && <Dashboard db={db} onOpenModal={openModal} tema={tema} onOpenDetail={openDetail} onIr={goTo} />}
              {view === "clientes" && (
                <ClientesView db={db} onOpenModal={openModal} onDeleteCliente={deleteCliente} onOpenDetail={openDetail} onImportarClientes={importarClientesCSV} />
              )}
              {view === "veiculos" && (
                <VeiculosView db={db} onOpenModal={openModal} onDeleteVeiculo={deleteVeiculo} onOpenDetail={openDetail} onImportarVeiculos={importarVeiculosCSV} />
              )}
              {view === "financeiro" && (
                <FinanceiroView db={db} onOpenModal={openModal} onDeleteBoleto={deleteBoleto} onMarcarPago={marcarPago} onImportarBaixa={importarBaixaBoletosCSV} />
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
                  onAtualizarLinkPortal={atualizarLinkPortalSeguradora}
                />
              )}
              {view === "consultoras" && <ConsultorasView db={db} onOpenModal={openModal} onDeleteConsultora={deleteConsultora} onDeleteComissao={deleteComissao} onMarcarPagaComissao={marcarPagaComissao} />}
              {view === "adesoes" && <AdesoesView db={db} onOpenModal={openModal} onDeleteAdesao={deleteAdesao} onMarcarRecebida={marcarRecebidaAdesao} onGerarPagamento={gerarPagamentoAdesao} />}
              {view === "comissoes" && (
                <ComissoesCorretoraView db={db} onOpenModal={openModal} onDeleteLancamento={deleteLancamento} />
              )}
              {view === "usuarios" && ehAdmin && (
                <UsuariosView db={db} sessao={sessao} meuUserId={sessao?.user?.id} onRecarregarUsuarios={recarregarUsuarios} />
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
              </ErrorBoundary>
            </main>
          </div>
        </div>
      )}

      <ErrorBoundary fallback={null} resetKey={modal ? modal.type + (modal.data?.id || "") : ""} onError={(e) => { closeModal(); notify("Não foi possível abrir esta janela: " + (e.message || e)); }}>
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
        <Modal title={modal.data?.id ? "Editar consultora" : "Nova consultora"} onClose={closeModal} wide>
          <ConsultoraForm initial={modal.data} onSave={saveConsultora} onCancel={closeModal} />
        </Modal>
      )}
      {modal && modal.type === "adesao" && (
        <Modal title={modal.data?.id ? "Editar adesão" : "Nova adesão"} onClose={closeModal} wide>
          <AdesaoForm initial={modal.data} clientes={db.clientes} consultoras={db.consultoras} seguradoras={db.seguradoras} onSave={saveAdesao} onCancel={closeModal} />
        </Modal>
      )}
      {modal && modal.type === "fonte" && (
        <Modal title={modal.data?.id ? "Regra de comissão" : "Nova fonte de comissão"} onClose={closeModal}>
          <FonteForm initial={modal.data} outraAutomatica={db.seguradoras.some((s) => s.comissaoAutomatica && s.id !== modal.data?.id)} onSave={saveFonteComissao} onCancel={closeModal} />
        </Modal>
      )}
      {modal && modal.type === "lancamento" && (
        <Modal title={modal.data?.id ? "Editar lançamento" : "Novo lançamento de comissão"} onClose={closeModal} wide>
          <LancamentoForm initial={modal.data} seguradoras={db.seguradoras} clientes={db.clientes} onSave={saveLancamento} onCancel={closeModal} />
        </Modal>
      )}
      {modal && modal.type === "comissao" && (
        <Modal title={modal.data ? "Editar comissão" : "Nova comissão"} onClose={closeModal} wide>
          <ComissaoForm initial={modal.data} clientes={db.clientes} consultoras={db.consultoras} onSave={saveComissao} onCancel={closeModal} />
        </Modal>
      )}
      </ErrorBoundary>
    </div>
  );
}
