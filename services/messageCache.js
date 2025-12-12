import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";
import { Platform } from "react-native";
const isWeb = Platform.OS === "web";

const CACHE_PREFIX = "cipher_cache_"; 
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; 
const MAX_MESSAGES_PER_CHAT = 1000; 

async function getOrCreateCacheMasterKey(userId) {
  if (isWeb) return null;
  try {
    const SecureStore = await import("expo-secure-store");
    const keyName = `cipher_cache_key_${userId.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const existing = await SecureStore.getItemAsync(keyName);
    if (existing) return existing;
    const keyWA = CryptoJS.lib.WordArray.random(32);
    const keyB64 = CryptoJS.enc.Base64.stringify(keyWA);
    await SecureStore.setItemAsync(keyName, keyB64, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
    return keyB64;
  } catch (e) {
    console.warn("SecureStore not available for cache encryption:", e);
    return null;
  }
}

function computeCipherHash(ciphertextBase64, ivBase64) {
  return CryptoJS.SHA256(ciphertextBase64 + "|" + ivBase64).toString(CryptoJS.enc.Hex);
}

async function _readRawStorage(key) {
  if (isWeb) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  } else {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
}

async function _writeRawStorage(key, val) {
  const ser = JSON.stringify(val);
  if (isWeb) {
    try {
      localStorage.setItem(key, ser);
      return true;
    } catch (e) {
      return false;
    }
  } else {
    try {
      await AsyncStorage.setItem(key, ser);
      return true;
    } catch (e) {
      return false;
    }
  }
}

async function _removeRawStorage(key) {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
}


export async function saveDecryptedMessage({ chatRoomId, messageId, plaintext, ciphertext, iv, createdAtMs, userId, senderId }) {
  const key = CACHE_PREFIX + chatRoomId;
  const bucket = (await _readRawStorage(key)) || { messages: [] };

  const cipherHash = computeCipherHash(ciphertext, iv);
  const now = Date.now();

  let textEncrypted = null;
  let textPlain = null;
  const masterKey = await getOrCreateCacheMasterKey(userId).catch(() => null);
  if (masterKey) {
    const keyWA = CryptoJS.enc.Base64.parse(masterKey);
    const ivWA = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(plaintext, keyWA, { iv: ivWA, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    textEncrypted = ivWA.toString(CryptoJS.enc.Base64) + ":" + encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  } else {
    textPlain = plaintext;
  }

  bucket.messages = bucket.messages.filter(m => m.id !== messageId);

  bucket.messages.unshift({
    id: messageId,
    textEncrypted,
    text: textPlain,
    cipherHash,
    createdAtMs: createdAtMs || now,
    savedAtMs: now,
    senderId: senderId,
  });

  if (bucket.messages.length > MAX_MESSAGES_PER_CHAT) {
    bucket.messages = bucket.messages.slice(0, MAX_MESSAGES_PER_CHAT);
  }

  await _writeRawStorage(key, bucket);
}


export async function loadCachedDecryptedMessage({ chatRoomId, messageId, ciphertext, iv, userId }) {
  const key = CACHE_PREFIX + chatRoomId;
  const bucket = (await _readRawStorage(key));
  if (!bucket || !Array.isArray(bucket.messages)) return null;

  const entry = bucket.messages.find(m => m.id === messageId);
  if (!entry) return null;

  const now = Date.now();
  if (entry.savedAtMs && now - entry.savedAtMs > CACHE_TTL_MS) {
    bucket.messages = bucket.messages.filter(m => m.id !== messageId);
    await _writeRawStorage(key, bucket);
    return null;
  }

  const cipherHash = computeCipherHash(ciphertext, iv);
  if (!entry.cipherHash || entry.cipherHash !== cipherHash) return null;

  if (entry.textEncrypted) {
    const masterKey = await getOrCreateCacheMasterKey(userId).catch(() => null);
    if (!masterKey) return null;
    try {
      const [ivB64, ctB64] = entry.textEncrypted.split(":");
      const keyWA = CryptoJS.enc.Base64.parse(masterKey);
      const ivWA = CryptoJS.enc.Base64.parse(ivB64);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(ctB64),
      });
      const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWA, {
        iv: ivWA,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      return plaintext || null; 
    } catch (e) {
      console.warn("Failed to decrypt cache entry:", e);
      return null;
    }
  }

  return entry.text || null;
}



export async function loadAllCachedForChat({ chatRoomId, userId }) {
  const key = CACHE_PREFIX + chatRoomId;
  const bucket = (await _readRawStorage(key));
  if (!bucket || !Array.isArray(bucket.messages)) return {};
  const now = Date.now();
  const out = {};
  for (const entry of bucket.messages) {
    if (entry.savedAtMs && now - entry.savedAtMs > CACHE_TTL_MS) continue;
    if (entry.textEncrypted) {
      const masterKey = await getOrCreateCacheMasterKey(userId).catch(() => null);
      if (!masterKey) continue;
      try {
        const [ivB64, ctB64] = entry.textEncrypted.split(":");
        const keyWA = CryptoJS.enc.Base64.parse(masterKey);
        const ivWA = CryptoJS.enc.Base64.parse(ivB64);
        const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(ctB64) });
        const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWA, { iv: ivWA, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        if (plaintext) out[entry.id] = {
            text: plaintext,
            createdAtMs: entry.createdAtMs,
            senderId: entry.senderId,
        };
      } catch (e) {
        continue;
      }
    } else if (entry.text) {
        out[entry.id] = {
            text: entry.text,
            createdAtMs: entry.createdAtMs,
            senderId: entry.senderId,
        };
    }
  }
  return out;
}


export async function clearCacheForChat(chatRoomId) {
  const key = CACHE_PREFIX + chatRoomId;
  await _removeRawStorage(key);
}

export async function clearCachedMessage(chatRoomId, messageId) {
  const key = CACHE_PREFIX + chatRoomId;
  const bucket = (await _readRawStorage(key));
  if (!bucket) return;
  bucket.messages = bucket.messages.filter(m => m.id !== messageId);
  await _writeRawStorage(key, bucket);
}
