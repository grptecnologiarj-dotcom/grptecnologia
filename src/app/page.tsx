"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Wrench, ArrowRight, CheckCircle2, Star, Zap, Shield, BarChart2,
  MessageCircle, Package, Calendar, ClipboardList, Camera, ChevronDown,
  Users, TrendingUp, Clock, Play,
} from "lucide-react";

/* ─── helpers ─────────────────────────────────────── */

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className}
      initial={{ y: 24 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.01 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className}
      initial={{ y: 16 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.01 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/* ─── mini UI cards (hero right side) ───────────── */

function DashboardCard() {
  return (
    <div className="w-[340px] rounded-2xl border border-white/20 bg-white/90 p-5 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Dashboard</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "OS abertas", val: "14", color: "#2563eb", up: "+3 hoje" },
          { label: "Faturamento", val: "R$18,7k", color: "#16a34a", up: "+12%" },
          { label: "Técnicos", val: "4/5", color: "#7c3aed", up: "ativos" },
          { label: "Prontas", val: "6", color: "#ea580c", up: "retirada" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] text-slate-400 font-medium">{k.label}</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px] text-slate-400">{k.up}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {[
          { label: "OS-2026-0042 · iPhone 13", status: "Em reparo", color: "#2563eb" },
          { label: "OS-2026-0041 · Notebook Dell", status: "Pronto", color: "#16a34a" },
        ].map((o) => (
          <div key={o.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span className="text-[11px] font-medium text-slate-600 truncate max-w-[180px]">{o.label}</span>
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: o.color + "18", color: o.color }}>{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OSCard() {
  return (
    <div className="w-[260px] rounded-2xl border border-white/20 bg-white/95 p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <ClipboardList className="size-3.5 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">OS-2026-0042</p>
          <p className="text-[10px] text-slate-400">João Pedro · iPhone 13 Pro</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {[
          { step: "OS aberta", done: true },
          { step: "Diagnóstico", done: true },
          { step: "Orçamento aprovado", done: true },
          { step: "Em reparo", done: false, active: true },
          { step: "Pronto para retirada", done: false },
        ].map((s) => (
          <div key={s.step} className="flex items-center gap-2">
            <div className={`size-3.5 rounded-full shrink-0 flex items-center justify-center ${s.done ? "bg-green-500" : s.active ? "bg-blue-600 ring-2 ring-blue-200" : "bg-slate-200"}`}>
              {s.done && <CheckCircle2 className="size-2.5 text-white" />}
            </div>
            <span className={`text-[10px] ${s.done ? "text-slate-500 line-through" : s.active ? "font-semibold text-blue-600" : "text-slate-400"}`}>{s.step}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2">
        <p className="text-[10px] text-blue-600 font-semibold">💬 Orçamento aprovado via WhatsApp às 15:30</p>
      </div>
    </div>
  );
}

function WhatsAppCard() {
  return (
    <div className="w-[240px] rounded-2xl border border-white/20 bg-white/95 p-4 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.14)] backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-7 rounded-full bg-[#25d366] flex items-center justify-center">
          <MessageCircle className="size-3.5 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">WhatsApp</p>
          <p className="text-[10px] text-green-500 font-medium">● Conectado</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="rounded-xl rounded-tl-sm bg-slate-100 px-3 py-2 max-w-[180px]">
          <p className="text-[10px] text-slate-600">Olá! Quando fica pronto o notebook?</p>
          <p className="text-[9px] text-slate-400 mt-0.5">14:32</p>
        </div>
        <div className="rounded-xl rounded-tr-sm bg-blue-600 px-3 py-2 max-w-[180px] ml-auto">
          <p className="text-[10px] text-white">Sua OS está <strong>pronta para retirada</strong>! ✅</p>
          <p className="text-[9px] text-blue-200 mt-0.5">14:35 ✓✓</p>
        </div>
        <div className="rounded-xl rounded-tl-sm bg-slate-100 px-3 py-2 max-w-[180px]">
          <p className="text-[10px] text-slate-600">Ótimo! Vou buscar hoje à tarde.</p>
          <p className="text-[9px] text-slate-400 mt-0.5">14:38</p>
        </div>
      </div>
    </div>
  );
}

function RevenueCard() {
  const bars = [42, 68, 55, 82, 73, 90];
  const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  return (
    <div className="w-[200px] rounded-2xl border border-white/20 bg-white/95 p-4 shadow-[0_14px_36px_-8px_rgba(0,0,0,0.12)] backdrop-blur-xl">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Faturamento</p>
      <p className="text-xl font-bold text-slate-800">R$ 18.750</p>
      <p className="text-[10px] text-green-500 font-semibold mb-3">↑ 12% vs. mês anterior</p>
      <div className="flex items-end gap-1 h-14">
        {bars.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
            <div className="w-full rounded-t-sm" style={{ height: `${h}%`, background: i === bars.length - 1 ? "#2563eb" : "#dbeafe" }} />
            <span className="text-[8px] text-slate-400">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── features ────────────────────────────────────── */

const features = [
  { icon: ClipboardList, title: "Ordens de Serviço", desc: "Checklists, peças, diagnóstico, garantia e aprovação digital. Tudo sem papel.", color: "#2563eb", bg: "#eff6ff" },
  { icon: Camera, title: "Evidências fotográficas", desc: "Fotografe na entrada e na entrega. Proteja sua empresa e construa confiança.", color: "#7c3aed", bg: "#f5f3ff" },
  { icon: MessageCircle, title: "WhatsApp integrado", desc: "Notificações automáticas de status, orçamentos e conclusão de serviço.", color: "#16a34a", bg: "#f0fdf4" },
  { icon: Package, title: "Controle de estoque", desc: "Peças, movimentações e alertas de estoque mínimo em tempo real.", color: "#ea580c", bg: "#fff7ed" },
  { icon: BarChart2, title: "Financeiro completo", desc: "DRE simplificado, fluxo de caixa, ticket médio e relatórios por técnico.", color: "#0891b2", bg: "#ecfeff" },
  { icon: Calendar, title: "Agenda e visitas", desc: "Agendamento de visitas técnicas com vinculo direto a OS e técnico responsável.", color: "#9333ea", bg: "#faf5ff" },
];

const steps = [
  { num: "01", title: "Abra a OS em segundos", desc: "Cadastre o cliente, equipamento e problema relatado. Dispare o link de acompanhamento automaticamente." },
  { num: "02", title: "Execute com controle", desc: "Registre diagnóstico, peças usadas e evidências. A timeline atualiza em tempo real para o cliente." },
  { num: "03", title: "Feche e receba", desc: "Emita garantia, registre o pagamento e gere o comprovante digital. Tudo em um só lugar." },
];

const testimonials = [
  { name: "Carlos Eduardo", role: "TechRepair SP", text: "Em 3 meses organizei minha assistência e aumentei 40% no faturamento. A diferença entre antes e depois é absurda.", stars: 5, letter: "C", color: "#2563eb" },
  { name: "Mariana Ferreira", role: "iService Curitiba", text: "O portal do cliente é incrível. Reduzimos em 70% as ligações perguntando sobre o andamento da OS.", stars: 5, letter: "M", color: "#7c3aed" },
  { name: "Roberto Nascimento", role: "CFTV Solutions MG", text: "Trabalho com contratos de manutenção preventiva. O módulo de contratos me economiza horas por mês.", stars: 5, letter: "R", color: "#16a34a" },
];

const plans = [
  {
    name: "Starter", price: "R$ 0", period: "/mês",
    desc: "Para técnicos autônomos",
    items: ["30 OS por mês", "1 usuário", "Clientes ilimitados", "App mobile PWA"],
    cta: "Começar grátis", highlight: false,
  },
  {
    name: "Pro", price: "R$ 79", period: "/mês",
    desc: "Para assistências em crescimento",
    items: ["OS ilimitadas", "Até 5 usuários", "WhatsApp integrado", "Financeiro completo", "Evidências fotográficas", "Aprovação digital"],
    cta: "Testar 14 dias grátis", highlight: true,
    badge: "Mais popular",
  },
  {
    name: "Business", price: "R$ 199", period: "/mês",
    desc: "Para múltiplas unidades",
    items: ["Tudo do Pro", "Usuários ilimitados", "Multiunidades", "White Label", "Suporte prioritário"],
    cta: "Falar com vendas", highlight: false,
  },
];

const faqs = [
  { q: "Preciso instalar algum programa?", r: "Não. O DeskControl é 100% online. Acesse pelo navegador em qualquer dispositivo — computador, tablet ou celular." },
  { q: "Meus dados ficam seguros?", r: "Sim. Utilizamos Supabase (PostgreSQL) com criptografia em trânsito e em repouso. Cada empresa tem seus dados completamente isolados." },
  { q: "Funciona para celular e eletrodoméstico?", r: "Sim. Para qualquer tipo de assistência: smartphones, notebooks, CFTV, eletrodomésticos, impressoras, redes e muito mais." },
  { q: "O contrato tem fidelidade?", r: "Não. Todos os planos são mensais sem fidelidade. Cancele a qualquer momento, sem multa." },
  { q: "Tem suporte em português?", r: "Sim. Suporte 100% em português via WhatsApp e e-mail, de seg–sex, 8h–18h, pela equipe da GRP Tecnologia." },
];

/* ─── MAIN ──────────────────────────────────────── */

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.4]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="flex flex-col bg-white text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm"
          : "bg-transparent"
      }`}>
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.4)]">
              <Wrench className="size-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Desk<span className="text-blue-600">Control</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden items-center gap-8 md:flex">
            {[
              { href: "#como-funciona", label: "Como funciona" },
              { href: "#recursos", label: "Recursos" },
              { href: "#planos", label: "Planos" },
              { href: "#depoimentos", label: "Clientes" },
            ].map((l) => (
              <a key={l.href} href={l.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
              Entrar
            </Link>
            <Link href="/registro"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)] hover:bg-blue-700 hover:shadow-[0_4px_16px_rgba(37,99,235,0.45)] transition-all duration-200">
              Teste grátis
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/40" />
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-blue-500/6 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[80px]" />
          <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] -translate-x-1/2 rounded-full bg-blue-400/4 blur-[90px]" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            {/* Left */}
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700"
              >
                <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                Mais de 500 assistências técnicas no Brasil
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="text-[2.75rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-slate-900 sm:text-5xl lg:text-[3.5rem]"
              >
                Controle total da sua{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    assistência técnica
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600/40 to-transparent rounded-full" />
                </span>
                {" "}em um só lugar.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 text-lg leading-relaxed text-slate-500"
              >
                OS, clientes, WhatsApp, estoque, financeiro e agenda — integrados e funcionando do primeiro dia. Sem papel, sem planilha, sem caos.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link href="/registro"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:shadow-[0_6px_28px_rgba(37,99,235,0.5)] transition-all duration-200">
                  Começar 14 dias grátis
                  <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm">
                  <Play className="size-3.5 fill-slate-600 text-slate-600" />
                  Ver como funciona
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 flex items-center gap-4 flex-wrap"
              >
                <div className="flex -space-x-2">
                  {["C", "M", "R", "A", "J"].map((l, i) => (
                    <div key={i} className="flex size-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm"
                      style={{ background: ["#2563eb","#7c3aed","#16a34a","#ea580c","#0891b2"][i] }}>
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />)}
                    <span className="ml-1.5 text-sm font-semibold text-slate-800">4.9</span>
                  </div>
                  <p className="text-xs text-slate-500">+500 assistências confiam no DeskControl</p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="mt-4 text-xs text-slate-400"
              >
                ✓ Sem cartão de crédito &nbsp;·&nbsp; ✓ Cancele quando quiser &nbsp;·&nbsp; ✓ Suporte em português
              </motion.p>
            </div>

            {/* Right — floating screens */}
            <div className="relative hidden lg:flex items-center justify-center h-[580px]">
              {/* Dashboard — back left */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ y: heroY }}
                className="absolute left-0 top-8 z-10"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <DashboardCard />
                </motion.div>
              </motion.div>

              {/* OS card — center right */}
              <motion.div
                initial={{ opacity: 0, x: 30, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-0 z-20"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <OSCard />
                </motion.div>
              </motion.div>

              {/* WhatsApp — bottom left */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: 30 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-8 bottom-0 z-30"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <WhatsAppCard />
                </motion.div>
              </motion.div>

              {/* Revenue — bottom right */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: 30 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-4 bottom-8 z-20"
              >
                <motion.div
                  animate={{ y: [0, 7, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                  <RevenueCard />
                </motion.div>
              </motion.div>

              {/* Glow ring */}
              <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 rounded-full bg-blue-500/8 blur-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="size-5 text-slate-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ LOGOS / SEGMENTOS ═══════════════ */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
              Funciona para todos os segmentos de assistência técnica
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: "📱", label: "Celulares" },
                { icon: "💻", label: "Notebooks" },
                { icon: "🖥️", label: "Computadores" },
                { icon: "📺", label: "Eletrônicos" },
                { icon: "📸", label: "Câmeras" },
                { icon: "🔒", label: "CFTV" },
                { icon: "🏠", label: "Eletrodomésticos" },
                { icon: "🖨️", label: "Impressoras" },
                { icon: "🔧", label: "Geral" },
              ].map((s) => (
                <div key={s.label}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-colors cursor-default">
                  <span>{s.icon}</span>
                  {s.label}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════ COMO FUNCIONA ═══════════════ */}
      <section id="como-funciona" className="py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center mb-16">
            <FadeUp>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Como funciona</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Do caos ao controle em 3 passos
              </h2>
              <p className="mt-4 text-slate-500">Simples de configurar, poderoso no dia a dia.</p>
            </FadeUp>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((s, i) => (
              <ScaleIn key={s.num} delay={i * 0.12}>
                <div className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] transition-shadow">
                  <div className="mb-6 inline-flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-black text-blue-600">
                    {s.num}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-4 text-slate-300 text-2xl z-10">→</div>
                  )}
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ RECURSOS ═══════════════ */}
      <section id="recursos" className="py-28 lg:py-36 bg-slate-50/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center mb-16">
            <FadeUp>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Recursos</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Tudo que sua assistência precisa
              </h2>
              <p className="mt-4 text-slate-500">Pensado por quem conhece a rotina de uma assistência técnica de verdade.</p>
            </FadeUp>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <ScaleIn key={f.title} delay={i * 0.07}>
                <div className="group h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="mb-5 inline-flex size-11 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105"
                    style={{ backgroundColor: f.bg }}>
                    <f.icon className="size-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ DIFERENCIAL (timeline) ═══════════════ */}
      <section className="py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <FadeUp>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Transparência total</p>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight">
                  Cada OS com linha do tempo e histórico completo
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-500">
                  Nunca mais perca uma informação. Todo o histórico desde a entrada do equipamento até a entrega — visível para você e para o cliente.
                </p>
                <ul className="mt-8 space-y-3">
                  {[
                    "Fotos da entrada e saída do equipamento",
                    "Timeline de todas as alterações",
                    "Orçamento digital com aprovação pelo WhatsApp",
                    "Assinatura digital do cliente",
                    "Garantia emitida automaticamente",
                    "Portal público de acompanhamento",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/registro"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] hover:bg-blue-700 transition-all">
                    Experimentar agora
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </FadeUp>

            <ScaleIn delay={0.15}>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-9 rounded-full bg-blue-600 flex items-center justify-center">
                    <ClipboardList className="size-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">OS-2026-0042</p>
                    <p className="text-xs text-slate-400">iPhone 13 Pro · João Pedro Almeida</p>
                  </div>
                  <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">Em reparo</span>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: Camera, label: "Foto de entrada registrada", time: "14:32", done: true, color: "#7c3aed" },
                    { icon: ClipboardList, label: "Diagnóstico: tela trincada + bateria", time: "14:45", done: true, color: "#2563eb" },
                    { icon: MessageCircle, label: "Orçamento enviado via WhatsApp", time: "15:10", done: true, color: "#0891b2" },
                    { icon: CheckCircle2, label: "Orçamento aprovado pelo cliente", time: "15:30", done: true, color: "#16a34a" },
                    { icon: Wrench, label: "Em reparo — Carlos Mendes", time: "Agora", done: false, active: true, color: "#ea580c" },
                  ].map((evt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                        evt.done ? "bg-green-50" : (evt as any).active ? "bg-blue-50 ring-2 ring-blue-200" : "bg-slate-100"
                      }`} style={{ color: evt.done ? "#16a34a" : evt.color }}>
                        <evt.icon className="size-3.5" />
                      </div>
                      <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                        <p className={`text-xs font-medium ${(evt as any).active ? "text-blue-700" : "text-slate-700"}`}>{evt.label}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{evt.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ═══════════════ DEPOIMENTOS ═══════════════ */}
      <section id="depoimentos" className="py-28 lg:py-36 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center mb-16">
            <FadeUp>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Depoimentos</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Quem usa, não volta atrás
              </h2>
            </FadeUp>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <ScaleIn key={t.name} delay={i * 0.1}>
                <div className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(t.stars)].map((_, j) => <Star key={j} className="size-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 mb-6">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: t.color }}>
                      {t.letter}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PLANOS ═══════════════ */}
      <section id="planos" className="py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center mb-16">
            <FadeUp>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Planos</p>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Simples e transparente
              </h2>
              <p className="mt-4 text-slate-500">Comece grátis. Escale quando precisar. Sem surpresas.</p>
            </FadeUp>
          </div>
          <div className="grid gap-5 lg:grid-cols-3 items-start">
            {plans.map((plan, i) => (
              <ScaleIn key={plan.name} delay={i * 0.1}>
                <div className={`relative rounded-2xl p-8 transition-all ${
                  plan.highlight
                    ? "bg-blue-600 text-white shadow-[0_24px_60px_rgba(37,99,235,0.35)] scale-[1.02]"
                    : "border border-slate-100 bg-white shadow-sm"
                }`}>
                  {plan.highlight && plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-bold text-blue-600 shadow-sm">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className={`text-sm font-semibold uppercase tracking-wider mb-1 ${plan.highlight ? "text-blue-200" : "text-slate-500"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mb-5 ${plan.highlight ? "text-blue-200" : "text-slate-400"}`}>{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? "text-blue-200" : "text-slate-400"}`}>{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.items.map((item) => (
                      <li key={item} className={`flex items-center gap-2.5 text-sm ${plan.highlight ? "text-blue-100" : "text-slate-600"}`}>
                        <CheckCircle2 className={`size-4 shrink-0 ${plan.highlight ? "text-blue-300" : "text-green-500"}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/registro"
                    className={`flex w-full items-center justify-center rounded-full py-3 text-sm font-bold transition-all ${
                      plan.highlight
                        ? "bg-white text-blue-600 hover:bg-blue-50 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                    }`}>
                    {plan.cta}
                  </Link>
                </div>
              </ScaleIn>
            ))}
          </div>
          <FadeUp delay={0.3}>
            <p className="mt-8 text-center text-sm text-slate-400">
              ✓ Sem fidelidade &nbsp;·&nbsp; ✓ Cancele quando quiser &nbsp;·&nbsp; ✓ 14 dias grátis nos planos pagos
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section className="py-20 lg:py-28 bg-slate-50/60">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <FadeUp>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Perguntas frequentes</h2>
            </FadeUp>
          </div>
          <div className="space-y-2">
            {faqs.map((item, i) => (
              <FadeUp key={item.q} delay={i * 0.05}>
                <div className={`rounded-2xl border bg-white transition-all overflow-hidden ${
                  openFaq === i ? "border-blue-200 shadow-sm" : "border-slate-100"
                }`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-800">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="size-4 text-slate-400 shrink-0" />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed text-slate-500">{item.r}</p>
                  </motion.div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA FINAL ═══════════════ */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-8 py-20 text-center shadow-[0_32px_80px_rgba(37,99,235,0.3)]">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }} />
              </div>
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-4">Comece hoje</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Pare de perder tempo com papel e planilhas
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
                  Junte-se a centenas de assistências que já modernizaram sua operação com o DeskControl.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/registro"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-blue-600 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:bg-blue-50 transition-all">
                    Criar conta grátis
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link href="/login"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-4 text-sm font-semibold text-white hover:bg-white/20 transition-all">
                    Já tenho conta
                  </Link>
                </div>
                <p className="mt-5 text-sm text-blue-200">14 dias grátis · Sem cartão de crédito · Cancele quando quiser</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600">
                  <Wrench className="size-3.5 text-white" />
                </div>
                <span className="text-sm font-bold">Desk<span className="text-blue-600">Control</span></span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                A plataforma de gestão para assistências técnicas do Brasil.
              </p>
              <p className="mt-4 text-xs text-slate-400">
                Desenvolvido por{" "}
                <span className="font-semibold text-blue-600">GRP Tecnologia</span>
              </p>
            </div>
            {[
              { title: "Produto", links: ["Recursos", "Planos", "Como funciona", "Changelog"] },
              { title: "Empresa", links: ["Sobre nós", "Blog", "Carreiras", "Contato"] },
              { title: "Legal", links: ["Privacidade", "Termos de uso", "Cookies", "Suporte"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-slate-100 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} DeskControl · GRP Tecnologia. Todos os direitos reservados.</p>
            <div className="flex gap-1">
              {["🇧🇷 Feito no Brasil", "🔒 Dados seguros", "⚡ 99.9% uptime"].map((b) => (
                <span key={b} className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] text-slate-400">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
