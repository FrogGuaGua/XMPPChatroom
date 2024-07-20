// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen

const { parseJID } = require("../util/jid");


// Implement to process file json and message json
class TaskQueue {
  constructor(appHandle) {
    this.queue = [];
    this.running = false;
    this.appHandle = appHandle
  }
  // Add into quene
  enqueue(task) {
    this.queue.push(task);
    if (!this.running) {
      this.runNext();
    }
  }
  // run next task
  async runNext() {
    if (this.queue.length > 0) {
      this.running = true;
      const task = this.queue.shift();
      console.log("task start")
      console.log(task)
      // process message and file
      if (task.tag == "message" || task.tag == "file") {
        let to = parseJID(task.to)  
        let from = parseJID(task.from)
        task.time = (new Date()).toString()
        // message to public
        if (task.to == "public") {
          if (from.domain && from.domain == this.appHandle.defaultDomainName) {
            this.appHandle.serverService.boardcast(JSON.stringify(task))
          }
          this.appHandle.clientService.broadcast(JSON.stringify(task))
        }
        else {
          if (to.domain) {
            // message to local user
            if (to.domain == this.appHandle.defaultDomainName) {
              this.appHandle.clientService.clientPool.filter(client => {
                return client.jid == task.to || client.jid == task.from
              }).forEach(client => {
                client.socket.send(JSON.stringify(task))
              })
            }
            else {
              // message to other server
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