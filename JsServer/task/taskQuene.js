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
        if(task.tag == "message"){
            if (task.to == "public") {
                global.clientServer.pubicRoom.push(task)
                global.clientServer.broadcast(JSON.stringify(task))
            }
            else{
                global.clientServer.clientPool.filter(client=>{
                    return client.jid == task.to || client.jid == task.from
                }).forEach(client=>{
                  client.socket.send(JSON.stringify(task))
                })
            }
        }
        this.running = false;
        this.runNext();
      }
    }
  }

  
module.exports = TaskQueue;