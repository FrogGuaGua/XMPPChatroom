// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen

// all protocal 
// including the field check 
// something is nerver used
class protocal {
    static login() {
        return { tag: "login", username: "", password: "",nickname:"",publickey:""}
    }
    static message() {
        return { tag: "message", from: "", to: "", info: "" }
    }
    static file() {
        return { tag: "file", filename:"", from: "", to: "", info: "" }
    }
    static check() {
        return { tag: "check" }
    }
    static offer() {
        return { tag: "offer", from: "", to: "", offer: "" }
    }
    static answer() {
        return { tag: "answer", from: "", to: "", answer: "" }
    }
    static signup() {
        return { tag:"signup", username:"", password:""}
    }
    static signupSuccess(){
        return {tag:"signupSuccess"}
    }
    static signupFail(){
        return {tag:"signupFail"}
    }
    
}

export { protocal }