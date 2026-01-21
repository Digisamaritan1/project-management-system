<template>

    <Teleport to="#my-image-slider" v-if="showPreviewer && isImageWrapperAvailable">

        <div class="slider_controller" :style="containerStyle">
            <template v-if="Object.keys(previewImage?.item || {}).length">
                <!-- ARROWS -->
                <button class="left arrow-container button-style" :class="{'hide_handles': hideHandles}" v-if="previewImage.index !== 0" @click="selectPrevious()">
                    <img src="@/assets/images/png/arrow.png" alt="left_arrow" class="left_arrow">
                </button>
                <button class="right arrow-container button-style" :class="{'hide_handles': hideHandles}" v-if="previewImage.index !== (items.length - 1)" @click="selectNext()">
                    <img src="@/assets/images/png/arrow.png" alt="right_arrow" class="right_arrow">
                </button>
                <ImagePreview
                    :image="previewImage.item"
                    @close="closeSlider()"
                    @mousedown="manageHandles(true)"
                    @mouseup="manageHandles(false)"
                    :downloadFun="downloadFun"

                    @touchstart="manageHandles(true)"
                    @touchend="manageHandles(false)"
                />
            </template>
            <div
                class="images_container scroll-smooth"
                :class="{'hide_handles': hideHandles}"
                id="CONTAINER"
                ref="containerRef"
                @mousedown="mouseDown"
                @mouseleave="mouseLeave"
                @mouseup="mouseUp"
                @mousemove="mouseMove"

                v-if="items.length > 1"
            >
                <img src="@/assets/images/png/arrow.png" alt="" class="arrow_image">
                <div class="filler-div"></div>

                <!-- IMAGES -->
                <template
                    v-for="(item, index) in (items)"
                    :key="item?.key || index"
                >
                <ImageItem
                        :image="item"
                        :selected="previewImage?.index === index"
                        :index="index"
                        @click="selectImage(item?.key, index)"
                    />
                </template>

                <div ref="loadMoreTrigger" class="load-trigger"></div>
                <div class="filler-div"></div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { defineComponent, defineProps, onBeforeUnmount, onMounted, ref, defineEmits, computed, provide, watch, nextTick } from "vue";
import { dragScroll, fileImageReplacer, imagesContainerAdjust } from "./hepler";

import ImageItem from "../../atom/ImageItem/ImageItem.vue";
import ImagePreview from "../../atom/ImagePreview/ImagePreview.vue";

const props = defineProps({
    items: {
        type: Array,
        required: true
    },
    defaultImage: {
        type: String,
        required: false
    },
    fileIcons: {
        type: Array,
        required: false
    },
    activeIndex: {
        type: Number,
        required: false
    },
    downloadFun: {
        type: Function,
        required: false
    },
    config: {
        type: Object,
        required: false,
        default: () => ({
            handlesTimer: 3000
        })
    },
    showPreviewer: {
        type: Boolean,
        required: true
    },
    containerStyle: {}
})

const {initSlider, mouseDown, mouseLeave, mouseUp, mouseMove} = dragScroll();
const {checkPosition} = imagesContainerAdjust();
const {setFileImage} = fileImageReplacer()
defineComponent({
    name: "Slider_Component"
})

const compoConfig = ref();
watch(() => props.config, (val) => {
    compoConfig.value = val;
}, {immediate: true})
provide("compoConfig", compoConfig)

const defaultFailImage = computed(() => props.defaultImage);
provide("defaultFailImage", defaultFailImage)
const emit = defineEmits(["close","loadMore"])

const previewImage = ref([]);
const hideHandles = ref(false)
provide("hideHandles", hideHandles)

const containerRef = ref(null);
const loadMoreTrigger = ref(null);
let observer = null;

function setupScrollObserver() {

  nextTick(() => {
    const trigger = document.querySelector('.load-trigger');
    if (!trigger || !(trigger instanceof Element)) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            emit('loadMore');
          }
        });
      },
      {
        root: containerRef.value,
        threshold: 0,
        rootMargin: "500px",
      }
    );
    observer.observe(trigger);
  });
}

// MODAL
function toggleModal(show = true) {
    const modal = document.getElementById("my-preview-dropdown");
    if (!show && modal) {
        modal.remove();
    } else if(show && !modal) {
        setTimeout(() => {
            const element = document.createElement("div");
            element.id = "my-preview-dropdown";
            document.getElementById("app")?.appendChild(element);
        })
    }
}

onMounted(() => {
    if (!document.getElementById("my-image-slider")) {
        const element = document.createElement("div");
        element.id = "my-image-slider";
        document.body.append(element);
    }
    toggleModal(true);

    setTimeout(() => {
        hideHandlesFun();
        const initialIndex = typeof props.activeIndex === "number" ? props.activeIndex : 0;
        previewImage.value = { item: props.items[initialIndex], index: initialIndex };
        startKeyListener();
        setupScrollObserver();

        if (props.fileIcons?.length) {
            setFileImage(props.fileIcons);
        } else {
            setFileImage();
        }
    });
});

watch(() => props.activeIndex, (val) => {
    if (typeof val === "number") {
        selectImage(null, val, true);
    }
});


const isImageWrapperAvailable = computed(() => {
    return typeof document !== "undefined" && document.getElementById("my-image-slider");
});


watch(() => props.showPreviewer, (val) => {
    if (val) {
        if (observer) {
            observer.disconnect();
        }

        nextTick(() => {
            initSlider("CONTAINER");

            selectImage(null, props.activeIndex);
            checkPosition({
                direction: "right",
                containerId: "CONTAINER",
                previewImage
            });

            setupScrollObserver();
        });
    }
},{ deep: true });

onBeforeUnmount(() => {
    toggleModal(false);

    stopKeyListener();
    if (observer) {
        observer.disconnect();
    }
})

function startKeyListener() {
    document.addEventListener('keydown', keyListener)
    if(window.innerWidth >= 768) {
        document.addEventListener('mousemove', movementListener)
    }
}
function stopKeyListener() {
    document.removeEventListener('keydown', keyListener)
    if(window.innerWidth >= 768) {
        document.removeEventListener('mousemove', movementListener)
    }
}
function keyListener(e) {
    hideHandles.value = false;

    if(e.code === "Escape") {
        closeSlider();
    } else if(e.key.includes("Arrow")) {
        // e.preventDefault();
        if(e.key.includes("Right"))
            selectNext()
        else if(e.key.includes("Left"))
            selectPrevious()
    }
}
function movementListener() {
    // hide handles if no movement for 3 seconds
    if(hideHandles.value) {
        hideHandles.value = false;
    }
    hideHandlesFun();
}

const hideHandlesFun = debounce(() => {
    if(window.innerWidth <= 768) return;

    setTimeout(() => {
        hideHandles.value = false;
    }, (compoConfig.value.handlesTimer-1000))
}, 1000)


function debounce(func, timeout) {
    let timer;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(func, timeout);
    }
}

function manageHandles(value) {
    hideHandles.value = value;
}

function selectNext() {
    if(previewImage.value.index < props.items?.length - 1) {
        const newIndex = previewImage.value.index + 1;
        const nextItem = props.items[newIndex]
        previewImage.value = {
            item: nextItem,
            index: newIndex
        }

        checkPosition({
            direction:"right",
            containerId: "CONTAINER",
            previewImage,
        })
    }
}
function selectPrevious() {
    if(previewImage.value.index > 0) {
        const prevIndex = previewImage.value.index - 1;
        const prevItem = props.items[prevIndex]
        previewImage.value = {
            item: prevItem,
            index: prevIndex
        }

        checkPosition({
            direction:"left",
            containerId: "CONTAINER",
            previewImage
        });
    }
}

function closeSlider() {
    emit("close");
}

onBeforeUnmount(() => {
    stopKeyListener();
})

function selectImage(key, index) {
    const dir = index > (previewImage.value.index || 0) ? "right" : "left";
    if(key) {
        const selectedIndex = props.items?.find((x) => x.key === key);

        if(selectedIndex !== -1) {
            previewImage.value = {item: props.items[selectedIndex], index};
        } else {
            previewImage.value = {item: props.items[index], index};
        }
    } else {
        previewImage.value = {item: props.items[index], index};
    }

    checkPosition({
        direction: dir,
        containerId: "CONTAINER",
        previewImage
    });
}
</script>

<style lang="css" scoped>
@import url("./style.css");
.load-trigger {
    width: 20px;
    height: 100%;
    display: inline-block;
    vertical-align: top;
    pointer-events: none;
}
</style>