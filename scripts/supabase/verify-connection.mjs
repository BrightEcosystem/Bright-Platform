#!/usr/bin/env node
// Diagnóstico de conectividade pública com o Supabase, em camadas: DNS, TCP 443,
// GET simples à origem, e GET ao endpoint REST usando apenas a chave publicável.
// Nunca imprime URLs completas, domínios, chaves, senhas ou cabeçalhos de
// autenticação — apenas status (ok/falhou) e a causa técnica genérica do erro.
// Usa somente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { lookup } from "node:dns/promises";
import { connect } from "node:net";

const HTTP_TIMEOUT_MS = 15000;
const TCP_TIMEOUT_MS = 5000;

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

function classifyError(err) {
  if (err.name === "AbortError" || err.name === "TimeoutError") {
    return `timeout (${HTTP_TIMEOUT_MS / 1000}s)`;
  }

  const code = err.cause?.code ?? err.code;

  if (code === "ENOTFOUND" || code === "EAI_AGAIN") return "falha de DNS";
  if (code === "ECONNREFUSED") return "conexão recusada";
  if (code === "ECONNRESET") return "conexão interrompida (reset)";
  if (code === "ETIMEDOUT") return "timeout de conexão";
  if (
    typeof code === "string" &&
    (code.startsWith("CERT_") ||
      code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
      code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
      code === "SELF_SIGNED_CERT_IN_CHAIN")
  ) {
    return "erro de certificado/TLS";
  }

  return `erro genérico de rede (${code || err.name || "desconhecido"})`;
}

async function checkDns(hostname) {
  try {
    await lookup(hostname);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: classifyError(err) };
  }
}

function checkPort(hostname, port) {
  return new Promise((resolvePromise) => {
    const socket = connect({ host: hostname, port, timeout: TCP_TIMEOUT_MS });
    const finish = (ok, error) => {
      socket.destroy();
      resolvePromise({ ok, error });
    };
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false, "timeout de conexão"));
    socket.once("error", (err) => finish(false, classifyError(err)));
  });
}

async function checkHttp(url, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, error: classifyError(err) };
  } finally {
    clearTimeout(timer);
  }
}

loadEnvLocal();

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!rawUrl || !anonKey) {
  console.log(
    "Configuração ausente: NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY não definidos.",
  );
  console.log("Rode `npm run supabase:check` para o diagnóstico completo.");
  process.exitCode = 1;
  process.exit();
}

let parsed;
try {
  parsed = new URL(rawUrl);
} catch {
  console.log("NEXT_PUBLIC_SUPABASE_URL não é uma URL válida (valor não exibido).");
  process.exitCode = 1;
  process.exit();
}

const hostname = parsed.hostname; // usado só internamente, nunca impresso

console.log("Diagnóstico de conexão pública com o Supabase\n");

const dns = await checkDns(hostname);
console.log(`  DNS: ${dns.ok ? "resolvido" : `falhou (${dns.error})`}`);

const port = dns.ok
  ? await checkPort(hostname, 443)
  : { ok: false, error: "não testado (DNS falhou antes)" };
console.log(`  HTTPS (porta 443): ${port.ok ? "acessível" : `falhou (${port.error})`}`);

const baseResult = port.ok
  ? await checkHttp(parsed.origin + "/", {})
  : { ok: false, error: "não testado (porta 443 inacessível)" };
console.log(
  `  GET à origem do projeto: ${baseResult.ok ? `respondeu (status ${baseResult.status})` : `falhou (${baseResult.error})`}`,
);

const restResult = baseResult.ok
  ? await checkHttp(`${parsed.origin}/rest/v1/`, {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    })
  : { ok: false, error: "não testado (GET à origem falhou)" };

console.log("");

if (!restResult.ok) {
  console.log(`  Resposta HTTP (endpoint REST): não recebida`);
  console.log(`  Causa técnica: ${restResult.error}`);
  console.log("\nFalha de rede — não foi possível confirmar conexão com o projeto.");
  process.exitCode = 1;
} else {
  const status = restResult.status;
  const authOutcome =
    status >= 200 && status < 300
      ? "aceita"
      : status === 401 || status === 403
        ? "rejeitada (chave inválida ou sem permissão)"
        : status === 404
          ? "endpoint não encontrado (projeto pode estar pausado ou URL incorreta)"
          : `resposta HTTP ${status} (não classificada)`;

  console.log(`  Resposta HTTP (endpoint REST): recebida (status ${status})`);
  console.log(`  Autenticação pública: ${authOutcome}`);
  console.log("\nConexão confirmada — o servidor respondeu.");
  process.exitCode = 0;
}
