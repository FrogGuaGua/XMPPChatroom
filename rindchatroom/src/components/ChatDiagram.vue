<template>
    <el-card body-class="chat-message-box">
        <template #header>
            <div style="text-align: center;">
                <el-text size="large"  style="font-size: 30px;">{{ statePool.currentPage.nickname }}</el-text>
                <el-text type="info">{{ statePool.currentPage.jid }}</el-text>
            </div>
        </template>
        <ChatContent></ChatContent>
        <template #footer>
            <el-row :gutter="24">
                <el-col :span="22">
                    <el-input v-model="userInput"></el-input>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" @click="onSend()">Send</el-button>
                </el-col>
            </el-row>
        </template>
    </el-card>
</template>

<script setup>
import { ref } from 'vue';
import { inject } from 'vue';
import ChatContent from "@/components/ChatContent.vue"
import { protocal } from '@/utils/protocol';

const myInfomation = inject('myInfomation');
const statePool = inject('statePool')
const userInput = ref("")
const onSend = () => {
    let info = protocal.message()
    info.from = myInfomation.jid
    info.to = statePool.currentPage.jid
    info.type = "info"
    info.info = userInput.value
    myInfomation.websocket.send(JSON.stringify(info))
    userInput.value = ""
}


</script>

<style scoped>
.el-button {
    height: 100%;
}

.chat-message-box {
    height: 70%
}
</style>