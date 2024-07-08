<template>
    <div :style="userListHeight()" class="user-contect">
        <ChatMessage v-for="(value, index) in getCurrentChat()" :key="index" :from="value.from" :to="value.to"
            :info="value.info" :time="value.time">
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
const getCurrentChat = () =>{
    let currentChat = myInfomation.chatlog.filter(m => {
        return m.from === statePool.currentPage.jid || m.to === statePool.currentPage.jid
    })
    return currentChat
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