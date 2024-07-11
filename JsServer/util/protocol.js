class protocal{
    static login(){
        return {tag:"login",username:"",password:""}
    }
    static loginSuccess(){
        return {tag:"loginSuccess",nickname:"",jid:""}
    }
    static loginFailed(){
        return {tag:"loginFailed"}
    }
    static presence(){
        return {tag:"presence",presence:[]}
    }
    static userInfo(){
        return {nickname:"",jid:"",status:""}
    }
    static message(){
        return {tag:"message",from:"",to:"",info:"",time:""}
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