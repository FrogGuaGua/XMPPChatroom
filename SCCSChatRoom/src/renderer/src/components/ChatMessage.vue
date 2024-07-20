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
            <el-button size="large" round @click="download()">
                <el-icon v-if="prop.tag == 'file'">
                    <Folder />
                </el-icon>
                <el-text v-if="prop.tag == 'message'">{{ prop.info }}</el-text>
                <el-text v-if="prop.tag == 'file'">{{ prop.filename }}</el-text>
            </el-button>
        </el-col>
    </el-row>
</template>
<script setup>
import { defineProps, } from 'vue';
// Data from Chat diagram
const prop = defineProps({
    tag: String,
    from: String,
    to: String,
    info: String,
    filename: String,
    time: String,
})
// Implementing for peer to peer download
const download = () => {
    if (prop.tag == 'file') {
        const blob = new Blob([prop.info]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = prop.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }
    else {
        return
    }
}
</script>