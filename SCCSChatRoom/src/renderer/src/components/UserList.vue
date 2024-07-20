<template>
  <!-- Iterate over each user object in the userList.userList array, generating multiple UserCard component instances -->
  <UserCard v-for="(user, index) in userList.userList" :key="index" :nickname="user.nickname" :jid="user.jid" />
</template>

<script setup>
// Group 1
// Zhihao Cheng / Shahzeb / Sabrina Afrine Sathi / Zhisong Chen
import { defineProps } from 'vue';
import UserCard from "@/components/UserCard.vue";
// Genertate user card in userlist
const userList = defineProps({
  userList: {
    nickname:"",
    jid:"",
  }
});
</script>