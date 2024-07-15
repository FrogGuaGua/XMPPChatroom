const WebSocket = require("ws");
const { loginSuccess, loginFailed, userInfo, presence } = require("../util/protocol");
const protocal = require("../util/protocol");
const { } = require("node-forge/lib/pki");
const { publicKeyFromPem } = require("node-forge/lib/x509");
const port = 4567

class Client {
    constructor(nickname, jid, socket, publickey) {
        this.nickname = nickname
        this.jid = jid
        this.status = "online"
        this.socket = socket
        this.stack = 0
        this.publickey = publickey
        this.publickeyHandle = publicKeyFromPem(this.publickey)
    }
    getInfo() {
        let info = userInfo()
        info.jid = this.jid
        info.nickname = this.nickname
        info.publickey = this.publickey
        info.status = this.status
        return info
    }
    encrypt(data) {
        return this.publickeyHandle.encrypt(data, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: {
                md: forge.md.sha1.create()
            }
        });
    }
}


class ClientService {
    constructor(appHandle) {
        this.appHandle = appHandle
        this.server = new WebSocket.Server({ port: port })
        this.clientPool = []
        setInterval(() => {
            this.clientPool.forEach(client => {
                if (client) {
                    client.stack += 1
                    if (client.stack == 4) {
                        client.socket.close()
                    }
                }
            })
        }, 5000)
        this.server.on("connection", async (socket,req) => {
            socket.on('message', (message) => {
                try {
                    message = JSON.parse(message)
                } catch (error) {
                    socket.close()
                    console.error("Received wrong json, close the socket");
                    return
                }
                console.log(message)
                if (message.tag == "login") {
                    this.login(message, socket,req)
                }
                if (message.tag == "signup") {
                    this.signup(message, socket)
                }
                if (message.tag == "message") {
                    let index = this.clientPool.findIndex((client) => { client == socket })
                    if (index) {
                        this.message(message, socket)
                    }
                }
                if (message.tag == "check") {
                    this.check(message, socket)
                }
                console.log(message)

            });
            socket.on('close', () => {
                let removeIndex = this.clientPool.findIndex((client) => { client == socket })
                this.clientPool.splice(removeIndex)
                this.appHandle.boardcastMyPresence()
                this.appHandle.boardcastTotalPresence()
                console.log("Client disconnect")
            })
        })
    }
    async signup(message, socket) {
        let username = message.username
        let password = message.password
        let result = await this.appHandle.databaseManagement.registerUser(username, password)
        if (result) {
            socket.send(JSON.stringify(protocal.signupSuccess()))
        }
        else {
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
        minfo.type = message.type
        this.appHandle.taskQueue.enqueue(minfo)
    }
    async login(message, socket,req) {
        let username = message.username
        let password = message.password
        let queryResult = await this.appHandle.databaseManagement.queryUser(username)
        if (queryResult && queryResult.passwordhash == password) {
            let successInfo = loginSuccess()
            this.clientPool.forEach(client=>{
                console.log(username)
                if(client.jid == `${username}@${this.appHandle.defaultDomainName}`){
                    let ret = loginFailed()
                    socket.send(JSON.stringify(ret))
                    socket.close()
                }
            })
            successInfo.nickname = message.nickname
            successInfo.jid = `${queryResult.jid}@${this.appHandle.defaultDomainName}`
            this.clientPool.push(new Client(message.nickname, `${queryResult.jid}@${this.appHandle.defaultDomainName}`, socket, message.publickey))
            let ip = req.socket.remoteAddress;
            successInfo.ip = ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip;
            await socket.send(JSON.stringify(successInfo))
            await this.appHandle.boardcastMyPresence()
            await this.appHandle.boardcastTotalPresence()
        }
        else {
            let ret = loginFailed()
            socket.send(JSON.stringify(ret))
            socket.close()
        }
    }
    getPresence() {
        let presenceInfo = []
        this.clientPool.forEach(element => {
            presenceInfo.push(element.getInfo())
        });
        return presenceInfo
    }
    getClientBySocket(socket) {
        return this.clientPool.filter(client => {
            return client.socket == socket
        })
    }
    getClientByJID(jid) {
        return this.clientPool.filter(client => {
            return client.jid == jid
        })
    }
    broadcast(data) {
        if(!this.clientPool){
            return
        }
        this.clientPool.forEach(client => {
            client.socket.send(data)
        });
    }
}



module.exports = ClientService;