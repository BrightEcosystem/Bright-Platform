#!/usr/bin/env node
// Valida se as variáveis de ambiente obrigatórias para o Supabase existem e
// têm um formato plausível. NUNCA imprime valores — apenas presente/ausente/inválido.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

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

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function looksLikeJwt(value) {
  return value.split(".").length === 3;
}

function isPostgresUrl(value) {
  return /^postgres(ql)?:\/\/.+/.test(value);
}

function isProjectRef(value) {
  return /^[a-z0-9-]{6,40}$/i.test(value);
}

const CHECKS = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", validate: isValidUrl },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", validate: looksLikeJwt },
  { key: "SUPABASE_SERVICE_ROLE_KEY", validate: looksLikeJwt },
  { key: "SUPABASE_PROJECT_REF", validate: isProjectRef },
  { key: "DATABASE_URL", validate: isPostgresUrl },
  { key: "DIRECT_URL", validate: isPostgresUrl },
];

loadEnvLocal();

let hasProblem = false;

console.log("Verificação de ambiente do Supabase\n");

for (const { key, validate } of CHECKS) {
  const value = process.env[key];
  let status;

  if (value === undefined || value === "") {
    status = "ausente";
    hasProblem = true;
  } else if (!validate(value)) {
    status = "inválido";
    hasProblem = true;
  } else {
    status = "presente";
  }

  console.log(`  ${status === "presente" ? "OK" : "!!"}  ${key}: ${status}`);
}

console.log("");

if (hasProblem) {
  console.log(
    "Configuração incompleta. Crie/edite .env.local com base em .env.example e rode novamente.",
  );
  process.exitCode = 1;
} else {
  console.log("Todas as variáveis obrigatórias estão presentes e com formato válido.");
}
