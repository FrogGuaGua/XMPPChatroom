from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


def generateRSAKeypair():
    privateKey = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    publicKey = privateKey.public_key()
    return privateKey, publicKey
def keyToPem(publickey):
    pem = publickey.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return pem.decode()