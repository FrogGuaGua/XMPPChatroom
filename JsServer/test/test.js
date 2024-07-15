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

}

class ServerService {
    constructor() {
        this.serverPool = []
        this.config = null
        this.domain = null
        this.load()
        this.process()
    }
    async process() {
        try {
            this.server = new WebSocket.Server({ port: this.defaultPort })
        }
        catch (e) {
            console.log(e)
        }
        if (this.server) {
            this.server.on("connection", async (socket, req) => {
                socket.on('message', async (message) => {
                    const ip = req.socket.remoteAddress;
                    const port = req.socket.remotePort;
                    this.serverPool.forEach(server => {
                        if (ip == server.ip && port == server.port) {
                            server.socket = socket
                        }
                    })
                    message = JSON.parse(message)
                    console.log(message)

                });
                socket.on('close', () => {
                    console.log("Client disconnect")
                })
            })
        }
    }
    async load() {
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


    }
}


let a = new ServerService()