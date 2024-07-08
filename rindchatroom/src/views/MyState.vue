<template>
    <el-descriptions title="Welcome to rind chatroom">
      <el-descriptions-item label="Username">{{myInfomation.username}}</el-descriptions-item>
      <el-descriptions-item label="Jid">{{myInfomation.jid}}</el-descriptions-item>
      <el-descriptions-item label="ip">{{myInfomation.ip}}</el-descriptions-item>
    </el-descriptions>
  </template>
<script setup>
import { inject } from 'vue';

const myInfomation = inject('myInfomation');


</script>