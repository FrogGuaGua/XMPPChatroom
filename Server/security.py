from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization,hashes
from cryptography.hazmat.primitives.asymmetric import rsa,padding



def generateRSAKeypair():
    privateKey = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    publicKey = privateKey.public_key()
    return publicKey, privateKey
def publickeyToPem(key:rsa.RSAPublicKey):
    pem = key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return pem.decode()
def privatekeyToPem(key:rsa.RSAPrivateKey):
    pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )
    return pem.decode()

def RSASetting():
    return padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA1()),
        algorithm=hashes.SHA256(),
        label=None
    )