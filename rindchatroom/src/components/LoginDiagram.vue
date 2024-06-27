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
      <el-button type="primary" @click="onSign">Sign up</el-button>
    </el-col>
    <el-col>
      <h4>NameHere</h4>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, inject } from 'vue'

const username = ref()
const passwd = ref()
const statePool = inject('statePool');
const onSubmit = ()=>{
  statePool.isLogin = true;
}
const onSign = ()=>{
  
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