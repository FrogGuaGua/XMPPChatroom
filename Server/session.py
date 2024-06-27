import socket
import ssl
from structure import Client,BasicObject

class ClientSession(BasicObject):
    def __init__(self) -> None:
        self.client = Client()
        self.context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        #self.context.load_cert_chain('/path/to/certchain.pem', '/path/to/private.key')
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.ssl_sock = self.context.wrap_socket(self.sock, server_hostname=self.client.address)
        self.ssl_sock.connect((self.client.address, self.client.port))
        super.__init__()

    def onUpdate(self):
        pass


    def onReceive(self):
        try:
            self.data = self.ssl_sock.recv(4096)  
            if self.data:
                return self.data.decode('utf-8')
            else:
                return ""
        except Exception as e:
            print(f"Error receiving data: {e}")
            return ""
    def onSend(self,message):
        try:
            self.ssl_sock.sendall(message.encode('utf-8'))
        except Exception as e:
            print(f"Error sending data: {e}")
    def onClose(self):
        self.ssl_sock.close()
        sessionPool.endSession(self.client.jid)
    

class SessionPool():
    def __init__(self) -> None:
        self.pool = {}
    def addSession(self,session:ClientSession):
        self.pool[session.client.jid] = session
    def endSession(self,session:ClientSession):
        del self.pool[session.client.jid]
    def currentOnline(self):
        return len(self.pool)
    