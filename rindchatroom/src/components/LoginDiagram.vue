<template>
  <el-row :gutter="24">
    <el-col>
      <div class="grid-content">
        <h2>RindChatroom</h2>
      </div>
    </el-col>
    <el-col :span="24">
      <div class="grid-content">
        <el-icon>
          <User />
        </el-icon>
        <el-input v-model="nickname" style="width: 240px" placeholder="Your nickname" />
      </div>
    </el-col>
    <el-col :span="24">
      <div class="grid-content">
        <el-icon>
          <User />
        </el-icon>
        <el-input v-model="username" style="width: 240px" placeholder="Your username" />
      </div>
    </el-col>
    <el-col :span="24">
      <div class="grid-content">
        <el-icon>
          <Lock />
        </el-icon>
        <el-input v-model="password" style="width: 240px" placeholder="Your password" type="password" />
      </div>
    </el-col>
    <el-col :span="24">
      <div class="grid-content">
        <el-icon>
          <Lock />
        </el-icon>
        <el-input v-model="serverIP" style="width: 240px" placeholder="Server IP" />
      </div>
    </el-col>
    <el-col :span="24">
      <div class="grid-content">
        <el-icon>
          <Lock />
        </el-icon>
        <el-input v-model="serverPort" style="width: 240px" placeholder="Server Port" />
      </div>
    </el-col>
    <el-col>
      <el-button type="primary" @click="onSubmit()">submit</el-button>
      <el-button type="primary" @click="onSign">Sign up</el-button>
    </el-col>
    <el-col>
      <h4>NameHere</h4>
    </el-col>
  </el-row>
</template>

<script setup>
import { protocal } from '@/utils/protocol';
import { RSAOAEP2048 } from '@/utils/security';
import CryptoJS from 'crypto-js';
import { ElMessage } from 'element-plus';
import { inject, ref, watch } from 'vue'
const username = ref("")
const password = ref("")
const nickname = ref("")
const serverIP = ref("10.0.0.109")
const serverPort = ref("4567")
const statePool = inject('statePool')
const myInfomation = inject("myInfomation")
var security = null
var websocket = null
const onSubmit = () => {
  statePool.serverIP = serverIP
  statePool.serverPort = serverPort
  security = new RSAOAEP2048()
  websocket = new WebSocket("ws://" + statePool.serverIP + ":" + statePool.serverPort)
  myInfomation.security = security
  myInfomation.websocket = websocket
  websocket.onopen = () => {
    ElMessage({
      message: 'Connected to server, start login.',
      type: 'success',
    })
    let loginInfo = protocal.login()
    loginInfo.username = username.value
    loginInfo.nickname = nickname.value
    loginInfo.password = CryptoJS.MD5(password.value).toString()
    websocket.send(JSON.stringify(loginInfo))
  }
  websocket.onclose = () => {
    statePool.state = 0
  }
  websocket.onmessage = (event) => {
    let message = JSON.parse(event.data)
    if (message.tag == "loginSuccess") {
      myInfomation.nickname = message.nickname
      myInfomation.jid = message.jid
      statePool.state = 2
    }
    if (message.tag == "loginFailed") {
      ElMessage({
        message: 'Login failed, check address port username password.',
        type: 'warning',
      })
    }
  }
}
const onSign = () => {
  statePool.serverIP = serverIP
  statePool.serverPort = serverPort
  security = new RSAOAEP2048()
  websocket = new WebSocket("ws://" + statePool.serverIP + ":" + statePool.serverPort)
  myInfomation.security = security
  myInfomation.websocket = websocket
  websocket.onopen = () => {
    ElMessage({
      message: 'Connected to server, start signup.',
      type: 'success',
    })
    let loginInfo = protocal.signup()
    loginInfo.username = username.value
    loginInfo.password = CryptoJS.MD5(password.value).toString()
    websocket.send(JSON.stringify(loginInfo))
  }
  websocket.onmessage = (event) => {
    let message = JSON.parse(event.data)
    console.log(message)
    if (message.tag == "signupSuccess") {
      ElMessage({
        message: 'Signup success.',
      })
    }
    else {
      ElMessage({
        message: 'Signup failed, check address port username password.',
        type: 'warning',
      })
    }
  }

}
const heart = ref("")

watch(() => statePool.state,
  (state) => {
    if (state == 2) {
      statePool.isLogin = true
      heart.value = setInterval(() => {
        websocket.send(JSON.stringify(protocal.check()))
      }, 5000);
      websocket.onmessage = (event) => {
        let message = JSON.parse(event.data)
        if (message.tag == "presence") {
          myInfomation.presence = message.presence
        }
        if (message.tag == "message") {
          myInfomation.chatlog.push(message)
        }
      }
    }
    else {
      if (state == 0) {
        ElMessage({
          message: 'Connect closed.',
          type: 'warning',
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