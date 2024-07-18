const ClientService = require("./client/clientService");
const TaskQueue = require("./task/taskQuene");
const DatabaseManagement = require("./database/database");
const ServerService = require("./server/serverService");
const path = require('path');
const fs = require('fs');
const {RSAOAEP2048} = require("./util/security");
const protocal = require("./util/protocol");


class Application {
    constructor() {
        let configPath = path.resolve(__dirname, 'configuration.json');
        fs.readFile(configPath, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            try {
                this.config = JSON.parse(data);
                this.security = new RSAOAEP2048();
                this.remoteServers = this.config.server
                this.defaultServerPort = this.config.defaultServerPort
                this.defaultClientPort = this.config.defaultClientPort
                this.defaultDomainName = this.config.defaultDomainName
                if(await this.configCheck()){
                    console.error('Check your config , make the domain names and the IP(including your self) is unique')
                    return
                }
                await this.load()
            } catch (err) {
                console.error('Error parsing JSON:', err);
            }
        })
    }
    async load() {
        this.databaseManagement = new DatabaseManagement()
        this.clientService = new ClientService(this)
        this.serverService = new ServerService(this)
        this.taskQueue = new TaskQueue(this)
    }
    boardcast(data){
        this.clientService.broadcast(data)
        this.serverService.boardcast(data)
    }
    getTotalPresence(){
        return this.clientService.getPresence().concat(this.serverService.getPresence())
    }
    boardcastMyPresence(){
        let data = protocal.presence()
        data.presence = this.clientService.getPresence()
        this.serverService.boardcast(JSON.stringify(data))
    }
    boardcastTotalPresence(){
        let data = protocal.presence()
        data.presence = this.getTotalPresence()
        this.clientService.broadcast(JSON.stringify(data))
    }
    async configCheck(){
        let domainName= []
        let doaminIP = []
        this.config.server.forEach(server=> {
            domainName.push(server.domain)
            doaminIP.push(server.address)
        });
        domainName.push(this.defaultDomainName)
        // domainnames or ips are not unique
        if(domainName.length !== (new Set(domainName)).size ){
            return true
        }
        if(doaminIP.length !== (new Set(doaminIP)).size ){
            return true
        }
        return false
    }
}

let app = new Application()
