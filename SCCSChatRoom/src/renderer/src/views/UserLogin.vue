<template>
  <div class="login">
    <LoginDiagram> </LoginDiagram>
  </div>
</template>

<script>
import LoginDiagram from '@/components/LoginDiagram.vue'
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
