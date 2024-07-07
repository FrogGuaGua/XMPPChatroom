
from cryptography.hazmat.primitives.asymmetric import rsa
import websockets
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
import base64

XMPPState = {
  "initing": 0,
  "connecting":1,
  "loggin":2,
  "chatting":3,
  "quit":4
}
defaultPadding = padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA1()),
        algorithm=hashes.SHA256(),
        label=None
    )
class Client():
    def __init__(self,socketStream:websockets.WebSocketServerProtocol) -> None:
        self.stage = XMPPState["initing"]
        XMPPState["initing"]
        self.socketStream = socketStream
        self.clientKey:rsa.RSAPublicKey = ""
        self.serverPublicKey = ""
        self.serverPrivateKey = ""
        self.ipaddress= ""
        self.isAlive = False
    def encrypt(self,data:str):
        return(self.clientKey.encrypt(data.encode('utf-8'),defaultPadding))
    def send(self,data):
        self.socketStream.send(base64.b64encode(self.encrypt(data)))


class ClientManagement():
    def __init__(self) -> None:
        self.sessionPool = {}
    def newSession(self,key,socket):
        self.sessionPool[key] = Client(socket)
    def hasSession(self,key):
        return key in self.sessionPool.keys()
    def getSession(self,key)->Client:
        return self.sessionPool[key]
    def getSessionState(self,key):
        return self.getSession(key).stage
    def setSessionState(self,key,state):
        self.getSession(key).stage = state
    def setClientKey(self,key,clientKey):
        self.getSession(key).clientKey = clientKey
    def getClientKey(self,key):
        return self.getSession(key).clientKey
    def getServerPublicKey(self,key):
        return self.getSession(key).serverPublicKey
    def getServerPrivateKey(self,key)->rsa.RSAPrivateKey:
        return self.getSession(key).serverPrivateKey
    def setServerKey(self,key,publickey,privatekey):
        self.getSession(key).serverPublicKey= publickey
        self.getSession(key).serverPrivateKey= privatekey
    
    def getPresence(self,exclude = None):
        if(len(self.sessionPool)<=1):
            return [] 
        onlineUsers = list(self.sessionPool.keys()).remove(exclude)
        print(onlineUsers)
        if(not onlineUsers):
            return [] 
        return [self.sessionPool[i] for i in onlineUsers]
    def getOnlineUserMarks(self):
        if(len(self.sessionPool)<=1):
            return [] 
        return list(self.sessionPool.keys())
    def setClientAlive(self,key,state:bool):
        self.getSession(key).isAlive = state
    def getClientAlive(self,key):
        return self.getSession(key)
    