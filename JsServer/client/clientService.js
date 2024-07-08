const WebSocket = require("ws");
const RSAOAEP2048 = require("../util/security");
const CryptoJS = require('crypto-js');
const file = require("../util/file");
const { loginSuccess, loginFailed, userInfo, presence } = require("../util/protocol");
const protocal = require("../util/protocol");
const port = 4567

class Client {
    constructor(nickname, ip, jid,socket) {
        this.nickname = nickname
        this.ip = ip
        this.jid = jid
        this.status = "online"
        this.socket = socket
        this.stack = 0
    }
    getInfo() {
        let info = userInfo()
        info.jid = this.jid
        info.ip = this.ip
        info.nickname = this.nickname
        info.status = this.status
        return info
    }
}


class ClientService {
    constructor() {
        this.security = new RSAOAEP2048();
        this.server = new WebSocket.Server({ port: port })
        this.clientPool = []
        this.pubicRoom = []
        setInterval(()=>{
            this.clientPool.forEach(client=>{
                client.stack+=1
                if(client.stack == 4){
                    client.socket.close()
                }
            })
        },5000)
        file.saveToFile(file.toJS(this.security.publicKeyPem), "publickey.js")
        this.server.on("connection", (socket) => {
            socket.on('message', (message) => {
                message = JSON.parse(message)
                // console.log(message)
                if (message.tag == "login") {
                    if (this.login(message, socket)) {
                        socket.send(JSON.stringify(this.getPresence()))
                        socket.send(JSON.stringify(this.pubicRoom))
                    }
                }
                if (message.tag == "signup") {
                }
                if (message.tag == "message") {
                    this.message(message, socket)
                }
                if(message.tag == "check"){
                    this.check(message,socket)
                }
                
            });
            socket.on('close',()=>{
                let removeIndex = this.clientPool.findIndex((client)=>{client == socket })
                this.clientPool.splice(removeIndex)
                this.broadcast(JSON.stringify(this.getPresence()))
                console.log("Client disconnect")
            })
        })
    }
    check(message,socket){
        let client = this.getClientBySocket(socket)[0]
        client.stack = 0
    }
    message(message, socket) {
        let minfo = protocal.message()
        minfo.from = message.from
        minfo.to = message.to
        minfo.info = message.info
        minfo.time = (new Date()).toString()
        global.taskQueue.enqueue(minfo)
    }
    login(message, socket) {
        let username = message.username
        let password = CryptoJS.MD5(message.password).toString()
        if (true) {
            let ret = loginSuccess()
            ret.nickname = "123"
            socket.send(JSON.stringify(ret))
            let jid = "123"
            this.clientPool.push(new Client("nn", "ip", jid,socket))
            return true
        }
        else {
            let ret = loginFailed()
            socket.send(JSON.stringify(ret))
            socket.close()
            return false
        }
    }
    getPresence() {
        let presenceInfo = []
        this.clientPool.forEach(element => {
            presenceInfo.push(element.getInfo())
        });
        let presenceJson = presence()
        presenceJson.presence = presenceInfo
        return presenceJson
    }
    getClientBySocket(socket){
        return this.clientPool.filter(client=>{
            return client.socket == socket
        })
    }
    getClientByJID(jid){
        return this.clientPool.filter(client=>{
            return client,jid == jid
        })
    }
    broadcast(data) {
        this.clientPool.forEach(client => {
            client.socket.send(data)
        });
    }
}



module.exports = ClientService;