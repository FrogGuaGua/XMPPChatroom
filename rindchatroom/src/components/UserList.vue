<template>
  <UserCard 
      v-for="user in userList.userList" 
      :key="user.nickName" 
      :nick-name="user.nickName" 
      :last-message="user.lastMessage" 
    />
</template>

<script setup>
import { defineProps } from 'vue';
import UserCard from "@/components/UserCard.vue";
const userList= defineProps({
  userList: {
    type: Array,
    required: true,
    default: () => ["test","test"]
  }
});
</script>