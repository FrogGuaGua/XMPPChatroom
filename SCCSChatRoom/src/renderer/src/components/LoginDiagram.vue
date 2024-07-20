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

const username = ref('12312312')
const password = ref('123')
const nickname = ref('12312312')
const serverIP = ref('10.13.84.131')
const serverPort = ref('4567')
const statePool = inject('statePool')
const myInfomation = inject('myInfomation')
var security = null
var websocket = null
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
const onSubmit = () => {
  if (username.value.length < 8) {
    ElMessage({
      message: 'The length of username are at least 8.',
      type: 'warning'
    })
    return
  }
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
  websocket.onclose = () => {
    statePool.state = 0
  }
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
const onSign = () => {
  if (username.value.length < 1 || password.value.length < 8 ) {
    ElMessage({
      message: 'The length of password are at least 8 or empty username.',
      type: 'warning'
    })
    return
  }
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
const heart = ref('')
watch(
  () => statePool.state,
  (state) => {
    if (state == 2) {
      statePool.isLogin = true
      heart.value = setInterval(() => {
        websocket.send(JSON.stringify(protocal.check()))
      }, 5000)
      websocket.onmessage = (event) => {
        let message = JSON.parse(event.data)
        if (message.tag == 'presence') {
          myInfomation.presence = message.presence
        }
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
            console.log(e)
          }
        }

      }
    } else {
      if (state == 0) {
        ElMessage.error({
          message: 'Connect closed.'
        })
        statePool.isLogin = false
      }
      if (heart.value) {
        clearInterval(heart.value)
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
