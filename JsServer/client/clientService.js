const WebSocket = require("ws");
const RSAOAEP2048 = require("../util/security");
const CryptoJS = require('crypto-js');
const file = require("../util/file");
const { loginSuccess, loginFailed, userInfo, presence } = require("../util/protocol");
const protocal = require("../util/protocol");
const port = 4567

class Client {
    constructor(nickname, jid, socket) {
        this.nickname = nickname
        this.jid = jid
        this.status = "online"
        this.socket = socket
        this.stack = 0
    }
    getInfo() {
        let info = userInfo()
        info.jid = this.jid
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
        setInterval(() => {
            this.clientPool.forEach(client => {
                if(client){
                    client.stack += 1
                    if (client.stack == 4) {
                        client.socket.close()
                    }
                }
            })
        }, 5000)
        // file.saveToFile(file.toJS(this.security.publicKeyPem), "publickey.js")
        this.server.on("connection", async (socket) => {
            socket.on('message', (message) => {
                try {
                    message = JSON.parse(message)
                } catch (error) {
                    socket.close()
                    console.error("JSON :", error);
                }
                if (message.tag == "login") {
                    this.login(message, socket)
                }
                if (message.tag == "signup") {
                    this.signup(message, socket)
                }
                if (message.tag == "message") {
                    this.message(message, socket)
                }
                if (message.tag == "check") {
                    this.check(message, socket)
                }
                console.log(message)

            });
            socket.on('close', () => {
                let removeIndex = this.clientPool.findIndex((client) => { client == socket })
                this.clientPool.splice(removeIndex)
                this.boadrdcastPresence()
                console.log("Client disconnect")
            })
        })
    }
    async signup(message,socket){
        let username = message.username
        let password = message.password
        let result = await global.databaseManagement.registerUser(username,password)
        if(result){
            socket.send(JSON.stringify(protocal.signupSuccess()))
        }
        else{
            socket.send(JSON.stringify(protocal.signupFail()))
        }
        socket.close()
    }
    check(message, socket) {
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
    async login(message, socket) {
        let username = message.username
        let password = message.password
        let queryResult = await global.databaseManagement.queryUser(username)
        if (queryResult  && queryResult.passwordhash == password) {
            let successInfo = loginSuccess()
            successInfo.nickname = message.nickname
            successInfo.jid = queryResult.jid
            this.clientPool.push(new Client(message.nickname, queryResult.jid, socket))          
            await socket.send(JSON.stringify(successInfo))
            this.boadrdcastPresence()
        }
        else {
            let ret = loginFailed()
            socket.send(JSON.stringify(ret))
            socket.close()
        }
    }
    boadrdcastPresence() {
        this.broadcast(JSON.stringify(this.getPresence()))
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
    getClientBySocket(socket) {
        return this.clientPool.filter(client => {
            return client.socket == socket
        })
    }
    getClientByJID(jid) {
        return this.clientPool.filter(client => {
            return client, jid == jid
        })
    }
    broadcast(data) {
        this.clientPool.forEach(client => {
            client.socket.send(data)
        });
    }
}



module.exports = ClientService;