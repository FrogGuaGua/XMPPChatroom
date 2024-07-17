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
import UserLogin from './views/UserLogin.vue'
import ChatRoom from './views/ChatRoom.vue'
import MyState from './views/MyState.vue'
import { ref, watch, provide, reactive } from 'vue'

const clientState = {
  init: 0,
  login: 1,
  chat: 2
}

const statePool = reactive({
  isLogin: false,
  currentPage: {
    nickname: String,
    jid: String,
    status: String,
    ip: String
  },
  serverIP: '',
  serverPort: '',
  state: clientState.init
})

const myInfomation = reactive({
  nickname: 'tester',
  jid: '000',
  presence: {},
  chatlog: [],
  websocket: '',
  security: '',
  ip:'127.0.0.1',
})

const loginVisible = ref(true)
watch(
  () => statePool.isLogin,
  (isLogin) => {
    loginVisible.value = !isLogin
  }
)

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
