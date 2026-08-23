import { execFileSync, spawn } from "node:child_process";
import {
  cpSync,
  existsSync,
  chownSync,
  mkdtempSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  activateRelease,
  assertBuildMatchesCommit,
  assertRollbackAvailable,
  assertSafeReleasePath,
  rollbackRelease,
  secureReleaseTree,
} from "../src/lib/release.ts";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (!key?.startsWith("--") || !value) {
    throw new Error("Use pares --opcao valor.");
  }
  args.set(key, value);
}

const sourceDirectory = resolve(args.get("--source") ?? "");
const sha = args.get("--sha") ?? "";
const releaseRoot = resolve(
  args.get("--release-root") ?? "/var/www/olhossecos",
);
const serviceName = args.get("--service") ?? "olhossecos-astro.service";
const healthOrigin = args.get("--health-origin") ?? "http://127.0.0.1:4321";
const mode = args.get("--mode") ?? "activate";
const runtimeUser = args.get("--runtime-user") ?? "www-data";
const testMode = process.env.OLHOSSECOS_DEPLOY_TEST_MODE === "1";
// A suíte de deploy roda contra diretórios temporários e não deve tocar em API
// externa; --indexnow no ativa o mesmo desligamento à mão.
const submitToIndexNow =
  !testMode && (args.get("--indexnow") ?? "sim").toLowerCase() !== "nao";
const indexNowScript = fileURLToPath(
  new URL("./submit-indexnow.mjs", import.meta.url),
);

if (!/^[0-9a-f]{40}$/u.test(sha)) {
  throw new Error("--sha deve ser um SHA Git completo.");
}
if (!sourceDirectory || sourceDirectory === "/") {
  throw new Error("--source deve apontar para um checkout isolado.");
}
if (mode !== "activate" && mode !== "prepare-only") {
  throw new Error("--mode deve ser activate ou prepare-only.");
}
if (testMode && !releaseRoot.startsWith("/tmp/")) {
  throw new Error("O modo de teste só pode usar uma raiz dentro de /tmp.");
}
if (!testMode && process.getuid?.() !== 0) {
  throw new Error("O deploy operacional deve ser executado como root.");
}

const runtimeIdentity =
  process.getuid?.() === 0
    ? {
        uid: Number(
          execFileSync("id", ["-u", runtimeUser], { encoding: "utf8" }).trim(),
        ),
        gid: Number(
          execFileSync("id", ["-g", runtimeUser], { encoding: "utf8" }).trim(),
        ),
      }
    : { uid: process.getuid?.(), gid: process.getgid?.() };

const sourceSha = execFileSync(
  "git",
  ["-C", sourceDirectory, "rev-parse", "HEAD"],
  {
    encoding: "utf8",
  },
).trim();
if (sourceSha !== sha) {
  throw new Error(`Checkout em ${sourceSha}; esperado ${sha}.`);
}
const sourceStatus = execFileSync(
  "git",
  ["-C", sourceDirectory, "status", "--porcelain"],
  { encoding: "utf8" },
).trim();
if (sourceStatus) {
  throw new Error("O checkout de origem possui alterações locais.");
}
assertBuildMatchesCommit(sourceDirectory, sha);

for (const requiredPath of [
  "dist/server/entry.mjs",
  "dist/client",
  "dist/BUILD_METADATA.json",
  "package.json",
  "package-lock.json",
  "scripts",
  "src/lib",
]) {
  if (!existsSync(join(sourceDirectory, requiredPath))) {
    throw new Error(`Artefato obrigatório ausente: ${requiredPath}`);
  }
}

const releasesDirectory = join(releaseRoot, "releases");
const releasePath = assertSafeReleasePath(
  releaseRoot,
  join(releasesDirectory, sha),
);
const incomingPath = join(releasesDirectory, `.incoming-${sha}-${process.pid}`);
const currentLink = join(releaseRoot, "current");
if (existsSync(releasePath)) {
  throw new Error(`O release ${sha} já existe; nada foi sobrescrito.`);
}

mkdirSync(releasesDirectory, { recursive: true, mode: 0o755 });
rmSync(incomingPath, { recursive: true, force: true });
mkdirSync(incomingPath, { mode: 0o755 });
const npmCacheDirectory = mkdtempSync(join(tmpdir(), "olhossecos-npm-cache-"));
chownSync(
  npmCacheDirectory,
  runtimeIdentity.uid ?? 0,
  runtimeIdentity.gid ?? 0,
);
chownSync(incomingPath, runtimeIdentity.uid ?? 0, runtimeIdentity.gid ?? 0);

const copy = (relativePath) => {
  cpSync(
    join(sourceDirectory, relativePath),
    join(incomingPath, relativePath),
    {
      recursive: true,
      dereference: false,
    },
  );
};

try {
  for (const relativePath of [
    "dist",
    "scripts",
    "src/lib",
    "package.json",
    "package-lock.json",
  ]) {
    copy(relativePath);
  }
  writeFileSync(join(incomingPath, "RELEASE_SHA"), `${sha}\n`, { mode: 0o644 });
  execFileSync("npm", ["ci", "--omit=dev", "--ignore-scripts"], {
    cwd: incomingPath,
    env: {
      ...process.env,
      NPM_CONFIG_CACHE: npmCacheDirectory,
    },
    uid: runtimeIdentity.uid,
    gid: runtimeIdentity.gid,
    stdio: "inherit",
  });

  const candidatePort = 44322;
  const candidate = spawn(
    process.execPath,
    [join(incomingPath, "dist/server/entry.mjs")],
    {
      cwd: incomingPath,
      env: {
        ...process.env,
        HOST: "127.0.0.1",
        PORT: String(candidatePort),
        NODE_ENV: "production",
      },
      uid: runtimeIdentity.uid,
      gid: runtimeIdentity.gid,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let candidateOutput = "";
  candidate.stdout.on("data", (chunk) => {
    candidateOutput += String(chunk);
  });
  candidate.stderr.on("data", (chunk) => {
    candidateOutput += String(chunk);
  });

  const candidateOrigin = `http://127.0.0.1:${candidatePort}`;
  const deadline = Date.now() + 15_000;
  try {
    for (const path of ["/", "/newsletter", "/superficie", "/app"]) {
      let passed = false;
      while (Date.now() < deadline) {
        if (candidate.exitCode !== null) break;
        try {
          const response = await fetch(`${candidateOrigin}${path}`);
          if (response.status === 200) {
            passed = true;
            break;
          }
        } catch {
          // O candidato ainda pode estar iniciando.
        }
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
      }
      if (!passed) {
        throw new Error(
          `Health check do candidato falhou em ${path}.\n${candidateOutput}`,
        );
      }
    }
  } finally {
    if (candidate.exitCode === null) candidate.kill("SIGTERM");
  }

  renameSync(incomingPath, releasePath);
  secureReleaseTree(releasePath);

  if (mode === "prepare-only") {
    console.log(`Release preparado: ${releasePath}`);
  } else {
    assertRollbackAvailable(currentLink);
    const previousTarget = activateRelease({
      currentLink,
      releasePath,
      releaseRoot,
    });
    try {
      execFileSync("systemctl", ["restart", serviceName], { stdio: "inherit" });
      const healthDeadline = Date.now() + 20_000;
      let healthy = false;
      while (Date.now() < healthDeadline) {
        try {
          const response = await fetch(`${healthOrigin}/`);
          if (response.status === 200) {
            healthy = true;
            break;
          }
        } catch {
          // Aguarda o serviço reiniciar.
        }
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
      }
      if (!healthy) throw new Error("Health gate do serviço ativo falhou.");
    } catch (error) {
      rollbackRelease({ currentLink, previousTarget, releaseRoot });
      execFileSync("systemctl", ["restart", serviceName], { stdio: "inherit" });
      throw error;
    }

    console.log(`Release ativo: ${releasePath}`);

    // O IndexNow existia como npm run seo:indexnow e dependia de alguém
    // lembrar — na prática, nunca rodou, e Bing e Yandex só descobriam
    // conteúdo novo no rastreio natural.
    //
    // Roda depois do health gate, com o release já no ar: avisar buscador
    // sobre página que ainda não responde é pior que não avisar. Falha aqui
    // não derruba o deploy nem dispara rollback — o site já está servindo, e
    // uma API de terceiro fora do ar não é motivo para desfazer a publicação.
    if (submitToIndexNow) {
      try {
        execFileSync(process.execPath, [indexNowScript], { stdio: "inherit" });
      } catch (error) {
        console.warn(`IndexNow não foi notificado: ${error.message}`);
      }
    }
  }
} catch (error) {
  rmSync(incomingPath, { recursive: true, force: true });
  throw error;
} finally {
  rmSync(npmCacheDirectory, { recursive: true, force: true });
}
