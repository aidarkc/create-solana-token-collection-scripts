import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

const umi = createUmi('https://api.devnet.solana.com');

// ✍️ Параметры генерации
const prefix = 'ii';     // ← Префикс публичного ключа
const countNeeded = 10;    // ← Сколько нужно найти

let found = 0;
let attempts = 0;
let startTime = Date.now();
let lastReportTime = Date.now();

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function updateProgress() {
  const elapsed = Date.now() - startTime;
  const line = `🔁 Попыток: ${attempts.toString().padStart(10)} | Время: ${formatDuration(elapsed)}`;
  process.stdout.write(`\r${line.padEnd(60)} `); // перезаписать строку
}

console.log(`🔮 Ищем публичные ключи, начинающиеся с "${prefix}"...`);

while (found < countNeeded) {
  const kp = umi.eddsa.generateKeypair();
  const pub = kp.publicKey.toString();
  attempts++;
  
  if (attempts % 1000 === 0) {
    updateProgress();
  }

  if (pub.startsWith(prefix)) {
    const elapsed = Date.now() - startTime;
    const secret = Array.from(kp.secretKey);

    console.log(`\n\n// -----------------------`);
    console.log(`// #${found + 1} найдено после ${attempts} попыток, время: ${formatDuration(elapsed)}`);
    console.log(`// 🪙 Mint Address: ${pub}`);
    console.log(`// 📦 Вставь этот блок в create-collection.js`);
    console.log(`const mintSecret = [`);
    console.log(
      secret.map((b, idx) => (idx % 16 === 0 ? '\n  ' : '') + b + ',').join('') + '\n];\n'
    );

    found++;
    attempts = 0;
    startTime = Date.now();
  }
}

console.log(`\n✅ Готово! Найдено ${countNeeded} адресов за ${formatDuration(Date.now() - startTime)}.`);

