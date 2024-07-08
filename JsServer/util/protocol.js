class protocal{
    static login(){
        return {tag:"login",username:"",password:""}
    }
    static loginSuccess(){
        return {tag:"loginSuccess",nickname:""}
    }
    static loginFailed(){
        return {tag:"loginFailed"}
    }
    static presence(){
        return {tag:"presence",presence:[]}
    }
    static userInfo(){
        return {nickname:"",jid:"",ip:"",status:""}
    }
    static message(){
        return {tag:"message",from:"",to:"",info:"",time:""}
    }
    static check(){
        return {tag:"checked"}
    }
}


module.exports = protocal