class xmlManagement {
    constructor() 
    {
        this.parser = new DOMParser();
        this.serializer = new XMLSerializer();
        const xmlString = '<root></root>';
        this.xml = this.parser.parseFromString(xmlString, 'application/xml');
        this.root = this.xml.documentElement;
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
    startPresence()
    {
        let presence = this.xml.createElement('presence');
        presence.setAttribute("publicRoom","publicRoom")
        this.presence = this.stream.appendChild(presence);
    }
    startMessage()
    {
        let message = this.xml.createElement('message');
        this.message = this.stream.appendChild(message);
    }
    toString(xmlElement)
    {
        return this.serializer.serializeToString(xmlElement)
    }


}
export {xmlManagement}


