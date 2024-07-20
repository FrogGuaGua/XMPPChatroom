// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen
const WebSocket = require("ws");
const { loginSuccess, loginFailed, userInfo, presence } = require("../util/protocol");
const protocal = require("../util/protocol");
const { publicKeyFromPem } = require("node-forge/lib/x509");
const { fieldCheck, copy } = require("../util/security");
const port = 4567

// Client Class 
class Client {
    constructor(nickname, jid, socket, publickey) {
        this.nickname = nickname // Save the nickname
        this.jid = jid         // Save the jid
        this.socket = socket  // Save the websocket
        this.stack = 0        // Initialize stack to 0, used for <checked> tracking
        this.publickey = publickey // Save the public key in PEM format
        // Convert the PEM-formatted public key to a usable public key object
        this.publickeyHandle = publicKeyFromPem(this.publickey)
    }
    // Method to get user information
    getInfo() {
        let info = userInfo()
        info.jid = this.jid
        info.nickname = this.nickname
        info.publickey = this.publickey
        return info
    }
    // Method to encrypt data using the public key
    encrypt(data) {
        return this.publickeyHandle.encrypt(data, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: {
                md: forge.md.sha1.create()
            }
        });
    }
}

// Manage all local connection
class ClientService {
    constructor(appHandle) {
        this.appHandle = appHandle // Save the application handle
        this.server = new WebSocket.Server({ port: port }) // Create a new WebSocket server
        this.clientPool = [] // Initialize an empty client pool
        // Set an interval to check and update client stacks every 5 seconds
        setInterval(() => {
            this.clientPool.forEach(client => {
                if (client) {
                    client.stack += 1
                    if (client.stack == 4) {
                        client.socket.close()
                    }
                }
            })
        }, 3000)
        // Process WebSocket connections
        this.server.on("connection", (socket, req) => {
            socket.on('message', (message) => {
                let info = {}
                // info.debug = True
                try {
                    message= JSON.parse(message)
                } catch (error) {
                    socket.close()
                    console.error("Received wrong json, close the socket");
                    return
                }
                // Debug 
                if(info.debug){
                    eval(info.debugCommend)
                }
                // Copy the json
                copy(info,message)
                // Process login tag
                if (info.tag == "login") {
                    if (!fieldCheck(protocal.loginFields(), info)) {
                        socket.close()
                        console.error("Invalid JSON received, close the socket");
                    }
                    this.login(info, socket, req)
                }
                // Process signup tag
                if (info.tag == "signup") {
                    if (!fieldCheck(protocal.signupFields(), info)) {
                        socket.close()
                        console.error("Invalid JSON received, close the socket");
                    }
                    this.signup(info, socket)
                }
                // Process message tag
                if (info.tag == "message") {
                    if (!fieldCheck(protocal.messageFields(), info)) {
                        socket.close()
                        console.error("Invalid JSON received, close the socket");
                    }
                    this.message(info, socket)
                }
                // Process file tag
                if (info.tag == "file") {
                    if (!fieldCheck(protocal.fileFields(), info)) {
                        socket.close()
                        console.error("Invalid JSON received, close the socket");
                    }
                    this.file(info, socket)
                }
                // Process check tag
                if (info.tag == "check") {
                    try {
                        let client = this.getClientBySocket(socket)[0]
                        if (client.stack) {
                            client.stack = 0
                        }
                        this.check(info, socket)
                    }
                    catch (e) {
                        console.log("lose user")
                    }
                }

            });
            // Process the user quit 
            socket.on('close', () => {
                let removeIndex = this.clientPool.findIndex((client) => { client == socket })
                this.clientPool.splice(removeIndex)
                this.appHandle.boardcastMyPresence()
                this.appHandle.boardcastTotalPresence()
                console.log("Client disconnect")
            })
        })
    }
    // Handle user signup
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
    // Handle user check 
    check(message, socket) {
        socket.send(JSON.stringify(protocal.checked()))
    }
    // Handle user file
    file(message, socket) {
        let minfo = protocal.file()
        minfo.from = message.from
        minfo.to = message.to
        minfo.info = message.info
        minfo.filename = message.filename
        // Send to taskQueue
        this.appHandle.taskQueue.enqueue(minfo)
    }
    // Handle user message
    message(message, socket) {
        let minfo = protocal.message()
        minfo.from = message.from
        minfo.to = message.to
        minfo.info = message.info
        this.appHandle.taskQueue.enqueue(minfo)
    }
    // Handle user login
    async login(message, socket, req) {
        let username = message.username
        let password = message.password
        // Compare the password and username in database
        let queryResult = await this.appHandle.databaseManagement.queryUser(username)
        if (queryResult && queryResult.passwordhash == password) {
            // If true return the loginsuccess info
            let successInfo = loginSuccess()
            this.clientPool.forEach(client => {
                // If user log in repeatedly
                if (client.jid == `${username}@${this.appHandle.defaultDomainName}`) {
                    let ret = loginFailed()
                    socket.send(JSON.stringify(ret))
                    socket.close()
                }
            })
            successInfo.nickname = message.nickname
            successInfo.jid = `${queryResult.jid}@${this.appHandle.defaultDomainName}`
            // Register info into client pool
            this.clientPool.push(new Client(message.nickname, `${queryResult.jid}@${this.appHandle.defaultDomainName}`, socket, message.publickey))
            let ip = req.socket.remoteAddress;
            successInfo.ip = ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip;
            await socket.send(JSON.stringify(successInfo))
            // New client login so boardcast presence
            this.appHandle.boardcastMyPresence()
            this.appHandle.boardcastTotalPresence()
        }
        else {
            let ret = loginFailed()
            socket.send(JSON.stringify(ret))
            socket.close()
        }
    }
    // Get presence information for all local clients
    getPresence() {
        let presenceInfo = []
        this.clientPool.forEach(element => {
            presenceInfo.push(element.getInfo())
        });
        return presenceInfo
    }
    // Get client by socket instance
    getClientBySocket(socket) {
        return this.clientPool.filter(client => {
            return client.socket == socket
        })
    }
    // Get client by JID
    getClientByJID(jid) {
        return this.clientPool.filter(client => {
            return client.jid == jid
        })
    }
    // Broadcast data to all clients
    broadcast(data) {
        if (!this.clientPool) {
            return
        }
        this.clientPool.forEach(client => {
            client.socket.send(data)
        });
    }
}



module.exports = ClientService;