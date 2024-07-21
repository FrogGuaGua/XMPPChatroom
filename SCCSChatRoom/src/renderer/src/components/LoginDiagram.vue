<template>
  <el-row :gutter="24">
    <el-col>
      <div class="grid-content">
        <h2>SCCSChatroom</h2>
      </div>
    </el-col>
    <el-col :span="24">
      <el-text>Your nickname(Optional)</el-text>
      <div class="grid-content">
        <el-icon>
          <User />
        </el-icon>
        <el-input v-model="nickname" style="width: 240px" placeholder="Your nickname(Optional)"
          :formatter="(value) => `${value}`.replace(/[^0-9A-Za-z]/g, '')" />
      </div>
    </el-col>
    <el-col :span="24">
      <el-text>Your username</el-text>
      <div class="grid-content">
        <el-icon>
          <User />
        </el-icon>
        <el-input v-model="username" style="width: 240px" placeholder="Your username"
          :formatter="(value) => `${value}`.replace(/[^0-9A-Za-z]/g, '')" />
      </div>
    </el-col>
    <el-col :span="24">
      <el-text>Your password</el-text>
      <div class="grid-content">
        <el-icon>
          <Lock />
        </el-icon>
        <el-input v-model="password" style="width: 240px" placeholder="Your password" type="password" />
      </div>
    </el-col>
    <el-col :span="24">
      <el-text>Server IP</el-text>
      <div class="grid-content">
        <el-icon>
          <Lock />
        </el-icon>
        <el-input v-model="serverIP" style="width: 240px" placeholder="Server IP"
          :formatter="(value) => `${value}`.replace(/[^0-9.]/g, '')" :parser="(value) => parseIP(value)" />
      </div>
    </el-col>
    <el-col :span="24">
      <el-text>Server Port</el-text>
      <div class="grid-content">
        <el-icon>
          <Lock />
        </el-icon>
        <el-input v-model="serverPort" style="width: 240px" placeholder="Server Port"
          :formatter="(value) => `$ ${value}`.replace(/[^0-9.]/g, '')" />
      </div>
    </el-col>
    <el-col>
      <el-button type="primary" @click="onSubmit()">Log in</el-button>
      <el-button type="primary" @click="onSign()">Sign up</el-button>
    </el-col>
    <el-col>
      <h4>SCCS</h4>
    </el-col>
  </el-row>
</template>

<script setup>
import { protocal } from '@/utils/protocol'
import { RSAOAEP2048, filterJsonCharacters } from '@/utils/security'
import CryptoJS from 'crypto-js'
import { ElMessage } from 'element-plus'
import { inject, ref, watch } from 'vue'
import { sliceStr } from '../utils/security'
// Ref for each input
const username = ref('')
const password = ref('')
const nickname = ref('')
const serverIP = ref('')
const serverPort = ref('4567')
const statePool = inject('statePool')
const myInfomation = inject('myInfomation')
var security = null
var websocket = null
// Limited IP import
const parseIP = (value) => {
  const parts = value.split('.');
  const validParts = parts.map(part => {
    let num = parseInt(part, 10);
    if (isNaN(num) || num < 0) num = "";
    if (num > 255) num = 255;
    return num.toString();
  });
  return validParts.join('.');
};
// Code for login function
const onSubmit = () => {
  // check invalid input
  if (!username.value || !password.value || !nickname.value || username.value == "public") {
    ElMessage({
      message: 'Login failed, check address port username password.',
      type: 'warning'
    })
    return
  }
  statePool.serverIP = serverIP
  statePool.serverPort = serverPort
  security = new RSAOAEP2048()
  websocket = new WebSocket('ws://' + statePool.serverIP + ':' + statePool.serverPort)
  myInfomation.security = security
  myInfomation.websocket = websocket
  // send username and password
  websocket.onopen = () => {
    ElMessage({
      message: 'Connected to server, start login.',
      type: 'success'
    })
    let loginInfo = protocal.login()
    loginInfo.username = username.value
    loginInfo.nickname = nickname.value
    loginInfo.password = CryptoJS.MD5(password.value).toString()
    loginInfo.publickey = security.publicKeyPem
    websocket.send(JSON.stringify(loginInfo))
  }
  // if websocket close back to login diagram
  websocket.onclose = () => {
    statePool.state = 0
  }
  // receive the message for server
  // if success show chatroom
  // else show failed message
  websocket.onmessage = (event) => {
    let message = JSON.parse(event.data)
    if (message.tag == 'loginSuccess') {
      myInfomation.nickname = message.nickname
      myInfomation.jid = message.jid
      myInfomation.ip = message.ip
      statePool.state = 2
    }
    if (message.tag == 'loginFailed') {
      ElMessage({
        message: 'Login failed, check address port username password.',
        type: 'warning'
      })
    }
  }
}
// Code for sign function
const onSign = () => {
  // password and username limitation
  if (username.value.length < 1 || password.value.length < 8) {
    ElMessage({
      message: 'The length of password are at least 8 or empty username.',
      type: 'warning'
    })
    return
  }
  // not empty
  if (!username.value || !password.value || username.value == "public") {
    ElMessage({
      message: 'Signup failed, check address port username password.',
      type: 'warning'
    })
    return
  }
  statePool.serverIP = serverIP
  statePool.serverPort = serverPort
  security = new RSAOAEP2048()
  websocket = new WebSocket('ws://' + statePool.serverIP + ':' + statePool.serverPort)
  myInfomation.security = security
  myInfomation.websocket = websocket
  // send sign up info 
  websocket.onopen = () => {
    ElMessage({
      message: 'Connected to server, start signup.',
      type: 'success'
    })
    let loginInfo = protocal.signup()
    loginInfo.username = username.value
    loginInfo.password = CryptoJS.MD5(password.value).toString()
    websocket.send(JSON.stringify(loginInfo))
  }
  // process signupSuccess and signupfailed
  websocket.onmessage = (event) => {
    let message = JSON.parse(event.data)
    if (message.tag == 'signupSuccess') {
      ElMessage({
        message: 'Signup success.'
      })
    } else {
      ElMessage({
        message: 'Signup failed, check address port username password.',
        type: 'warning'
      })
    }
  }
}
// heart beat ref
const heart = ref('')
const stack = ref(0)
// watch the statePool.state change
watch(
  () => statePool.state,
  (state) => {
    // if change to chat
    if (state == 2) {
      statePool.isLogin = true
      // process the heart beat
      heart.value = setInterval(() => {
        websocket.send(JSON.stringify(protocal.check()))
        stack.value += 1
        if (stack.value == 3) {
          ElMessage({
            message: 'You lose the connection.',
            type: 'warning'
          })
          stack.value = 0
          websocket.close()
          clearInterval(heart.value)
          heart.value = ''
          onSubmit()
        }
      }, 2000)
      // Process message receive
      websocket.onmessage = (event) => {
        let message = event.data
        try { message = JSON.parse(event.data) } 
        catch (e) {
          console.log("Json error")
          return
        }
        // Process presence
        if (message.tag == 'presence') {
          myInfomation.presence = message.presence
        }
        // Process checked
        if (message.tag == 'checked') {
          stack.value = 0
        }
        // Process message or file
        if (message.tag == 'message' || message.tag == 'file') {
          try {
            if (message.to != 'public') {
              let slicedInfo = sliceStr(atob(message.info), 256)
              let currentinfo = ""
              slicedInfo.forEach(str => {
                currentinfo += myInfomation.security.decrypt(str)
              })
              message.info = currentinfo
            }
            myInfomation.chatlog.push(message)
          }
          catch (e) {
            myInfomation.chatlog.push(message)
            console.log("Receive the message without encrytion, try to display without decrypt.")
          }
        }

      }
    } else {
      // some error process
      if (state == 0) {
        ElMessage.error({
          message: 'Connect closed.'
        })
        statePool.isLogin = false
      }
      if (heart.value) {
        clearInterval(heart.value)
        stack.value = 0
      }
    }
  }
)
</script>

<style>
.el-row {
  margin-bottom: 20px;
}

.el-col {
  border-radius: 4px;
}

.el-row:last-child {
  margin-bottom: 0px;
}

.grid-content {
  border-radius: 10px;
  min-height: 65px;
}

.el-input {
  width: 500px;
  height: 40px;
}
</style>
