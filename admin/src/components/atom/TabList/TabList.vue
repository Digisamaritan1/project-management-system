<template>

    <div :class="{'shade-blue font-weight-500 font-size-16': active, 'shade-gray font-weight-500 font-size-16' : !active,'pl-20px':item.name !='Subscription Details'}" class="d-flex align-items-center text-nowrap border-top-radius-10-px cursor-pointer tab-list wrapper h-100" @click.stop="$emit('click', item)">
        <div 
            class="d-flex align-items-center font-size-14 view-list position-re"
            >
            <!-- :style="{ height: active ? '48px' : 'auto' }" -->
            <span class="tab-item-span">{{item.name}}</span>
        </div>
    </div>
</template>
<script setup>

defineProps({
    item: {
        type: Object,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    },
    firstChild: {
        type: Boolean,
        default: false
    },
})
</script>
<style scoped>
span.tab-item-span {
    font-family: Roboto;
    font-size: 16px;
    font-weight: 500;
    line-height: 20.72px;
    text-align: left;
}


.tab-list-wrapper .tab-list {
    margin: 0px 30px 10px 0px;
    padding-bottom: 10px;
    padding-left: 0;
    border-bottom: 2px solid #F4F5F7;
}

.tab-list-wrapper .tab-list.shade-blue {
    border-bottom: 2px solid #253D98;
}
@media(max-width:420px){
    .tab-list-wrapper .tab-list {
    margin: 0px 15px 10px 0px;
}
}
</style>