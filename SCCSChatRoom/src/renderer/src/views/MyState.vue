<template>
  <el-descriptions title="Welcome to SCCS chatroom">
    <el-descriptions-item label="Nickname">{{ myInfomation.nickname }}</el-descriptions-item>
    <el-descriptions-item label="Jid">{{ myInfomation.jid }}</el-descriptions-item>
    <el-descriptions-item label="IP">{{ myInfomation.ip }}</el-descriptions-item>
  </el-descriptions>
</template>
<script setup>
import { inject } from 'vue'
// Display user info
const myInfomation = inject('myInfomation')
</script>
