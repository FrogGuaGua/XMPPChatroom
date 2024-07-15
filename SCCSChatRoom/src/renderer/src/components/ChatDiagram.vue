<template>
    <el-card body-class="chat-message-box">
        <template #header>
            <div style="text-align: center;">
                <el-text size="large" style="font-size: 30px;">{{ statePool.currentPage.nickname }}</el-text>
                <el-text type="info">{{ statePool.currentPage.jid }}</el-text>
            </div>
        </template>
        <ChatContent></ChatContent>
        <template #footer>
            <el-row :gutter="24">
                <el-col :span="20">
                    <el-input v-model="userInput"></el-input>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" @click="onSend()">Send</el-button>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" @click="onSendFile()">
                        <input ref="fileInputer" type="file" @change="selectFile"
                            style="opacity: 0; width: 100%; height: 100%; position: absolute;pointer-events: none;">
                        <el-icon>
                            <Upload />
                        </el-icon>
                    </el-button>
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
import { md, pki } from "node-forge";
import { ElMessage } from 'element-plus'
const myInfomation = inject('myInfomation');
const statePool = inject('statePool')
const userInput = ref("")
const fileInputer = ref()
const onSend = () => {
    if (userInput.value == "") {
        return
    }
    let info = protocal.message()
    info.from = myInfomation.jid
    info.to = statePool.currentPage.jid
    info.type = "info"
    info.info = userInput.value
    if (info.to != "public") {
        let publickey = null
        myInfomation.presence.forEach(user => {
            if (user.jid == statePool.currentPage.jid) {
                publickey = user.publickey
            }
        });
        if (!publickey) {
            return
        } else {
            publickey = pki.publicKeyFromPem(publickey)
        }
        info.info = btoa(publickey.encrypt(info.info, 'RSA-OAEP', {
            md: md.sha256.create(),
            mgf1: {
                md: md.sha1.create()
            }
        }))
    }
    myInfomation.websocket.send(JSON.stringify(info))
    userInput.value = ""
}
const onSendFile = () => {
    fileInputer.value.dispatchEvent(new PointerEvent("click"))
}
const selectFile = async (event) => {
    if(statePool.currentPage.jid == 'public'){
        ElMessage.error({
                message: 'Sharing to public is not allowed.',
            })
        return
    }
    let file = event.target.files[0].path
    let info = protocal.message()
    let port = await window.api.startP2P(file)
    info.from = myInfomation.jid
    info.to = statePool.currentPage.jid
    info.type = "file"
    info.info = `ws://${myInfomation.ip}:${port}`
    if (info.to != "public") {
        let publickey = null
        myInfomation.presence.forEach(user => {
            if (user.jid == statePool.currentPage.jid) {
                publickey = user.publickey
            }
        });
        if (!publickey) {
            return
        } else {
            publickey = pki.publicKeyFromPem(publickey)
        }
        info.info = btoa(publickey.encrypt(info.info, 'RSA-OAEP', {
            md: md.sha256.create(),
            mgf1: {
                md: md.sha1.create()
            }
        }))
    }
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