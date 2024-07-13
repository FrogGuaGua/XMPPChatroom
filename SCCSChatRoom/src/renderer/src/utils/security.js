import { md, pki } from "node-forge";

class RSAOAEP2048 {
    constructor() {
        this.RSA = pki.rsa
        this.generateKeyPair()
        this.publicKeyPem = pki.publicKeyToPem(this.publicKey)
        this.privateKeyPem = pki.privateKeyToPem(this.privateKey)
    }
    generateKeyPair() {
        this.RSAHandle = this.RSA.generateKeyPair({ bits: 2048, e: 0x10001 })
        this.publicKey = this.RSAHandle.publicKey
        this.privateKey = this.RSAHandle.privateKey
    }
    encrypt(data) {
        return this.publicKey.encrypt(data, 'RSA-OAEP', {
            md: md.sha256.create(),
            mgf1: {
                md: md.sha1.create()
            }
        })
    }
    decrypt(data) {
        return this.privateKey.decrypt(data, 'RSA-OAEP', {
            md: md.sha256.create(),
            mgf1: {
                md: md.sha1.create()
            }
        })
    }
}
function filterJsonCharacters(data){
    return data.replace(/[^ -~\t\n\r]/g, '');
}

export { RSAOAEP2048,filterJsonCharacters }