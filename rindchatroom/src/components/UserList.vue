<template>
  <UserCard v-for="(user, index) in userList.userList" :key="index" :nickname="user.nickname"
    :status="user.status" :jid="user.jid" :ip="user.ip"/>
</template>

<script setup>
import { defineProps } from 'vue';
import UserCard from "@/components/UserCard.vue";
const userList = defineProps({
  userList: {
    nickname:"",
    jid:"",
    ip:"",
    status:"",
  }
});
</script>