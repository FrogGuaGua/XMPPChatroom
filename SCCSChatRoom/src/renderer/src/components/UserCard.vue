<template>
    <el-card @click="readMessage" shadow="hover">
        <div style="display: flex; justify-content: space-between;">
            <el-text size="large">{{ user.nickname }}</el-text>
            <el-text type="info">{{ user.jid }}</el-text>
        </div>
    </el-card>
</template>

<script setup>
// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen
import { defineProps, inject, ref } from 'vue';

const user = defineProps(
    {
        nickname: String,
        jid: String,
    })
// process change the tab
const statePool = inject("statePool")
const readMessage = () => {
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


.jid-container {
    padding: 4px;
    margin: 0;
}
</style>