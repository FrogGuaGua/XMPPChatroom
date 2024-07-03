import json
import websockets
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from types import list
import threading
import time
from security import RSASetting
import base64

class Configuration():
    def __init__(self) -> None:
        self.filename = "configuration.json"
        self.file =  open(self.filename,'r',encoding='utf-8') 
        self.configuration = (json.load(self.file ))
        pem = open(self.getServerInfo()["privateKeyPath"],encoding="utf-8")
        self.privateKey:rsa.RSAPrivateKey = serialization.load_pem_private_key(pem)
        self.file.close()
    def getDomainInfo(self)->dict:
        return self.configuration['domain']
    def getServerInfo(self)->dict:
        return self.configuration['server']
    def decrypt(self,data):
        return self.privateKey.decrypt(data,RSASetting())
    
class Domain():
    def __init__(self,address:str,publickey:rsa.RSAPublicKey,passive:bool) -> None:
        self.address = address
        self.isAlive = False
        self.publickey = publickey
        self.isPassive = passive
        self.websocket:websockets.WebSocketServerProtocol|websockets.WebSocketClientProtocol
        self.stack = 0
    async def createConnection(self):
        self.websocket:websockets.WebSocketServerProtocol|websockets.WebSocketClientProtocol = websockets.connect(self.address)
    async def send(self,data):
        await self.websocket.send(data)


class domainServer():
    def __init__(self) -> None:
        # stroce domain
        self.domainPool = {}
        # store thread
        self.threadPool = []
        # store task
        self.taskPool = []
        self.config = Configuration()
        self.init()
    def init(self):
        domain = self.config.getDomainInfo()
        serverInfo = self.config.getServerInfo()
        self.privateKey = serialization.load_pem_private_key()
        for i in self.config.getDomainInfo().keys():
            self.domainPool[domain[i]["address"]] = Domain("ws://"+domain[i]["address"],serialization.load_pem_public_key(domain[i]["publickey"]),domain[i]["passive"])
        self.initThreadPool()
        async def taskHandel(websocket:websockets.WebSocketServerProtocol):
            ip = websocket.request_headers["Origin"]
            try:
                async for message in websocket:
                    if(not ip in self.domainPool):
                        websocket.close()
                    # if get heart beat return
                    if(message == "ping" or message == "pong"):
                        await websocket.send("pong")
                        self.domainPool[ip].stack = 0
                        self.domainPool[ip].websocket = websocket
                    else:
                        # add to task line
                        message = base64.b64decode(self.config.decrypt(message))                   
            except(websockets.ProtocolError):
                print("server to server error")
        self.gateway = websockets.serve(taskHandel,serverInfo["toServer"]["host"],serverInfo["toServer"]["port"])
    def initThreadPool(self):
        def heartbeatHandle(domain:Domain):
            while True:
                domain.send("3")
                domain.stack+=1
                time.sleep(10)
        for i in self.domainPool.items():
            if(not i.isPassive):
                i.websocket = websockets.connect(i.address)
                thread = threading.Thread(target=heartbeatHandle,args=i)
                thread.daemon = True
                self.threadPool.append(thread)
                try:
                    thread.start()
                except(threading.ThreadError):
                    print("domain thread error")
    def findDomain(self,ip:str):
        if ip in self.domainPool:
            return self.domainPool[ip]
        else:
            return False
                
            
        
