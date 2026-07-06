"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth";
import { loginSchema, registroSchema } from "@/lib/validations";

/* ------------------------------- LOGIN ------------------------------- */
export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "E-mail ou senha inválidos." };
  }

  const supabase = await createServerClientInstance();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Credenciais inválidas. Verifique e tente novamente." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/* ------------------------------ REGISTRO ----------------------------- */
export async function registroAction(formData: FormData) {
  const parsed = registroSchema.safeParse({
    empresaNome: formData.get("empresaNome"),
    nome: formData.get("nome"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { error: firstError?.message ?? "Dados inválidos." };
  }

  const { empresaNome, nome, email, password } = parsed.data;
  const supabase = await createServerClientInstance();

  // 1. Cria o usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome, empresa_nome: empresaNome },
    },
  });

  if (authError || !authData.user) {
    return {
      error: authError?.message ?? "Não foi possível criar a conta.",
    };
  }

  // 2. Cria a empresa (em produção, idealmente via trigger no banco)
  const slug = empresaNome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { data: empresa, error: empresaError } = await supabase
    .from("empresas")
    .insert({
      nome: empresaNome,
      slug,
      plano: "pro",
      status: "trial",
    })
    .select()
    .single();

  if (empresaError || !empresa) {
    return { error: "Erro ao criar empresa. Tente novamente." };
  }

  // 3. Cria o perfil do usuário vinculado à empresa
  const { error: perfilError } = await supabase.from("usuarios").insert({
    auth_user_id: authData.user.id,
    empresa_id: empresa.id,
    nome,
    email,
    role: "admin",
    status: "ativo",
  });

  if (perfilError) {
    return { error: "Erro ao criar perfil de usuário." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/* ------------------------------ LOGOUT ------------------------------- */
export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClientInstance();
    await supabase.auth.signOut();
  }
  revalidatePath("/");
  redirect("/");
}

/* --------------------------- CRIAR OS --------------------------- */
export async function criarOSAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    // Modo demo: apenas simula sucesso
    revalidatePath("/os");
    redirect("/os");
  }

  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado." };
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!perfil) {
    return { error: "Perfil não encontrado." };
  }

  const { data: os } = await supabase
    .from("ordens_servico")
    .insert({
      empresa_id: perfil.empresa_id,
      numero: `OS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      cliente_id: formData.get("clienteId"),
      tecnico_id: formData.get("tecnicoId") || null,
      prioridade: formData.get("prioridade"),
      problema: formData.get("problema"),
    })
    .select("id")
    .single();

  if (os) {
    revalidatePath("/os");
    redirect(`/os/${os.id}`);
  }

  return { error: "Erro ao criar OS." };
}

/* --------------------------- CRIAR CLIENTE --------------------------- */
export async function criarClienteAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    revalidatePath("/clientes");
    redirect("/clientes");
  }

  // TODO: implementar com Supabase
  revalidatePath("/clientes");
  redirect("/clientes");
}
