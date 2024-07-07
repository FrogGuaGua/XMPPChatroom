<template>
    <el-card @click="readMessage" shadow="hover" :class="messageBlink()">
        <template #header>
            <div style="display: flex; justify-content: space-between;">
                <el-text size="large">{{ getUserName() }}</el-text>
                <el-text type="info">{{ getJID() }}</el-text>
            </div>
        </template>
        <div class="status-container" >
            <el-text>OnlineUser: {{ getStatus() }}</el-text>
        </div>
    </el-card>
</template>

<script setup>
import { defineProps, ref } from 'vue';

const user = defineProps(
    {
        nickName: String,
        jid: String,
        status: String
    })
const getUserName = () => {
    return user.nickName
}
const getStatus = () => {
    return user.status
}
const getJID = () => {
    return user.jid
}
const hasNewMessage = ref(false)
const messageBlink = () => {
    return hasNewMessage.value == true ? "blinking-green" : ""
}
const readMessage = () => {
    hasNewMessage.value = false
}
</script>

<style scoped>
@keyframes blink {
    0% {
        background-color: white;
    }

    50% {
        background-color: lightgreen;
    }

    100% {
        background-color: white;
    }
}

.blinking-green {
    animation: blink 1s infinite;
}
.status-container {
    padding: 4px; 
    margin: 0;   
  }
</style>