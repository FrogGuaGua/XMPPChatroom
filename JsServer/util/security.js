// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen

const forge = require('node-forge');

// class for generate rsa2048 public key and private key
class RSAOAEP2048 {
    constructor() {
        this.RSA = forge.pki.rsa;
        this.generateKeyPair();
        this.publicKeyPem = forge.pki.publicKeyToPem(this.publicKey)
        this.privateKeyPem = forge.pki.privateKeyToPem(this.privateKey)
    }
    // generate key pair for rsa
    generateKeyPair() {
        this.RSAHandle = this.RSA.generateKeyPair({ bits: 2048, e: 0x10001 });
        this.publicKey = this.RSAHandle.publicKey;
        this.privateKey = this.RSAHandle.privateKey;
    }
    // function to encrypte data
    encrypt(data) {
        return this.publicKey.encrypt(data, 'RSA-OAEP', {
            md: forge.md.sha1.create(),
            mgf1: {
                md: forge.md.sha256.create()
            }
        });
    }
    // function to decrypte data
    decrypt(data) {
        return this.privateKey.decrypt(data, 'RSA-OAEP', {
            md: forge.md.sha1.create(),
            mgf1: {
                md: forge.md.sha256.create()
            }
        });
    }

}
// function to check json file
function fieldCheck(fields, json) {
    for (const field of fields) {
        if (!(field in json) || typeof json[field] !== 'string' || json[field].trim() === '') {
            return false;
        }
    }
    return true
}
// copy the data to object
function copy(data, json) {
    try {
        for (let key in json) {
            if (key in json && key in data) {
                copy(data[key], json[key])
            } else {
                data[key] = json[key]
            }
        }
    } catch (e) {
        console.log("copy error")
        return false
    }
}
module.exports = { RSAOAEP2048, fieldCheck, copy };