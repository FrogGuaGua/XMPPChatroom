<template>
  <el-container>
    <el-header>
      <MyState></MyState>
    </el-header>
    <el-main>
      <el-dialog v-model="loginVisible" title="Tips" width="500" align-center :show-close="false"
        :close-on-click-modal="false" :close-on-press-escape="false">
        <UserLogin />
      </el-dialog>
      <ChatRoom>
      </ChatRoom>
    </el-main>
  </el-container>
</template>

<script setup>
import UserLogin from './views/UserLogin.vue'
import ChatRoom from './views/ChatRoom.vue'
import MyState from './views/MyState.vue'
import { ref, watch, provide, reactive } from 'vue';
const statePool = reactive(
  {
    isLogin: false,
  });
const myInfomation = reactive(
  {
    userName:"tester",
    lastLoginTime:"000",
    myIPaddress:"0.0.0.0"
  }
)
const loginVisible = ref(true);
watch(() => statePool.isLogin,
  (isLogin) => {
    loginVisible.value = !isLogin;
  }
)
provide('statePool', statePool)
provide('myInfomation', myInfomation)
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

</style>
