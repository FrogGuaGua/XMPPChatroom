const forge = require('node-forge');
class RSAOAEP2048 {
    constructor() {
        this.RSA = forge.pki.rsa;
        this.generateKeyPair();
        this.publicKeyPem = forge.pki.publicKeyToPem(this.publicKey)
        this.privateKeyPem = forge.pki.privateKeyToPem(this.privateKey)
    }

    generateKeyPair() {
        this.RSAHandle = this.RSA.generateKeyPair({ bits: 2048, e: 0x10001 });
        this.publicKey = this.RSAHandle.publicKey;
        this.privateKey = this.RSAHandle.privateKey;
    }

    encrypt(data) {
        return this.publicKey.encrypt(data, 'RSA-OAEP', {
            md: forge.md.sha1.create(),
            mgf1: {
                md: forge.md.sha256.create()
            }
        });
    }
    decrypt(data) {
        return this.privateKey.decrypt(data, 'RSA-OAEP', {
            md: forge.md.sha1.create(),
            mgf1: {
                md: forge.md.sha256.create()
            }
        });
    }

}
function fieldCheck(fields, json) {
    for (const field of fields) {
        if (!(field in json) || typeof json[field] !== 'string' || json[field].trim() === '') {
            return false;
        }
    }
    return true
}
module.exports = { RSAOAEP2048, fieldCheck };