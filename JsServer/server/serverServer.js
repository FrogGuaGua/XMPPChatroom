const path = require('path');
const fs = require('fs');
const WebSocket = require("ws");
const protocal = require('../util/protocol');


class Server{
    constructor(domain,ip,port){
        this.domain = domain
        this.ip = ip
        this.port = port
        this.activeSocket = null
        this.passiveSocket = null
        this.stack = 0

    }
    activeConnect(){
        this.activeSocket = new WebSocket.WebSocket(`ws://${this.ip}:${this.port}`)
        this.activeSocket.onopen = this.attendance.bind(this)
        this.activeSocket.onclose = this.close.bind(this)
        this.activeSocket.onmessage = this.message.bind(this)
    }
    async attendance(websocket){
        console.log()
        await websocket.send(JSON.stringify(protocal.attendance()))
    }
    async close(websocket){
        this.activeSocket = new WebSocket.WebSocket(`ws://${this.ip}:${this.port}`)
        console.log("Server disconnected")
    }
    async message(event){
        try {
            let info = JSON.parse(event.data)
        } catch (error) {
            socket.close()
            console.error("JSON :", error);
        }
        if(info.tag == "attendance"){
            this.attendance()
        }
        if(info.tag == "message"){
            this.message(info)
        }
        if(info.tag = "check"){
            this.check()
        }
    }
    async attendance(){
        let presence = protocal.presence()
        presence.presence =global.clientServer.getPresence()
        presence = JSON.stringify(presence)
        await this.send(presence)
    }
    async message(info){
        global.taskQueue.enqueue(info)
    }
    async check(){
        this.send(JSON.stringify(protocal.checked()))
    }
    async send(data){
        if(this.activeConnect.open === 1){
            this.activeSocket.send(data)
        }
        else{
            console.log(111)
        }
    }
}

class ServerService {
    constructor() {
        let configPath = path.resolve(__dirname, 'configuration.json');
        this.serverPool=[]
        this.config = null
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
    }
    load() {
        this.defaultPort = this.config.defaultServerPort
        for (const [key, value] of Object.entries(this.config)) {
            this.serverPool.push(new Server(key,value,this.defaultPort))
        }
        this.serverPool.forEach(serer=>{
            serer.activeConnect()
        })

    }
}

module.exports = ServerService;
