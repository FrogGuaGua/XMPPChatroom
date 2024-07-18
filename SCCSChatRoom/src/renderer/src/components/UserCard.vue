<template>
    <el-card @click="readMessage" shadow="hover" :class="messageBlink()">
        <div style="display: flex; justify-content: space-between;">
            <el-text size="large">{{ user.nickname }}</el-text>
            <el-text type="info">{{ user.jid }}</el-text>
        </div>
    </el-card>
</template>

<script setup>

import { defineProps, inject, ref } from 'vue';

const user = defineProps(
    {
        nickname: String,
        jid: String,
    })
const hasNewMessage = ref(false)
const messageBlink = () => {
    return hasNewMessage.value == true ? "blinking-green" : ""
}
const statePool = inject("statePool")
const readMessage = () => {
    hasNewMessage.value = false
    statePool.currentPage = { nickname: user.nickname, jid: user.jid, status: user.status, ip: user.ip }
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

.jid-container {
    padding: 4px;
    margin: 0;
}
</style>