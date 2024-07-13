<template>
  <el-row :gutter="24">
    <el-col :span="6">
      <ul class="user-list" :style="userListHeight()">
        <PublicRoom
          :nickname="publicRoom.nickname"
          :jid="publicRoom.jid"
          :ip="publicRoom.ip"
          :status="publicRoom.status"
        ></PublicRoom>
        <UserList :user-list="myInfo.presence"></UserList>
      </ul>
    </el-col>
    <el-col :span="18">
      <ChatDiagram :style="userListHeight()"></ChatDiagram>
    </el-col>
  </el-row>
</template>

<script setup>
import UserList from '@/components/UserList.vue'
import PublicRoom from '@/components/PublicRoom.vue'
import ChatDiagram from '@/components/ChatDiagram.vue'
import { inject, ref } from 'vue'

const pageHeight = ref(document.documentElement.clientHeight)
const userListHeight = () => {
  return 'height: ' + pageHeight.value * 0.81 + 'px'
}

const publicRoom = {
  nickname: 'PublicRoom',
  jid: 'public',
  status: '',
  ip: ''
}
const myInfo = inject('myInfomation')
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
