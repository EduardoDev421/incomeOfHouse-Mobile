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

  // Remove primeiro os dados públicos associados à conta profissional/cliente.
  // Aquisições são removidas antes das plantas para respeitar possíveis chaves estrangeiras.
  const { error: aquisicoesError } = await adminClient
    .from("plantas_adquiridas")
    .delete()
    .eq("usuario_id", user.id);
  if (aquisicoesError) {
    console.error("Falha ao remover aquisições da conta:", aquisicoesError);
    return resposta(500, { error: "Não foi possível remover as aquisições vinculadas à conta." });
  }

  // As plantas publicadas pertencem ao profissional; aquisições pertencem ao usuário.
  const { error: plantasError } = await adminClient
    .from("plantas")
    .delete()
    .eq("profissional_id", user.id);
  if (plantasError) {
    console.error("Falha ao remover plantas da conta:", plantasError);
    return resposta(500, { error: "Não foi possível remover os projetos vinculados à conta." });
  }

  const { error: profissionalError } = await adminClient
    .from("profissionais")
    .delete()
    .eq("id", user.id);
  if (profissionalError) {
    console.error("Falha ao remover perfil profissional:", profissionalError);
    return resposta(500, { error: "Não foi possível remover o perfil profissional vinculado à conta." });
  }

  // Remove arquivos do Storage antes de excluir o usuário do Auth.
  const { error: documentoError } = await adminClient.storage
    .from("professional-documents")
    .remove([`${user.id}/comprovante`]);

  const { data: imagens, error: listarImagensError } = await adminClient.storage
    .from("plantas")
    .list(user.id, { limit: 1000 });

  let imagensError = listarImagensError;
  if (!listarImagensError && imagens?.length) {
    const caminhos = imagens
      .filter((arquivo) => arquivo.name)
      .map((arquivo) => `${user.id}/${arquivo.name}`);
    if (caminhos.length) {
      const { error } = await adminClient.storage.from("plantas").remove(caminhos);
      imagensError = error;
    }
  }

  if (documentoError || imagensError) {
    console.error("Falha ao limpar arquivos do Storage:", documentoError || imagensError);
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Falha ao excluir usuário:", deleteError);
    return resposta(500, {
      error: "Não foi possível concluir a exclusão da conta. " + deleteError.message,
    });
  }

  return resposta(200, {
    success: true,
    storageCleanupWarning: Boolean(documentoError || imagensError),
  });
});
