# -*- coding: utf-8 -*-
# @Author: Rind
# @Date: 2024年6月26日 05:20:54
# @Last Modified by: Rind
# @Last Modified time: 2024年6月26日 05:20:54


import socket
import threading
import xml.etree.ElementTree as ET
from session import SessionPool

# XMPP服务器信息
host = '0.0.0.0'
port = 64442

sessionPool = SessionPool()


def startServer():
    serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    serverSocket.bind((host, port))
    serverSocket.listen(10)
    while True:
        connection, address = serverSocket.accept()
        print(connection,address)


if __name__ == '__main__':
    startServer()
