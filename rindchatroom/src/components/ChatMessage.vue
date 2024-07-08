<template>
    <el-row :gutter="24">
        <el-col :span="6">
            <el-icon><User /></el-icon>
            <el-text size="large" >{{"  "+prop.from + " :"}}</el-text>
        </el-col>
        <el-col :span="18">
            <el-text size="small" type="info">{{prop.time}}</el-text>
        </el-col>
        <el-col :span="24">
            <el-button size="large"  round>
            <el-text >{{prop.info}}</el-text>
        </el-button>
        </el-col>
    </el-row>
</template>
<script setup>
import { defineProps, } from 'vue';
const prop = defineProps({
    from: String,
    to: String,
    info:String,
    time: String
})


</script>