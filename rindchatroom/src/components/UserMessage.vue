<template>
    <el-card body-class="chat-content-box">
        <template #header>
            <el-text>{{nickName }}</el-text>
        </template>
        <div>

        </div>
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


const nickName = ref("")
const userInput = ref("")
const onSend = ()=>
{

}

</script>

<style scoped>
.el-button {
    height: 100%;
}
.chat-content-box{
    height: 70%
}
</style>