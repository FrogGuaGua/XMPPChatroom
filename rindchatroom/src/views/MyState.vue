<template>
    <el-descriptions title="Welcome to rind chatroom">
      <el-descriptions-item label="Username">{{myInfomation.userName}}</el-descriptions-item>
      <el-descriptions-item label="LastLogin">{{myInfomation.lastLoginTime}}</el-descriptions-item>
      <el-descriptions-item label="IP">{{myInfomation.myIPaddress}}</el-descriptions-item>
    </el-descriptions>
  </template>
<script setup>
import { inject } from 'vue';

const myInfomation = inject('myInfomation');


</script>