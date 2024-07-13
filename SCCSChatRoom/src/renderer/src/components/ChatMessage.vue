<template>
    <el-row :gutter="24">
        <el-col :span="6">
            <el-icon>
                <User />
            </el-icon>
            <el-text size="large">{{ " " + prop.from + " :" }}</el-text>
        </el-col>
        <el-col :span="18">
            <el-text size="small" type="info">{{ prop.time }}</el-text>
        </el-col>
        <el-col :span="24">
            <el-button size="large" round @click="p2pDownload()">
                <el-icon v-if="prop.type == 'file'">
                    <Folder />
                </el-icon>
                <el-text>{{ prop.info }}</el-text>
            </el-button>
        </el-col>
    </el-row>
</template>
<script setup>
import { defineProps, } from 'vue';
import { ElMessage } from 'element-plus'
const prop = defineProps({
    from: String,
    to: String,
    info: String,
    time: String,
    type: String
})
const p2pDownload = () => {
    if (prop.type == 'file') {
        console.log(prop.info)
        let socket = new WebSocket(prop.info);
        socket.onmessage = (event) => {
            const blob = new Blob([event.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'rename.safe';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            socket.close();
        }
        socket.onerror = (event) => {
            ElMessage({
                message: 'The url is not aviliable.',
                type: 'warning'
            })
            return
        }
        socket.onopen = (event) => {
            ElMessage({
                message: 'Start downloading.',
            })
            return
        }
        socket.onopen = (event) => {
            ElMessage({
                message: 'Finished or target cancel the link.',
            })
            return
        }
    }
    else {
        return
    }
}





</script>