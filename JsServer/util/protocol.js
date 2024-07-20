// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen

// all protocal used
// including the field check 
class protocal{
    // login
    static login(){
        return {tag:"login",username:"",password:""}
    }
    static loginFields(){
        return ["tag","username","password"]
    }
    static loginSuccess(){
        return {tag:"loginSuccess",nickname:"",jid:"",ip:""}
    }
    static loginFailed(){
        return {tag:"loginFailed"}
    }
    //presence
    static presence(){
        return {tag:"presence",presence:[]}
    }
    static presenceFields(){
        return ["presence"]
    }
    static userInfo(){
        return {nickname:"",jid:"",publickey:""}
    }
    static userInfoFields(){
        return ["nickname","jid","publickey"]
    }
    // message
    static message(){
        return {tag:"message",from:"",to:"",info:"",time:""}
    }
    static messageFields(){
        return ["from","to","info"]
    }
    // file
    static file(){
        return {tag:"file",from:"",to:"",info:"",time:"",filename:""}
    }
    static fileFields(){
        return ["from","to","info","filename"]
    }
    // check
    static checked(){
        return {tag:"checked"}
    }
    static check(){
        return {tag:"check"}
    }
    // signup
    static signup(){
        return {tag:"signup",username:"",password:""}
    }
    static signupFields(){
        return ["signup","username","password"]
    }
    static signupSuccess(){
        return {tag:"signupSuccess"}
    }
    static signupFail(){
        return {tag:"signupFail"}
    }
    // attendance
    static attendance(){
        return {tag:"attendance"}
    }
}


module.exports = protocal