const forge = require("node-forge");

module.exports = async function generateKeypairWorker(/* userId optional */) {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
  const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

  return { publicKeyPem, privateKeyPem };
};
