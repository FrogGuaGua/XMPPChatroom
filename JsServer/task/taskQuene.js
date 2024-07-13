const { format } = require("node-forge/lib/util");
const { parseJID } = require("../util/jid");

class TaskQueue {
  constructor(appHandle) {
    this.queue = [];
    this.running = false;
    this.appHandle = appHandle
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
        let to = parseJID(task.to)  
        let from = parseJID(task.from)
        task.time = (new Date()).toString()
        if (task.to == "public") {
          if (from.domain && from.domain == this.appHandle.defaultDomainName) {
            this.appHandle.serverService.boardcast(JSON.stringify(task))
          }
          this.appHandle.clientService.broadcast(JSON.stringify(task))
        }
        else {
          if (to.domain) {
            if (to.domain == this.appHandle.defaultDomainName) {
              this.appHandle.clientService.clientPool.filter(client => {
                return client.jid == task.to || client.jid == task.from
              }).forEach(client => {
                client.socket.send(JSON.stringify(task))
              })
            }
            else {
              this.appHandle.serverService.serverPool.forEach(async server => {
                if (server.domain == to.domain) {
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