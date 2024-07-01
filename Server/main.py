# -*- coding: utf-8 -*-
# @Author: Rind
# @Date: 2024年6月26日 05:20:54
# @Last Modified by: Rind
# @Last Modified time: 2024年6月26日 05:20:54

import asyncio
import xml.etree.ElementTree as ET
import websockets
import xmpp 
from management import SessionManagement
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
import base64

host = '10.0.0.109'
port = 64442
sessionManagement = SessionManagement()
XMPPState = {
  "initing": 0,
  "connecting":1,
  "loggin":2,
  "streamming":3,
  "quit":4
}
# ssl_context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")
xmpp = xmpp.XMPPService()
defaultPadding = padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA1()),
        algorithm=hashes.SHA256(),
        label=None
    )
async def handleConnection(websocket:websockets.WebSocketServerProtocol):
    try:
        index = websocket.request_headers["Sec-WebSocket-Key"]
        async for message in websocket:            
            if(sessionManagement.hasSession(index) and sessionManagement.getSessionState(index) >= XMPPState["loggin"]):
                message = base64.b64decode(message)
                message = sessionManagement.getServerPrivateKey(index).decrypt(message,defaultPadding).decode('utf-8')
            # print(message)
            info = xmpp.xmlTransformer(message)
            reply = xmpp.messageProcess(info.tag,info.attrib,sessionManagement,websocket) 
            if(sessionManagement.hasSession(index) and sessionManagement.getSessionState(index) > XMPPState["loggin"]):
                reply = base64.b64encode(sessionManagement.getSession(index).encrypt(reply)).decode('utf-8')
            if(not reply):
                continue
            await websocket.send(reply)       
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed: {e}")

if __name__ == '__main__':
    start_server = websockets.serve(handleConnection, host, port,ping_timeout=10,ping_interval=10)
    print("[+]Service start")
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
