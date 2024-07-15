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
        console.log("connected")
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
        console.log(info)
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
        // else if (this.passiveSocket.open ){
        //     this.passiveSocket.send(data)
        // }
    }
}

a = new Server("123","10.0.0.109","5555")
a.activeConnect()
a.activeSocket.send(JSON.stringify({tag:"attendance"}))