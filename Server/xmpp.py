import xml.etree.ElementTree as ET
from management import SessionManagement,Session
import websockets
from security import generateRSAKeypair,publickeyToPem
from cryptography.hazmat.primitives import serialization
from typing import List
XMPPState = {
  "initing": 0,
  "connecting":1,
  "loggin":2,
  "chatting":3,
  "quit":4
}

    


class XMPPService():
    def __init__(self) -> None:
        self.pool = {}
    @staticmethod
    def xmlTransformer(str):
        try:
            root = ET.fromstring(str)
            return root
        except ET.ParseError as e:
            print(f"Failed to parse XML: {e}")
    
    def messageProcess(self,tag,attr,sessionManagement:SessionManagement,websocket:websockets.WebSocketServerProtocol):
        userMark = websocket.request_headers["Sec-WebSocket-Key"]
        if tag == "{http://etherx.jabber.org/streams}stream" and not sessionManagement.hasSession(userMark):
            sessionManagement.newSession(userMark,websocket)
            return self.initStream(attr)
        if tag == "{urn:ietf:params:xml:ns:xmpp-tls}starttls" and sessionManagement.getSessionState(userMark) == XMPPState["initing"]:
            sessionManagement.setSessionState(userMark,XMPPState["connecting"])
            return self.approvedTLS(attr)
        if tag == "proceed" and sessionManagement.getSessionState(userMark) == XMPPState["connecting"]:
            sessionManagement.setClientKey(userMark,serialization.load_pem_public_key(attr["key"].encode('utf-8')))
            sessionManagement.setSessionState(userMark,XMPPState["loggin"])
            publicKey,privateKey = generateRSAKeypair()
            sessionManagement.setServerKey(userMark,publicKey,privateKey)
            return self.TLSSuccess(attr,publickeyToPem(publicKey))
        if tag == "login" and sessionManagement.getSessionState(userMark) == XMPPState["loggin"]:
            sessionManagement.setSessionState(userMark,XMPPState["chatting"])
            return self.processLogin(attr,userMark,sessionManagement)
        else:
            print("tag:"+tag)
            print("attr:"+str(attr))
            return False
        
    #check the 
    def initStream(self,attr) ->str:
        if(attr['to']) == "server" and attr['version'] == '1.0':
            return '<stream:stream xmlns:stream="http://etherx.jabber.org/streams" xmlns="jabber:client" from="server" version="1.0"/>'
    def approvedTLS(self,attr)->str:
        if(not len(attr)):
            return "<proceed xmlns='urn:ietf:params:xml:ns:xmpp-tls'/>"
    def TLSSuccess(self,attr,publickey)->str:
        return "<proceed key ='{}' mechanism='MD5,PLAIN'>".format(publickey)
    def processLogin(self,attr,userMark,sessionManagement:SessionManagement)->str:
        username = attr['username']
        password = attr['password']
        nickname = "nickname"
        jid = "jid"
        attendance = "<attendance nickname ='{}' jid = '{}'>".format(nickname,jid)
        if (True):
            sessionManagement.setClientAlive(userMark,True)
            if(len(sessionManagement.pool)>1):
                targets:List[Session] = sessionManagement.getOnline(userMark)
                for i in targets:
                    i.send(attendance)
            return "<update nickname ='{}' lasttime='{}' jid='{}'>".format("123","123","123")
        else:
            return "<error message ='Username or password wrong!'>"



    