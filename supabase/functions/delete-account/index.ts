import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function resposta(status: number, corpo: Record<string, unknown>) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return resposta(405, { error: "Método não permitido." });
  }

  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token) return resposta(401, { error: "Sessão não encontrada." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return resposta(500, { error: "A função de exclusão não está configurada no Supabase." });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return resposta(401, { error: "Sessão inválida ou expirada." });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // A exclusão do usuário dispara as FKs ON DELETE CASCADE já configuradas
  // para profiles, profissionais e plantas.
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Falha ao excluir usuário:", deleteError);
    return resposta(500, {
      error: "Não foi possível excluir a conta. Nenhum acesso foi removido. " + deleteError.message,
    });
  }

  // Os objetos do Storage não são removidos automaticamente pela exclusão do Auth.
  const { error: storageError } = await adminClient.storage
    .from("professional-documents")
    .remove([`${user.id}/comprovante`]);

  if (storageError) {
    console.error("Conta excluída, mas houve falha ao remover documento:", storageError);
  }

  return resposta(200, {
    success: true,
    storageCleanupWarning: Boolean(storageError),
  });
});
