<template>
  <div class="login">
    <LoginDiagram> </LoginDiagram>
  </div>
</template>

<script>
// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen
import LoginDiagram from '@/components/LoginDiagram.vue'
// only prop the data
export default {
  name: 'UserLogin',
  components: {
    LoginDiagram
  }
}
</script>

<style>
.login {
  box-shadow: var(--el-box-shadow-dark);
  text-align: center;
}
</style>
