class protocal{
    static login(){
        return {tag:"login",username:"",password:""}
    }
    static signup()
    {
        return {tag:"signup",username:"",password:""}
    }
    static message(){
        return {tag:"message",from:"",to:"",type:"",info:""}
    }
    static check(){
        return {tag:"check"}
    }
}

export{protocal}