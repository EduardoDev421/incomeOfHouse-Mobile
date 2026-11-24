# incomeOfHouse---Mobile

## Integração Supabase

O app usa o Supabase para autenticação e perfis. Para configurar o projeto:

1. Se ainda não existir, copie `.env.example` para `.env` na raiz. Se o arquivo já existir, apenas acrescente `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` usando os valores do painel Supabase, sem sobrescrever as demais configurações. Use a chave publicável; nunca coloque a `service_role` no aplicativo.
2. No SQL Editor do projeto, execute as migrações em ordem de timestamp. Se já aplicou `20261122000000_create_profiles.sql`, execute também `20261122190000_professional_document_storage.sql` e `20261123190000_public_professionals.sql`. A última cria funções públicas que retornam somente os dados de divulgação dos profissionais, sem expor dados pessoais.
3. Configure o envio e a confirmação de e-mail em **Authentication** no painel. O cadastro pode exigir confirmação antes do primeiro login.
4. Reinicie o Expo depois de criar ou alterar `.env`.
5. Em **Authentication → URL Configuration → Redirect URLs**, permita `incomeofhouse://AuthCallback` e `incomeofhouse://AlterarSenha` para builds do app. Durante o desenvolvimento, permita também as URLs retornadas por `Linking.createURL('AuthCallback')` e `Linking.createURL('AlterarSenha')` no ambiente usado (Expo Go, web ou development build).

Login, cadastro de clientes e profissionais, confirmação de e-mail, persistência de sessão, logout, recuperação de senha por link e alteração autenticada de senha estão conectados. Nome e telefone do perfil podem ser atualizados; o comprovante profissional pode ser enviado a um bucket privado e seu status passa para análise. A revisão do documento ainda é manual. Projetos, pedidos, portfólio, disponibilidade, mensagens e demais módulos de negócio ainda não estão conectados. A chave `EXPO_PUBLIC_` é incorporada ao app, portanto deve conter somente a chave publicável do Supabase, nunca uma chave secreta.