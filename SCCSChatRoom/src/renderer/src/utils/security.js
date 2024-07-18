import { md, pki} from "node-forge";
import { decoder } from "decoder"


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
        return decoder(this.publicKey.encrypt(data, 'RSA-OAEP', {
            md: md.sha256.create(),
            mgf1: {
                md: md.sha1.create()
            }
        }))
    }
    decrypt(data) {
        return decoder(this.privateKey.decrypt(data, 'RSA-OAEP', {
            md: md.sha256.create(),
            mgf1: {
                md: md.sha1.create()
            }
        }))
    }
}
function filterJsonCharacters(data) {
    return data.replace(/[^ -~\t\n\r]/g, '');
}
function sliceStr(str,num){
    let result = []
    let buff = ""
    if(str.length<=num){
        return [str]
    }
    for (let i = 0; i < str.length; i++) {
        if(i != 0 && i % num == 0){
            result.push(buff)
            buff = ""
        }
        buff+=str[i]
    }
    return result;
}

export { RSAOAEP2048, filterJsonCharacters,sliceStr }