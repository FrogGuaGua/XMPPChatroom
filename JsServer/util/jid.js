// Code to parse JID
// c1@s1 to [c1,s1]
function parseJID(jid){
    const regex = /^([a-zA-Z0-9]+)@([a-zA-Z0-9]+)$/;
    const match = jid.match(regex);
    if(!match){
      return false
    }
    if(match[0] != jid){
      return false
    }
    if (match[0] && jid.indexOf('@') === jid.lastIndexOf('@')) {
      const username = match[1];
      const domain = match[2];
      return { username, domain };
    } else {
      return false; 
    }
}
module.exports = {parseJID};