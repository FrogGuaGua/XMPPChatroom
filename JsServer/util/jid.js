function parseJID(jid){
    const pattern = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+$/;
    const match = jid.match(pattern);
    
    if (match) {
        return {
            username: match[1],
            domain: match[2]
        };
    } else {
        return false;
    }
}
module.exports = {parseJID};