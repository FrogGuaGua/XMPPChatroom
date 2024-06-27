# -*- coding: utf-8 -*-
# @Author: Rind
# @Date: 2024年6月26日 05:20:54
# @Last Modified by: Rind
# @Last Modified time: 2024年6月26日 05:20:54
import threading

class Client():
    def __init__(self) -> None:
        self.jid = None
        self.address = None
        self.session = None
        self.port = None


defaultTick = 0.3
class BasicObject():
    def __init__(self,tick = defaultTick ) -> None:
        self.handle = self
        self.tick = tick
        self.thread = threading.Timer(self.tick,self.onUpdate)
        self.onStart()
    def onStart(self):
        self.thread.start()
    def onUpdate(self):
        pass
    def onStop(self):
        self.thread.cancel()

