import 'react-native-get-random-values';

import { db } from "@/config/firebaseConfig";
import CryptoJS from "crypto-js";
import { doc, setDoc } from "firebase/firestore";
import forge from "node-forge";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

// ----------------------
// Forge RNG patch for RN/Web
// ----------------------
if (typeof global.crypto !== "undefined" && forge) {
  forge.random.getBytes = (count, callback) => {
    const bytes = new Uint8Array(count);
    global.crypto.getRandomValues(bytes);
    const str = Array.from(bytes).map(b => String.fromCharCode(b)).join("");
    if (callback) callback(str);
    return str;
  };
} else {
  console.warn("No secure random available for Forge!");
}

// ----------------------
// PRIVATE KEY STORAGE
// ----------------------
async function savePrivateKey(userId, privateKeyPem) {
  const safeKey = `${userId.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  if (isWeb) {
    localStorage.setItem(safeKey, privateKeyPem);
  } else {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.setItemAsync(safeKey, privateKeyPem, {
      keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY,
    });
  }
}

async function getPrivateKey(userId) {
  const safeKey = `${userId.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  if (isWeb) return localStorage.getItem(safeKey);
  console.log("Retrieving private key for:", safeKey);
  const SecureStore = await import("expo-secure-store");
  return await SecureStore.getItemAsync(safeKey);
}

// ----------------------
// RSA KEY GENERATION
// ----------------------
export async function generateAndStoreKeypair(userId) {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

  const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

  await setDoc(doc(db, "users", userId), { publicKey: publicKeyPem }, { merge: true });

  await savePrivateKey(userId, privateKeyPem);

  return { publicKey: publicKeyPem };
}

// ----------------------
// AES HELPERS
// ----------------------
function fromBase64(b64) {
  return CryptoJS.enc.Base64.parse(b64);
}

export function aesEncryptToBase64(plaintext, aesKeyWordArray) {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(plaintext, aesKeyWordArray, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return {
    ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
    iv: iv.toString(CryptoJS.enc.Base64),
    keyBase64: CryptoJS.enc.Base64.stringify(aesKeyWordArray),
  };
}

export function aesDecryptFromBase64(ciphertextBase64, aesKeyBase64, ivBase64) {
  const keyWA = fromBase64(aesKeyBase64);
  const iv = fromBase64(ivBase64);
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(ciphertextBase64),
  });
  const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWA, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// ----------------------
// RSA ENCRYPT/DECRYPT
// ----------------------
export async function rsaEncryptBase64(aesKeyBase64, recipientPublicKeyPem) {
  const publicKey = forge.pki.publicKeyFromPem(recipientPublicKeyPem);
  const encryptedBytes = publicKey.encrypt(aesKeyBase64, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
  return forge.util.encode64(encryptedBytes);
}

export async function rsaDecryptBase64(encryptedBase64, privateKeyPem) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encryptedBytes = forge.util.decode64(encryptedBase64);
  return privateKey.decrypt(encryptedBytes, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
}

// ----------------------
// PUBLIC INTERFACE
// ----------------------
export { getPrivateKey, savePrivateKey };

