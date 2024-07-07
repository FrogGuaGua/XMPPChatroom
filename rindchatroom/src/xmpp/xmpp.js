import { md, pki } from "node-forge";
import { baseURL } from "./serverInfo";
import { xmlManagement } from "./xml";

const XMPPState = {
  ready: -1,
  initing: 0,
  connecting: 1,
  tlsStart: 2,
  loggin: 3,
  chatting: 4
}

class XMPPService {
  constructor() {
    this._stage = XMPPState.ready
    this.socket = new WebSocket(baseURL);
    this.myxml = new xmlManagement()
    this.myxml.startStream()
    this.selfKey = ""
    this.serverKey = ""
    this.crypt = pki.rsa
    this.serverAlive = true
    Object.defineProperty(this, 'stage', {
      get: () => this._stage,
      set: (v) => {
        this._stage = v;
        switch (v) {
          case XMPPState.initing:
            this.initing();
            break;
          case XMPPState.tlsStart:
            this.tlsStart()
            break;
          case XMPPState.connecting:
            this.connecting();
            break;
          case XMPPState.loggin:
            break;
          case XMPPState.chatting:
            this.chatting()
            break;
          default:
            console.error('WebSocket error');
        }
        this._stage = v;
      }
    })
    this.socket.onopen = () => {
      this.stage = XMPPState.initing
    }
  }
  initing() {
    this.myxml.startStream()
    this.socket.send(this.myxml.toString(this.myxml.stream))
    this.socket.onmessage = (event) => {
      if (event.data == '<stream:stream xmlns:stream="http://etherx.jabber.org/streams" xmlns="jabber:client" from="server" version="1.0"/>') {
        this.socket.send("<starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'/>")
        this.stage = XMPPState.connecting
      }
      else {
        this.stage = XMPPState.ready
      }
    }
  }

  connecting() {
    this.socket.onmessage = (event) => {
      if (event.data == "<proceed xmlns='urn:ietf:params:xml:ns:xmpp-tls'/>") {
        this.selfKey = this.crypt.generateKeyPair({ bits: 2048, e: 0x10001 })
        let publicKey = pki.publicKeyToPem(this.selfKey.publicKey)
        this.socket.send("<proceed key='" + publicKey + "'/>")
        this.stage = XMPPState.tlsStart
      }
    }
  }
  tlsStart() {
    this.socket.onmessage = (event) => {
      let xmlReader = new DOMParser()
      let xml = xmlReader.parseFromString(event.data, "application/xml")
      let tag = xml.querySelector('proceed')
      if (tag) {
        this.serverKey = tag.getAttribute('key')
        this.serverKey = pki.publicKeyFromPem(this.serverKey)
        this.stage = XMPPState.loggin
      }
      else {
        this.stage = XMPPState.connecting
      }
    }
  }
  login() {
    // over Write At Login.vue
  }
  chatting() {
    this.onmessage = (event) => {
      if (event.data == "pong") {
        this.serverAlive = true
        return
      }
      let xmlReader = new DOMParser()
      let xml = xmlReader.parseFromString(event.data, "application/xml")
      let newPresence = xml.querySelector('presence')
      // <presence> 
      //     <client jid="1" nickname="rind" publickey="" ip=“”> 
      //     </client> 
      //   <client jid="1" nickname="rind" publickey="" ip=“”> 
      //     </client>
      // </presence>
      if (newPresence) {
        newPresence.querySelectorAll('client').forEach(client => {
          client.setAttribute('status', 'online')
        });
        var oldPresenceMap = new Map();
        var newPresenceMap = new Map();
        // 根据旧的在线表创建索引map
        this.presence.querySelectorAll('client').forEach(client => {
          var jid = client.getAttribute('jid');
          oldPresenceMap.set(jid, client);
        });
        newPresence.querySelectorAll('client').forEach(client => {
          var jid = client.getAttribute('jid');
          newPresenceMap.set(jid, client);
        });
        // 如果旧表新表都有 则将新表中的信息更新到旧表
        // 如果新表没有 旧表有 则设为不在线
        // 如果旧表没有 新表有则将该元素复制进旧表
        this.myxml.presence.querySelectorAll('client').forEach(oldClient => {
          var jid = oldClient.getAttribute('jid');
          if (newPresenceMap.has(jid)) {
            var newClient = oldPresenceMap.get(jid);
            Array.from(newClient.attributes).forEach(attr => {
              oldClient.setAttribute(attr.name, attr.value);
            });
          } else {
            oldClient.setAttribute('status', 'offline');
          }
        });
        newPresence.querySelectorAll('client').forEach(newClient => {
          var jid = newClient.getAttribute('jid');
          if (!oldPresenceMap.has(jid)) {
            this.myxml.presence.documentElement.appendChild(newClient)
          } 
        });
        console.log("presence updated")
        return
      }
      let quit = xml.querySelector('quit')
      if (quit) {
        this.myxml.presence.removeAttribute(quit.getAttribute('jid'))
        return
      }
      let message = xml.querySelector('message')
      if (message) {
        this.myxml.message.appendChild(message)
        return
      }
    }

  }
  heartBeat() {
    this.heartBeatProcess = setTimeout(() => {
      if (!this.serverAlive) {
        console.error("Server missing")
      }
      this.socket.send("ping")
      this.serverAlive = false
    }, 10);

  }
  getPresence(){
    return this.myxml.presence
  }
  getMessage(){
    return this.myxml.message
  }
  secureSend(data) {
    let b64data = btoa(this.serverKey.encrypt(data, 'RSA-OAEP', {
      md: md.sha256.create(),
      mgf1: {
        md: md.sha1.create()
      }
    }));
    this.socket.send(b64data)
  }
  secureSendXML(data) {
    this.secureSend(this.myxml.toString(data))
  }
  decrypt(data) {
    return this.selfKey.privateKey.decrypt(data, 'RSA-OAEP', {
      md: md.sha256.create(),
      mgf1: {
        md: md.sha1.create()
      }
    })
  }
  getSocket() {
    return this.socket
  }

}
export { XMPPService, XMPPState }
