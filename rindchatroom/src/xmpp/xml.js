class xmlManagement {
    constructor() 
    {
        this.parser = new DOMParser();
        this.serializer = new XMLSerializer();
        const xmlString = '<root></root>';
        this.xml = this.parser.parseFromString(xmlString, 'application/xml');
        this.root = this.xml.documentElement;
        this.initMessage()
        this.initPresence()
    }
    startStream()
    {
        let stream = this.xml.createElement('stream:stream');
        stream.setAttribute('xmlns:stream','http://etherx.jabber.org/streams' )
        stream.setAttribute('xmlns', 'jabber:client');
        stream.setAttribute('to', 'server');
        stream.setAttribute('version', '1.0');
        this.stream = this.root.appendChild(stream);
    }
    initPresence()
    {
        this.presence = this.xml.createElement('presence');
    }
    initMessage()
    {
        this.message = this.xml.createElement('message');
    }
    toString(xmlElement)
    {
        return this.serializer.serializeToString(xmlElement)
    }


}
export {xmlManagement}


