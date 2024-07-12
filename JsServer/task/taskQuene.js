const { parseJID } = require("../util/jid");

class TaskQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }
  enqueue(task) {
    this.queue.push(task);
    if (!this.running) {
      this.runNext();
    }
  }
  async runNext() {
    if (this.queue.length > 0) {
      this.running = true;
      const task = this.queue.shift();
      if (task.tag == "message") {
        let from = parseJID(task.from)
        let to = parseJID(task.to)
        if (task.to == "public") {
          if (from.domain && from.domain == global.serverService.domain) {
            global.serverService.boardcast(JSON.stringify(task))
          }
          global.clientServer.broadcast(JSON.stringify(task))
        }
        else {
          if (to.domain){
            if (to.domain == global.serverService.domain) {
              global.clientServer.clientPool.filter(client => {
                return client.jid == task.to || client.jid == task.from
              }).forEach(client => {
                client.socket.send(JSON.stringify(task))
              })
            }
            else{
              global.serverService.serverPool.forEach(async server=>{
                if(server.domain == to.domain)
                {
                  server.send(JSON.stringify(task))
                }
              })
            }
          }
        }
      }
      this.running = false;
      this.runNext();
    }
  }

}


module.exports = TaskQueue;