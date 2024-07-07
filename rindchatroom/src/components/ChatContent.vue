<template>
    <div :style="userListHeight()">
        <ChatMessage></ChatMessage>
    </div>
</template>
<script setup>
import { inject,ref, watch } from 'vue';
import { Parser } from 'xml2js';
import ChatMessage from "@/components/ChatMessage.vue"

const pageHeight = ref(document.documentElement.clientHeight)
const userListHeight = () => {
    return "height: " + pageHeight.value * 0.75 + "px"
}
const statePool = inject("statePool")

const parser = new Parser({
    attrkey: 'attributes',
    explicitArray: false
});
const chatttingInfo =ref()
const chatXML = `<message>
    <chat from='C1@S1' to='C1@S2' type='info'  data='kjsets' /> 
    <chat from='C1@S1' to='C1@S2' type='info'  data='12kjsets' /> 
</message>`

watch(() => statePool.currentPage, () => {
    parser.parseString(chatXML, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        chatttingInfo.value = result.message
    })
}
)

</script>