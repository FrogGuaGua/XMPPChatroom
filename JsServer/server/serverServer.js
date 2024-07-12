const path = require('path');
const fs = require('fs');
const WebSocket = require("ws");
const protocal = require('../util/protocol');
const { parseJID } = require('../util/jid');


class Server {
    constructor(domain, ip, port) {
        this.domain = domain
        this.ip = ip
        this.port = port
        this.activeSocket = null
        this.passiveSocket = null
        this.stack = 0
        this.reconnectTimeout = null;
    }
    activeConnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout); 
            this.reconnectTimeout = null;
        }
        this.activeSocket = new WebSocket.WebSocket(`ws://${this.ip}:${this.port}`)
        this.activeSocket.onopen = this.attendance.bind(this)
        this.activeSocket.onclose = this.close.bind(this)
        this.activeSocket.onmessage = this.message.bind(this)
        this.activeSocket.onerror = this.error.bind(this)
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
    attendance(websocket) {
        websocket.send(JSON.stringify(protocal.attendance()))
    }
    close(websocket) {
        console.log("Serverservice closed")
        this.reconnect()
    }
    message(event) {
        try {
            let info = JSON.parse(event.data)
        } catch (error) {
            socket.close()
            console.error("JSON :", error);
        }
        if (info.tag == "attendance") {
            this.attendance()
        }
        if (info.tag == "message") {
            this.message(info)
        }
        if (info.tag = "check") {
            this.check()
        }
    }
    async attendance() {
        let presence = protocal.presence()
        presence.presence = global.clientServer.getPresence()
        presence = JSON.stringify(presence)
        await this.send(presence)
    }
    async message(info) {
        global.taskQueue.enqueue(info)
    }
    async check() {
        this.send(JSON.stringify(protocal.checked()))
    }
    async send(data) {
        if (this.activeSocket.open === 1) {
            this.activeSocket.send(data)
        }
        else if (this.passiveSocket.open ){
            this.passiveSocket.send(data)
        }
    }
}

class ServerService {
    constructor() {
        let configPath = path.resolve(__dirname, 'configuration.json');
        this.serverPool = []
        this.config = null
        this.domain = null
        fs.readFile(configPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            try {
                this.config = JSON.parse(data);
                this.load()

            } catch (err) {
                console.error('Error parsing JSON:', err);
            }
        })
        try {
            this.server = new WebSocket.Server({ port: this.defaultPort })
        }
        catch (e) {
            console.log("launch serverService error")
        }
        if (this.server) {
            this.server.on("connection", async (socket,req) => {
                socket.on('message', async (message) => {
                    const ip = req.socket.remoteAddress;
                    const port = req.socket.remotePort;
                    this.serverPool.forEach(server=>{
                        if(ip == server.ip && port == server.port){
                            server.socket = socket
                        }
                    })
                    console.log(message)
                    try {
                        message = JSON.parse(message)
                    } catch (error) {
                        socket.close()
                        console.error("JSON :", error);
                    }
                    if (message.tag == "message") {
                        this.message(message, socket)
                    }
                    if (message.tag == "check") {
                        this.check(message, socket)
                    }
                    if (message.tag == "attendance") {
                        await this.attendance(message, socket)
                    }

                });
                socket.on('close', () => {
                    let removeIndex = this.clientPool.findIndex((client) => { client == socket })
                    this.clientPool.splice(removeIndex)
                    this.boadrdcastPresence()
                    console.log("Client disconnect")
                })
            })
        }
    }
    whiteList(){
        
    }
    async boardcast(data){
        this.serverPool.forEach(async server=>{
            await server.send(data)
        })
    }
    message(message, socket){
        if(message.to && message.from && message.info){
            let to  = parseJID(message.to)
            if(this.domain == to.domain){
                global.taskQueue.enqueue(message)
            }else{
                socket.close()
            }
        }
    }
    check(message,socket){
        socket.send(JSON.stringify(protocal.checked()))
    }
    async attendance(message,socket){
        let presence = global.clientServer.getPresence()
        socket.send(JSON.stringify(presence))
    }

    load() {
        this.defaultPort = this.config.defaultServerPort
        this.domain = this.config.defaultDomain
        this.config.server.forEach(server => {
            try {
                if (server.domain && server.address) {
                    this.serverPool.push(new Server(server.domain, server.address, this.defaultPort))
                }
            }
            catch (err) {
                console.error("check your config")
            }
        })

        this.serverPool.forEach(serer => {
            serer.activeConnect()
        })

    }
}

module.exports = ServerService;
