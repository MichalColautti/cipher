const forge = require("node-forge");

module.exports = async function generateKeypairWorker(/* userId optional */) {
  // Generate RSA keypair (2048-bit) entirely inside worker thread
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
  const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

  // Return PEMs to main thread — do NOT call native modules here
  return { publicKeyPem, privateKeyPem };
};
