import asyncio
import websockets
import json
from protocol import *
connected_clients = set()
servers = {"rind":"localhost"}  # change to your ip
clients = []

async def boardcast(data):
    for i in clients:
        await i["socket"].send(data)


def presence():
    presence = protocol.presence()
    r = []
    for i in clients:
        r.append({"nickname":"","jid":i["jid"],"ip":i["ip"],"status":i["status"]})
    presence["presence"] = r
    return presence

async def handle_message(websocket, path):
    try:
        async for message in websocket:
            info = json.loads(message)
            print(message)
            #login 
            if(info["tag"] == "login"):
                userinfo = protocol.userInfo()
                userinfo["jid"] = info["username"]
                userinfo["socket"] = websocket

                # save online users
                clients.append(userinfo.copy())
                # b
                await websocket.send(json.dumps(protocol.success()))

                await boardcast(json.dumps(presence()))

            #message
            if(info["tag"] == "message"):
                to = info["to"]
                f = info["from"]
                for i in clients:
                    if(i["to"] == to or f == i["from"]):
                        await i["socket"].send(json.dumps(info))
                    

    finally:
        print("client leave")
        # to do remove from client
        # boardcast presence




if __name__ == '__main__':
    startServer = websockets.serve(handle_message, "localhost", 4557)
    print("[+]Service start")
    asyncio.get_event_loop().run_until_complete(startServer)
    asyncio.get_event_loop().run_forever()