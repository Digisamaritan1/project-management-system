<template>
    <tr>
        <td>
            <div class="d-flex align-items-center">
                <Skelaton class="border-radius-5-px skelaton__option m-5px" :style="{ height: '30px', width: '120px' }" />
            </div>
        </td>
        <td>
            <div class="d-flex flex-column">
                <Skelaton class="border-radius-5-px skelaton__option m-5px" :style="{ height: '30px', width: '120px' }" />
            </div>
        </td>
        <td>
            <div class="d-flex align-items-center justify-content-evenly">
                <Skelaton class="border-radius-5-px skelaton__option m-5px" :style="{ height: '30px', width: '120px' }" />
            </div>
        </td>
        <td>
            <div class="d-flex align-items-center">
                <Skelaton class="border-radius-5-px skelaton__option m-5px" :style="{ height: '30px', width: '150px', margin: '0 auto' }" />
            </div>
        </td>
        <td>
            <div class="d-flex align-items-center justify-content-between">
                <div class="discription_project d-flex align-items-center justify-content-between">
                    <Skelaton class="border-radius-5-px skelaton__option m-5px" :style="{ height: '30px', width: '280px' }" />
                </div>
            </div>
        </td>
        <td class="editdelete">
            <span class="d-flex justify-content-between align-items-center">
                <Skelaton class="border-radius-5-px skelaton__option m-5px" :style="{ height: '30px', width: '100px' }" />
            </span>
        </td>
    </tr>
</template>

<script setup>
    import Skelaton from '../Skelaton/Skelaton.vue';
</script>

<style scoped>
.edit__icon-image{
    height: 18px !important;
}
.task-timelog-taskkey{
    padding-left: 11px;
}
.task-timelog-taskkey::after {
    background-color: #000000;
    content: "";
    display: inline-block;
    font-size: 18px;
    opacity: 0.5;
    width: 1px;
    height: 12px;
    margin-right: 8px;
    margin-left: 8px;
}
.task-name-time-log{
    text-align: left;
    max-width: 115px;
}
.sub-task-name-timelog {
    max-width: 72px;
}
</style>