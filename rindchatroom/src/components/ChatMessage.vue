<template>
    <div>
        <el-button type="primary">Primary</el-button>
        <el-button type="primary">Primary</el-button>
    </div>
</template>
<script setup>
const prop = defineProps({
    from: String,
    to: String,
    type:String,
    data: String
})
</script>