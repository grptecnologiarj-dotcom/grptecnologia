-- =========================================================
-- Seed inicial — GRP Tecnologia
-- Execute APÓS criar o usuário admin no Supabase Auth:
--   Authentication → Users → "Add user" (e-mail + senha)
-- Depois substitua <AUTH_USER_ID> pelo UUID gerado
-- =========================================================

-- Garantir empresa GRP
insert into empresas (id, nome, slug, email, cidade, estado, plano, status)
values (
  '00000000-0000-0000-0000-000000000001',
  'GRP Tecnologia',
  'grp',
  'contato@grptecnologia.com.br',
  'Rio de Janeiro',
  'RJ',
  'pro',
  'ativo'
) on conflict (id) do update
  set nome = excluded.nome,
      email = excluded.email;

-- Criar perfil de admin
-- INSTRUÇÃO: copie o UUID do usuário criado no Auth e substitua abaixo
/*
insert into usuarios (auth_user_id, empresa_id, nome, email, role, status)
values (
  '<AUTH_USER_ID>',
  '00000000-0000-0000-0000-000000000001',
  'Gabriel',
  'gabriel@grptecnologia.com.br',
  'admin',
  'ativo'
);
*/

-- Após descomentar e executar, verifique:
-- select * from usuarios;
-- select * from empresas;
