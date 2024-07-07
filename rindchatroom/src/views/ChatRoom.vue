<template>
  <el-row :gutter="24">
    <el-col :span="6">
      <ul class="user-list" :style="userListHeight()">
        <PublicRoom :nick-name="publicRoom.nickname" :jid="publicRoom.jid" :status="publicRoom.status"></PublicRoom>
        <UserList :user-list="users"></UserList>
      </ul>
    </el-col>
    <el-col :span="18">
      <ChatDiagram :style="userListHeight()"></ChatDiagram>
    </el-col>
  </el-row>
</template>


<script setup>
import UserList from "@/components/UserList.vue";
import PublicRoom from "@/components/PublicRoom.vue";
import ChatDiagram from "@/components/ChatDiagram.vue"
import { ref } from "vue";
import { Parser } from "xml2js";
// const myXMPP = inject('myXMPP')
const pageHeight = ref(document.documentElement.clientHeight)
const userListHeight = () => {
  return "height: " + pageHeight.value * 0.85 + "px"
}

const publicRoom = {
  nickname: "PublicRoom",
  jid: "public",
  status: "asdasd"
}

var presenceXML = `
<presence>
  <client jid="rd@s1" nickname="rind2" publickey="" ip="" status="online"></client>
  <client jid="3" nickname="sam" publickey="" ip="" status="offline"></client>
  <client jid="2" nickname="alex" publickey="" ip="" status="online"></client>
  <client jid="r1d@s1" nickname="rind2" publickey="" ip="" status="online"></client>
  <client jid="32" nickname="sam" publickey="" ip="" status="offline"></client>
  <client jid="22" nickname="alex" publickey="" ip="" status="online"></client>
</presence>`;
const parser = new Parser({
  attrkey: 'attributes',
  explicitArray: false
});
const users = ref("")
parser.parseString(presenceXML, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  users.value = result.presence.client
})
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

.user-list .user-list-item+.user-item {
  margin-top: 10px;
}
</style>