<template>
    <el-card @click="readMessage" shadow="hover" :class="messageBlink()">
        <template #header>
            <el-text size="large">{{getUserName()}}</el-text>
        </template>
        <el-text>{{getLastMessage()}}</el-text>
    </el-card>
</template>

<script setup>
import { defineProps, ref } from 'vue';

const user = defineProps(
    {
        nickName: String,
        lastMessage: String
    })
const getUserName = ()=>{
    return user.nickName.substring(0,10)
}
const getLastMessage = ()=>{
    return user.lastMessage.substring(0,10)
}
const hasNewMessage = ref(false)
const messageBlink = ()=>{
    return hasNewMessage.value==true?"blinking-green":""
}
const readMessage = ()=>{
    hasNewMessage.value = false
}
</script>

<style scoped>
@keyframes blink {
    0% { background-color: white; }
    50% { background-color: lightgreen; }
    100% { background-color: white; }
  }
  
  .blinking-green {
    animation: blink 1s infinite;
  }
</style>