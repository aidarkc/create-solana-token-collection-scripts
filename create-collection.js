// create-collection.js
// 
//  Полностью рабочий вариант скрипта создающего новый токен коллекцию
//
//  !!!!!  обязательно перед запуском вставь в код адрес будущей коллекции выбранный из node generate-addresses.js
//     или можно заменить на генерацию случайного нового адреса 
//
//  запускается:  node create-collection.js
//  что бы потом дальше передать права смарт контракту останется только выполнить готовую команду для передачи прав
//  рядом должен лежать файл my-keypair.json с ключом того кто создаёт коллекцию
//
//  из возможных минусов то что создаётся какойто временный ключ указанный в Mint Authority и он же в Freeze Authority
//  гпт говорит что это не важно так как это временный технический аккаунт b он потом не имеет никаких прав, но типа при желании можно попробывать его принудительно сгенерировать самому
//
//  и ещё при желании можно наверное сделать что бы адрес будущего токена генерировался заранее

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner
} from '@metaplex-foundation/umi';
import { mplTokenMetadata, createNft } from '@metaplex-foundation/mpl-token-metadata';
import { readFileSync } from 'fs';

// Загружаем keypair из файла
const secret = JSON.parse(readFileSync('my-keypair.json', 'utf8'));                // 🔑 Кошелёк, с которого всё делается

// Создаём Umi-клиент
const umi = createUmi('https://api.devnet.solana.com');                             // 🌐 Сеть — Devnet

// Восстанавливаем keypair
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));

// Подключаем плагины
umi
  .use(signerIdentity(createSignerFromKeypair(umi, keypair)))
  .use(mplTokenMetadata());

// -----------------------   или генерируем новый mint-адрес этой командой    ----------------------------------------------------------
// const mint = generateSigner(umi);  // генерируем mint-адрес
// -----------------------   или вставляем сюда заранее сгенерированный и выбранный ключ из результатов node generate-addresses.js   ---

// ✍️ Заранее выбранный mint-секрет в формате типа
// const mintSecret = [
//   // Вставьте сюда 64 байта секретного ключа от понравившегося mint-адреса
// ];

const mintSecret = [

  151,47,238,126,55,59,2,61,253,238,78,135,182,130,236,188,
  122,183,51,216,138,56,214,135,210,165,194,65,7,175,81,120,
  6,149,142,213,206,67,72,139,147,16,202,244,60,15,164,79,
  183,203,161,82,110,236,209,73,188,161,228,169,133,253,88,5,
];



if (mintSecret.length !== 64) {
  throw new Error('❌ Не указан приватный ключ для mint-адреса!');
}

const mintKeypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(mintSecret));
const mint = createSignerFromKeypair(umi, mintKeypair); 
 //------------------------------------------------------------------------------------------------------------------------------------


// 1️⃣ Создаём NFT с флагом isCollection
await createNft(umi, {
  mint,
  name: 'Коллекция',                                                    // 🧾 Имя коллекции (до 32 байт в UTF-8)
  symbol: 'PROMISE',                                                    // 💠 Символ (до 10 символов ASCII) ( например BTC — у биткоина и т.п.) 
  uri: 'https://shineup.me/nft/collection.json',                        // 📄 Ссылка на метаданные
  sellerFeeBasisPoints: 0,                                              // 💸 Роялти
  isCollection: true,                                                   // ✅ Это коллекция
  collectionIsSized: true                                              // 🧮 Позволяет отслеживать число элементов в коллекции
}).sendAndConfirm(umi);



console.log('✅ Коллекция создана!');
console.log('🪙 Mint address: ', mint.publicKey.toString());
console.log('');
console.log('📮 Публичный ключ управления коллекцией : ', keypair.publicKey.toString());
console.log('');
console.log(`🔎 Посмотреть коллекцию: https://explorer.solana.com/address/${mint.publicKey.toString()}?cluster=devnet`);
console.log('');

const newUpdateAuthority = '5dFcWDNp42Xn9Vv4oDMJzM4obBJ8hvDuAtPX54fT5L3t';  // 📍 Новый будущий владелец коллекции (адрес смарт-контракта)

console.log('📦 Готовая команда для передачи прав коллекции через Metaboss:');
console.log('');
console.log(`metaboss set update-authority \\`);
console.log(`  --keypair ./my-keypair.json \\`);
console.log(`  --account ${mint.publicKey.toString()} \\`);
console.log(`  --new-update-authority ${newUpdateAuthority}`);
