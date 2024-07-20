<template>
  <el-container>
    <el-header>
      <MyState v-if="statePool.isLogin"></MyState>
    </el-header>
    <el-main>
      <el-dialog
        v-model="loginVisible"
        title="Welcome"
        width="500"
        align-center
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <UserLogin />
      </el-dialog>
      <ChatRoom v-if="statePool.isLogin"> </ChatRoom>
    </el-main>
  </el-container>
</template>

<script setup>
// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen
import UserLogin from './views/UserLogin.vue'
import ChatRoom from './views/ChatRoom.vue'
import MyState from './views/MyState.vue'
import { ref, watch, provide, reactive } from 'vue'
// Client State
// Control the diagram showing
const clientState = {
  init: 0,
  login: 1,
  chat: 2
}
// Global info
const statePool = reactive({
  isLogin: false,   // Control the login diagram 
                    
  currentPage: {    // Control the message shown and chat target
    nickname: String,   // nickname
    jid: String,        // jid
  },
  serverIP: '',     // server ip
  serverPort: '',   // server port
  state: clientState.init  // Client State
})
// Global user info 
const myInfomation = reactive({
  nickname: 'tester',   // my nickname
  jid: '000',    // my jid
  presence: {},   // all presence
                  //used to show chatlist
  chatlog: [],    // all chat message
  websocket: '',  // the connection to server
  security: '',   // RSA2048OAEP
  ip:'127.0.0.1',  // my ip
})


// Implementing changes to the login window display
const loginVisible = ref(true)
watch(
  () => statePool.isLogin,
  (isLogin) => {
    loginVisible.value = !isLogin
  }
)
// Implementing global info for components
provide('myInfomation', myInfomation)
provide('statePool', statePool)
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
