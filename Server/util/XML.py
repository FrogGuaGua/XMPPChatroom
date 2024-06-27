import xml.etree.ElementTree as ET

class XMLUtil():
    #XMPP HEAD
    @staticmethod 
    def head(host):
        return (
                    "<?xml version='1.0'?>"
                    "<stream:stream from='{0}' "
                    "xmlns='jabber:client' "
                    "xmlns:stream='http://etherx.jabber.org/streams' "
                    "id='{}'>"
                ).format(host)
    

class XMLStream():
    def __init__(self,data,stream) -> None:
        self.XML:ET = ET.fromstring(data)
        self.stream = stream
    def rend():
        pass

    