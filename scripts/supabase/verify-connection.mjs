#!/usr/bin/env node
// Testa uma única consulta pública e segura contra o Supabase (somente leitura,
// sem criar/alterar/excluir dados). Nunca imprime chaves no terminal.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;

  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.log(
    "Configuração ausente: NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY não definidos.",
  );
  console.log("Rode `npm run supabase:check` para o diagnóstico completo.");
  process.exitCode = 1;
  process.exit();
}

let host = "(url inválida)";
try {
  host = new URL(url).host;
} catch {
  // mantém o valor padrão
}

console.log(`Testando conexão pública e somente-leitura com ${host}...`);

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

// Consulta somente-leitura (HEAD + count), não retorna nem altera dados.
const { error, count } = await supabase
  .from("products")
  .select("id", { count: "exact", head: true });

if (!error) {
  console.log(`Conexão OK. Tabela "products" acessível (${count ?? 0} registro(s)).`);
  process.exit(0);
}

const message = error.message || "";

if (error.code === "PGRST205" || /could not find the table/i.test(message)) {
  console.log(
    'Conectado ao Supabase, mas a tabela "products" ainda não existe. Aplique as migrations em database/migrations/ antes de continuar.',
  );
  process.exitCode = 1;
} else if (
  error.code === "401" ||
  /invalid api key|jwt/i.test(message)
) {
  console.log(
    "Falha de autenticação com o Supabase. Verifique NEXT_PUBLIC_SUPABASE_ANON_KEY (valor não exibido).",
  );
  process.exitCode = 1;
} else {
  console.log(`Não foi possível confirmar a conexão: ${message || "erro desconhecido"}.`);
  process.exitCode = 1;
}
