// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen


const path = require('path');
const fs = require('fs');
const WebSocket = require("ws");
const protocal = require('../util/protocol');
const { parseJID } = require('../util/jid');
const { fieldCheck } = require('../util/security');

// Server class
// The class will inited by config
class Server {
    constructor(domain, ip, port, appHandle) {
        this.domain = domain             // Remote server domain
        this.ip = ip                     // Remote server ip
        this.port = port                // Remote server port
        this.activeSocket = null
        this.passiveSocket = null
        this.stack = 0                 // for check tag
        this.reconnectTimeout = null;  // reconnect timeout
        this.presenceInfo = null       // saving presenceInfo
        this.appHandle = appHandle     // global app handel
    }
    // Connect the remote serer
    async activeConnect() {
        // Clear any existing reconnect timeout
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        let url = `ws://${this.ip}:${this.port}`;
        console.log(`Connecting to: ${url}`);
        if (url) {
            this.activeSocket = new WebSocket.WebSocket(url)
            // Set event handlers for the WebSocket
            this.activeSocket.onopen = this.attendance.bind(this)
            this.activeSocket.onclose = this.close.bind(this)
            this.activeSocket.onmessage = this.process.bind(this)
            this.activeSocket.onerror = this.error.bind(this)
        }
    }
    // Handle reconnect condition
    reconnect() {
        if (this.reconnectTimeout) return;
        // Set a timeout to attempt reconnection after 3 seconds
        this.reconnectTimeout = setTimeout(() => {
            console.log("Attempting to reconnect...");
            this.activeConnect();
        }, 3000);
    }
    // Handle errors
    error() {
        console.error("Remote server is not online")
        this.reconnect()
    }
    // Handle attendance
    attendance(event) {
        console.log("Server connected")
        // Send attendance protocol message
        this.send(JSON.stringify(protocal.attendance()))
        // Send presence information
        let presence = protocal.presence()
        presence.presence = this.appHandle.clientService.getPresence()
        presence = JSON.stringify(presence)
        this.send(presence)
    }
    // Handle close event
    close(websocket) {
        console.log("Serverservice closed")
        this.reconnect()
        this.appHandle.boardcastTotalPresence()
    }
    // Handle messages event
    process(event) {
        let info = null
        // Parse the json
        try {
            info = JSON.parse(event.data)
        } catch (error) {
            console.log(event.data)
            console.error("JSON error in server to server");
        }
        if (info == null) {
            return
        }
        // Handle presence info
        if (info.tag == "presence") {
            if (info.presence) {
                this.presence(info)
            }
        }
        // Handle message info
        if (info.tag == "message") {
            if (!fieldCheck(protocal.messageFields(), info)) {
                socket.close()
                console.error("JSON error in server to server, close the socket");
            }
            this.message(info)
        }
        // Handle file info
        if (info.tag == "file") {
            if (!fieldCheck(protocal.fileFields(), info)) {
                socket.close()
                console.error("JSON error in server to server, close the socket");
            }
            this.message(info)
        }
        // Handle check info
        if (info.tag = "check") {
            this.check()
        }
    }
    // Process the message
    async message(info) {
        this.appHandle.taskQueue.enqueue(info)
    }
    // Process the check
    async check() {
        this.send(JSON.stringify(protocal.checked()))
    }
    // Process the presence
    async presence(info) {
        if (!info.presence) {
            return
        }
        info.presence.forEach(user => {
            if (!fieldCheck(protocal.userInfoFields(), user))
                return
        })
        this.presenceInfo = info.presence
    }
    // Process the send
    async send(data) {
        if (this.activeSocket.readyState == 1) {
            this.activeSocket.send(data)
        }
    }
    // Get the presence
    getPresence() {
        return this.presenceInfo
    }
}

class ServerService {
    constructor(appHandle) {
        this.appHandle = appHandle   // app handle
        this.serverPool = []           // server list
        this.defaultPort = this.appHandle.defaultServerPort  // defaut server to server port
        this.defaultDomain = this.appHandle.defaultDomainName // defaut domain name
        this.load()  // load server from config
        this.process() // precess message receive
    }
    // Start up server
    process() {
        try {
            this.server = new WebSocket.Server({ port: this.defaultPort })
        }
        catch (e) {
            console.log(e)
        }
        if (this.server) {
            this.server.on("connection", (socket, req) => {
                socket.on('message', (message) => {
                    // Ip white list
                    // If not in list kick out
                    let ip = req.socket.remoteAddress;
                    if (ip.startsWith('::ffff:')) {
                        ip = ip.split(':').pop()
                    }
                    let flag = true
                    this.serverPool.forEach(server => {
                        if (ip == server.ip) {
                            server.socket = socket
                            flag = false
                        }
                    })
                    if (flag) {
                        socket.close()
                        console.log("Wrong ip conncected in, kick out")
                    }
                    let info = {}
                    // info.debug = True

                    // Process login tag
                    try {
                        message = JSON.parse(message)
                    } catch (error) {
                        socket.close()
                        console.error("Received wrong json, close the socket");
                        return
                    }
                    // Debug 
                    // if (info.debug) {
                    //     eval(info.debugCommend)
                    // }
                    // Copy the json
                    copy(info, message)
                    // process message tag
                    if (info.tag == "message") {
                        if (!fieldCheck(protocal.messageFields(), info)) {
                            socket.close()
                            console.error("JSON error in server to server message, close the socket");
                        }
                        // Check the message to server
                        let jid = parseJID(info.to)
                        if (this.defaultDomain == undefined || this.defaultDomain == null) {
                            this.message(info, socket)
                            return
                        }
                        if (this.defaultDomain == jid.domain) {
                            this.message(info, socket)
                        }
                    }
                    // Process file tag
                    if (info.tag == 'file') {
                        if (!fieldCheck(protocal.fileFields(), info)) {
                            console.error("JSON error in server to server file, close the socket");
                        }
                        // Check the message to server
                        let jid = parseJID(info.to)
                        if (this.defaultDomain == undefined || this.defaultDomain == null) {
                            this.message(info, socket)
                            return
                        }
                        if (this.defaultDomain == jid.domain) {
                            this.message(info, socket)
                        }
                    }
                    // Process check tag
                    if (info.tag == "check") {
                        this.check(info, socket)
                    }
                    // Process attendance tag
                    if (info.tag == "attendance") {
                        this.attendance(info, socket)
                    }
                    // Process presence tag
                    if (info.tag == "presence") {
                        if (info.presence) {
                            this.presence(info, socket, ip)
                        }
                    }
                    // Crypto challange
                    // Assume only you know the password
                    // Prove code below is not safe
                    if (info.try) {
                        try {
                            let a = BigInt('0x' + info.try)
                            let b = BigInt("0xb6d733a404d0b06e51dcf52fec53b6b9ed807b3bdc13dbe33e5e59182f66b733")
                            let c = BigInt("0x3e9")
                            let d = "4384742de6012452302030a8c48605374070da2f41d5847b066bcd94f32a05e0"
                            let result = ((a ** c) % b).toString(16)
                            if (result == d) {
                                let hex = Buffer.from(info.try, 'hex')
                                socket.send(JSON.stringify({ flag: hex.toString('utf8') }))
                            }
                            else {
                                socket.send(JSON.stringify({ flag: "Zzzzzzzz...." }))
                            }
                        }
                        catch (e) {
                            console.log("message try not true")
                        }
                    }
                });
                // Websocket close handle
                socket.on('close', () => {
                    console.log("Client disconnect")
                });
            })
        }
        // Try to connect to remote server
        this.serverPool.forEach(serer => {
            serer.activeConnect()
        })
    }
    // Boardcast info to all remote server
    boardcast(data) {
        if (!this.serverPool) {
            return
        }
        this.serverPool.forEach(server => {
            server.send(data)
        })
    }
    // Handle file tag
    async file(message, socket) {
        this.appHandle.taskQueue.enqueue(message)
    }
    // Handle message tag
    async message(message, socket) {
        this.appHandle.taskQueue.enqueue(message)
    }
    // Handle check tag
    async check(message, socket) {
        socket.send(JSON.stringify(protocal.checked()))
    }
    // Handle presence tag
    async attendance(message, socket) {
        let presence = protocal.presence()
        // send the local presence
        presence.presence = this.appHandle.clientService.getPresence()
        socket.send(JSON.stringify(presence))
    }
    // Handle presence tag
    async presence(message, socket, ip) {
        // Check presence source
        this.serverPool.forEach(server => {
            if (server.ip == ip) {
                console.log(message.presence)
                server.presenceInfo = message.presence
            }
        })
        this.appHandle.boardcastTotalPresence()
    }
    // Load from config
    load() {
        // Load server to serverPool
        this.appHandle.remoteServers.forEach(server => {
            try {
                if (server.domain && server.address) {
                    this.serverPool.push(new Server(server.domain, server.address, this.defaultPort, this.appHandle))
                }
            }
            catch (err) {
                console.error("check your config")
            }
        })
    }
    // get total presence
    getPresence() {
        let presence = []
        this.serverPool.forEach(server => {
            if (server.getPresence() != null) {
                presence = presence.concat(server.getPresence())
            }
        })
        return presence
    }
}



module.exports = ServerService;
