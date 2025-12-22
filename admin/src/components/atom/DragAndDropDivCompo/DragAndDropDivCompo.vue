<template>
    <div class="main-drag-contain">
        <div class="drag-text" :class="{'drag-active-image' : show , 'drag-active-image-show': dragShow}">
            <p><span>Click to Replace</span> or Drag and Drop</p>
            <span>SVG, PNG, JPG</span>
        </div>
        <div
            @dragover.prevent="handleDragOver" 
            @drop.prevent="handleDrop" 
            @dragleave.prevent="handleDragLeave"
            class="upload-body-dragged font-weight-500 cursor-pointer"
            @click="!handleClick ? $refs[dyId].click() : ''"
        >
            <!-- @click="!handleClick ? $refs[dyId].click() : $emit('click', $event)" -->
            <input type="file" @change="selectionUpload" :ref="dyId" class="d-none" :multiple="multiSelect">
        </div>
    </div>
</template>

<script setup>
    import { useCustomComposable } from '@/composable';
    import { ref, defineProps, onMounted } from 'vue';
    import { useToast } from "vue-toast-notification";

    const props = defineProps({
        extensions: {
            type: Array,
            default: () => []
        },
        multiSelect: {
            type: Boolean,
            default: false
        },
        show: {
            type: Boolean,
            default: false
        },
        handleClick: {
            type: Boolean,
            default: true
        }
    });

    // eslint-disable-next-line
    const extensions = ref("");
    const dragShow = ref(props.show);
    const $toast = useToast();
    extensions.value = props.extensions.map(exe => exe.name).join();
    const statusOfDragAndDrop = ref({over: false, dropped: false,notDrop:false},)
    const emit =  defineEmits(["handleDrop","dragOver","dragLeave"]);
    const {makeUniqueId} = useCustomComposable();

    const dyId = ref("");

    onMounted(() => {
        dyId.value = makeUniqueId(6);
    })

    function selectionUpload(e) {
        const files = Array.from(e.target.files);
        e.target.value = null;
        checkFile(files);
    }

    function checkFile(files = []) {
        let arr = [];
        props.extensions.forEach((v) =>
            arr.push(v.name?.replaceAll(" ", "_").toLowerCase())
        );
        let isErrorInUpload = false;

        if(!props.multiSelect && files.length > 1) {
            return $toast.error("Multiple files not allowed.", {position: 'top-right'});
        }

        files = files.filter((x) => x);
        files.forEach((file) => {
            if(file == null) {
                isErrorInUpload = true;
                $toast.error("Please select valid file.",{position: 'top-right'});
                return;
            }
            let fileName = file.name;
            var ele = fileName.substring(fileName.lastIndexOf(".") + 1);

            const isExists = arr.includes("." + ele.toLowerCase());
            if (!isExists) {
                isErrorInUpload = true;
                if(props.extensions.length > 1) {
                    $toast.error(`Please select valid file. Only ${arr} files are allowed.`,{position: 'top-right'});
                } else {
                    $toast.error("You have to add extension in setting.",{position: 'top-right'});
                }
                return;
            }
        });
        if(!isErrorInUpload) {
            emit("handleDrop", files);
        }
    }

    //after drag and drop file upload function called
    const handleDrop = (event) => {
        emit("dragLeave",false);
        event.preventDefault();
        statusOfDragAndDrop.value.dropped = true;
        statusOfDragAndDrop.value.over = false;
        let files = [];

        // event.dataTransfer.items.forEach((ele)=>{ files.push(ele.getAsFile())});
        Array.from(event.dataTransfer.items).forEach((ele)=>{ files.push(ele.getAsFile())});
        dragShow.value = false;
        checkFile(files);
    }

    //when files dgrag over the main div for add some css to main div
    const handleDragOver = () => {
        if (!dragShow.value) {
            dragShow.value = true;
        }
        emit("dragOver",true)

        statusOfDragAndDrop.value.over = true;
    }

    //when drag file remove from drag area class disable
    const handleDragLeave = () => {
        statusOfDragAndDrop.value.over = false;
        dragShow.value = false;
        emit("dragLeave",false);
    }    
</script>
<style>
.main-drag-contain {
    height: 185px;
    position: relative;
}

.upload-body-dragged {
    /* background-color: #FFFFFFd6; */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 1px dashed;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9 !important;
    font-size: 18px;
    box-sizing: border-box;
}
.image-contain--wrapper:has(.drag-active-image) .upload-body-dragged {
    border: 1px solid #000;
}
.upload-body-dragged p span {
    color: #253D98;
}
.drag-text {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    /* border-radius: 5px; */
}

.drag-active-image {
    opacity: 0;
}
.image-contain--wrapper:hover:has(.drag-active-image):after, .image-contain--wrapper:has(.drag-active-image-show):after  {
    content: '';
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    top: 0px;
    left: 0px;
    border-radius: 12px;
}

.image-contain--wrapper:hover .drag-text.drag-active-image, .image-contain--wrapper .drag-text.drag-active-image-show {
    opacity: 1;
    z-index: 1;
}

.image-contain--wrapper:hover .drag-text.drag-active-image > *, .image-contain--wrapper .drag-text.drag-active-image-show > * {
    color: #fff!important;
}

.image-contain--wrapper:hover .upload-body-dragged p span, .image-contain--wrapper .drag-active-image-show p span {
    color: #fff;
}
</style>
