<template>
    <div :style="userListHeight()" class="user-contect">
        <ChatMessage v-for="(value, index) in getCurrentChat()" :key="index" :tag="value.tag" :from="value.from" :to="value.to"
            :info="value.info" :time="value.time" :filename="value.filename">
        </ChatMessage>
    </div>
</template>
<script setup>
import { inject, ref } from 'vue';
import ChatMessage from "@/components/ChatMessage.vue"

const pageHeight = ref(document.documentElement.clientHeight)
const userListHeight = () => {
    return "height: " + pageHeight.value * 0.51 + "px"
}
const myInfomation = inject("myInfomation")
const statePool = inject("statePool")
const getCurrentChat = () => {
    if (statePool.currentPage.jid == "public") {
        let currentChat = myInfomation.chatlog.filter(messages => {
            return messages.to === statePool.currentPage.jid
        })
        return currentChat
    }
    if (statePool.currentPage.jid == myInfomation.jid) {
        let currentChat = myInfomation.chatlog.filter(messages => {
            return messages.to === myInfomation.jid && messages.from === myInfomation.jid
        })
        return currentChat
    }
    else {
        let currentChat = myInfomation.chatlog.filter(messages => {
            return messages.from === statePool.currentPage.jid || messages.to === statePool.currentPage.jid
        })
        return currentChat
    }
}

</script>
<style scoped>
.user-contect {
    padding: 0;
    margin: 0;
    list-style: none;
    overflow: auto;
}
</style>