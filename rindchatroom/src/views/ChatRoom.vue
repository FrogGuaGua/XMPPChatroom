<template>
    <el-row :gutter="24">
      <el-col :span="6" >
        <ul class="user-list" :style="userListHeight()">
          <UserList :user-list="users" ></UserList>
        </ul>
      </el-col>
      <el-col :span="18">
        <UserMessage :style="userListHeight()"></UserMessage>
      </el-col>
    </el-row>
</template>


<script setup>
import UserList from "@/components/UserList.vue";
import UserMessage from "@/components/UserMessage.vue"
import { ref } from "vue";
const pageHeight = ref(document.documentElement.clientHeight)
const userListHeight = ()=>{
  return "height: "+ pageHeight.value*0.85+"px"
}
// Define the user list
const users = ([
  { nickName: 'User1', lastMessage: 'Hello' },
  { nickName: 'User2', lastMessage: 'Hi there' },
  { nickName: 'User2', lastMessage: 'Hi there' },
  { nickName: 'User2', lastMessage: 'Hi there' },
  { nickName: 'User1', lastMessage: 'Hello' },
  { nickName: 'User2', lastMessage: 'Hi there' },
  { nickName: 'User2', lastMessage: 'Hi there' },
  { nickName: 'User2', lastMessage: 'Hi there' },
  { nickName: 'User2', lastMessage: 'Hi there' },
  { nickName: 'User2', lastMessage: 'Hi there' },
  { nickName: 'User2', lastMessage: 'Hi there' },
  { nickName: 'User2', lastMessage: 'Hi there' },
  { nickName: 'User2', lastMessage: 'Hi there' },
  { nickName: 'User2', lastMessage: 'Hi there' },
]);
</script>

<style>
.user-list {
  padding: 0;
  margin: 0;
  list-style: none;
  overflow: auto;
}
.user-list .user-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: var(--el-color-primary-light-9);
  margin: 10px;
  color: var(--el-color-primary);
}
.user-list .user-list-item + .user-item {
  margin-top: 10px;
}
</style>