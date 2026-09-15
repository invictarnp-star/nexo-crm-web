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
  Menu, ArrowLeft, Clock, FileText, Wallet, TrendingUp, TrendingDown, ChevronRight, ChevronDown,
  CreditCard, MessageCircle, ListFilter, RotateCcw, Eye, Upload, Shield, FileDown, Printer,
  Link2, ExternalLink, PartyPopper, Bell, Bot, Send, LogOut, PanelLeftClose, PanelLeftOpen,
  ArrowUpRight, Sparkles, UserCircle2, Download, SlidersHorizontal, Info
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Tokens & global style                                               */
/* ------------------------------------------------------------------ */

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

.nexo {
  --ink: #0A0E14;
  --surface: #121922;
  --surface-2: #19222D;
  --surface-3: #202B38;
  --surface-raised: #1B2530;
  --border: #263241;
  --border-soft: #1D2732;
  --border-strong: #324256;
  --text: #EDF1F5;
  --text-dim: #92A2B2;
  --text-faint: #56646F;
  --accent: #3E86BF;
  --accent-2: #5AA7DC;
  --accent-dim: #2C5F87;
  --accent-soft: rgba(62,134,191,0.14);
  --accent-ring: rgba(62,134,191,0.35);
  --success: #34B172;
  --success-soft: rgba(52,177,114,0.14);
  --warning: #DB9B3D;
  --warning-soft: rgba(219,155,61,0.14);
  --danger: #DD5F52;
  --danger-soft: rgba(221,95,82,0.14);
  --info: #7A8FB0;
  --info-soft: rgba(122,143,176,0.16);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.24);
  --shadow-md: 0 8px 24px -8px rgba(0,0,0,0.45);
  --shadow-lg: 0 20px 48px -16px rgba(0,0,0,0.55);
  --shadow-glow: 0 8px 22px -6px rgba(62,134,191,0.45);
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--ink);
  color: var(--text);
  min-height: 100vh;
  width: 100%;
  position: relative;
  -webkit-font-smoothing: antialiased;
}
.nexo * { box-sizing: border-box; }
.nexo .mono { font-family: 'JetBrains Mono', monospace; }
.nexo ::-webkit-scrollbar { width: 10px; height: 10px; }
.nexo ::-webkit-scrollbar-track { background: transparent; }
.nexo ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 20px; border: 2px solid var(--ink); }
.nexo *:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }

@keyframes nexoFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.nexo-fade-in { animation: nexoFadeUp .28s cubic-bezier(.16,1,.3,1) both; }
@media (prefers-reduced-motion: reduce) { .nexo-fade-in { animation: none; } }

/* Layout */
.nexo-shell { display: flex; min-height: 100vh; }
.nexo-sidebar {
  width: 240px; flex-shrink: 0; background: var(--surface);
  border-right: 1px solid var(--border-soft); padding: 18px 12px;
  display: flex; flex-direction: column; gap: 14px;
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 40;
  transition: transform .25s ease, width .2s ease;
}
.nexo-sidebar.collapsed { width: 72px; }
.nexo-brand { display: flex; align-items: center; gap: 10px; padding: 6px 8px 12px; border-bottom: 1px solid var(--border-soft); margin-bottom: 4px; }
.nexo-brand-mark {
  width: 36px; height: 36px; border-radius: var(--radius-md); flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent-2), var(--accent-dim));
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 14.5px; color: #fff; letter-spacing: -0.5px;
  box-shadow: var(--shadow-glow);
}
.nexo-brand-text { min-width: 0; overflow: hidden; }
.nexo-sidebar.collapsed .nexo-brand-text, .nexo-sidebar.collapsed .nexo-sidebar-group-label,
.nexo-sidebar.collapsed .nexo-nav-item span, .nexo-sidebar.collapsed .nexo-sidebar-foot-info,
.nexo-sidebar.collapsed .nexo-collapse-btn span { display: none; }
.nexo-sidebar.collapsed .nexo-brand { justify-content: center; }
.nexo-sidebar.collapsed .nexo-nav-item { justify-content: center; padding: 10px; }
.nexo-brand-name { font-weight: 700; font-size: 15.5px; letter-spacing: -0.2px; line-height: 1.2; white-space: nowrap; }
.nexo-brand-tag { font-size: 10.5px; color: var(--text-faint); margin-top: 2px; white-space: nowrap; }
.nexo-sidebar-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; gap: 14px; margin: 0 -4px; padding: 0 4px; }
.nexo-sidebar-group-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: .7px; color: var(--text-dim); font-weight: 800; padding: 8px 12px 6px; white-space: nowrap; opacity: .85; }
.nexo-nav { display: flex; flex-direction: column; gap: 2px; }
.nexo-nav-item {
  position: relative; display: flex; align-items: center; gap: 11px; padding: 9px 12px;
  border-radius: var(--radius-sm); color: var(--text-dim); font-size: 13.5px; font-weight: 500;
  cursor: pointer; border: 1px solid transparent; user-select: none; white-space: nowrap;
  transition: background .12s ease, color .12s ease;
}
.nexo-nav-item svg { flex-shrink: 0; }
.nexo-nav-item:hover { background: var(--surface-2); color: var(--text); }
.nexo-nav-item.active { background: var(--accent-soft); color: var(--text); border-color: var(--accent-ring); }
.nexo-nav-item.active::before { content: ""; position: absolute; left: -12px; top: 6px; bottom: 6px; width: 3px; border-radius: 4px; background: var(--accent-2); }
.nexo-sidebar.collapsed .nexo-nav-item.active::before { display: none; }
.nexo-nav-item.active svg { color: var(--accent-2); }
.nexo-nav-tooltip {
  position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
  background: var(--surface-3); color: var(--text); font-size: 12px; font-weight: 600;
  padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border);
  white-space: nowrap; box-shadow: var(--shadow-md); opacity: 0; pointer-events: none;
  transition: opacity .12s ease; z-index: 50;
}
.nexo-sidebar.collapsed .nexo-nav-item:hover .nexo-nav-tooltip { opacity: 1; }
.nexo-collapse-btn {
  display: flex; align-items: center; gap: 8px; justify-content: center; margin: 0 4px;
  padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-soft); background: var(--surface-2);
  color: var(--text-faint); cursor: pointer; font-size: 11.5px; font-weight: 600;
}
.nexo-collapse-btn:hover { color: var(--text); border-color: var(--border-strong); }
.nexo-sidebar-foot { font-size: 10.5px; color: var(--text-faint); padding: 10px 6px 2px; border-top: 1px solid var(--border-soft); display: flex; flex-direction: column; gap: 8px; }
.nexo-sidebar-foot-info { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.nexo-main { margin-left: 240px; flex: 1; min-width: 0; display: flex; flex-direction: column; transition: margin-left .2s ease; }
.nexo-main.sidebar-collapsed { margin-left: 72px; }
.nexo-topbar {
  height: 64px; border-bottom: 1px solid var(--border-soft); background: rgba(10,14,20,0.78);
  backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; position: sticky; top: 0; z-index: 30; gap: 16px;
}
.nexo-topbar-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.nexo-topbar-title { font-size: 16px; font-weight: 700; letter-spacing: -0.2px; display:flex; flex-direction: column; line-height: 1.25;}
.nexo-topbar-greeting { font-size: 11px; color: var(--text-faint); font-weight: 500; }
.nexo-topbar-search {
  display: flex; align-items: center; gap: 8px; background: var(--surface-2); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 8px 12px; width: 280px; max-width: 32vw; color: var(--text-faint);
  transition: border-color .15s, background .15s;
}
.nexo-topbar-search:focus-within { border-color: var(--accent-dim); background: var(--surface-3); }
.nexo-topbar-search input { background: none; border: none; outline: none; color: var(--text); font-size: 13px; width: 100%; font-family: inherit; }
.nexo-topbar-search input::placeholder { color: var(--text-faint); }
.nexo-topbar-search kbd { font-size: 10.5px; color: var(--text-faint); border: 1px solid var(--border); border-radius: 4px; padding: 1px 5px; font-family: inherit; }
.nexo-topbar-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; align-items: center;}
.nexo-hamburger { display: none; background: none; border: none; color: var(--text); cursor: pointer; padding: 6px;}
.nexo-content { padding: 26px 28px 64px; flex: 1; }
.nexo-overlay { display:none; }

.nexo-topbar-iconbtn { position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--surface-2); color: var(--text-dim); cursor: pointer; }
.nexo-topbar-iconbtn:hover { color: var(--text); border-color: var(--border-strong); }
.nexo-notif-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 50%; background: var(--danger); border: 2px solid var(--surface-2); }
.nexo-user-chip { display: flex; align-items: center; gap: 9px; padding: 5px 10px 5px 5px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface-2); cursor: pointer; }
.nexo-user-chip:hover { border-color: var(--border-strong); }
.nexo-user-chip-name { font-size: 12.5px; font-weight: 600; line-height: 1.2; }
.nexo-user-chip-role { font-size: 10.5px; color: var(--text-faint); line-height: 1.2; }

/* Buttons */
.nexo-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-family: inherit;
  font-size: 13px; font-weight: 600; padding: 9px 15px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); background: var(--surface-2); color: var(--text);
  cursor: pointer; white-space: nowrap; transition: border-color .15s, background .15s, transform .08s, box-shadow .15s;
}
.nexo-btn:hover { border-color: var(--accent-dim); background: var(--surface-3); }
.nexo-btn:active { transform: translateY(1px); }
.nexo-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.nexo-btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; box-shadow: 0 1px 0 rgba(255,255,255,0.08) inset; }
.nexo-btn-primary:hover { background: #3679AC; border-color: #3679AC; box-shadow: var(--shadow-glow); }
.nexo-btn-ghost { background: transparent; border-color: transparent; color: var(--text-dim); }
.nexo-btn-ghost:hover { background: var(--surface-2); color: var(--text); border-color: transparent; }
.nexo-btn-danger { color: var(--danger); }
.nexo-btn-danger:hover { border-color: var(--danger); background: var(--danger-soft); }
.nexo-btn-success { background: var(--success); border-color: var(--success); color: #fff; }
.nexo-btn-success:hover { background: #2C9A63; border-color: #2C9A63; }
.nexo-btn-sm { padding: 6px 11px; font-size: 12px; }
.nexo-btn-block { width: 100%; }
.nexo-btn .nexo-spinner { animation: nexoSpin .7s linear infinite; }
.nexo-btn.is-loading { color: transparent !important; pointer-events: none; position: relative; }
.nexo-btn.is-loading::after {
  content: ""; position: absolute; width: 15px; height: 15px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; animation: nexoSpin .7s linear infinite;
}
.nexo-btn-ghost.is-loading::after, .nexo-btn:not(.nexo-btn-primary):not(.nexo-btn-success).is-loading::after { border: 2px solid var(--border-strong); border-top-color: var(--text); }
@keyframes nexoSpin { to { transform: rotate(360deg); } }
.nexo-icon-btn {
  width: 31px; height: 31px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface-2); color: var(--text-dim);
  cursor: pointer; transition: color .12s, border-color .12s, background .12s;
}
.nexo-icon-btn:hover { color: var(--text); border-color: var(--accent-dim); background: var(--surface-3); }
.nexo-icon-btn.danger:hover { color: var(--danger); border-color: var(--danger); background: var(--danger-soft); }
.nexo-btn-group { display: inline-flex; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border); }
.nexo-btn-group .nexo-btn { border: none; border-radius: 0; border-right: 1px solid var(--border); }
.nexo-btn-group .nexo-btn:last-child { border-right: none; }

/* Dropdown menu */
.nexo-dropdown { position: relative; display: inline-block; }
.nexo-dropdown-menu {
  position: absolute; right: 0; top: calc(100% + 6px); min-width: 200px; background: var(--surface-3);
  border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 45;
  padding: 6px; display: flex; flex-direction: column; gap: 1px;
}
.nexo-dropdown-item { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: var(--radius-sm); font-size: 13px; color: var(--text-dim); cursor: pointer; background: none; border: none; text-align: left; font-family: inherit; width: 100%; }
.nexo-dropdown-item:hover { background: var(--surface-2); color: var(--text); }
.nexo-dropdown-item svg { color: var(--text-faint); flex-shrink: 0; }
.nexo-dropdown-sep { height: 1px; background: var(--border-soft); margin: 5px 2px; }

/* Cards */
.nexo-card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); padding: 18px; box-shadow: var(--shadow-sm); }
.nexo-card-title { font-size: 13.5px; font-weight: 700; }
.nexo-card-sub { font-size: 11.5px; color: var(--text-faint); margin-top: 2px; }
.nexo-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(196px, 1fr)); gap: 14px; margin-bottom: 20px; }
.nexo-kpi {
  background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius-lg);
  padding: 17px 18px 16px; position: relative; overflow: hidden; box-shadow: var(--shadow-sm);
  transition: border-color .15s, transform .15s;
}
.nexo-kpi:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.nexo-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.nexo-kpi-icon { width: 34px; height: 34px; border-radius: var(--radius-sm); display:flex; align-items:center; justify-content:center; flex-shrink: 0;}
.nexo-kpi-label { font-size: 12px; color: var(--text-dim); font-weight: 600; margin-bottom: 6px;}
.nexo-kpi-value { font-size: 22px; font-weight: 800; letter-spacing: -0.4px; line-height: 1; }
.nexo-kpi-foot { margin-top: 8px; font-size: 11px; color: var(--text-faint); }
.nexo-trend { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 700; padding: 2px 7px 2px 5px; border-radius: 999px; }
.nexo-trend.up { color: var(--success); background: var(--success-soft); }
.nexo-trend.down { color: var(--danger); background: var(--danger-soft); }
.nexo-trend.flat { color: var(--text-faint); background: var(--surface-2); }
.nexo-charts-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 14px; margin-bottom: 14px;}
.nexo-charts-grid > * { min-width: 0; }
.nexo-chart-title { font-size: 13.5px; font-weight: 700; margin-bottom: 2px; }
.nexo-chart-sub { font-size: 11.5px; color: var(--text-faint); margin-bottom: 16px; }

/* Section header */
.nexo-section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;}
.nexo-section-title { font-size: 19px; font-weight: 800; letter-spacing: -0.4px; }
.nexo-section-sub { font-size: 12.5px; color: var(--text-faint); margin-top: 3px; font-weight: 500; }
.nexo-section-count { font-size: 12.5px; color: var(--text-faint); font-weight: 500; margin-left: 8px;}
.nexo-section-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

/* Search & filters */
.nexo-searchbar { display:flex; align-items:center; gap:8px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 9px 12px; max-width: 380px; flex: 1; transition: border-color .15s;}
.nexo-searchbar:focus-within { border-color: var(--accent-dim); }
.nexo-searchbar svg { color: var(--text-faint); flex-shrink: 0; }
.nexo-searchbar input { background:none; border:none; outline:none; color: var(--text); font-size: 13px; width: 100%; font-family:inherit;}
.nexo-searchbar input::placeholder { color: var(--text-faint); }
.nexo-filters { background: var(--surface); border:1px solid var(--border-soft); border-radius: var(--radius-lg); padding: 14px 16px; margin-bottom: 16px; display:flex; flex-wrap:wrap; gap: 12px; align-items:flex-end;}
.nexo-filter-field { display:flex; flex-direction:column; gap:5px; min-width: 130px; flex:1;}
.nexo-filter-field label { font-size: 10.5px; text-transform:uppercase; letter-spacing:.4px; color: var(--text-faint); font-weight:600;}
.nexo-filter-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 5px 10px; border-radius: 999px; background: var(--accent-soft); color: var(--accent-2); border: 1px solid var(--accent-ring); }
.nexo-filter-chip button { background: none; border: none; color: inherit; cursor: pointer; display: flex; padding: 0; }

/* Inputs */
.nexo-input, .nexo-select, .nexo-textarea {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
  border-radius: var(--radius-sm); padding: 9px 11px; font-size: 13px; font-family: inherit; outline: none; width: 100%;
  transition: border-color .12s, background .12s;
}
.nexo-input:focus, .nexo-select:focus, .nexo-textarea:focus { border-color: var(--accent); background: var(--surface-3); }
.nexo-input:disabled, .nexo-select:disabled, .nexo-textarea:disabled { opacity: .55; cursor: not-allowed; }
.nexo-textarea { resize: vertical; min-height: 60px; }
.nexo-field { display:flex; flex-direction:column; gap: 6px; }
.nexo-field label { font-size: 12px; color: var(--text-dim); font-weight: 600; }
.nexo-field-error { font-size: 11px; color: var(--danger); display: flex; align-items: center; gap: 4px; }
.nexo-field-row { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.nexo-field-row3 { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.nexo-checkbox { width: 16px; height: 16px; border-radius: 4px; border: 1px solid var(--border-strong); background: var(--surface-2); accent-color: var(--accent); cursor: pointer; }

/* Table */
.nexo-table-wrap { background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); }
.nexo-table-scroll { overflow-x: auto; }
.nexo-table { width: 100%; border-collapse: collapse; min-width: 640px; }
.nexo-table th {
  text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .6px;
  color: var(--text-faint); font-weight: 700; padding: 13px 16px; border-bottom: 1px solid var(--border-soft);
  white-space: nowrap; background: var(--surface-2);
}
.nexo-table td { padding: 13px 16px; font-size: 13px; border-bottom: 1px solid var(--border-soft); vertical-align: middle; }
.nexo-table tr:last-child td { border-bottom: none; }
.nexo-table tbody tr { transition: background .1s; }
.nexo-table tbody tr:hover { background: var(--surface-2); }
.nexo-row-link { cursor: pointer; }
.nexo-cell-muted { color: var(--text-faint); font-size: 12px; }
.nexo-cell-strong { font-weight: 600; }
.nexo-actions-cell { display:flex; gap: 6px; justify-content:flex-end; }
.nexo-table-foot { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--border-soft); background: var(--surface-2); }
.nexo-pagination { display: flex; align-items: center; gap: 4px; }
.nexo-pagination button { width: 28px; height: 28px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface-3); color: var(--text-dim); cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
.nexo-pagination button:hover:not(:disabled) { color: var(--text); border-color: var(--border-strong); }
.nexo-pagination button:disabled { opacity: .4; cursor: not-allowed; }
.nexo-progress-track { width: 100%; height: 6px; border-radius: 999px; background: var(--surface-3); overflow: hidden; }
.nexo-progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--success), var(--accent-2)); transition: width .3s ease; }
.nexo-ai-fab { transition: transform .15s ease, box-shadow .15s ease; }
.nexo-ai-fab:hover { transform: translateY(-2px) scale(1.04); }
.nexo-pagination button.active { background: var(--accent); border-color: var(--accent); color: #fff; }

/* Badges */
.nexo-badge { display:inline-flex; align-items:center; gap:5px; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
.nexo-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink:0; }
.nexo-avatar { width: 52px; height: 52px; border-radius: var(--radius-md); background: var(--accent-soft); color: var(--accent-2); display:flex; align-items:center; justify-content:center; font-weight: 700; font-size: 19px; flex-shrink: 0; }
.nexo-avatar-sm { width: 34px; height: 34px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 700; display:flex; align-items:center; justify-content:center; flex-shrink: 0; color: #fff; }
.nexo-avatar-xs { width: 27px; height: 27px; border-radius: 50%; font-size: 11px; font-weight: 700; display:flex; align-items:center; justify-content:center; flex-shrink: 0; color: #fff; }
.nexo-name-cell { display: flex; align-items: center; gap: 11px; }

/* Skeleton */
@keyframes nexoShimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
.nexo-skeleton { background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 37%, var(--surface-2) 63%); background-size: 400px 100%; animation: nexoShimmer 1.4s ease infinite; border-radius: var(--radius-sm); }
.nexo-skeleton-line { height: 12px; margin-bottom: 8px; }
.nexo-skeleton-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(196px, 1fr)); gap: 14px; margin-bottom: 20px; }
.nexo-skeleton-card { height: 106px; border-radius: var(--radius-lg); }

/* Empty state */
.nexo-empty { text-align:center; padding: 60px 20px; color: var(--text-faint); }
.nexo-empty svg { margin-bottom: 12px; opacity: .5; }
.nexo-empty-title { color: var(--text-dim); font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.nexo-empty-sub { font-size: 12.5px; }

/* Toasts */
.nexo-toast-wrap { position: fixed; top: 18px; right: 18px; z-index: 200; display: flex; flex-direction: column; gap: 10px; max-width: min(360px, calc(100vw - 32px)); }
@keyframes nexoToastIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
.nexo-toast { display: flex; align-items: flex-start; gap: 10px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-md); padding: 12px 14px; box-shadow: var(--shadow-lg); font-size: 13px; animation: nexoToastIn .22s cubic-bezier(.16,1,.3,1) both; }
.nexo-toast svg { flex-shrink: 0; margin-top: 1px; }
.nexo-toast.success { border-left: 3px solid var(--success); }
.nexo-toast.success svg { color: var(--success); }
.nexo-toast.error { border-left: 3px solid var(--danger); }
.nexo-toast.error svg { color: var(--danger); }
.nexo-toast.info { border-left: 3px solid var(--info); }
.nexo-toast.info svg { color: var(--info); }
.nexo-toast.warning { border-left: 3px solid var(--warning); }
.nexo-toast.warning svg { color: var(--warning); }
.nexo-toast-close { margin-left: auto; background: none; border: none; color: var(--text-faint); cursor: pointer; padding: 0; display: flex; }
.nexo-toast-close:hover { color: var(--text); }

/* Confirm dialog */
.nexo-confirm-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }

/* Modal */
.nexo-modal-overlay { position: fixed; inset: 0; background: rgba(4,6,9,0.65); z-index: 100; display:flex; align-items:flex-start; justify-content:center; overflow-y:auto; padding: 40px 16px; backdrop-filter: blur(2px); }
@keyframes nexoModalIn { from { opacity: 0; transform: translateY(10px) scale(.99); } to { opacity: 1; transform: none; } }
.nexo-modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 480px; box-shadow: var(--shadow-lg); animation: nexoModalIn .2s cubic-bezier(.16,1,.3,1) both; }
.nexo-modal.wide { max-width: 620px; }
.nexo-modal-head { display:flex; align-items:center; justify-content:space-between; padding: 18px 20px; border-bottom: 1px solid var(--border-soft); }
.nexo-modal-head h3 { font-size: 15.5px; font-weight: 700; margin: 0; }
.nexo-modal-body { padding: 20px; display:flex; flex-direction:column; gap: 14px; }
.nexo-modal-foot { display:flex; justify-content:flex-end; gap: 8px; padding: 16px 20px; border-top: 1px solid var(--border-soft); }

/* Tooltip (generic) */
.nexo-tt { position: relative; display: inline-flex; }
.nexo-tt-bubble { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: var(--surface-3); border: 1px solid var(--border); color: var(--text); font-size: 11.5px; font-weight: 500; padding: 6px 9px; border-radius: var(--radius-sm); white-space: nowrap; box-shadow: var(--shadow-md); opacity: 0; pointer-events: none; transition: opacity .12s ease; z-index: 50; }
.nexo-tt:hover .nexo-tt-bubble { opacity: 1; }

/* Client detail */
.nexo-detail-grid { display:grid; grid-template-columns: 300px 1fr; gap: 16px; align-items:start; }
.nexo-detail-grid > * { min-width: 0; }
.nexo-info-row { display:flex; align-items:center; gap: 9px; font-size: 13px; color: var(--text-dim); padding: 8px 0; border-bottom: 1px solid var(--border-soft); }
.nexo-info-row:last-child { border-bottom: none; }
.nexo-info-row svg { color: var(--text-faint); flex-shrink:0; }
.nexo-veiculo-card { border: 1px solid var(--border-soft); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 10px; background: var(--surface-2); transition: border-color .12s; }
.nexo-veiculo-card:hover { border-color: var(--border-strong); }
.nexo-veiculo-card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px; }
.nexo-mini-kpis { display:grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
.nexo-mini-kpi { background: var(--surface-2); border: 1px solid var(--border-soft); border-radius: var(--radius-md); padding: 12px 14px; }
.nexo-mini-kpi-label { font-size: 11px; color: var(--text-faint); margin-bottom: 4px; }
.nexo-mini-kpi-value { font-size: 16px; font-weight: 700; }
.nexo-tabs { display:flex; gap: 4px; border-bottom: 1px solid var(--border-soft); margin-bottom: 16px; overflow-x: auto; }
.nexo-tab { padding: 9px 4px; margin-right: 20px; font-size: 13px; font-weight: 600; color: var(--text-faint); cursor:pointer; border-bottom: 2px solid transparent; white-space: nowrap; transition: color .12s; }
.nexo-tab:hover { color: var(--text-dim); }
.nexo-tab.active { color: var(--text); border-color: var(--accent-2); }

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
.nexo-login-quote span { color: var(--accent-2); }
.nexo-login-hero-icons { display: flex; align-items: center; gap: 18px; margin-top: 26px; color: var(--text-dim); flex-wrap: wrap; }
.nexo-login-hero-icons .item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; }
.nexo-login-hero-icons svg { color: var(--accent-2); }
.nexo-login-hero-foot { position: relative; z-index: 2; font-size: 12px; color: var(--text-dim); animation: nexoLoginFade .9s ease .15s both; }

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
@media (max-width: 1180px) {
  .nexo-topbar-search { width: 200px; }
}
@media (max-width: 1024px) {
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
@media (max-width: 900px) {
  .nexo-topbar-search { display: none; }
}
@media (max-width: 768px) {
  .nexo-sidebar { transform: translateX(-100%); box-shadow: 20px 0 40px rgba(0,0,0,0.3); width: 240px !important; }
  .nexo-sidebar.open { transform: translateX(0); }
  .nexo-sidebar .nexo-brand-text, .nexo-sidebar .nexo-sidebar-group-label, .nexo-sidebar .nexo-nav-item span, .nexo-sidebar .nexo-sidebar-foot-info { display: block !important; }
  .nexo-sidebar .nexo-nav-item { justify-content: flex-start !important; padding: 9px 12px !important; }
  .nexo-sidebar .nexo-brand { justify-content: flex-start !important; }
  .nexo-collapse-btn { display: none; }
  .nexo-main, .nexo-main.sidebar-collapsed { margin-left: 0; }
  .nexo-hamburger { display: inline-flex; align-items:center; justify-content:center; }
  .nexo-content { padding: 16px 14px 40px; }
  .nexo-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .nexo-mini-kpis { grid-template-columns: repeat(2,1fr); }
  .nexo-field-row, .nexo-field-row3 { grid-template-columns: 1fr; }
  .nexo-overlay.open { display:block; position: fixed; inset:0; background: rgba(0,0,0,0.45); z-index: 39; }
  .nexo-topbar { padding: 0 14px; }
  .nexo-topbar-greeting { display: none; }
  .nexo-user-chip-role { display: none; }
  .hide-mobile { display: none !important; }
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
const AVATAR_HUES = ["#3E86BF", "#34B172", "#DB9B3D", "#B08BF0", "#DD5F52", "#5AA7DC", "#3FB8AF"];
function getIniciais(nome) {
  return (nome || "").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "?";
}
function getAvatarColor(nome) {
  const s = nome || "";
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_HUES[hash % AVATAR_HUES.length];
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
/** Monta o link do WhatsApp Web/App a partir de um telefone (com ou sem DDI/máscara).
 * Números brasileiros sem o "55" na frente recebem o DDI automaticamente.
 * "mensagem" (opcional) já vem preenchida na conversa, pronta para revisar e enviar. */
function linkWhatsApp(numero, mensagem) {
  const digitos = (numero || "").replace(/\D/g, "");
  if (!digitos) return "";
  const comDDI = digitos.length > 11 ? digitos : `55${digitos}`;
  const base = `https://wa.me/${comDDI}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

/** Retorna os clientes cujo aniversário (dia e mês do campo "nascimento") é hoje. */
function aniversariantesDeHoje(clientes) {
  const hoje = new Date();
  const diaHoje = hoje.getDate();
  const mesHoje = hoje.getMonth() + 1;
  return (clientes || []).filter((c) => {
    if (!c.nascimento) return false;
    const [, mes, dia] = c.nascimento.split("-").map(Number);
    return dia === diaHoje && mes === mesHoje;
  });
}

/** Retorna os clientes com CNH cadastrada que já venceu ou vai vencer nos
 * próximos `dias` dias (padrão 30 — dá tempo do cliente providenciar a
 * renovação), do mais urgente pro menos urgente. */
function cnhsVencendo(clientes, dias = 30) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  return (clientes || [])
    .filter((c) => c.cnhValidade)
    .map((c) => {
      const venc = parseISODate(c.cnhValidade);
      const diasRestantes = Math.round((venc - hoje) / 86400000);
      return { ...c, diasRestantes };
    })
    .filter((c) => c.diasRestantes <= dias)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
}

/** Monta um resumo em texto, só com contagens e totais (SEM nenhum dado
 * pessoal de cliente), para dar contexto ao assistente de IA sem que
 * informação sensível saia do sistema. */
function montarContextoAssistente(db) {
  const boletosComStatus = (db.boletos || []).map((b) => ({ ...b, status: computeBoletoStatus(b) }));
  const pagos = boletosComStatus.filter((b) => b.status === "Pago").length;
  const emAberto = boletosComStatus.filter((b) => b.status === "Em aberto").length;
  const aVencer = boletosComStatus.filter((b) => b.status === "A vencer").length;
  const vencidos = boletosComStatus.filter((b) => b.status === "Vencido").length;
  const valorEmAberto = sum(boletosComStatus.filter((b) => b.status !== "Pago").map((b) => b.valor));
  const clientesAtivos = (db.clientes || []).filter((c) => c.status === "Ativo").length;
  const clientesInativos = (db.clientes || []).length - clientesAtivos;
  const veiculosAtivos = (db.veiculos || []).filter((v) => v.status === "Ativo").length;
  const veiculosInativos = (db.veiculos || []).length - veiculosAtivos;
  const qtdAniversariantesHoje = aniversariantesDeHoje(db.clientes).length;
  const qtdCnhVencendo = cnhsVencendo(db.clientes, 30).length;

  return [
    `Clientes: ${(db.clientes || []).length} cadastrados (${clientesAtivos} ativos, ${clientesInativos} inativos).`,
    `Veículos: ${(db.veiculos || []).length} cadastrados (${veiculosAtivos} ativos, ${veiculosInativos} inativos).`,
    `Boletos: ${boletosComStatus.length} no total — ${pagos} pagos, ${emAberto} em aberto, ${aVencer} a vencer nos próximos 7 dias, ${vencidos} vencidos.`,
    `Valor total em aberto (não pago, soma de tudo que não é "Pago"): ${formatBRL(valorEmAberto)}.`,
    qtdAniversariantesHoje > 0 ? `${qtdAniversariantesHoje} cliente(s) fazendo aniversário hoje.` : null,
    qtdCnhVencendo > 0 ? `${qtdCnhVencendo} CNH(s) vencida(s) ou vencendo nos próximos 30 dias.` : null,
  ].filter(Boolean).join("\n");
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

/* ------------------------------------------------------------------ */
/* Notificações (toast) e confirmação — substituem alert()/confirm()   */
/* Bus global simples: qualquer função do app pode chamar showToast()  */
/* ou confirmDialog() sem precisar receber props, já que só existe um  */
/* <ToastHost/> e um <ConfirmHost/>, montados uma vez na raiz do app.  */
/* ------------------------------------------------------------------ */
let _setToasts = null;
let _toastSeq = 1;
function showToast(message, type = "info") {
  if (!_setToasts) return;
  const id = _toastSeq++;
  _setToasts((prev) => [...prev, { id, message, type }]);
  setTimeout(() => {
    if (_setToasts) _setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 5500);
}

function ToastHost() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    _setToasts = setToasts;
    return () => { _setToasts = null; };
  }, []);
  if (toasts.length === 0) return null;
  const iconFor = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle };
  return (
    <div className="nexo-toast-wrap">
      {toasts.map((t) => {
        const Icon = iconFor[t.type] || Info;
        return (
          <div key={t.id} className={`nexo-toast ${t.type}`}>
            <Icon size={17} />
            <div style={{ flex: 1, whiteSpace: "pre-wrap", lineHeight: 1.45 }}>{t.message}</div>
            <button className="nexo-toast-close" onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

let _setConfirmRequest = null;
function confirmDialog(message, opts) {
  opts = opts || {};
  return new Promise((resolve) => {
    if (!_setConfirmRequest) { resolve(window.confirm(message)); return; }
    _setConfirmRequest({ message, opts, resolve });
  });
}

function ConfirmHost() {
  const [request, setRequest] = useState(null);
  useEffect(() => {
    _setConfirmRequest = setRequest;
    return () => { _setConfirmRequest = null; };
  }, []);
  if (!request) return null;
  const { message, opts, resolve } = request;
  const finish = (result) => { setRequest(null); resolve(result); };
  const perigoso = opts.tone !== "neutral";
  return (
    <div className="nexo-modal-overlay" onClick={() => finish(false)}>
      <div className="nexo-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="nexo-modal-body" style={{ textAlign: "center", paddingTop: 30, paddingBottom: 6 }}>
          <div
            className="nexo-confirm-icon"
            style={{
              margin: "0 auto 14px",
              background: perigoso ? "var(--danger-soft)" : "var(--info-soft)",
              color: perigoso ? "var(--danger)" : "var(--info)",
            }}
          >
            {perigoso ? <AlertTriangle size={20} /> : <Info size={20} />}
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{opts.title || "Confirmar ação"}</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.55 }}>{message}</div>
        </div>
        <div className="nexo-modal-foot" style={{ justifyContent: "center" }}>
          <button className="nexo-btn" onClick={() => finish(false)}>Cancelar</button>
          <button className={`nexo-btn ${perigoso ? "nexo-btn-danger" : "nexo-btn-primary"}`} onClick={() => finish(true)}>
            {opts.confirmLabel || "Confirmar"}
          </button>
        </div>
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
    neutral: ["var(--text-dim)", "var(--surface-2)"],
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
  const [f, setF] = useState(() => {
    if (initial) {
      const veiculoIdsIniciais = initial.veiculoIds && initial.veiculoIds.length
        ? initial.veiculoIds
        : (initial.veiculoId ? [initial.veiculoId] : []);
      return { ...initial, veiculoIds: veiculoIdsIniciais };
    }
    return {
      clienteId: defaultClienteId || "", veiculoIds: defaultVeiculoId ? [defaultVeiculoId] : [], numero: "", nossoNumero: "",
      dataEmissao: todayISO(), dataVencimento: "", valor: "", dataPagamento: "", parcelas: 1,
    };
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const veiculosDoCliente = veiculos.filter((v) => v.clienteId === f.clienteId);

  function toggleVeiculo(id) {
    setF((prev) => {
      const jaTem = prev.veiculoIds.includes(id);
      return { ...prev, veiculoIds: jaTem ? prev.veiculoIds.filter((v) => v !== id) : [...prev.veiculoIds, id] };
    });
  }
  function marcarTodosVeiculos() {
    setF((prev) => ({ ...prev, veiculoIds: veiculosDoCliente.map((v) => v.id) }));
  }
  function limparVeiculos() {
    setF((prev) => ({ ...prev, veiculoIds: [] }));
  }

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
          <select className="nexo-select" value={f.clienteId} onChange={(e) => setF({ ...f, clienteId: e.target.value, veiculoIds: [] })}>
            <option value="">Selecione</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Veículos cobertos por este boleto (opcional)">
        {!f.clienteId ? (
          <div className="nexo-empty-sub">Escolha o cliente primeiro.</div>
        ) : veiculosDoCliente.length === 0 ? (
          <div className="nexo-empty-sub">Este cliente não tem veículos cadastrados — o boleto ficará direto no cliente.</div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <button type="button" className="nexo-btn nexo-btn-sm" onClick={marcarTodosVeiculos}>Marcar todos ({veiculosDoCliente.length})</button>
              <button type="button" className="nexo-btn nexo-btn-sm" onClick={limparVeiculos}>Nenhum (boleto direto no cliente)</button>
            </div>
            <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}>
              {veiculosDoCliente.map((v) => (
                <label key={v.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 2px", fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={f.veiculoIds.includes(v.id)} onChange={() => toggleVeiculo(v.id)} />
                  <span className="mono">{v.placa}</span>
                  <span style={{ color: "var(--text-dim)" }}>{v.marca} {v.modelo}</span>
                </label>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              {f.veiculoIds.length === 0
                ? "Nenhum veículo selecionado — este boleto ficará lançado direto no cliente."
                : `${f.veiculoIds.length} veículo(s) selecionado(s) — use isso para um boleto único que cobre vários veículos do mesmo cliente.`}
            </div>
          </div>
        )}
      </Field>

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
        <Field label={f.veiculoIds.length > 1 ? "Valor total do boleto (R$) *" : "Valor de cada parcela (R$) *"} error={errors.valor}>
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
  const aniversariantesHoje = useMemo(() => aniversariantesDeHoje(db.clientes), [db.clientes]);
  const cnhVencendoLista = useMemo(() => cnhsVencendo(db.clientes, 30), [db.clientes]);

  const clientesAtivos = db.clientes.filter((c) => c.status === "Ativo").length;
  const veiculosAtivos = db.veiculos.filter((v) => v.status === "Ativo").length;
  const veiculosInativos = db.veiculos.filter((v) => v.status === "Inativo").length;
  const emAberto = boletosComStatus.filter((b) => b.status !== "Pago");
  const aVencer = boletosComStatus.filter((b) => b.status === "A vencer");

  // Boletos que vencem nos próximos dias (mesma regra do KPI "Boletos a vencer"),
  // já com o cliente encontrado e os dias restantes calculados, pra montar o
  // lembrete de WhatsApp — do mais urgente pro menos urgente.
  const boletosVencendoComCliente = aVencer
    .map((b) => {
      const cliente = db.clientes.find((c) => c.id === b.clienteId);
      const venc = parseISODate(b.dataVencimento);
      const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      const diasRestantes = Math.round((venc - hoje) / 86400000);
      return { ...b, cliente, diasRestantes };
    })
    .filter((b) => b.cliente)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
  const valorEmAberto = sum(emAberto.map((b) => b.valor));
  const valorAReceber = sum(boletosComStatus.filter((b) => b.status === "A vencer" || b.status === "Em aberto").map((b) => b.valor));
  const valorRecebido = sum(boletosComStatus.filter((b) => b.status === "Pago").map((b) => b.valor));
  const cotacoesRegistradas = db.cotacoes.length;

  // Atividades recentes: um feed unificado a partir de eventos que já existem
  // no banco (sem inventar dado novo) — pagamento de boleto, nova cotação,
  // veículo cadastrado, adesão recebida e comissão paga, ordenados por data.
  const atividadesRecentes = useMemo(() => {
    const eventos = [];
    db.boletos.forEach((b) => {
      if (b.dataPagamento) {
        const cliente = db.clientes.find((c) => c.id === b.clienteId);
        eventos.push({ tipo: "pagamento", icon: Wallet, tone: "success", data: b.dataPagamento, titulo: "Pagamento recebido", sub: `${cliente?.nome || "Cliente"} · ${formatBRL(b.valor)}` });
      }
    });
    db.cotacoes.forEach((q) => {
      if (q.dataCotacao) {
        const cliente = db.clientes.find((c) => c.id === q.clienteId);
        eventos.push({ tipo: "cotacao", icon: FileText, tone: "info", data: q.dataCotacao, titulo: "Nova cotação", sub: `${cliente?.nome || "Cliente"} · ${formatBRL(q.valor)}` });
      }
    });
    db.veiculos.forEach((v) => {
      if (v.dataCadastro) {
        const cliente = db.clientes.find((c) => c.id === v.clienteId);
        eventos.push({ tipo: "veiculo", icon: Car, tone: "accent", data: v.dataCadastro, titulo: "Veículo cadastrado", sub: `${v.marca} ${v.modelo} · ${cliente?.nome || "Cliente"}` });
      }
    });
    db.adesoes.forEach((a) => {
      if (a.dataRecebimento) {
        const cliente = db.clientes.find((c) => c.id === a.clienteId);
        eventos.push({ tipo: "adesao", icon: FileDown, tone: "success", data: a.dataRecebimento, titulo: "Adesão recebida", sub: `${cliente?.nome || "Cliente"} · ${formatBRL(a.valorRecebido || a.valorAdesao)}` });
      }
    });
    db.comissoes.forEach((cm) => {
      if (cm.dataEfetivaPagamento) {
        eventos.push({ tipo: "comissao", icon: CreditCard, tone: "warning", data: cm.dataEfetivaPagamento, titulo: "Comissão paga", sub: `${formatBRL(cm.valorComissao)} · ${cm.referencia || ""}` });
      }
    });
    return eventos.filter((e) => e.data).sort((a, b) => (a.data < b.data ? 1 : -1)).slice(0, 8);
  }, [db.boletos, db.cotacoes, db.veiculos, db.adesoes, db.comissoes, db.clientes]);

  const relativeDate = (iso) => {
    const dias = Math.round((new Date().setHours(0, 0, 0, 0) - parseISODate(iso)) / 86400000);
    if (dias <= 0) return "hoje";
    if (dias === 1) return "ontem";
    if (dias < 30) return `há ${dias} dias`;
    return formatDateBR(iso);
  };

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

      {aniversariantesHoje.length > 0 && (
        <div
          className="nexo-card"
          style={{ marginBottom: 20, borderColor: "var(--warning)", background: "linear-gradient(135deg, rgba(219,155,61,0.10), var(--surface))" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <PartyPopper size={20} color="var(--warning)" />
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {aniversariantesHoje.length === 1 ? "Aniversariante de hoje 🎉" : `Aniversariantes de hoje 🎉 (${aniversariantesHoje.length})`}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {aniversariantesHoje.map((c) => {
              const idade = c.nascimento ? new Date().getFullYear() - Number(c.nascimento.slice(0, 4)) : null;
              const contato = c.whatsapp || c.telefone;
              const mensagem = `Parabéns, ${c.nome.split(" ")[0]}! 🎉🎂 A equipe do Nexo Gestão deseja a você um feliz aniversário e muitas felicidades!`;
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.nome}</div>
                    <div className="nexo-cell-muted" style={{ fontSize: 12 }}>{idade ? `Fazendo ${idade} anos hoje` : "Aniversário hoje"}</div>
                  </div>
                  {contato ? (
                    <a
                      className="nexo-btn nexo-btn-sm"
                      style={{ background: "var(--success)", borderColor: "var(--success)", color: "#fff" }}
                      href={linkWhatsApp(contato, mensagem)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={13} /> Mandar parabéns
                    </a>
                  ) : (
                    <span className="nexo-cell-muted" style={{ fontSize: 12 }}>Sem WhatsApp/telefone cadastrado</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {boletosVencendoComCliente.length > 0 && (
        <div
          className="nexo-card"
          style={{ marginBottom: 20, borderColor: "var(--info)", background: "linear-gradient(135deg, rgba(122,143,176,0.12), var(--surface))" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Bell size={20} color="var(--info)" />
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {boletosVencendoComCliente.length === 1
                ? "1 boleto vence nos próximos dias 📅"
                : `${boletosVencendoComCliente.length} boletos vencem nos próximos dias 📅`}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {boletosVencendoComCliente.slice(0, 6).map((b) => {
              const contato = b.cliente.whatsapp || b.cliente.telefone;
              const quando = b.diasRestantes <= 0 ? "vence hoje" : b.diasRestantes === 1 ? "vence amanhã" : `vence em ${b.diasRestantes} dias`;
              const mensagem = `Olá, ${b.cliente.nome.split(" ")[0]}! Passando para lembrar que seu boleto de ${formatBRL(b.valor)} vence em ${formatDateBR(b.dataVencimento)}. Qualquer dúvida, estou à disposição!`;
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{b.cliente.nome}</div>
                    <div className="nexo-cell-muted" style={{ fontSize: 12 }}>
                      {formatBRL(b.valor)} · {quando} ({formatDateBR(b.dataVencimento)})
                    </div>
                  </div>
                  {contato ? (
                    <a
                      className="nexo-btn nexo-btn-sm"
                      style={{ background: "var(--info)", borderColor: "var(--info)", color: "#fff" }}
                      href={linkWhatsApp(contato, mensagem)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={13} /> Lembrar
                    </a>
                  ) : (
                    <span className="nexo-cell-muted" style={{ fontSize: 12 }}>Sem WhatsApp/telefone cadastrado</span>
                  )}
                </div>
              );
            })}
            {boletosVencendoComCliente.length > 6 && (
              <div className="nexo-cell-muted" style={{ fontSize: 12 }}>
                +{boletosVencendoComCliente.length - 6} outro(s) boleto(s) a vencer — veja em Financeiro.
              </div>
            )}
          </div>
        </div>
      )}

      {cnhVencendoLista.length > 0 && (
        <div
          className="nexo-card"
          style={{ marginBottom: 20, borderColor: "var(--danger)", background: "linear-gradient(135deg, rgba(221,95,82,0.10), var(--surface))" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <AlertTriangle size={20} color="var(--danger)" />
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {cnhVencendoLista.length === 1
                ? "1 CNH vencida ou vencendo"
                : `${cnhVencendoLista.length} CNHs vencidas ou vencendo`}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cnhVencendoLista.slice(0, 6).map((c) => {
              const contato = c.whatsapp || c.telefone;
              const quando =
                c.diasRestantes < 0
                  ? `venceu há ${Math.abs(c.diasRestantes)} dia(s)`
                  : c.diasRestantes === 0
                  ? "vence hoje"
                  : c.diasRestantes === 1
                  ? "vence amanhã"
                  : `vence em ${c.diasRestantes} dias`;
              const mensagem = `Olá, ${c.nome.split(" ")[0]}! Passando para lembrar que sua CNH ${c.diasRestantes < 0 ? "venceu" : "vence"} em ${formatDateBR(c.cnhValidade)}. Se precisar de ajuda para renovar, é só chamar!`;
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.nome}</div>
                    <div className="nexo-cell-muted" style={{ fontSize: 12 }}>
                      CNH {quando} ({formatDateBR(c.cnhValidade)})
                    </div>
                  </div>
                  {contato ? (
                    <a
                      className="nexo-btn nexo-btn-sm"
                      style={{ background: "var(--danger)", borderColor: "var(--danger)", color: "#fff" }}
                      href={linkWhatsApp(contato, mensagem)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={13} /> Avisar
                    </a>
                  ) : (
                    <span className="nexo-cell-muted" style={{ fontSize: 12 }}>Sem WhatsApp/telefone cadastrado</span>
                  )}
                </div>
              );
            })}
            {cnhVencendoLista.length > 6 && (
              <div className="nexo-cell-muted" style={{ fontSize: 12 }}>
                +{cnhVencendoLista.length - 6} outro(s) — veja em Clientes.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="nexo-kpi-grid">
        <Kpi icon={Users} label="Clientes ativos" value={clientesAtivos} tone="accent" />
        <Kpi icon={Car} label="Veículos ativos" value={veiculosAtivos} tone="success" />
        <Kpi icon={Car} label="Veículos inativos" value={veiculosInativos} tone="danger" />
        <Kpi icon={FileText} label="Boletos em aberto" value={emAberto.length} tone="info" />
        <Kpi icon={Clock} label="Boletos a vencer" value={aVencer.length} tone="warning" />
        <Kpi icon={Wallet} label="Valor em aberto" value={formatBRL(valorEmAberto)} tone="info" />
        <Kpi icon={TrendingUp} label="Valor a receber" value={formatBRL(valorAReceber)} tone="warning" />
        <Kpi icon={Receipt} label="Valor recebido" value={formatBRL(valorRecebido)} tone="success" />
        <Kpi icon={Wallet} label="Cotações registradas" value={cotacoesRegistradas} tone="info" />
        <Kpi icon={TrendingUp} label="Produção do mês" value={formatBRL(valorBoletosDoMesAtual)} tone="success" />
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

      <div className="nexo-charts-grid">
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

        <div className="nexo-card">
          <div className="nexo-chart-title">Atividades recentes</div>
          <div className="nexo-chart-sub">Últimos eventos registrados no sistema</div>
          {atividadesRecentes.length === 0 ? (
            <EmptyState icon={Clock} title="Nenhuma atividade ainda" sub="Assim que houver pagamentos, cotações ou cadastros, eles aparecem aqui." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 260, overflowY: "auto" }}>
              {atividadesRecentes.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 2px", borderBottom: i < atividadesRecentes.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                  <div className="nexo-kpi-icon" style={{ width: 28, height: 28, background: `var(--${a.tone}-soft)`, flexShrink: 0 }}>
                    <a.icon size={14} color={`var(--${a.tone})`} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.titulo}</div>
                    <div className="nexo-cell-muted" style={{ fontSize: 11.5 }}>{a.sub}</div>
                  </div>
                  <div className="nexo-cell-muted" style={{ fontSize: 11, whiteSpace: "nowrap" }}>{relativeDate(a.data)}</div>
                </div>
              ))}
            </div>
          )}
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
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [importando, setImportando] = useState(false);
  const [importandoCombo, setImportandoCombo] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const fileInputRef = useRef(null);
  const fileInputComboRef = useRef(null);

  const ultimaInteracao = (clienteId) => {
    const datas = [
      ...db.boletos.filter((b) => b.clienteId === clienteId).flatMap((b) => [b.dataPagamento, b.dataVencimento]),
      ...db.cotacoes.filter((q) => q.clienteId === clienteId).map((q) => q.dataCotacao),
    ].filter(Boolean).sort();
    return datas.length ? datas[datas.length - 1] : null;
  };

  const filtered = db.clientes.filter((c) => {
    if (statusFiltro !== "Todos" && c.status !== statusFiltro) return false;
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
        showToast("Nenhuma linha válida encontrada. Confira se o arquivo tem as colunas Nome e CPF/CNPJ.", "warning");
      } else {
        await onImportarClientes(clientesNovos);
      }
    } catch (err) {
      showToast("Não foi possível ler o arquivo: " + err.message, "error");
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
        showToast("Nenhuma linha válida encontrada. Confira se o arquivo tem as colunas Nome e CPF/CNPJ.", "warning");
      } else {
        await onImportarClientesEVeiculos(registros);
      }
    } catch (err) {
      showToast("Não foi possível ler o arquivo: " + err.message, "error");
    } finally {
      setImportandoCombo(false);
    }
  }

  return (
    <div>
      <div className="nexo-section-head">
        <div>
          <div className="nexo-section-title">Clientes<span className="nexo-section-count">{db.clientes.length} cadastrados</span></div>
          <div className="nexo-section-sub">Sua carteira de clientes e o histórico de cada um</div>
        </div>
        <div className="nexo-section-actions">
          <div className="nexo-dropdown">
            <button className="nexo-btn" onClick={() => setMenuAberto((v) => !v)}>
              <SlidersHorizontal size={13} /> Importar / Exportar <ChevronDown size={13} />
            </button>
            {menuAberto && (
              <div className="nexo-dropdown-menu" onMouseLeave={() => setMenuAberto(false)}>
                <button
                  className="nexo-dropdown-item"
                  onClick={() => {
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
                    );
                    setMenuAberto(false);
                  }}
                >
                  <Download size={14} /> Baixar modelo (clientes)
                </button>
                <button className="nexo-dropdown-item" disabled={importando} onClick={() => { fileInputRef.current?.click(); setMenuAberto(false); }}>
                  <Upload size={14} /> {importando ? "Importando…" : "Importar CSV de clientes"}
                </button>
                <div className="nexo-dropdown-sep" />
                <button
                  className="nexo-dropdown-item"
                  onClick={() => {
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
                    );
                    setMenuAberto(false);
                  }}
                  title="Cada linha é um veículo. Repita o CPF do mesmo cliente em várias linhas para cadastrar mais de um veículo para ele."
                >
                  <Download size={14} /> Baixar modelo (+ veículos)
                </button>
                <button className="nexo-dropdown-item" disabled={importandoCombo} onClick={() => { fileInputComboRef.current?.click(); setMenuAberto(false); }}>
                  <Upload size={14} /> {importandoCombo ? "Importando…" : "Importar clientes + veículos"}
                </button>
                <div className="nexo-dropdown-sep" />
                <button
                  className="nexo-dropdown-item"
                  onClick={() => {
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
                    );
                    setMenuAberto(false);
                  }}
                >
                  <FileText size={14} /> Exportar CSV
                </button>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleArquivoSelecionado} />
          <input ref={fileInputComboRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleArquivoClientesVeiculos} />
          <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("cliente")}><Plus size={15} /> Novo cliente</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="nexo-searchbar">
          <Search size={15} color="var(--text-faint)" />
          <input placeholder="Pesquisar por nome, CPF ou placa" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="nexo-select" style={{ width: 150 }} value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
          <option value="Todos">Todos os status</option>
          <option value="Ativo">Ativos</option>
          <option value="Inativo">Inativos</option>
        </select>
      </div>

      {db.clientes.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Users} title="Nenhum cliente cadastrado" sub="Clique em “Novo cliente” para começar." /></div>
      ) : filtered.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Search} title="Nenhum resultado" sub="Tente pesquisar por outro nome, CPF ou placa, ou ajuste o filtro de status." /></div>
      ) : (
        <div className="nexo-table-wrap">
          <div className="nexo-table-scroll">
            <table className="nexo-table">
              <thead>
                <tr>
                  <th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th><th>Veículos</th><th>Última interação</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const nVeiculos = db.veiculos.filter((v) => v.clienteId === c.id).length;
                  const interacao = ultimaInteracao(c.id);
                  return (
                    <tr key={c.id} className="nexo-row-link" onClick={() => onOpenDetail(c.id)}>
                      <td>
                        <div className="nexo-name-cell">
                          <div className="nexo-avatar-sm" style={{ background: getAvatarColor(c.nome) }}>{getIniciais(c.nome)}</div>
                          <span style={{ fontWeight: 600 }}>{c.nome}</span>
                        </div>
                      </td>
                      <td className="mono nexo-cell-muted">{c.cpf || "—"}</td>
                      <td className="nexo-cell-muted">{c.telefone || c.whatsapp || "—"}</td>
                      <td className="nexo-cell-muted">{c.email || "—"}</td>
                      <td className="nexo-cell-muted">{nVeiculos}</td>
                      <td className="nexo-cell-muted">{interacao ? formatDateBR(interacao) : "—"}</td>
                      <td><AtivoInativoBadge ativo={c.status} /></td>
                      <td>
                        <div className="nexo-actions-cell" onClick={(e) => e.stopPropagation()}>
                          {(c.whatsapp || c.telefone) && (
                            <a
                              className="nexo-icon-btn"
                              style={{ color: "var(--success)" }}
                              href={linkWhatsApp(c.whatsapp || c.telefone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Conversar no WhatsApp"
                            >
                              <MessageCircle size={13} />
                            </a>
                          )}
                          <button className="nexo-icon-btn" onClick={() => onOpenModal("cliente", c)}><Pencil size={13} /></button>
                          <button className="nexo-icon-btn danger" onClick={() => onDeleteCliente(c.id)}><Trash2 size={13} /></button>
                          <button className="nexo-icon-btn" onClick={() => onOpenDetail(c.id)}><Eye size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="nexo-table-foot">
            <span className="nexo-cell-muted">{filtered.length} de {db.clientes.length} cliente(s)</span>
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
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const getCliente = (id) => db.clientes.find((c) => c.id === id);

  const ativos = db.veiculos.filter((v) => v.status === "Ativo");
  const valorMensalTotal = sum(db.veiculos.map((v) => v.valorMensal));
  const valorFipeTotal = sum(db.veiculos.map((v) => v.valorFipe));

  const filtered = db.veiculos.filter((v) => {
    if (statusFiltro !== "Todos" && v.status !== statusFiltro) return false;
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
        <div>
          <div className="nexo-section-title">Veículos<span className="nexo-section-count">{db.veiculos.length} cadastrados</span></div>
          <div className="nexo-section-sub">Frota segurada, valores mensais e situação por veículo</div>
        </div>
        <div className="nexo-section-actions">
          <button
            className="nexo-btn nexo-btn-sm"
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
            <Download size={13} /> Exportar CSV
          </button>
          <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("veiculo")}><Plus size={15} /> Novo veículo</button>
        </div>
      </div>

      <div className="nexo-kpi-grid">
        <Kpi icon={Car} label="Veículos cadastrados" value={db.veiculos.length} tone="info" />
        <Kpi icon={CheckCircle2} label="Veículos ativos" value={ativos.length} tone="success" />
        <Kpi icon={Wallet} label="Valor mensal total" value={formatBRL(valorMensalTotal)} tone="accent" />
        <Kpi icon={TrendingUp} label="Valor Fipe total" value={formatBRL(valorFipeTotal)} tone="neutral" />
      </div>

      <div className="nexo-filters">
        <div className="nexo-filter-field" style={{ flex: "1 1 260px" }}>
          <label>Buscar</label>
          <div className="nexo-searchbar">
            <Search size={14} />
            <input placeholder="Placa, modelo, marca ou cliente" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="nexo-filter-field">
          <label>Status</label>
          <select className="nexo-select" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
            <option>Todos</option><option>Ativo</option><option>Inativo</option>
          </select>
        </div>
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
                      <td>
                        <div className="nexo-name-cell">
                          <div className="nexo-avatar-sm" style={{ background: getAvatarColor(cliente ? cliente.nome : "—") }}>{getIniciais(cliente ? cliente.nome : "—")}</div>
                          <span style={{ fontWeight: 600 }}>{cliente ? cliente.nome : "—"}</span>
                        </div>
                      </td>
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
          <div className="nexo-table-foot">
            <span>{filtered.length} de {db.veiculos.length} veículos</span>
            <span className="mono">Mensal no filtro: {formatBRL(sum(filtered.map((v) => v.valorMensal)))}</span>
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
          // Aceita mais de uma placa na mesma linha (separadas por , ; ou /) para um boleto único que
          // cobre vários veículos do mesmo cliente (ex.: cliente com frota, boleto único mensal).
          placa: valorDaColuna(cabecalhos, linha, ["placas", "placa"]),
          nossoNumero: valorDaColuna(cabecalhos, linha, ["nossonumero", "nnumero", "nosso"]),
          valor: paraNumero(valorDaColuna(cabecalhos, linha, ["valor", "valorboleto"])),
          dataVencimento: paraDataISO(valorDaColuna(cabecalhos, linha, ["vencimento", "datavencimento", "datadevencimento"])),
        }))
        .filter((r) => (r.nome || r.cpf) && r.valor);
      if (registros.length === 0) {
        showToast("Nenhuma linha válida encontrada. Confira as colunas Nome do Cliente/CPF-CNPJ, Placa, Nosso Número e Valor.", "warning");
      } else {
        await onImportarBoletos(registros);
      }
    } catch (err) {
      showToast("Não foi possível ler o arquivo: " + err.message, "error");
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
        showToast("Nenhuma linha válida encontrada. Confira se o arquivo tem a coluna Nosso Número.", "warning");
      } else {
        await onImportarBaixas(registros);
      }
    } catch (err) {
      showToast("Não foi possível ler o arquivo: " + err.message, "error");
    } finally {
      setImportandoBaixa(false);
    }
  }

  const [menuImportExport, setMenuImportExport] = useState(false);
  const boletosComStatus = db.boletos.map((b) => ({ ...b, status: computeBoletoStatus(b) }));

  const emAberto = boletosComStatus.filter((b) => b.status !== "Pago");
  const aVencer = boletosComStatus.filter((b) => b.status === "A vencer");
  const vencidos = boletosComStatus.filter((b) => b.status === "Vencido");
  const valorEmAberto = sum(emAberto.map((b) => b.valor));
  const valorAReceber = sum(boletosComStatus.filter((b) => b.status === "A vencer" || b.status === "Em aberto").map((b) => b.valor));
  const valorRecebido = sum(boletosComStatus.filter((b) => b.status === "Pago").map((b) => b.valor));

  const filtered = boletosComStatus.filter((b) => {
    const cliente = db.clientes.find((c) => c.id === b.clienteId);
    const idsVeiculosDoBoleto = b.veiculoIds && b.veiculoIds.length ? b.veiculoIds : (b.veiculoId ? [b.veiculoId] : []);
    const veiculosDoBoleto = idsVeiculosDoBoleto.map((id) => db.veiculos.find((v) => v.id === id)).filter(Boolean);
    if (fCliente && !(cliente && cliente.nome.toLowerCase().includes(fCliente.toLowerCase()))) return false;
    if (fCpf && !(cliente && cliente.cpf.replace(/\D/g, "").includes(fCpf.replace(/\D/g, "")))) return false;
    if (fPlaca && !veiculosDoBoleto.some((v) => v.placa.toLowerCase().includes(fPlaca.toLowerCase()))) return false;
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
        <div>
          <div className="nexo-section-title">Financeiro<span className="nexo-section-count">{db.boletos.length} boletos</span></div>
          <div className="nexo-section-sub">Carteira de boletos, vencimentos e baixas de pagamento</div>
        </div>
        <div className="nexo-section-actions">
          <div className="nexo-dropdown">
            <button className="nexo-btn nexo-btn-sm" onClick={() => setMenuImportExport((v) => !v)}>
              <SlidersHorizontal size={13} /> Importar <ChevronDown size={13} />
            </button>
            {menuImportExport && (
              <div className="nexo-dropdown-menu" onMouseLeave={() => setMenuImportExport(false)}>
                <button
                  className="nexo-dropdown-item"
                  onClick={() => {
                    exportarCSV("modelo-cadastro-boletos.csv", [
                      { titulo: "Nome do Cliente", valor: () => "" }, { titulo: "CPF/CNPJ", valor: () => "" },
                      { titulo: "Placa(s) - separe com ; se for boleto único de vários veículos", valor: () => "" }, { titulo: "Nosso Número", valor: () => "" },
                      { titulo: "Valor", valor: () => "" }, { titulo: "Vencimento", valor: () => "" },
                    ], [{}]);
                    setMenuImportExport(false);
                  }}
                >
                  <Download size={14} /> Modelo (cadastro)
                </button>
                <button className="nexo-dropdown-item" disabled={importandoCadastro} onClick={() => { inputCadastroRef.current?.click(); setMenuImportExport(false); }}>
                  <Upload size={14} /> {importandoCadastro ? "Importando…" : "Importar boletos"}
                </button>
                <div className="nexo-dropdown-sep" />
                <button
                  className="nexo-dropdown-item"
                  onClick={() => {
                    exportarCSV("modelo-relatorio-baixa.csv", [
                      { titulo: "Nome do cliente", valor: () => "" }, { titulo: "Nosso Número", valor: () => "" },
                      { titulo: "Situação", valor: () => "" }, { titulo: "Data do Pagamento", valor: () => "" },
                      { titulo: "Voluntário", valor: () => "" },
                    ], [{}]);
                    setMenuImportExport(false);
                  }}
                >
                  <Download size={14} /> Modelo (baixa)
                </button>
                <button className="nexo-dropdown-item" disabled={importandoBaixa} onClick={() => { inputBaixaRef.current?.click(); setMenuImportExport(false); }}>
                  <Upload size={14} /> {importandoBaixa ? "Importando…" : "Importar baixa (relatório)"}
                </button>
              </div>
            )}
          </div>
          <input ref={inputCadastroRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleArquivoCadastro} />
          <input ref={inputBaixaRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleArquivoBaixa} />
          <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("boleto")}><Plus size={15} /> Novo boleto</button>
        </div>
      </div>

      <div className="nexo-kpi-grid">
        <Kpi icon={FileText} label="Boletos em aberto" value={emAberto.length} tone="info" />
        <Kpi icon={Clock} label="Boletos a vencer" value={aVencer.length} tone="warning" />
        <Kpi icon={AlertTriangle} label="Boletos vencidos" value={vencidos.length} tone="danger" />
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
                  const idsVeiculosDoBoleto = b.veiculoIds && b.veiculoIds.length ? b.veiculoIds : (b.veiculoId ? [b.veiculoId] : []);
                  const veiculosDoBoleto = idsVeiculosDoBoleto.map((id) => db.veiculos.find((v) => v.id === id)).filter(Boolean);
                  return (
                    <tr key={b.id}>
                      <td>
                        <div className="nexo-name-cell">
                          <div className="nexo-avatar-sm" style={{ background: getAvatarColor(cliente ? cliente.nome : "—") }}>{getIniciais(cliente ? cliente.nome : "—")}</div>
                          <span style={{ fontWeight: 600 }}>{cliente ? cliente.nome : "—"}</span>
                        </div>
                      </td>
                      <td className="nexo-cell-muted">
                        {veiculosDoBoleto.length === 0 ? "—"
                          : veiculosDoBoleto.length === 1 ? `${veiculosDoBoleto[0].marca} ${veiculosDoBoleto[0].modelo}`
                          : `${veiculosDoBoleto.length} veículos`}
                      </td>
                      <td className="mono nexo-cell-muted" title={veiculosDoBoleto.length > 1 ? veiculosDoBoleto.map((v) => v.placa).join(", ") : undefined}>
                        {veiculosDoBoleto.length === 0 ? "—"
                          : veiculosDoBoleto.length === 1 ? veiculosDoBoleto[0].placa
                          : veiculosDoBoleto.length <= 3 ? veiculosDoBoleto.map((v) => v.placa).join(", ")
                          : `${veiculosDoBoleto.slice(0, 2).map((v) => v.placa).join(", ")} +${veiculosDoBoleto.length - 2}`}
                      </td>
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
          <div className="nexo-table-foot">
            <span>{filtered.length} de {db.boletos.length} boletos</span>
            <span className="mono">Total no filtro: {formatBRL(sum(filtered.map((b) => b.valor)))}</span>
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
  const boletosDoCliente = db.boletos
    .filter((b) => b.clienteId === clienteId || veiculoIds.includes(b.veiculoId) || (b.veiculoIds || []).some((vid) => veiculoIds.includes(vid)))
    .map((b) => ({ ...b, status: computeBoletoStatus(b) }));

  const pagos = boletosDoCliente.filter((b) => b.status === "Pago");
  const emAberto = boletosDoCliente.filter((b) => b.status !== "Pago");
  const aVencer = boletosDoCliente.filter((b) => b.status === "A vencer");
  const totalEmAberto = sum(emAberto.map((b) => b.valor));
  const totalRecebido = sum(pagos.map((b) => b.valor));
  const cotacoesDoCliente = db.cotacoes.filter((q) => q.clienteId === clienteId);
  const comissoesDoCliente = db.comissoes.filter((cm) => cm.clienteId === clienteId);

  const [aba, setAba] = useState("resumo");
  const abas = [
    { key: "resumo", label: "Resumo" },
    { key: "veiculos", label: `Veículos (${veiculosDoCliente.length})` },
    { key: "financeiro", label: `Financeiro (${boletosDoCliente.length})` },
    { key: "cotacoes", label: `Cotações (${cotacoesDoCliente.length})` },
    { key: "comissoes", label: `Comissões (${comissoesDoCliente.length})` },
  ];

  return (
    <div>
      <button className="nexo-btn nexo-btn-ghost" style={{ marginBottom: 14 }} onClick={onBack}><ArrowLeft size={15} /> Voltar para clientes</button>

      <div className="nexo-detail-grid">
        <div className="nexo-card">
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <div className="nexo-avatar" style={{ background: getAvatarColor(cliente.nome), color: "#fff" }}>{getIniciais(cliente.nome)}</div>
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
          <div className="nexo-info-row">
            <MessageCircle size={14} />
            {cliente.whatsapp ? (
              <a href={linkWhatsApp(cliente.whatsapp)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--success)" }}>
                {cliente.whatsapp}
              </a>
            ) : (
              "—"
            )}
          </div>
          <div className="nexo-info-row"><Mail size={14} /> {cliente.email || "—"}</div>
          <div className="nexo-info-row"><MapPin size={14} /> {cliente.endereco || "—"}{cliente.cep ? ` · CEP ${cliente.cep}` : ""}</div>
          {(cliente.whatsapp || cliente.telefone) && (
            <a
              className="nexo-btn"
              style={{ width: "100%", justifyContent: "center", marginTop: 14, background: "var(--success)", borderColor: "var(--success)", color: "#fff" }}
              href={linkWhatsApp(cliente.whatsapp || cliente.telefone)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={14} /> Conversar no WhatsApp
            </a>
          )}
          <button className="nexo-btn" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => onOpenModal("cliente", cliente)}>
            <Pencil size={14} /> Editar dados pessoais
          </button>
        </div>

        <div>
          <div className="nexo-tabs">
            {abas.map((t) => (
              <div key={t.key} className={`nexo-tab ${aba === t.key ? "active" : ""}`} onClick={() => setAba(t.key)}>{t.label}</div>
            ))}
          </div>

          {aba === "resumo" && (
            <>
              <div className="nexo-mini-kpis">
                <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Boletos pagos</div><div className="nexo-mini-kpi-value">{pagos.length}</div></div>
                <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Boletos em aberto</div><div className="nexo-mini-kpi-value">{emAberto.length}</div></div>
                <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Total em aberto</div><div className="nexo-mini-kpi-value">{formatBRL(totalEmAberto)}</div></div>
                <div className="nexo-mini-kpi"><div className="nexo-mini-kpi-label">Total recebido</div><div className="nexo-mini-kpi-value">{formatBRL(totalRecebido)}</div></div>
              </div>
              <div className="nexo-card">
                <div className="nexo-chart-title">Veículos</div>
                <div className="nexo-chart-sub">{veiculosDoCliente.length} vinculado(s) · veja a aba Veículos para detalhes</div>
                {veiculosDoCliente.length === 0 ? (
                  <div className="nexo-empty-sub">Nenhum veículo vinculado a este cliente.</div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {veiculosDoCliente.map((v) => (
                      <span key={v.id} className="nexo-badge" style={{ background: "var(--surface-2)", color: "var(--text-dim)" }}>{v.marca} {v.modelo} · {v.placa}</span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {aba === "veiculos" && (
            <div className="nexo-card">
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
          )}

          {aba === "financeiro" && (
            <div className="nexo-card">
              <div className="nexo-chart-title">Boletos do cliente</div>
              <div className="nexo-chart-sub">{boletosDoCliente.length} lançamento(s)</div>
              {boletosDoCliente.length === 0 ? (
                <div className="nexo-empty-sub">Nenhum boleto lançado para este cliente ainda.</div>
              ) : (
                <div className="nexo-table-scroll">
                  <table className="nexo-table">
                    <thead><tr><th>Número</th><th>Veículos</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {boletosDoCliente.sort((a, b) => (a.dataVencimento || "").localeCompare(b.dataVencimento || "")).map((b) => {
                        const idsVeiculosDoBoleto = b.veiculoIds && b.veiculoIds.length ? b.veiculoIds : (b.veiculoId ? [b.veiculoId] : []);
                        const placasDoBoleto = idsVeiculosDoBoleto.map((id) => veiculosDoCliente.find((v) => v.id === id)?.placa).filter(Boolean);
                        return (
                        <tr key={b.id}>
                          <td className="mono">{b.numero}</td>
                          <td className="mono nexo-cell-muted" title={placasDoBoleto.length > 1 ? placasDoBoleto.join(", ") : undefined}>
                            {placasDoBoleto.length === 0 ? "Direto no cliente"
                              : placasDoBoleto.length <= 3 ? placasDoBoleto.join(", ")
                              : `${placasDoBoleto.slice(0, 2).join(", ")} +${placasDoBoleto.length - 2}`}
                          </td>
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
          )}

          {aba === "cotacoes" && (
            <div className="nexo-card">
              <div className="nexo-section-head" style={{ marginBottom: 12 }}>
                <div className="nexo-chart-title" style={{ marginBottom: 0 }}>Cotações do cliente</div>
                <button className="nexo-btn nexo-btn-sm" onClick={() => onOpenModal("cotacao", null, clienteId)}><Plus size={13} /> Nova cotação</button>
              </div>
              {cotacoesDoCliente.length === 0 ? (
                <div className="nexo-empty-sub">Nenhuma cotação registrada para este cliente ainda.</div>
              ) : (
                <div className="nexo-table-scroll">
                  <table className="nexo-table">
                    <thead><tr><th>Data</th><th>Seguradora</th><th>Plano</th><th>Valor</th><th></th></tr></thead>
                    <tbody>
                      {cotacoesDoCliente.sort((a, b) => (b.dataCotacao || "").localeCompare(a.dataCotacao || "")).map((q) => {
                        const seguradora = db.seguradoras.find((s) => s.id === q.seguradoraId);
                        const plano = db.planos.find((p) => p.id === q.planoId);
                        return (
                          <tr key={q.id}>
                            <td>{formatDateBR(q.dataCotacao)}</td>
                            <td>{seguradora?.nome || "—"}</td>
                            <td>{plano?.nome || "—"}</td>
                            <td className="mono">{formatBRL(q.valor)}</td>
                            <td><div className="nexo-actions-cell"><button className="nexo-icon-btn" onClick={() => onOpenModal("cotacao", q)}><Pencil size={13} /></button></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {aba === "comissoes" && (
            <div className="nexo-card">
              <div className="nexo-chart-title">Comissões geradas por este cliente</div>
              <div className="nexo-chart-sub">{comissoesDoCliente.length} lançamento(s)</div>
              {comissoesDoCliente.length === 0 ? (
                <div className="nexo-empty-sub">Nenhuma comissão associada a este cliente ainda.</div>
              ) : (
                <div className="nexo-table-scroll">
                  <table className="nexo-table">
                    <thead><tr><th>Referência</th><th>Tipo</th><th>Valor</th><th>Status</th></tr></thead>
                    <tbody>
                      {comissoesDoCliente.map((cm) => (
                        <tr key={cm.id}>
                          <td>{cm.referencia || "—"}</td>
                          <td className="nexo-cell-muted">{cm.tipo}</td>
                          <td className="mono">{formatBRL(cm.valorComissao)}</td>
                          <td><StatusPill status={cm.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
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
  const placasVeiculoBoleto = (b) => {
    const ids = b.veiculoIds && b.veiculoIds.length ? b.veiculoIds : (b.veiculoId ? [b.veiculoId] : []);
    const placas = ids.map((id) => db.veiculos.find((v) => v.id === id)?.placa).filter(Boolean);
    return placas.length ? placas.join(" | ") : "—";
  };

  const colunasBoleto = [
    { titulo: "Cliente", valor: (b) => nomeCliente(b.clienteId) },
    { titulo: "Placa(s)", valor: (b) => placasVeiculoBoleto(b) },
    { titulo: "Número", valor: (b) => b.numero },
    { titulo: "Vencimento", valor: (b) => formatDateBR(b.dataVencimento) },
    { titulo: "Valor", valor: (b) => b.valor },
    { titulo: "Status", valor: (b) => b.status },
    { titulo: "Data de pagamento", valor: (b) => formatDateBR(b.dataPagamento) },
  ];

  const relatorios = [
    {
      titulo: "Clientes cadastrados",
      icon: Users,
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
      icon: CheckCircle2,
      total: pagos.length,
      valor: formatBRL(sum(pagos.map((b) => b.valor))),
      arquivo: "relatorio-boletos-pagos.csv",
      colunas: colunasBoleto,
      linhas: pagos,
      tone: "success",
    },
    {
      titulo: "Boletos em aberto",
      icon: FileText,
      total: emAberto.length,
      valor: formatBRL(sum(emAberto.map((b) => b.valor))),
      arquivo: "relatorio-boletos-em-aberto.csv",
      colunas: colunasBoleto,
      linhas: emAberto,
      tone: "info",
    },
    {
      titulo: "Boletos a vencer",
      icon: Clock,
      total: aVencer.length,
      valor: formatBRL(sum(aVencer.map((b) => b.valor))),
      arquivo: "relatorio-boletos-a-vencer.csv",
      colunas: colunasBoleto,
      linhas: aVencer,
      tone: "warning",
    },
  ];

  const toneVar = { accent: "var(--accent)", success: "var(--success)", info: "var(--info)", warning: "var(--warning)" };
  const toneSoft = { accent: "var(--accent-soft)", success: "var(--success-soft)", info: "var(--info-soft)", warning: "var(--warning-soft)" };

  return (
    <div>
      <div className="nexo-section-head">
        <div>
          <div className="nexo-section-title">Relatórios</div>
          <div className="nexo-section-sub">Exportações prontas em CSV para planilhas e conferências</div>
        </div>
      </div>
      <div className="nexo-kpi-grid">
        {relatorios.map((r) => (
          <div key={r.titulo} className="nexo-card" style={{ borderTop: `2px solid ${toneVar[r.tone]}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div className="nexo-kpi-icon" style={{ background: toneSoft[r.tone], color: toneVar[r.tone] }}>
                <r.icon size={16} />
              </div>
              <div className="nexo-chart-title" style={{ margin: 0 }}>{r.titulo}</div>
            </div>
            <div className="nexo-kpi-value">{r.total}</div>
            {r.valor && <div className="nexo-cell-muted" style={{ marginBottom: 10 }}>{r.valor}</div>}
            <button
              className="nexo-btn nexo-btn-sm"
              style={{ marginTop: 10 }}
              disabled={r.linhas.length === 0}
              onClick={() => exportarCSV(r.arquivo, r.colunas, r.linhas)}
            >
              <Download size={13} /> Exportar CSV
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
  doc.text("Nexo Gestão", 14, y);
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
  const [buscaCotacao, setBuscaCotacao] = useState("");
  const fileInputRef = useRef(null);
  const valorTotalCotado = sum(db.cotacoes.map((c) => c.valor));

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
        showToast("Nenhuma linha válida encontrada. Confira as colunas Seguradora e Plano.", "warning");
      } else {
        await onImportarPlanos(planosNovos);
      }
    } catch (err) {
      showToast("Não foi possível ler o arquivo: " + err.message, "error");
    } finally {
      setImportando(false);
    }
  }

  const cotacoesFiltradas = db.cotacoes.filter((c) => {
    if (!buscaCotacao) return true;
    const q = buscaCotacao.toLowerCase();
    return nomeCliente(c.clienteId).toLowerCase().includes(q) || nomeSeguradoraPorId(c.seguradoraId).toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="nexo-section-head">
        <div>
          <div className="nexo-section-title">Cotação de seguros</div>
          <div className="nexo-section-sub">Tabela de seguradoras, planos e cotações geradas para seus clientes</div>
        </div>
      </div>

      <div className="nexo-kpi-grid">
        <Kpi icon={Shield} label="Seguradoras parceiras" value={db.seguradoras.length} tone="accent" />
        <Kpi icon={FileText} label="Planos cadastrados" value={db.planos.length} tone="info" />
        <Kpi icon={Wallet} label="Cotações registradas" value={db.cotacoes.length} tone="success" />
        <Kpi icon={TrendingUp} label="Valor total cotado" value={formatBRL(valorTotalCotado)} tone="warning" />
      </div>

      <div className="nexo-card" style={{ marginBottom: 16 }}>
        <div className="nexo-section-head" style={{ marginBottom: 12 }}>
          <div>
            <div className="nexo-chart-title" style={{ marginBottom: 0 }}>Seguradoras e tabela de preços</div>
            <div className="nexo-chart-sub" style={{ marginBottom: 0 }}>Cadastre suas seguradoras parceiras e os planos que você oferece</div>
          </div>
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
          <EmptyState icon={Shield} title="Nenhuma seguradora cadastrada" sub="Adicione uma acima ou importe sua tabela em CSV." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
            {db.seguradoras.map((s) => {
              const planosDaSeguradora = db.planos.filter((p) => p.seguradoraId === s.id);
              return (
                <div key={s.id} className="nexo-veiculo-card" style={{ margin: 0 }}>
                  <div className="nexo-veiculo-card-head">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
                      <Shield size={14} color="var(--accent-2)" /> {s.nome}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="nexo-icon-btn" title="Novo plano" onClick={() => onOpenModal("plano", null, null, null, s.id)}><Plus size={13} /></button>
                      <button className="nexo-icon-btn danger" title="Excluir seguradora" onClick={() => onDeleteSeguradora(s.id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  {planosDaSeguradora.length === 0 ? (
                    <div className="nexo-cell-muted" style={{ fontSize: 12.5 }}>Nenhum plano cadastrado para esta seguradora.</div>
                  ) : (
                    planosDaSeguradora.map((p) => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--border-soft)" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{p.nome}</div>
                          <div className="nexo-cell-muted" style={{ fontSize: 12 }}>
                            {formatBRL(p.valorMensal)}/mês · Franquia {formatBRL(p.valorFranquia)}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button className="nexo-icon-btn" onClick={() => onOpenModal("plano", p)}><Pencil size={13} /></button>
                          <button className="nexo-icon-btn danger" onClick={() => onDeletePlano(p.id)}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="nexo-card">
        <div className="nexo-section-head" style={{ marginBottom: 12 }}>
          <div className="nexo-chart-title" style={{ marginBottom: 0 }}>Cotações realizadas<span className="nexo-section-count">{cotacoesFiltradas.length}</span></div>
          <div style={{ display: "flex", gap: 8 }}>
            <div className="nexo-searchbar" style={{ maxWidth: 220 }}>
              <Search size={14} color="var(--text-faint)" />
              <input placeholder="Cliente ou seguradora" value={buscaCotacao} onChange={(e) => setBuscaCotacao(e.target.value)} />
            </div>
            <button className="nexo-btn nexo-btn-primary nexo-btn-sm" onClick={() => onOpenModal("cotacao")}>
              <Plus size={13} /> Nova cotação
            </button>
          </div>
        </div>
        {db.cotacoes.length === 0 ? (
          <EmptyState icon={FileText} title="Nenhuma cotação registrada" sub="Clique em “Nova cotação” para gerar a primeira." />
        ) : cotacoesFiltradas.length === 0 ? (
          <EmptyState icon={Search} title="Nenhum resultado" sub="Tente pesquisar por outro cliente ou seguradora." />
        ) : (
          <div className="nexo-table-scroll">
            <table className="nexo-table">
              <thead><tr><th>Cliente</th><th>Veículo</th><th>Seguradora</th><th>Plano</th><th>Valor</th><th>Data</th><th></th></tr></thead>
              <tbody>
                {cotacoesFiltradas
                  .slice()
                  .sort((a, b) => (b.dataCotacao || "").localeCompare(a.dataCotacao || ""))
                  .map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="nexo-name-cell">
                          <div className="nexo-avatar-sm" style={{ background: getAvatarColor(nomeCliente(c.clienteId)) }}>{getIniciais(nomeCliente(c.clienteId))}</div>
                          <span style={{ fontWeight: 600 }}>{nomeCliente(c.clienteId)}</span>
                        </div>
                      </td>
                      <td className="nexo-cell-muted">{c.veiculoId ? nomeVeiculo(c.veiculoId) : "—"}</td>
                      <td>{nomeSeguradoraPorId(c.seguradoraId)}</td>
                      <td>{nomePlanoPorId(c.planoId)}</td>
                      <td className="mono nexo-cell-strong">{formatBRL(c.valor)}</td>
                      <td className="nexo-cell-muted">{formatDateBR(c.dataCotacao)}</td>
                      <td>
                        <div className="nexo-actions-cell">
                          <button className="nexo-btn nexo-btn-sm" onClick={() => gerarPdfCotacao(c, db)}><FileDown size={12} /> PDF</button>
                          <button className="nexo-icon-btn" onClick={() => onOpenModal("cotacao", c)}><Pencil size={13} /></button>
                          <button className="nexo-icon-btn danger" onClick={() => onDeleteCotacao(c.id)}><Trash2 size={13} /></button>
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
                <div className="nexo-login-brand-name">NEXO GESTÃO</div>
                <div className="nexo-login-brand-tagline">Gestão para corretoras</div>
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
                <p className="sub">Acesse o painel do Nexo Gestão.</p>
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
        © {new Date().getFullYear()} Nexo Gestão — Todos os direitos reservados.
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
                <div className="nexo-login-brand-name">NEXO GESTÃO</div>
                <div className="nexo-login-brand-tagline">Gestão para corretoras</div>
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
        © {new Date().getFullYear()} Nexo Gestão — Todos os direitos reservados.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Verificação em duas etapas (2FA) — desafio no login                  */
/* ------------------------------------------------------------------ */

function MfaChallengeScreen({ onVerificado }) {
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleVerificar() {
    const codigoLimpo = codigo.replace(/\D/g, "");
    if (codigoLimpo.length !== 6) {
      setErro("Digite o código de 6 dígitos do seu aplicativo autenticador.");
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      const factor = (factorsData?.totp || []).find((f) => f.status === "verified");
      if (!factor) {
        setErro("Não encontramos sua verificação em duas etapas. Entre em contato com o suporte.");
        setCarregando(false);
        return;
      }
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challengeData.id,
        code: codigoLimpo,
      });
      if (verifyError) throw verifyError;
      onVerificado();
    } catch (e) {
      setErro("Código inválido ou expirado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
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
                <div className="nexo-login-brand-name">NEXO GESTÃO</div>
                <div className="nexo-login-brand-tagline">Gestão para corretoras</div>
              </div>
            </div>
            <div className="nexo-login-hero-mid">
              <div className="nexo-login-quote">"Protegendo o que <span>realmente importa</span>."</div>
            </div>
          </div>
        </div>

        <div className="nexo-login-panel">
          <div className="nexo-login-card">
            <div className="nexo-login-eyebrow">Verificação em duas etapas</div>
            <h1>Digite o código do seu app</h1>
            <p className="sub">Abra seu aplicativo autenticador (Google Authenticator, Authy, etc.) e digite o código de 6 dígitos.</p>
            <div className="nexo-login-fields">
              <Field label="Código de verificação">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="nexo-input mono"
                  style={{ letterSpacing: 4, fontSize: 18, textAlign: "center" }}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerificar()}
                  placeholder="000000"
                  autoFocus
                />
              </Field>
            </div>
            {erro && <div className="nexo-login-alert err" role="alert">{erro}</div>}
            <button className="nexo-btn nexo-btn-primary nexo-login-submit" disabled={carregando} onClick={handleVerificar}>
              {carregando ? "Verificando…" : "Verificar"}
            </button>
            <button
              type="button"
              className="nexo-login-link"
              style={{ marginTop: 14 }}
              onClick={() => supabase.auth.signOut()}
            >
              Usar outra conta
            </button>
          </div>
        </div>
      </div>
      <div className="nexo-login-page-foot">
        Sistema desenvolvido por Gilmar Alves<br />
        © {new Date().getFullYear()} Nexo Gestão — Todos os direitos reservados.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Segurança da conta — ativar/desativar verificação em duas etapas    */
/* ------------------------------------------------------------------ */

function SegurancaModal({ onClose }) {
  const [etapa, setEtapa] = useState("carregando"); // carregando | inativo | ativando | ativo
  const [factorAtivo, setFactorAtivo] = useState(null);
  const [factorPendente, setFactorPendente] = useState(null); // { id, qrCode, secret }
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const carregarFactors = useCallback(async () => {
    setErro("");
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setErro("Não foi possível carregar as configurações de segurança.");
      setEtapa("inativo");
      return;
    }
    const verificado = (data?.totp || []).find((f) => f.status === "verified");
    if (verificado) {
      setFactorAtivo(verificado);
      setEtapa("ativo");
    } else {
      setFactorAtivo(null);
      setEtapa("inativo");
    }
  }, []);

  useEffect(() => { carregarFactors(); }, [carregarFactors]);

  async function handleAtivar() {
    setCarregando(true);
    setErro("");
    try {
      // Remove fatores TOTP não confirmados de tentativas anteriores, pra não acumular.
      const { data: existentes } = await supabase.auth.mfa.listFactors();
      const pendentes = (existentes?.totp || []).filter((f) => f.status !== "verified");
      for (const f of pendentes) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Nexo Gestão" });
      if (error) throw error;
      setFactorPendente({ id: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
      setEtapa("ativando");
    } catch (e) {
      setErro(e.message || "Não foi possível iniciar a ativação. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleConfirmar() {
    const codigoLimpo = codigo.replace(/\D/g, "");
    if (codigoLimpo.length !== 6 || !factorPendente) {
      setErro("Digite o código de 6 dígitos mostrado no seu aplicativo autenticador.");
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factorPendente.id });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorPendente.id,
        challengeId: challengeData.id,
        code: codigoLimpo,
      });
      if (verifyError) throw verifyError;
      setCodigo("");
      setFactorPendente(null);
      await carregarFactors();
    } catch (e) {
      setErro("Código inválido. Confira o horário do seu celular e tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleDesativar() {
    if (!factorAtivo) return;
    if (!(await confirmDialog("Desativar a verificação em duas etapas? Sua conta ficará protegida só por senha."))) return;
    setCarregando(true);
    setErro("");
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: factorAtivo.id });
      if (error) throw error;
      await carregarFactors();
    } catch (e) {
      setErro("Não foi possível desativar agora. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleCancelarAtivacao() {
    if (factorPendente) {
      await supabase.auth.mfa.unenroll({ factorId: factorPendente.id }).catch(() => {});
    }
    setFactorPendente(null);
    setCodigo("");
    setErro("");
    await carregarFactors();
  }

  return (
    <Modal title="Segurança da conta" onClose={onClose}>
      {etapa === "carregando" && <div className="nexo-cell-muted">Carregando…</div>}

      {etapa === "inativo" && (
        <div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 14 }}>
            A verificação em duas etapas pede, além da senha, um código gerado no seu celular
            (Google Authenticator, Authy, Microsoft Authenticator, etc.) a cada login — assim,
            mesmo que alguém descubra sua senha, não consegue entrar na conta sem o celular.
          </p>
          {erro && <div className="nexo-login-alert err" style={{ marginBottom: 12 }}>{erro}</div>}
          <button className="nexo-btn nexo-btn-primary" onClick={handleAtivar} disabled={carregando}>
            <Shield size={14} /> {carregando ? "Preparando…" : "Ativar verificação em duas etapas"}
          </button>
        </div>
      )}

      {etapa === "ativando" && factorPendente && (
        <div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}>
            1. Abra um aplicativo autenticador no seu celular e escaneie o QR code abaixo.
          </p>
          <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
            <img
              src={factorPendente.qrCode}
              alt="QR code para configurar a verificação em duas etapas"
              style={{ width: 180, height: 180, background: "#fff", padding: 8, borderRadius: 8 }}
            />
          </div>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 10, textAlign: "center" }}>
            Não consegue escanear? Digite manualmente este código no app: <br />
            <span className="mono" style={{ color: "var(--text-dim)" }}>{factorPendente.secret}</span>
          </p>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}>
            2. Digite o código de 6 dígitos que apareceu no app para confirmar:
          </p>
          <Field label="Código de verificação">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="nexo-input mono"
              style={{ letterSpacing: 4, fontSize: 18, textAlign: "center" }}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmar()}
              placeholder="000000"
              autoFocus
            />
          </Field>
          {erro && <div className="nexo-login-alert err" style={{ margin: "10px 0" }}>{erro}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="nexo-btn nexo-btn-primary" onClick={handleConfirmar} disabled={carregando}>
              {carregando ? "Confirmando…" : "Confirmar e ativar"}
            </button>
            <button className="nexo-btn" onClick={handleCancelarAtivacao} disabled={carregando}>Cancelar</button>
          </div>
        </div>
      )}

      {etapa === "ativo" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, color: "var(--success)" }}>
            <CheckCircle2 size={18} />
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>Verificação em duas etapas ativada</div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 14 }}>
            A cada login será pedido também o código do seu aplicativo autenticador.
          </p>
          {erro && <div className="nexo-login-alert err" style={{ marginBottom: 12 }}>{erro}</div>}
          <button className="nexo-btn nexo-btn-danger" onClick={handleDesativar} disabled={carregando}>
            {carregando ? "Desativando…" : "Desativar verificação em duas etapas"}
          </button>
        </div>
      )}
    </Modal>
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
  const ativasCount = db.consultoras.filter((c) => c.status === "Ativa").length;
  return (
    <div>
      <div className="nexo-section-head">
        <div>
          <div className="nexo-section-title">Consultoras<span className="nexo-section-count">{db.consultoras.length} cadastradas</span></div>
          <div className="nexo-section-sub">Equipe comercial, adesões e comissões por consultora</div>
        </div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("consultora")}><Plus size={15} /> Nova consultora</button>
      </div>

      {db.consultoras.length === 0 ? (
        <div className="nexo-table-wrap"><EmptyState icon={Users} title="Nenhuma consultora cadastrada" sub="Clique em “Nova consultora” para começar." /></div>
      ) : (
        <>
          <div className="nexo-kpi-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            <Kpi icon={Users} label="Consultoras cadastradas" value={db.consultoras.length} tone="info" />
            <Kpi icon={CheckCircle2} label="Consultoras ativas" value={ativasCount} tone="success" />
          </div>
          <div className="nexo-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {db.consultoras.map((c) => {
              const adesoesDaConsultora = db.adesoes.filter((a) => a.consultoraId === c.id);
              const comissoesDaConsultora = db.comissoes.filter((cm) => cm.consultoraId === c.id);
              const totalRecebido = sum(adesoesDaConsultora.filter((a) => a.status === "Recebida").map((a) => a.valorRecebido || a.valorAdesao));
              const comissaoAPagar = sum(comissoesDaConsultora.filter((cm) => cm.status === "A pagar").map((cm) => cm.valorComissao));
              const comissaoPaga = sum(comissoesDaConsultora.filter((cm) => cm.status === "Pago").map((cm) => cm.valorComissao));
              return (
                <div key={c.id} className="nexo-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div className="nexo-avatar-sm" style={{ background: getAvatarColor(c.nome) }}>{getIniciais(c.nome)}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{c.nome}</div>
                        <div className="nexo-cell-muted" style={{ marginTop: 2 }}>{c.telefone || c.email || "—"}</div>
                      </div>
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
        </>
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
        <div>
          <div className="nexo-section-title">Links Úteis<span className="nexo-section-count">{db.linksUteis.length} cadastrados</span></div>
          <div className="nexo-section-sub">Atalhos para portais de seguradoras e sistemas parceiros</div>
        </div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("link")}><Plus size={15} /> Novo link</button>
      </div>

      <div className="nexo-filters">
        <div className="nexo-filter-field" style={{ flex: "1 1 260px" }}>
          <label>Buscar</label>
          <div className="nexo-searchbar">
            <Search size={14} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome, link ou observação" />
          </div>
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
                    <td>
                      <div className="nexo-name-cell">
                        <div className="nexo-avatar-sm" style={{ background: getAvatarColor(l.nome) }}><Link2 size={13} /></div>
                        <span style={{ fontWeight: 600 }}>{l.nome}</span>
                      </div>
                    </td>
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
        <div>
          <div className="nexo-section-title">Adesões<span className="nexo-section-count">{db.adesoes.length} lançadas</span></div>
          <div className="nexo-section-sub">Taxas de adesão de novos clientes por consultora</div>
        </div>
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
                    <td>
                      <div className="nexo-name-cell">
                        <div className="nexo-avatar-sm" style={{ background: getAvatarColor(nomeCliente(a.clienteId)) }}>{getIniciais(nomeCliente(a.clienteId))}</div>
                        <span style={{ fontWeight: 600 }}>{nomeCliente(a.clienteId)}</span>
                      </div>
                    </td>
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
          <div className="nexo-table-foot">
            <span>{filtradas.length} de {db.adesoes.length} adesões</span>
            <span className="mono">Total no filtro: {formatBRL(sum(filtradas.map((a) => a.valorAdesao)))}</span>
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
  const [buscaComissao, setBuscaComissao] = useState("");
  const nomeCliente = (id) => db.clientes.find((c) => c.id === id)?.nome || "—";
  const nomeConsultora = (id) => db.consultoras.find((c) => c.id === id)?.nome || "—";

  const aPagar = db.comissoes.filter((c) => c.status === "A pagar");
  const pagas = db.comissoes.filter((c) => c.status === "Pago");
  const producaoTotal = sum(db.comissoes.map((c) => c.valorBase));
  const ticketMedio = db.comissoes.length ? sum(db.comissoes.map((c) => c.valorComissao)) / db.comissoes.length : 0;

  const filtradas = db.comissoes.filter((c) => {
    if (filtroStatus !== "Todos" && c.status !== filtroStatus) return false;
    if (buscaComissao) {
      const termo = buscaComissao.toLowerCase();
      const texto = `${nomeConsultora(c.consultoraId)} ${nomeCliente(c.clienteId)} ${c.tipo} ${c.referencia}`.toLowerCase();
      if (!texto.includes(termo)) return false;
    }
    return true;
  });

  const fechamentoPorConsultora = db.consultoras.map((consultora) => {
    const comissoesDaConsultora = db.comissoes.filter((c) => c.consultoraId === consultora.id);
    return {
      consultora,
      totalContratos: comissoesDaConsultora.length,
      totalComissao: sum(comissoesDaConsultora.map((c) => c.valorComissao)),
      totalPago: sum(comissoesDaConsultora.filter((c) => c.status === "Pago").map((c) => c.valorComissao)),
      totalAPagar: sum(comissoesDaConsultora.filter((c) => c.status === "A pagar").map((c) => c.valorComissao)),
    };
  }).filter((f) => f.totalContratos > 0).sort((a, b) => b.totalComissao - a.totalComissao);

  return (
    <div>
      <div className="nexo-section-head">
        <div>
          <div className="nexo-section-title">Comissões<span className="nexo-section-count">{db.comissoes.length} lançamentos</span></div>
          <div className="nexo-section-sub">Comissões de consultoras, produção e fechamento por período</div>
        </div>
        <button className="nexo-btn nexo-btn-primary" onClick={() => onOpenModal("comissao")}><Plus size={15} /> Nova comissão</button>
      </div>

      <div className="nexo-kpi-grid">
        <Kpi icon={Clock} label="A pagar" value={formatBRL(sum(aPagar.map((c) => c.valorComissao)))} tone="warning" />
        <Kpi icon={CheckCircle2} label="Pagas" value={formatBRL(sum(pagas.map((c) => c.valorComissao)))} tone="success" />
        <Kpi icon={TrendingUp} label="Produção total" value={formatBRL(producaoTotal)} tone="info" />
        <Kpi icon={Wallet} label="Ticket médio de comissão" value={formatBRL(ticketMedio)} tone="neutral" />
      </div>

      <div className="nexo-tabs">
        <div className={`nexo-tab ${aba === "lista" ? "active" : ""}`} onClick={() => setAba("lista")}>Lançamentos</div>
        <div className={`nexo-tab ${aba === "fechamento" ? "active" : ""}`} onClick={() => setAba("fechamento")}>Fechamento por consultora</div>
      </div>

      {aba === "lista" ? (
        <>
          <div className="nexo-filters">
            <div className="nexo-filter-field" style={{ flex: "1 1 220px" }}>
              <label>Buscar</label>
              <div className="nexo-searchbar">
                <Search size={14} />
                <input value={buscaComissao} onChange={(e) => setBuscaComissao(e.target.value)} placeholder="Consultora, cliente ou referência…" />
              </div>
            </div>
            <div className="nexo-filter-field">
              <label>Status</label>
              <select className="nexo-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                <option>Todos</option><option>A pagar</option><option>Pago</option><option>Cancelado</option>
              </select>
            </div>
          </div>
          {db.comissoes.length === 0 ? (
            <div className="nexo-table-wrap"><EmptyState icon={FileText} title="Nenhuma comissão lançada" sub="Clique em “Nova comissão” para começar." /></div>
          ) : filtradas.length === 0 ? (
            <div className="nexo-table-wrap"><EmptyState icon={ListFilter} title="Nenhuma comissão encontrada" sub="Ajuste a busca ou os filtros para ver outros resultados." /></div>
          ) : (
            <div className="nexo-table-wrap">
              <div className="nexo-table-scroll">
                <table className="nexo-table">
                  <thead><tr><th>Consultora</th><th>Cliente</th><th>Sobre</th><th>Referência</th><th>Valor base</th><th>%</th><th>Comissão</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {filtradas.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="nexo-name-cell">
                            <div className="nexo-avatar-sm" style={{ background: getAvatarColor(nomeConsultora(c.consultoraId)) }}>{getIniciais(nomeConsultora(c.consultoraId))}</div>
                            <span style={{ fontWeight: 600 }}>{nomeConsultora(c.consultoraId)}</span>
                          </div>
                        </td>
                        <td className="nexo-cell-muted">{nomeCliente(c.clienteId)}</td>
                        <td className="nexo-cell-muted">{c.tipo}</td>
                        <td className="nexo-cell-muted">{c.referencia || "—"}</td>
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
              <div className="nexo-table-foot">
                <span>{filtradas.length} de {db.comissoes.length} lançamentos</span>
                <span className="mono">Total no filtro: {formatBRL(sum(filtradas.map((c) => c.valorComissao)))}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="nexo-table-wrap">
          {fechamentoPorConsultora.length === 0 ? (
            <EmptyState icon={Users} title="Nenhum fechamento ainda" sub="Lance comissões para ver o total por consultora." />
          ) : (
            <div className="nexo-table-scroll">
              <table className="nexo-table">
                <thead><tr><th>Consultora</th><th>Contratos</th><th>Total de comissão</th><th>Pago</th><th>A pagar</th><th style={{ width: 160 }}>Progresso pago</th></tr></thead>
                <tbody>
                  {fechamentoPorConsultora.map((f) => {
                    const pct = f.totalComissao > 0 ? Math.round((f.totalPago / f.totalComissao) * 100) : 0;
                    return (
                      <tr key={f.consultora.id}>
                        <td>
                          <div className="nexo-name-cell">
                            <div className="nexo-avatar-sm" style={{ background: getAvatarColor(f.consultora.nome) }}>{getIniciais(f.consultora.nome)}</div>
                            <span style={{ fontWeight: 600 }}>{f.consultora.nome}</span>
                          </div>
                        </td>
                        <td>{f.totalContratos}</td>
                        <td className="mono" style={{ fontWeight: 600 }}>{formatBRL(f.totalComissao)}</td>
                        <td className="mono" style={{ color: "var(--success)" }}>{formatBRL(f.totalPago)}</td>
                        <td className="mono" style={{ color: "var(--warning)" }}>{formatBRL(f.totalAPagar)}</td>
                        <td>
                          <div className="nexo-progress-track">
                            <div className="nexo-progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="nexo-cell-muted" style={{ fontSize: 11, marginTop: 3 }}>{pct}% pago</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App shell                                                            */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard, group: "Visão geral" },
  { key: "clientes", label: "Clientes", Icon: Users, group: "Operação" },
  { key: "veiculos", label: "Veículos", Icon: Car, group: "Operação" },
  { key: "cotacoes", label: "Cotação de seguros", Icon: Wallet, group: "Operação" },
  { key: "financeiro", label: "Financeiro", Icon: Receipt, group: "Financeiro" },
  { key: "comissoes", label: "Comissões", Icon: CreditCard, group: "Financeiro" },
  { key: "adesoes", label: "Adesões", Icon: FileDown, group: "Financeiro" },
  { key: "consultoras", label: "Consultoras", Icon: Users, group: "Equipe & recursos" },
  { key: "relatorios", label: "Relatórios", Icon: FileText, group: "Equipe & recursos" },
  { key: "links", label: "Links Úteis", Icon: Link2, group: "Equipe & recursos" },
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
  id: r.id, clienteId: r.cliente_id, veiculoId: r.veiculo_id || "", veiculoIds: r.veiculo_ids || [], numero: r.numero || "",
  nossoNumero: r.nosso_numero || "",
  dataEmissao: r.data_emissao || "", dataVencimento: r.data_vencimento || "", valor: r.valor ?? "",
  dataPagamento: r.data_pagamento || "",
});
/** Um boleto pode cobrir vários veículos do mesmo cliente (ex.: boleto único de um cliente
 * com a frota toda). veiculo_ids guarda a lista completa; veiculo_id continua preenchido
 * (com o 1º da lista) só para compatibilidade com telas/relatórios antigos que leem 1 veículo só. */
const boletoToRow = (b) => {
  const veiculoIds = Array.isArray(b.veiculoIds) ? b.veiculoIds.filter(Boolean) : (b.veiculoId ? [b.veiculoId] : []);
  return {
    cliente_id: b.clienteId,
    veiculo_id: veiculoIds.length ? veiculoIds[0] : null,
    veiculo_ids: veiculoIds,
    numero: b.numero,
    nosso_numero: (b.nossoNumero || "").trim() || null,
    data_emissao: b.dataEmissao || null,
    data_vencimento: b.dataVencimento || null, valor: Number(b.valor), data_pagamento: b.dataPagamento || null,
  };
};

/* ------------------------------------------------------------------ */
/* Assistente de IA (Google Gemini) — botão flutuante                  */
/* ------------------------------------------------------------------ */

function AssistenteIA({ db }) {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([]); // { autor: "usuario" | "assistente", texto }
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef(null);

  useEffect(() => {
    if (aberto) fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, aberto]);

  const enviar = async () => {
    const texto = pergunta.trim();
    if (!texto || enviando) return;
    const historico = mensagens;
    setMensagens((m) => [...m, { autor: "usuario", texto }]);
    setPergunta("");
    setEnviando(true);
    try {
      const contexto = montarContextoAssistente(db);
      const resp = await fetch("/api/assistente-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: texto, contexto, historico }),
      });
      const dados = await resp.json().catch(() => ({}));
      setMensagens((m) => [
        ...m,
        { autor: "assistente", texto: dados.resposta || dados.erro || "Não foi possível obter resposta do assistente." },
      ]);
    } catch (e) {
      setMensagens((m) => [...m, { autor: "assistente", texto: "Não foi possível falar com o assistente agora. Tente novamente." }]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setAberto((v) => !v)}
        title="Assistente de IA"
        className="nexo-ai-fab"
        style={{
          position: "fixed", right: 22, bottom: 22, width: 54, height: 54, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent-2), var(--accent))", color: "#fff", border: "none", boxShadow: "0 8px 24px rgba(62,134,191,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 60,
        }}
      >
        {aberto ? <X size={22} /> : <Bot size={24} />}
      </button>

      {aberto && (
        <div
          className="nexo-fade-in"
          style={{
            position: "fixed", right: 22, bottom: 86, width: 340, maxWidth: "calc(100vw - 32px)", height: 460,
            maxHeight: "calc(100vh - 120px)", background: "var(--surface)", border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column",
            overflow: "hidden", zIndex: 60,
          }}
        >
          <div style={{ padding: "13px 14px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13.5, background: "var(--surface-2)" }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, var(--accent-2), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bot size={14} color="#fff" />
            </div>
            Assistente Nexo
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {mensagens.length === 0 && (
              <div className="nexo-cell-muted" style={{ fontSize: 12.5 }}>
                Olá! Posso ajudar com dúvidas sobre o sistema e um resumo geral dos seus números (sem acessar dados pessoais de clientes). O que você quer saber?
              </div>
            )}
            {mensagens.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.autor === "usuario" ? "flex-end" : "flex-start",
                  background: m.autor === "usuario" ? "var(--accent)" : "var(--surface-2)",
                  color: m.autor === "usuario" ? "#fff" : "var(--text)",
                  borderRadius: 10, padding: "8px 11px", fontSize: 13, maxWidth: "85%", whiteSpace: "pre-wrap",
                }}
              >
                {m.texto}
              </div>
            ))}
            {enviando && <div className="nexo-cell-muted" style={{ fontSize: 12 }}>Digitando…</div>}
            <div ref={fimRef} />
          </div>
          <div style={{ padding: 10, borderTop: "1px solid var(--border-soft)", display: "flex", gap: 8 }}>
            <input
              className="nexo-input"
              style={{ flex: 1 }}
              placeholder="Digite sua pergunta…"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") enviar(); }}
              disabled={enviando}
            />
            <button className="nexo-btn nexo-btn-primary nexo-btn-sm" onClick={enviar} disabled={enviando || !pergunta.trim()}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [mfaPendente, setMfaPendente] = useState(false);
  const [mostrarSeguranca, setMostrarSeguranca] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // Disparado quando o usuário chega pelo link de "redefinir senha" do e-mail.
      if (event === "PASSWORD_RECOVERY") setRecuperandoSenha(true);
      setSessao(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Verificação em duas etapas: se o usuário ativou o 2FA, o login por senha
  // só chega ao "aal1" — precisa confirmar o código do app autenticador
  // ("aal2") antes de liberar os dados do sistema.
  useEffect(() => {
    if (!sessao) {
      setMfaPendente(false);
      return;
    }
    let cancelado = false;
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data, error }) => {
      if (cancelado || error) return;
      setMfaPendente(data.currentLevel === "aal1" && data.nextLevel === "aal2");
    });
    return () => { cancelado = true; };
  }, [sessao]);

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
    if (sessao && !mfaPendente) carregarTudo();
  }, [carregarTudo, sessao, mfaPendente]);

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
      showToast("Não foi possível salvar o cliente: " + e.message, "error");
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
      showToast("Não foi possível salvar o veículo: " + e.message, "error");
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
      showToast("Não foi possível salvar o boleto: " + e.message, "error");
    }
  };

  const deleteCliente = async (id) => {
    if (!(await confirmDialog("Excluir este cliente? Os veículos e boletos vinculados também serão removidos."))) return;
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
      showToast("Não foi possível excluir o cliente: " + e.message, "error");
    }
  };

  const deleteVeiculo = async (id) => {
    if (!(await confirmDialog("Excluir este veículo? Boletos lançados só para ele serão removidos; boletos que cobrem vários veículos (inclusive este) serão mantidos, só tirando este veículo da lista."))) return;
    try {
      // Boletos que citam este veículo, via veiculo_ids (boleto de vários veículos) ou veiculo_id (boleto de 1 só)
      const afetados = db.boletos.filter((b) => b.veiculoId === id || (b.veiculoIds || []).includes(id));
      const idsRestantesPorBoleto = new Map(
        afetados.map((b) => [b.id, (b.veiculoIds && b.veiculoIds.length ? b.veiculoIds : (b.veiculoId ? [b.veiculoId] : [])).filter((vid) => vid !== id)])
      );
      const paraExcluir = afetados.filter((b) => (idsRestantesPorBoleto.get(b.id) || []).length === 0);
      const paraAtualizar = afetados.filter((b) => (idsRestantesPorBoleto.get(b.id) || []).length > 0);

      for (const b of paraAtualizar) {
        const novosIds = idsRestantesPorBoleto.get(b.id);
        const { error: errUpd } = await supabase.from("boletos").update({ veiculo_ids: novosIds, veiculo_id: novosIds[0] }).eq("id", b.id);
        if (errUpd) throw errUpd;
      }

      const { error } = await supabase.from("veiculos").delete().eq("id", id);
      if (error) throw error;

      if (paraExcluir.length) {
        const { error: errDel } = await supabase.from("boletos").delete().in("id", paraExcluir.map((b) => b.id));
        if (errDel) throw errDel;
      }

      setDb((prev) => ({
        ...prev,
        veiculos: prev.veiculos.filter((v) => v.id !== id),
        boletos: prev.boletos
          .filter((b) => !paraExcluir.some((x) => x.id === b.id))
          .map((b) => {
            if (!idsRestantesPorBoleto.has(b.id)) return b;
            const novosIds = idsRestantesPorBoleto.get(b.id);
            return { ...b, veiculoIds: novosIds, veiculoId: novosIds[0] || "" };
          }),
      }));
    } catch (e) {
      showToast("Não foi possível excluir o veículo: " + e.message, "error");
    }
  };

  const deleteBoleto = async (id) => {
    if (!(await confirmDialog("Excluir este boleto?"))) return;
    try {
      const { error } = await supabase.from("boletos").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, boletos: prev.boletos.filter((b) => b.id !== id) }));
    } catch (e) {
      showToast("Não foi possível excluir o boleto: " + e.message, "error");
    }
  };

  const marcarPago = async (id) => {
    try {
      const { data, error } = await supabase.from("boletos").update({ data_pagamento: todayISO() }).eq("id", id).select().single();
      if (error) throw error;
      setDb((prev) => ({ ...prev, boletos: prev.boletos.map((b) => (b.id === id ? rowToBoleto(data) : b)) }));
    } catch (e) {
      showToast("Não foi possível atualizar o boleto: " + e.message, "error");
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
      showToast("Não foi possível salvar a seguradora: " + e.message, "error");
      return null;
    }
  };

  const deleteSeguradora = async (id) => {
    if (!(await confirmDialog("Excluir esta seguradora? Os planos vinculados também serão removidos."))) return;
    try {
      const { error } = await supabase.from("seguradoras").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({
        ...prev,
        seguradoras: prev.seguradoras.filter((s) => s.id !== id),
        planos: prev.planos.filter((p) => p.seguradoraId !== id),
      }));
    } catch (e) {
      showToast("Não foi possível excluir a seguradora: " + e.message, "error");
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
      showToast("Não foi possível salvar o plano: " + e.message, "error");
    }
  };

  const deletePlano = async (id) => {
    if (!(await confirmDialog("Excluir este plano?"))) return;
    try {
      const { error } = await supabase.from("planos").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, planos: prev.planos.filter((p) => p.id !== id) }));
    } catch (e) {
      showToast("Não foi possível excluir o plano: " + e.message, "error");
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
      showToast("Não foi possível salvar a cotação: " + e.message, "error");
    }
  };

  const deleteCotacao = async (id) => {
    if (!(await confirmDialog("Excluir esta cotação?"))) return;
    try {
      const { error } = await supabase.from("cotacoes").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, cotacoes: prev.cotacoes.filter((c) => c.id !== id) }));
    } catch (e) {
      showToast("Não foi possível excluir a cotação: " + e.message, "error");
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
      showToast("Não foi possível salvar o link: " + e.message, "error");
    }
  };
  const deleteLink = async (id) => {
    if (!(await confirmDialog("Excluir este link?"))) return;
    try {
      const { error } = await supabase.from("links_uteis").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, linksUteis: prev.linksUteis.filter((l) => l.id !== id) }));
    } catch (e) {
      showToast("Não foi possível excluir o link: " + e.message, "error");
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
      showToast("Não foi possível salvar a consultora: " + e.message, "error");
    }
  };
  const deleteConsultora = async (id) => {
    if (!(await confirmDialog("Excluir esta consultora? Adesões e comissões vinculadas a ela também serão removidas."))) return;
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
      showToast("Não foi possível excluir a consultora: " + e.message, "error");
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
      showToast("Não foi possível salvar a adesão: " + e.message, "error");
    }
  };
  const deleteAdesao = async (id) => {
    if (!(await confirmDialog("Excluir esta adesão?"))) return;
    try {
      const { error } = await supabase.from("adesoes").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, adesoes: prev.adesoes.filter((a) => a.id !== id) }));
    } catch (e) {
      showToast("Não foi possível excluir a adesão: " + e.message, "error");
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
      showToast("Não foi possível atualizar a adesão: " + e.message, "error");
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
      showToast("Não foi possível salvar a comissão: " + e.message, "error");
    }
  };
  const deleteComissao = async (id) => {
    if (!(await confirmDialog("Excluir esta comissão?"))) return;
    try {
      const { error } = await supabase.from("comissoes").delete().eq("id", id);
      if (error) throw error;
      setDb((prev) => ({ ...prev, comissoes: prev.comissoes.filter((c) => c.id !== id) }));
    } catch (e) {
      showToast("Não foi possível excluir a comissão: " + e.message, "error");
    }
  };
  const marcarPagaComissao = async (id) => {
    try {
      const { data, error } = await supabase.from("comissoes").update({ status: "Pago", data_efetiva_pagamento: todayISO() }).eq("id", id).select().single();
      if (error) throw error;
      setDb((prev) => ({ ...prev, comissoes: prev.comissoes.map((c) => (c.id === id ? rowToComissao(data) : c)) }));
    } catch (e) {
      showToast("Não foi possível atualizar a comissão: " + e.message, "error");
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
      showToast(`${data?.length || 0} cliente(s) importado(s) com sucesso.`, "success");
    } catch (e) {
      showToast("Não foi possível importar os clientes: " + e.message, "error");
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
      showToast(msg, ignoradas.length || veiculosIgnorados.length ? "warning" : "success");
    } catch (e) {
      showToast("Não foi possível importar clientes e veículos: " + e.message, "error");
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
      showToast(`${planosData?.length || 0} plano(s) importado(s), em ${seguradorasNovasCriadas.length} seguradora(s) nova(s).`, "success");
    } catch (e) {
      showToast("Não foi possível importar a tabela de preços: " + e.message, "error");
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
        // aceita uma ou várias placas na mesma linha (separadas por , ; ou /) para um boleto único
        // que cobre vários veículos do mesmo cliente
        const placasDaLinha = (l.placa || "").split(/[,;/]+/).map((p) => p.trim()).filter(Boolean);
        const veiculosEncontrados = placasDaLinha
          .map((p) => db.veiculos.find((v) => v.clienteId === cliente.id && v.placa.replace(/[^a-z0-9]/gi, "").toLowerCase() === p.replace(/[^a-z0-9]/gi, "").toLowerCase()))
          .filter(Boolean);
        if (placasDaLinha.length && veiculosEncontrados.length < placasDaLinha.length) {
          const naoEncontradas = placasDaLinha.filter((p) => !veiculosEncontrados.some((v) => v.placa.replace(/[^a-z0-9]/gi, "").toLowerCase() === p.replace(/[^a-z0-9]/gi, "").toLowerCase()));
          rejeitadas.push(`${linhaRef}: placa(s) não encontrada(s) para este cliente: ${naoEncontradas.join(", ")} (boleto seguiu com as demais placas)`);
        }
        payload.push(
          boletoToRow({
            clienteId: cliente.id,
            veiculoIds: veiculosEncontrados.map((v) => v.id),
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
        showToast("Nenhuma linha pôde ser importada.\n\n" + rejeitadas.join("\n"), "warning");
        return;
      }
      const { data, error } = await supabase.from("boletos").insert(payload).select();
      if (error) throw error;
      setDb((prev) => ({ ...prev, boletos: [...prev.boletos, ...(data || []).map(rowToBoleto)] }));
      let msg = `${data?.length || 0} boleto(s) importado(s) com sucesso.`;
      if (rejeitadas.length) msg += `\n\n${rejeitadas.length} linha(s) não importada(s):\n` + rejeitadas.join("\n");
      showToast(msg, rejeitadas.length ? "warning" : "success");
    } catch (e) {
      showToast("Não foi possível importar os boletos: " + e.message, "error");
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
      showToast(msg, naoEncontrados.length ? "warning" : "success");
    } catch (e) {
      showToast("Não foi possível importar o relatório de baixa: " + e.message, "error");
    }
  };

  const goTo = (v) => { setView(v); setSidebarOpen(false); };

  const titleMap = {
    dashboard: "Dashboard", clientes: "Clientes", veiculos: "Veículos", financeiro: "Financeiro", relatorios: "Relatórios",
    cotacoes: "Cotação de seguros", consultoras: "Consultoras", adesoes: "Adesões", comissoes: "Comissões",
    links: "Links Úteis",
    clienteDetail: "Detalhes do cliente",
  };

  const saudacao = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();
  const primeiroNome = (sessao?.user?.email || "").split("@")[0].split(".")[0];
  const nomeExibicao = primeiroNome ? primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1) : "";
  const iniciaisUsuario = (nomeExibicao || sessao?.user?.email || "U").slice(0, 2).toUpperCase();

  const cnhAlertas = useMemo(() => cnhsVencendo(db.clientes, 30), [db.clientes]);
  const boletosVencendoAlerta = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return db.boletos
      .filter((b) => !b.dataPagamento && b.dataVencimento)
      .map((b) => ({ ...b, dias: Math.round((parseISODate(b.dataVencimento) - hoje) / 86400000) }))
      .filter((b) => b.dias >= 0 && b.dias <= 7)
      .sort((a, b) => a.dias - b.dias);
  }, [db.boletos]);
  const totalNotificacoes = cnhAlertas.length + boletosVencendoAlerta.length;

  const handleGlobalSearchKeyDown = (e) => {
    if (e.key !== "Enter") return;
    const termo = normalizarTexto(globalSearch.trim());
    if (!termo) return;
    const alvo = db.clientes.find((c) => normalizarTexto(c.nome).includes(termo) || (c.cpf || "").includes(termo));
    if (alvo) {
      openDetail(alvo.id);
    } else {
      setView("clientes");
    }
    setGlobalSearch("");
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

  if (mfaPendente) {
    return (
      <div className="nexo">
        <style>{STYLE}</style>
        <MfaChallengeScreen onVerificado={() => setMfaPendente(false)} />
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
          <aside className={`nexo-sidebar ${sidebarOpen ? "open" : ""} ${sidebarCollapsed ? "collapsed" : ""}`}>
            <div className="nexo-brand">
              <div className="nexo-brand-mark">NG</div>
              <div className="nexo-brand-text">
                <div className="nexo-brand-name">Nexo Gestão</div>
                <div className="nexo-brand-tag">Clientes · Veículos · Financeiro</div>
              </div>
            </div>
            <div className="nexo-sidebar-scroll">
              {["Visão geral", "Operação", "Financeiro", "Equipe & recursos"].map((grupo) => (
                <nav className="nexo-nav" key={grupo}>
                  <div className="nexo-sidebar-group-label">{grupo}</div>
                  {NAV_ITEMS.filter((item) => item.group === grupo).map(({ key, label, Icon }) => (
                    <div
                      key={key}
                      className={`nexo-nav-item ${view === key || (view === "clienteDetail" && key === "clientes") ? "active" : ""}`}
                      onClick={() => goTo(key)}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                      {sidebarCollapsed && <div className="nexo-nav-tooltip">{label}</div>}
                    </div>
                  ))}
                </nav>
              ))}
            </div>
            <button className="nexo-collapse-btn" onClick={() => setSidebarCollapsed((v) => !v)} title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}>
              {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
              <span>Recolher menu</span>
            </button>
            <div className="nexo-sidebar-foot">
              <div className="nexo-sidebar-foot-info">v1.0 · Nexo Gestão</div>
            </div>
          </aside>

          <div className={`nexo-main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
            <header className="nexo-topbar">
              <div className="nexo-topbar-left">
                <button className="nexo-hamburger" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
                <div className="nexo-topbar-title">
                  {titleMap[view]}
                  <span className="nexo-topbar-greeting">{saudacao}{nomeExibicao ? `, ${nomeExibicao}` : ""}</span>
                </div>
                <div className="nexo-topbar-search hide-mobile">
                  <Search size={14} />
                  <input
                    placeholder="Buscar cliente por nome ou CPF…"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    onKeyDown={handleGlobalSearchKeyDown}
                  />
                </div>
              </div>
              <div className="nexo-topbar-actions">
                <div className="nexo-topbar-actions hide-mobile" style={{ marginRight: 4 }}>
                  <button className="nexo-btn nexo-btn-sm" onClick={() => openModal("cliente")}><Plus size={13} /> Cliente</button>
                  <button className="nexo-btn nexo-btn-sm" onClick={() => openModal("veiculo")}><Plus size={13} /> Veículo</button>
                  <button className="nexo-btn nexo-btn-sm nexo-btn-primary" onClick={() => openModal("boleto")}><Plus size={13} /> Boleto</button>
                </div>

                <div className="nexo-dropdown">
                  <button className="nexo-topbar-iconbtn" onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }} title="Notificações">
                    <Bell size={16} />
                    {totalNotificacoes > 0 && <span className="nexo-notif-dot" />}
                  </button>
                  {notifOpen && (
                    <div className="nexo-dropdown-menu" style={{ minWidth: 300 }} onMouseLeave={() => setNotifOpen(false)}>
                      <div style={{ padding: "6px 8px 8px", fontSize: 12.5, fontWeight: 700, borderBottom: "1px solid var(--border-soft)", marginBottom: 4 }}>
                        Notificações {totalNotificacoes > 0 ? `(${totalNotificacoes})` : ""}
                      </div>
                      {totalNotificacoes === 0 && (
                        <div style={{ padding: "14px 8px", fontSize: 12.5, color: "var(--text-faint)", textAlign: "center" }}>Tudo em dia por aqui 👍</div>
                      )}
                      {boletosVencendoAlerta.slice(0, 4).map((b) => {
                        const cliente = db.clientes.find((c) => c.id === b.clienteId);
                        return (
                          <button key={b.id} className="nexo-dropdown-item" onClick={() => { setView("financeiro"); setNotifOpen(false); }}>
                            <Clock size={14} />
                            <span>{cliente?.nome || "Cliente"} · boleto vence {b.dias === 0 ? "hoje" : `em ${b.dias}d`}</span>
                          </button>
                        );
                      })}
                      {cnhAlertas.slice(0, 4).map((c) => (
                        <button key={c.id} className="nexo-dropdown-item" onClick={() => { openDetail(c.id); setNotifOpen(false); }}>
                          <AlertTriangle size={14} />
                          <span>CNH de {c.nome.split(" ")[0]} vencendo</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="nexo-dropdown">
                  <div className="nexo-user-chip" onClick={() => { setUserMenuOpen((v) => !v); setNotifOpen(false); }}>
                    <div className="nexo-avatar-xs" style={{ background: "linear-gradient(135deg, var(--accent-2), var(--accent-dim))" }}>{iniciaisUsuario}</div>
                    <div className="hide-mobile">
                      <div className="nexo-user-chip-name">{nomeExibicao || "Usuário"}</div>
                      <div className="nexo-user-chip-role">Corretora</div>
                    </div>
                    <ChevronDown size={14} className="hide-mobile" />
                  </div>
                  {userMenuOpen && (
                    <div className="nexo-dropdown-menu" onMouseLeave={() => setUserMenuOpen(false)}>
                      <div style={{ padding: "6px 10px 10px", fontSize: 12, color: "var(--text-faint)", wordBreak: "break-all", borderBottom: "1px solid var(--border-soft)", marginBottom: 4 }}>
                        {sessao?.user?.email}
                      </div>
                      <button className="nexo-dropdown-item" onClick={() => { setMostrarSeguranca(true); setUserMenuOpen(false); }}>
                        <Shield size={14} /> Segurança e senha
                      </button>
                      <div className="nexo-dropdown-sep" />
                      <button className="nexo-dropdown-item" onClick={() => supabase.auth.signOut()}>
                        <LogOut size={14} /> Sair
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <main className="nexo-content nexo-fade-in" key={view}>
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

          <AssistenteIA db={db} />
        </div>
      )}

      {mostrarSeguranca && <SegurancaModal onClose={() => setMostrarSeguranca(false)} />}

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

      <ToastHost />
      <ConfirmHost />
    </div>
  );
}
