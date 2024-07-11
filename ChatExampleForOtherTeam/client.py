import asyncio
import websockets
import json
import threading
import os
from protocol import *
import subprocess


username = "123@rind"  #id@domain
socket = None
page = "public" # who your are talking to
message = []
presenceInfo = []




async def connect_to_server():
    uri = "ws://localhost:4557"   # server ip
    loop = asyncio.get_event_loop()
    async with websockets.connect(uri) as websocket:
        socket = websocket
        login = protocol.login()
        login["username"] = username
        await socket.send(json.dumps(login))
        while True:
            response = await websocket.recv()  #data you get
            data = json.loads(response)   #to json
            print(json.dumps(data))
            if(data["tag"] == "message"):
                message.append(data)
            if(data["tag"] =="presence"):
                presenceInfo = data["presence"]
                # get user list
                print(presenceInfo)
            if(data["tag"] == "success"):
                print("success")
           

# to do
# update presenceInfo on your UI 
# make a input to implement message to server

asyncio.run(connect_to_server())



