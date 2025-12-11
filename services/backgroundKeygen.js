import { db } from "@/config/firebaseConfig";
import { generateAndStoreKeypair, savePrivateKey } from "@/services/cryptoService";
import { doc, setDoc } from "firebase/firestore";


export async function runBackgroundKeygen(userId) {
  if (!userId) return { success: false, error: "missing-userId" };

  try {
    const rnmt = await import("react-native-multithreading");

    const spawnThread = rnmt && rnmt.spawnThread ? rnmt.spawnThread : null;
    if (!spawnThread) {
      throw new Error("spawnThread-not-available");
    }

    const runWorker = spawnThread(() => require("../workers/crypto.worker.js"));
    const result = await runWorker(userId); 

    if (!result || !result.publicKeyPem || !result.privateKeyPem) {
      throw new Error("invalid-worker-result");
    }

    const { publicKeyPem, privateKeyPem } = result;

    await savePrivateKey(userId, privateKeyPem);

    await setDoc(doc(db, "users", userId), { publicKey: publicKeyPem }, { merge: true });

    return { success: true, publicKey: publicKeyPem };
  } catch (err) {
    console.warn("Background keygen worker unavailable or failed:", err?.message || err);

    try {
      setTimeout(async () => {
        try {
          await generateAndStoreKeypair(userId); 
          console.log("Fallback key generation (JS-thread) completed for", userId);
        } catch (e) {
          console.error("Fallback key generation failed:", e);
        }
      }, 50);

      return { success: false, error: "worker_failed_fallback_started" };
    } catch (fallbackErr) {
      console.error("Fallback scheduling failed:", fallbackErr);
      return { success: false, error: fallbackErr.message || String(fallbackErr) };
    }
  }
}
