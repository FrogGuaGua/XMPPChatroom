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
import { ElMessageBox } from 'element-plus'
import { sliceStr } from '../utils/security';
// inject global var
const myInfomation = inject('myInfomation');
const statePool = inject('statePool')
const userInput = ref("")
const fileInputer = ref()
// Code for send message function
const onSend = () => {
    if (userInput.value == "") {
        return
    }
    let info = protocal.message()
    info.from = myInfomation.jid
    info.to = statePool.currentPage.jid
    info.type = "info"
    let slicedInfo = sliceStr(userInput.value, 190)
    if (info.to != "public") {
        let publickey = null
        myInfomation.presence.forEach(user => {
            if (user.jid == statePool.currentPage.jid) {
                publickey = user.publickey
            }
        });
        if (publickey == null || publickey == '') {
            console.log("The user do not have public key.")
            info.info = userInput.value
            myInfomation.websocket.send(JSON.stringify(info))
            myInfomation.chatlog.push(info)
            return
        } else {
            try { publickey = pki.publicKeyFromPem(publickey) }
            catch (e) {
                console.log("error public key stop sending")
                return
            }
        }
        slicedInfo.forEach((str) => {
            info.info += publickey.encrypt(str, 'RSA-OAEP', {
                md: md.sha256.create(),
                mgf1: {
                    md: md.sha1.create()
                }
            })
        })
        info.info = btoa(info.info)
    } else {
        info.info = userInput.value
    }
    myInfomation.websocket.send(JSON.stringify(info))
    if (info.to != "public" && info.to != myInfomation.jid) {
        info.info = userInput.value
        myInfomation.chatlog.push(info)
    }
    userInput.value = ""
}
// Fix bug for click send file
const onSendFile = () => {
    fileInputer.value.dispatchEvent(new PointerEvent("click"))
}
const filereader = new FileReader()
// Code for p2p function
const selectFile = async (event) => {
    // size limitation
    if (event.target.files[0].size >= 10240) {
        ElMessageBox.alert('File size>10 kb is not allowed', 'P2P policy', {
            confirmButtonText: 'OK',
        })
        return
    }
    if (statePool.currentPage.jid == 'public') {
        ElMessageBox.alert('File to public room is not allowed', 'P2P policy', {
            confirmButtonText: 'OK',
        })
        return
    }
    let file = event.target.files[0]
    // load the file
    filereader.onload = (e) => {
        let info = protocal.file()
        info.from = myInfomation.jid
        info.to = statePool.currentPage.jid
        info.filename = file.name
        info.info = new TextDecoder('utf-8').decode(new Uint8Array(e.target.result).buffer);
        if (info.to != "public" && info.to != myInfomation.jid) {
            myInfomation.chatlog.push(info)
        }
        let publickey = null
        myInfomation.presence.forEach(user => {
            if (user.jid == statePool.currentPage.jid) {
                publickey = user.publickey
            }
        });
        if (publickey == null || publickey == '') {
            console.log("The user do not have public key,try to send.")
            myInfomation.websocket.send(JSON.stringify(btoa(info)))
            return
        } else {
            try { publickey = pki.publicKeyFromPem(publickey) }
            catch (e) {
                console.log("error public key stop sending")
                return
            }
        }
        let slicedInfo = sliceStr(info.info, 190)
        let currentByte = ""
        slicedInfo.forEach((str) => {
            currentByte += publickey.encrypt(str, 'RSA-OAEP', {
                md: md.sha256.create(),
                mgf1: {
                    md: md.sha1.create()
                }
            })
        })
        info.info = btoa(currentByte)
        myInfomation.websocket.send(JSON.stringify(info))
        fileInputer.value.value = ""
    }
    filereader.onerror = () => {
        console.log("File transfer finished.")
    }
    filereader.readAsArrayBuffer(file)
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