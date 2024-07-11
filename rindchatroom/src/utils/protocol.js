class protocal {
    static login() {
        return { tag: "login", username: "", password: "",nickname:"" }
    }
    static message() {
        return { tag: "message", from: "", to: "", type: "", info: "" }
    }
    static check() {
        return { tag: "check" }
    }
    // for p2p
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