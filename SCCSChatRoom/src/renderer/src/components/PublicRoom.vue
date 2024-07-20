<template>
    <el-card @click="readMessage" shadow="hover">
        <template #header>
            <div style="display: flex; justify-content: space-between;">
                <el-text size="large">{{ user.nickname }}</el-text>
                <el-text type="info">{{ user.jid }}</el-text>
            </div>
        </template>
        <div class="status-container">
            <el-text>OnlineUser: {{ myInfomation.presence.length }}</el-text>
        </div>
    </el-card>
</template>

<script setup>
// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen
import { defineProps, inject, ref } from 'vue';
// Transfer the data
const user = defineProps(
    {
        nickname: String,
        jid: String,
        status: String,
        ip: String,
    })
// Preocess change tabs
const myInfomation = inject('myInfomation')
const statePool = inject("statePool")
// User click and change the tab
const readMessage = () => {
    statePool.currentPage = { nickname: user.nickname, jid: user.jid, status: user.status, ip: user.ip }
}
statePool.currentPage = { nickname: user.nickname, jid: user.jid, status: user.status, ip: user.ip }
</script>

<style scoped>
.status-container {
    padding: 4px;
    margin: 0;
}
</style>