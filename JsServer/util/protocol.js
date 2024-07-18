class protocal{
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
    static message(){
        return {tag:"message",from:"",to:"",info:"",time:""}
    }
    static messageFields(){
        return ["from","to","info"]
    }
    static file(){
        return {tag:"file",from:"",to:"",info:"",time:"",filename:""}
    }
    static fileFields(){
        return ["from","to","info","filename"]
    }
    static checked(){
        return {tag:"checked"}
    }
    static check(){
        return {tag:"check"}
    }
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
    static attendance(){
        return {tag:"attendance"}
    }
}


module.exports = protocal