from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import json
import websockets
import threading
import time
import base64
import asyncio
from security import RSASetting

class Configuration():
    def __init__(self) -> None:
        self.filename = "configuration.json"
        self.file =  open(self.filename,'r',encoding='utf-8') 
        self.configuration = (json.load(self.file ))
        pem = open(self.getServerInfo()["privateKeyPath"],encoding="utf-8")
        privateKey = pem.read().encode("utf-8")
        self.privateKey:rsa.RSAPrivateKey = serialization.load_pem_private_key(data=privateKey,password=None,backend=None)
        pem.close()
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
        self.config = Configuration()
    async def init(self):
        domain = self.config.getDomainInfo()
        serverInfo = self.config.getServerInfo()
        for i in self.config.getDomainInfo().keys():
            file = open(domain[i]["publickey"],"r")
            pem = file.read().encode("utf-8")
            self.domainPool[domain[i]["address"]] = Domain("ws://"+domain[i]["address"],pem,bool(domain[i]["passive"]))
            file.close()
        self.initThreadPool()
        async def taskHandel(websocket:websockets.WebSocketServerProtocol):
            ip = websocket.request_headers["Origin"]
            try:
                async for message in websocket:
                    # ban unexcept ip
                    if(not ip in self.domainPool):
                        print("unexcept info")
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
        self.gateway = await websockets.serve(taskHandel,serverInfo["toServer"]["host"],serverInfo["toServer"]["port"],
                                        origins=list(self.domainPool.keys()))
        await self.gateway.serve_forever()
    def initThreadPool(self):
        def heartbeatHandle(domain:Domain):
            while True:
                domain.send("3")
                domain.stack+=1
                if(domain.stack >= 3):
                    domain.isAlive = False
                    if(not domain.isPassive):
                        try:
                            domain.websocket.close()
                            domain.websocket = websockets.connect(domain.address)
                        except:
                            print("reconnent error")
                time.sleep(10)

        for i in self.domainPool.values():
            if(i.isPassive):
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
                



        


a = domainServer()
asyncio.run(a.init())