const fs = require('fs');

function saveToFile(data, filename) {
    fs.writeFile(filename, data, (err) => {
        if (err) throw err;
        console.log('file save error, check your permision');
    });
}
function toJS(data){
    return "const publicKey = `" + data + "` \nexport default publicKey"
}

module.exports = {saveToFile,toJS};

