import { db } from "@/config/firebaseConfig";
import { generateAndStoreKeypair, savePrivateKey } from "@/services/cryptoService"; // uses expo-secure-store etc.
import { doc, setDoc } from "firebase/firestore";

/**
 * Run background key generation for userId.
 * - Preferred: spawn worker (if available) that returns PEMs, persist on main thread.
 * - Fallback: use generateAndStoreKeypair on JS thread (scheduled via setTimeout).
 *
 * Returns: { success: true, publicKey } OR { success: false, error }
 */
export async function runBackgroundKeygen(userId) {
  if (!userId) return { success: false, error: "missing-userId" };

  // Try dynamic import of react-native-multithreading (lazy)
  try {
    // dynamic import so Metro/Expo won't require it at module evaluation time
    const rnmt = await import("react-native-multithreading");

    // If the module does not expose spawnThread, treat as unavailable
    const spawnThread = rnmt && rnmt.spawnThread ? rnmt.spawnThread : null;
    if (!spawnThread) {
      throw new Error("spawnThread-not-available");
    }

    // spawn worker (pass worker path relative to this file)
    const runWorker = spawnThread(() => require("../workers/crypto.worker.js"));
    const result = await runWorker(userId); // worker returns { publicKeyPem, privateKeyPem }

    if (!result || !result.publicKeyPem || !result.privateKeyPem) {
      throw new Error("invalid-worker-result");
    }

    const { publicKeyPem, privateKeyPem } = result;

    // Persist private key securely on main thread
    await savePrivateKey(userId, privateKeyPem);

    // Persist public key to Firestore (merge to avoid clobbering other fields)
    await setDoc(doc(db, "users", userId), { publicKey: publicKeyPem }, { merge: true });

    return { success: true, publicKey: publicKeyPem };
  } catch (err) {
    // Worker unavailable or failed — fallback gracefully
    console.warn("Background keygen worker unavailable or failed:", err?.message || err);

    // Start fallback generation on the JS thread but do NOT await it here (non-blocking)
    try {
      setTimeout(async () => {
        try {
          await generateAndStoreKeypair(userId); // this writes to SecureStore and Firestore
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
