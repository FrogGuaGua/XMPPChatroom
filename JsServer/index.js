const ClientService = require("./client/clientService");
const TaskQueue = require("./task/taskQuene");

global.clientServer = new ClientService()
global.taskQueue = new TaskQueue()

  