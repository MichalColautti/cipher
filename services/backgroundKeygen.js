import { NativeModules } from "react-native";


export async function runBackgroundKeygen(userId, options = { allowFallback: true }) {
  if (!userId) return { success: false, error: "missing-userId" };

  let canUseNativeWorker = false;
  try {
    const nativeRegistry = NativeModules && NativeModules.ReactNativeMultithreading;
    if (nativeRegistry) canUseNativeWorker = true;
  } catch (e) {
    canUseNativeWorker = false;
  }

  if (canUseNativeWorker) {
    try {
      const rnmt = require("react-native-multithreading");
      if (rnmt && typeof rnmt.spawnThread === "function") {
        try {
          const runWorker = rnmt.spawnThread(() => require("../workers/crypto.worker.js"));
          const result = await runWorker(userId);
          if (result && result.publicKeyPem && result.privateKeyPem) {
            return { success: true, publicKeyPem: result.publicKeyPem, privateKeyPem: result.privateKeyPem };
          }
          console.warn("Background keygen worker returned unexpected result, falling back");
        } catch (workerErr) {
          console.warn("Background keygen worker failed, falling back:", workerErr && workerErr.message ? workerErr.message : workerErr);
        }
      }
    } catch (requireErr) {
      console.warn("react-native-multithreading require failed:", requireErr && requireErr.message ? requireErr.message : requireErr);
    }
  } else {
    console.warn("Native react-native-multithreading module not present — skipping native worker");
    if (!options.allowFallback) return { success: false, error: "no_worker" };
  }

  if (!options.allowFallback) return { success: false, error: "no_worker" };

  try {
    const genFn = require("../workers/crypto.worker.js");
    if (typeof genFn === "function") {
      const result = await genFn(userId);
      if (result && result.publicKeyPem && result.privateKeyPem) {
        return { success: true, publicKeyPem: result.publicKeyPem, privateKeyPem: result.privateKeyPem };
      }
      return { success: false, error: "fallback_worker_no_keys" };
    } else {
      return { success: false, error: "worker_module_invalid" };
    }
  } catch (fallbackErr) {
    console.error("Background keygen fallback (JS) failed:", fallbackErr);
    return { success: false, error: fallbackErr && fallbackErr.message ? fallbackErr.message : String(fallbackErr) };
  }
}
