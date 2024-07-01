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
        <el-input v-model="username" style="width: 240px" placeholder="Your username" />
      </div>
    </el-col>
    <el-col :span="24">
      <div class="grid-content">
        <el-icon>
          <Lock />
        </el-icon>
        <el-input v-model="passwd" style="width: 240px" placeholder="Your password" type="password" />
      </div>
    </el-col>
    <el-col>
      <el-button type="primary" @click="onSubmit()">submit</el-button>
      <!-- <el-button type="primary" @click="onSign">Sign up</el-button> -->
    </el-col>
    <el-col>
      <h4>NameHere</h4>
    </el-col>
  </el-row>
</template>

<script setup>
import { inject, ref } from 'vue'
import { XMPPState } from '@/xmpp/xmpp.js'
import { ElMessage } from 'element-plus';
const username = ref("")
const passwd = ref("")
const myXMPP = inject('myXMPP')
const statePool = inject('statePool')
const myInfomation = inject("myInfomation")
let parser = new DOMParser()
let xml = parser.parseFromString("", 'application/xml');
let loginXML = xml.createElement('login')
loginXML.setAttribute('username', username.value)
loginXML.setAttribute('password', passwd.value)
const onSubmit = () => {
  myXMPP.socket.onmessage = (event) => {
    let xmlReader = new DOMParser()
    let currentData = atob(event.data)
    let xml = xmlReader.parseFromString(myXMPP.decrypt(currentData), "application/xml")
    let tag = xml.querySelector('update')
    if (tag) {
      myInfomation.nickName = tag.getAttribute('nickname')
      myInfomation.lastLoginTime = tag.getAttribute('lasttime')
      myInfomation.jid = tag.getAttribute('jid')
      statePool.isLogin = true
      myXMPP.stage = XMPPState.chatting
      ElMessage({
        message: 'Congrats, login success.',
        type: 'success',
      })
    }
    else {
      myXMPP.stage = XMPPState.loggin
      ElMessage.error('Oops, your username or password was wrong.')
    }
  }
  myXMPP.secureSendXML(loginXML)
}



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