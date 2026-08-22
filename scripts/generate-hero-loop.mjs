import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const inputImage =
  "/root/olhossecos.com.br-site/public/images/educacao/anatomia-superficie-ocular-3d.jpg";
const outputDir = "/root/olhossecos.com.br-site/public/videos";
const mp4Output = path.join(outputDir, "hero-ocular-surface.mp4");
const webmOutput = path.join(outputDir, "hero-ocular-surface.webm");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("Gerando vídeo em loop de 10s para o Hero...");

// Efeito de respiração de foco (subtle zoom) e varredura de luz especular cíclica de 10 segundos
// Loop perfeito usando expressões periódicas (sin/cos de 2*PI*t/10)
const filter = [
  // 1. Zoom e respiração suave
  "zoompan=z='1.02+0.015*sin(2*PI*in/300)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=300:s=1200x1200:fps=30",
  // 2. Curvas de cor e brilho dinâmico para simular a varredura da luz na película
  "eq=contrast='1.0+0.04*sin(2*PI*n/300)':brightness='0.01*sin(2*PI*n/300+PI/4)':saturation=1.02",
  "format=yuv420p",
].join(",");

// 1. Gerar MP4 (H.264, baseline/main universal compatível com Safari/iOS/Chrome)
const mp4Cmd = `ffmpeg -y -loop 1 -i "${inputImage}" -filter_complex "${filter}" -t 10 -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.0 -preset slow -crf 22 -movflags +faststart "${mp4Output}"`;

console.log("Compilando MP4...");
execSync(mp4Cmd, { stdio: "inherit" });

// 2. Gerar WebM (VP9, alta eficiência e suporte moderno para Chrome/Firefox/Android)
const webmCmd = `ffmpeg -y -loop 1 -i "${inputImage}" -filter_complex "${filter}" -t 10 -c:v libvpx-vp9 -b:v 0 -crf 28 -deadline good -cpu-used 2 "${webmOutput}"`;

console.log("Compilando WebM...");
execSync(webmCmd, { stdio: "inherit" });

const mp4Stat = fs.statSync(mp4Output);
const webmStat = fs.statSync(webmOutput);

console.log(`✅ Vídeos gerados com sucesso!`);
console.log(
  `- MP4: ${(mp4Stat.size / (1024 * 1024)).toFixed(2)} MB (${mp4Output})`,
);
console.log(
  `- WebM: ${(webmStat.size / (1024 * 1024)).toFixed(2)} MB (${webmOutput})`,
);
