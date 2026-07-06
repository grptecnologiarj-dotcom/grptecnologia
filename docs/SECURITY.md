# SECURITY — DeskControl

> Segurança não é um módulo. É uma camada em tudo.

---

## 1. MODELO DE AMEAÇAS

### Ameaças prioritárias

| Ameaça | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Vazamento de dados entre tenants | Média | Crítico | RLS + queries explícitas por empresa_id |
| Acesso não autorizado a dados de cliente | Alta | Alto | Auth obrigatória + portal por token |
| Injeção SQL | Baixa | Crítico | Supabase SDK (parametrizado) — nunca SQL concatenado |
| XSS em conteúdo de OS | Média | Médio | Sanitização + CSP |
| CSRF | Baixa | Médio | Server Actions (CSRF automático pelo Next.js) |
| Exposição de chaves de API | Média | Crítico | Variáveis de ambiente server-side, nunca no cliente |
| Brute force em login | Alta | Alto | Rate limiting no Supabase Auth |
| Acesso após revogação | Baixa | Alto | Token de curta duração + blacklist |
| Foto de OS manipulada | Baixa | Alto | Hash SHA-256 + storage imutável |
| Escalação de privilégio | Baixa | Crítico | RBAC verificado em toda Server Action |

---

## 2. AUTENTICAÇÃO

### Supabase Auth (JWT)
- **Sessão:** JWT com expiração de 1 hora, refresh token de 30 dias
- **Storage da sessão:** HttpOnly Cookie (não localStorage — protege contra XSS)
- **Algoritmo:** RS256
- **Claims customizados:** `empresa_id` e `role` injetados no JWT via database.auth hook

```sql
-- Hook: preencher claims customizados no JWT
CREATE OR REPLACE FUNCTION auth.custom_claims(user_id UUID)
RETURNS JSONB AS $$
  SELECT jsonb_build_object(
    'empresa_id', u.empresa_id,
    'role', u.role,
    'nome', u.nome
  )
  FROM public.usuarios u
  WHERE u.auth_user_id = user_id
    AND u.status = 'ativo'
    AND u.deleted_at IS NULL
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
```

### Proteção das rotas
```typescript
// middleware.ts — executado em TODAS as requisições
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { session } } = await supabase.auth.getSession()

  const isPublicRoute = ['/login', '/registro', '/acompanhar'].some(
    path => request.nextUrl.pathname.startsWith(path)
  )

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
}
```

### Rate limiting no login
- Supabase Auth: configurar máximo de 5 tentativas por 15 minutos por IP
- Após 5 falhas: CAPTCHA obrigatório (hCaptcha via Supabase)

---

## 3. AUTORIZAÇÃO

### Princípio do menor privilégio
Cada role tem acesso apenas ao mínimo necessário para sua função. Verificado em duas camadas:

1. **Server Action:** `requireRole()` antes de qualquer operação
2. **RLS:** última linha de defesa no banco

```typescript
// Exemplo de dupla verificação
export async function deletarCliente(clienteId: string) {
  // Camada 1: verificação na Server Action
  const user = await requireAuth()
  await requireRole(user, ['admin'])  // só admin pode deletar

  const supabase = await createServerClient()

  // Camada 2: RLS bloqueia se o usuário não tiver permissão no banco
  const { error } = await supabase
    .from('clientes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', clienteId)
    .eq('empresa_id', user.empresaId)  // explícito

  if (error) throw new Error('Sem permissão ou registro não encontrado')
}
```

### Nunca confiar em dados do cliente
```typescript
// ❌ ERRADO — empresa_id vem do formulário (pode ser manipulado)
export async function criarCliente(formData: FormData) {
  const empresaId = formData.get('empresa_id')  // NUNCA
}

// ✅ CORRETO — empresa_id vem da sessão autenticada
export async function criarCliente(data: unknown) {
  const { empresaId } = await requireAuth()  // do JWT
  // empresaId é confiável
}
```

---

## 4. SEGURANÇA DE DADOS

### Campos sensíveis criptografados

A senha do equipamento é sensível (clientes entregam o PIN do celular).

```sql
-- Extensão para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função de criptografia simétrica
-- A chave fica em variável de ambiente do Supabase, nunca no código
CREATE OR REPLACE FUNCTION encrypt_sensitive(value TEXT)
RETURNS TEXT AS $$
  SELECT encode(
    encrypt(value::bytea, current_setting('app.encryption_key')::bytea, 'aes'),
    'base64'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_sensitive(value TEXT)
RETURNS TEXT AS $$
  SELECT convert_from(
    decrypt(decode(value, 'base64'), current_setting('app.encryption_key')::bytea, 'aes'),
    'UTF8'
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

### Dados pessoais (LGPD)

O DeskControl armazena dados pessoais de clientes. Obrigações:

| Dado | Necessário? | Retenção | Exclusão sob demanda |
|---|---|---|---|
| Nome, CPF, e-mail | Sim (contrato de serviço) | Enquanto cliente | Sim, prazo 30 dias |
| Fotos do equipamento | Sim (prova de estado) | 5 anos | Não (obrigação legal) |
| Histórico de OS | Sim (garantia, auditoria) | 5 anos | Não (obrigação legal) |
| Geolocalização da assinatura | Sim (prova de entrega) | 5 anos | Não |
| IP de acesso | Sim (auditoria) | 1 ano | Sim |

**Implementações LGPD:**
- Política de Privacidade visível no portal do cliente
- Opção de "exportar meus dados" (API de export)
- Soft delete: dados ficam por 30 dias antes da exclusão física
- Log de todas as exportações de dados

---

## 5. SEGURANÇA DA API

### Chaves de API

```
VARIÁVEL                        USADO EM                    EXPOSTO AO CLIENTE?
─────────────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL        Browser + Server            SIM (público)
NEXT_PUBLIC_SUPABASE_ANON_KEY   Browser + Server            SIM (público, RLS protege)
SUPABASE_SERVICE_ROLE_KEY       Server apenas               NÃO (nunca no browser)
EVOLUTION_API_TOKEN             Edge Functions              NÃO
RESEND_API_KEY                  Edge Functions              NÃO
APP_ENCRYPTION_KEY              Banco (variável Supabase)   NÃO
```

**Regra absoluta:** Qualquer variável sem `NEXT_PUBLIC_` prefix nunca chega ao browser.

### Content Security Policy (CSP)

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",  // Next.js requer isso
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} wss://*.supabase.co`,
      "img-src 'self' data: blob: *.supabase.co",
      "frame-ancestors 'none'",
    ].join('; ')
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=()' }
]
```

---

## 6. SEGURANÇA DO STORAGE

### Fotos de OS
- Acesso apenas para usuários autenticados da mesma empresa
- URLs assinadas com expiração para links públicos (portal do cliente)
- Validação de tipo de arquivo (MIME type + extensão)
- Limite de tamanho: 10MB por foto
- Scan de vírus: configurar Supabase Storage scan (futuro)

```typescript
// Gerar URL assinada para o portal do cliente (expira em 1h)
const { data: signedUrl } = await supabase.storage
  .from('deskcontrol')
  .createSignedUrl(`${empresaId}/os/${osId}/entrada/foto1.jpg`, 3600)
```

### Validação de upload
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_SIZE = 10 * 1024 * 1024  // 10MB

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.'
  }
  if (file.size > MAX_SIZE) {
    return 'Arquivo muito grande. Máximo 10MB.'
  }
  return null
}
```

---

## 7. AUDITORIA

### O que registrar

Todo evento de segurança relevante vai para `audit_log`:
- Login / logout
- Tentativa de login falha
- Criação, edição e exclusão de qualquer registro
- Mudança de role de usuário
- Export de dados
- Acesso ao Super Admin
- Falha de autorização (tentativa de acesso negado)

### Implementação via trigger

```sql
-- Trigger genérico de auditoria
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    empresa_id, usuario_id, tabela, registro_id,
    operacao, dados_antes, dados_depois
  )
  VALUES (
    COALESCE(NEW.empresa_id, OLD.empresa_id),
    (SELECT user_id FROM auth.get_current_user_info()),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar nas tabelas críticas
CREATE TRIGGER audit_ordens_servico
  AFTER INSERT OR UPDATE OR DELETE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_transacoes
  AFTER INSERT OR UPDATE OR DELETE ON transacoes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ... etc para tabelas críticas
```

---

## 8. SEGURANÇA DO PORTAL DO CLIENTE

O portal é acessado sem autenticação via token único.

### Proteção do token
- Token: 32 bytes aleatórios em hex (256 bits de entropia)
- Nunca expirável automaticamente (cliente precisa do link longo prazo)
- Pode ser regenerado pelo Admin (invalida link antigo)
- Não inclui informações sobre a empresa no token (apenas opaque)

### O que o portal pode acessar
```sql
-- Policy especial para acesso por token (sem auth.uid())
CREATE POLICY "os_portal" ON ordens_servico
  FOR SELECT USING (
    portal_token = current_setting('request.headers')::json->>'x-portal-token'
  );

-- O portal acessa APENAS:
-- - Dados básicos da OS (status, problema, técnico)
-- - Fotos marcadas como públicas
-- - Valor total
-- - Histórico de eventos (filtrado — sem obs_internas)
-- NÃO acessa: obs_internas, senha_equip, dados financeiros internos
```

---

## 9. SEGURANÇA DO SUPER ADMIN

O Super Admin da GRP tem acesso a dados de todas as empresas.

**Controles:**
- Autenticação MFA obrigatória (TOTP)
- IP whitelist (apenas IPs da GRP)
- Todas as ações logadas com razão obrigatória ("Por que está acessando esta empresa?")
- Impersonação: cria sessão temporária com role 'admin' da empresa alvo + log permanente
- Sem acesso aos dados criptografados (senha_equip)
- Rotação de acesso: revisão trimestral de quem tem acesso

---

## 10. CHECKLIST DE SEGURANÇA POR FEATURE

Antes de qualquer PR de nova feature, verificar:

- [ ] Server Action tem `requireAuth()`
- [ ] Server Action tem `requireRole()` com roles mínimos
- [ ] Queries filtram explicitamente por `empresa_id`
- [ ] Inputs validados com Zod antes de qualquer operação
- [ ] Nenhuma chave secreta em variável `NEXT_PUBLIC_`
- [ ] Uploads validam tipo e tamanho
- [ ] Dados sensíveis não aparecem em logs
- [ ] Evento de auditoria criado para ações críticas
- [ ] Estado vazio testado (o que acontece se o banco retornar null?)
- [ ] Erro do banco não expõe detalhes internos ao usuário

---

*Documento criado em 2026-06-27 | Versão 1.0 | GRP Tecnologia*
