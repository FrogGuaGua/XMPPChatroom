<template>
  <UserCard v-for="(user, index) in userList.userList" :key="index" :nick-name="user.attributes.nickname"
    :status="user.attributes.status" :jid="user.attributes.jid"/>
</template>

<script setup>
import { defineProps } from 'vue';
import UserCard from "@/components/UserCard.vue";
const userList = defineProps({
  userList: {
    type: Array,
    required: true
  }
});
console.log(userList.userList)
</script>