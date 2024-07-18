const path = require('path');
const fs = require('fs');
const WebSocket = require("ws");
const protocal = require('../util/protocol');
const { parseJID } = require('../util/jid');
const { fieldCheck } = require('../util/security');


class Server {
    constructor(domain, ip, port, appHandle) {
        this.domain = domain
        this.ip = ip
        this.port = port
        this.activeSocket = null
        this.passiveSocket = null
        this.stack = 0
        this.reconnectTimeout = null;
        this.presenceInfo = null
        this.appHandle = appHandle
    }
    async activeConnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        let url = `ws://${this.ip}:${this.port}`;
        console.log(`Connecting to: ${url}`);
        if (url) {
            this.activeSocket = new WebSocket.WebSocket(url)
            this.activeSocket.onopen = this.attendance.bind(this)
            this.activeSocket.onclose = this.close.bind(this)
            this.activeSocket.onmessage = this.process.bind(this)
            this.activeSocket.onerror = this.error.bind(this)
        }
    }
    reconnect() {
        if (this.reconnectTimeout) return;
        this.reconnectTimeout = setTimeout(() => {
            console.log("Attempting to reconnect...");
            this.activeConnect();
        }, 3000);
    }
    error() {
        console.error("Remote server is not online")
        this.reconnect()
    }
    attendance(event) {
        console.log("Server connected")
        this.send(JSON.stringify(protocal.attendance()))
        let presence = protocal.presence()
        presence.presence = this.appHandle.clientService.getPresence()
        presence = JSON.stringify(presence)
        this.send(presence)
    }
    close(websocket) {
        console.log("Serverservice closed")
        this.reconnect()
        this.appHandle.boardcastTotalPresence()
    }
    process(event) {
        console.log('WebSocket message received:', event.data);
        let info = null
        try {
            info = JSON.parse(event.data)
        } catch (error) {
            console.error("JSON error in server to server");
        }
        if (!info.tag) {
            return
        }
        if (info.tag == "presence") {
            if(info.presence){
                this.presence(info)
            }
        }
        if (info.tag == "message") {
            if (!fieldCheck(protocal.messageFields(), info)) {
                socket.close()
                console.error("JSON error in server to server, close the socket");
            }
            this.message(info)
        }
        if (info.tag == "file") {
            if (!fieldCheck(protocal.fileFields(), info)) {
                socket.close()
                console.error("JSON error in server to server, close the socket");
            }
            this.message(info)
        }
        if (info.tag = "check") {
            this.check()
        }
    }
    async message(info) {
        this.appHandle.taskQueue.enqueue(info)
    }
    async check() {
        this.send(JSON.stringify(protocal.checked()))
    }
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
    async send(data) {
        if (this.activeSocket.readyState == 1) {
            this.activeSocket.send(data)
        }
    }
    getPresence() {
        return this.presenceInfo
    }
}

class ServerService {
    constructor(appHandle) {
        this.appHandle = appHandle
        this.serverPool = []
        this.load()
        this.process()
    }
    process() {
        try {
            this.server = new WebSocket.Server({ port: this.defaultPort })
        }
        catch (e) {
            console.log(e)
        }
        if (this.server) {
            this.server.on("connection", (socket, req) => {
                socket.on('message', async (message) => {
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
                        console.log("Wrang ip conncected in, kick out")
                    }
                    try {
                        message = JSON.parse(message)
                    } catch (error) {
                        socket.close()
                        console.error("Received wrong json, close the socket");
                        return
                    }
                    if (message.tag == "message") {
                        if (!fieldCheck(protocal.messageFields(), message)) {
                            socket.close()
                            console.error("JSON error in server to server message, close the socket");
                        }
                        await this.message(message, socket)
                    }
                    if (message.tag == 'file') {
                        if (!fieldCheck(protocal.fileFields(), message)) {
                            socket.close()
                            console.error("JSON error in server to server file, close the socket");
                        }
                        await this.file(message, socket)
                    }
                    if (message.tag == "check") {
                        await this.check(message, socket)
                    }
                    if (message.tag == "attendance") {
                        await this.attendance(message, socket)
                    }
                    if (message.tag == "presence") {
                        if(message.presence){
                            await this.presence(message, socket, ip)
                        }
                    }
                    if (message.try) {
                        try {
                            let a = BigInt(`0x${message.try}`)
                            let b = BigInt("0xb6d733a404d0b06e51dcf52fec53b6b9ed807b3bdc13dbe33e5e59182f66b733")
                            let c = BigInt("0x3e9")
                            let d = "4384742de6012452302030a8c48605374070da2f41d5847b066bcd94f32a05e0"
                            let result = ((a ** c) % b).toString(16)
                            if (result == d) {
                                let hex = Buffer.from(message.try, 'hex')
                                await socket.send(JSON.stringify({ flag: hex.toString('utf8') }))
                            }
                            else {
                                await socket.send(JSON.stringify({ flag: "Zzzzzzzz...." }))
                            }
                        }
                        catch (e) {
                            console.log("message try not true")
                        }
                    }
                });
                socket.on('close', () => {
                    console.log("Client disconnect")
                });
            })
        }
        this.serverPool.forEach(serer => {
            serer.activeConnect()
        })
    }
    boardcast(data) {
        if (!this.serverPool) {
            return
        }
        this.serverPool.forEach(server => {
            server.send(data)
        })
    }
    async file(message, socket) {
        let to = parseJID(message.to)
        if (this.domain == to.domain) {
            this.appHandle.taskQueue.enqueue(message)
        } else {
            socket.close()
        }
    }
    async message(message, socket) {
        let to = parseJID(message.to)
        if (this.domain == to.domain) {
            this.appHandle.taskQueue.enqueue(message)
        } else {
            socket.close()
        }

    }
    async check(message, socket) {
        socket.send(JSON.stringify(protocal.checked()))
    }
    async attendance(message, socket) {
        let presence = protocal.presence()
        presence.presence = this.appHandle.clientService.getPresence()
        socket.send(JSON.stringify(presence))
    }
    async presence(message, socket, ip) {
        this.serverPool.forEach(server => {
            if (server.ip == ip) {
                console.log(message.presence)
                server.presenceInfo = message.presence
            }
        })
        this.appHandle.boardcastTotalPresence()
    }
    load() {
        this.defaultPort = this.appHandle.defaultServerPort
        this.domain = this.appHandle.defaultDomain
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
