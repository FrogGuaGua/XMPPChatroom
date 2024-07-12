const ClientService = require("./client/clientService");
const TaskQueue = require("./task/taskQuene");
const DatabaseManagement = require("./database/database");
const ServerService = require("./server/serverServer");


global.clientServer = new ClientService()
global.taskQueue = new TaskQueue()
global.databaseManagement = new DatabaseManagement()
global.serverService = new ServerService()
