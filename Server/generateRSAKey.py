
from security import generateRSAKeypair,publickeyToPem,privatekeyToPem



if __name__ == '__main__':
    publicKey,privateKey = generateRSAKeypair()
    publicKey = publickeyToPem(publicKey)
    privateKey = privatekeyToPem(privateKey)
    file = open("public.pem","w+")
    file.write(publicKey)
    file.close()
    file = open("private.pem","w+")
    file.write(privateKey)
    file.close()