<template>
    <div ref="scrollContainer" class="scroll-container style-scroll" @scroll="handleScroll">
        <!-- Spacer for items above the viewport -->
        <div :style="{ height: `${spacerTop}px` }"></div>

        <!-- Render visible items -->
        <div
            v-for="(item) in visibleItems"
            :key="item._id"
            :id="item._id"
            :data-active-id="item._id"
        >
            <slot :item="item"/>
        </div>

        <!-- Spacer for items below the viewport -->
        <div :style="{ height: `${spacerBottom}px` }"></div>

        <button v-if="showJump" @click="jumpToActive()" class="btn jumpBtn">
            <img :src="downArrow" alt="downArrow" :class="`${startIndex > ACTIVE_INDEX ? 'rotate-down' : ''}`">
            <span class="text-ellipsis font-size-13 font-weight-400 gray">View Active</span>
        </button>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";

const downArrow = require("@/assets/images/table_arrow.png");

// Props
const props = defineProps({
    items: {
        type: Array,
        required: true,
    },
    activeId: {
        type: [String, Number],
        required: true,
    },
    JumpToActiveInitial: {
        type: Boolean,
        default: false,
    }
});

// Default heights
const DEFAULT_ITEM_HEIGHT = 42; // Regular item height
const ACTIVE_ITEM_HEIGHT = ref(80);
const ACTIVE_INDEX = computed(() => props.items.findIndex((item) => item._id === props.activeId));
const observer = ref(null);
const showJump = ref(false);

// Refs and state
const scrollContainer = ref(null);
const startIndex = ref(0);
const visibleItemsCount = 30; // Number of items to show in the viewport
const itemHeights = ref({}); // Cache for item heights

// Compute visible items
const visibleItems = computed(() => {
    return props.items.slice(startIndex.value, startIndex.value + visibleItemsCount);
});

// Compute spacer heights
const spacerTop = computed(() => {
    return props.items
        .slice(0, startIndex.value)
        .reduce(
            (sum, item) =>
                sum +
                (item._id === props.activeId
                    ? ACTIVE_ITEM_HEIGHT.value
                    : (itemHeights.value[item._id] || DEFAULT_ITEM_HEIGHT)),
            0
        );
});

const spacerBottom = computed(() => {
    return props.items
        .slice(startIndex.value + visibleItemsCount)
        .reduce(
            (sum, item) =>
                sum +
                (item._id === props.activeId
                    ? ACTIVE_ITEM_HEIGHT.value
                    : (itemHeights.value[item._id] || DEFAULT_ITEM_HEIGHT)),
            0
        );
});

// Helper to get item height
const itemHeight = (id) =>
    id === props.activeId ? ACTIVE_ITEM_HEIGHT.value : (itemHeights.value[id] || DEFAULT_ITEM_HEIGHT);

// Handle scroll
const handleScroll = () => {
    if (!scrollContainer.value) return;
    const scrollTop = scrollContainer.value.scrollTop;
    const scrollThreshold = 5;
    let accumulatedHeight = 0;
    let newStartIndex = 0;

    // Find the start index within a buffer range
    for (let i = 0; i < props.items.length; i++) {
        const height = itemHeight(props.items[i]._id);
        if (accumulatedHeight + height > scrollTop - scrollThreshold) {
            newStartIndex = i;
            break;
        }
        accumulatedHeight += height;
    }

    if (Math.abs(startIndex.value - newStartIndex) > 1) {
        startIndex.value = newStartIndex;
    }

    // IF ACTIVE ELEMENT IS IN VISIBLE ITEMS THEN OBSERVE IT ELSE DETACH OBSERVER
    if (
        startIndex.value <= ACTIVE_INDEX.value &&
        ACTIVE_INDEX.value < startIndex.value + visibleItemsCount
    ) {
        observeActiveElement(props.activeId);
    } else {
        observer.value.disconnect();
        showJump.value = true;
    }
};

// Watch for changes in items or activeId
watch(
    [() => props.items, () => props.activeId],
    () => {
        // Recompute start index if necessary
        reCaclulate();
    },
    { immediate: true }
);

function reCaclulate() {
    getActiveItemHeight();
    handleScroll();
    observeActiveElement(props.activeId); // Observe the new active element
}

function getActiveItemHeight() {
    setTimeout(() => {
        const ele = document.querySelector(`[data-active-id="${props.activeId}"]`);
        if (ele) {
            ACTIVE_ITEM_HEIGHT.value = ele.clientHeight + 12;
            itemHeights.value[props.activeId] = ACTIVE_ITEM_HEIGHT.value;
        }
    });
}

// FIND THE ACTIVE ELEMENT OFFSET FROM ALL ITEMS AND THEN JUMPS THE ACTIVE
function jumpToActive() {
    const activeIndex = props.items.findIndex((item) => item._id === props.activeId);
    const activeItemOffset = props.items
        .slice(0, activeIndex)
        .reduce(
            (sum, item) =>
                sum +
                (item._id === props.activeId
                    ? ACTIVE_ITEM_HEIGHT.value
                    : (itemHeights.value[item._id] || DEFAULT_ITEM_HEIGHT)),
            0
        );

    scrollContainer.value?.scrollTo({
        top: activeItemOffset,
        behavior: "smooth",
    });
}

// Initialize the Intersection Observer
function observeActiveElement(id) {
  if (!observer.value || !scrollContainer.value) return;

  // Find the active item
  const activeElement = document.querySelector(`[data-active-id="${id}"]`);

  if (activeElement) {
    observer.value.unobserve(activeElement);
    observer.value.observe(activeElement);
  }
}

// Intersection Observer callback
const handleIntersection = (entries) => {
    const entry = entries[0];
    if (entry.target.dataset.activeId === String(props.activeId) && !entry.isIntersecting) {
        showJump.value = true;
    } else {
        showJump.value = false;
    }
};

// Ensure container's height is set
onMounted(() => {
    observer.value = new IntersectionObserver(handleIntersection, {
        root: scrollContainer.value,
        rootMargin: "0px",
        threshold: 0.1, // Trigger when 10% of the active element is visible
    });
    observeActiveElement(props.activeId);

    getActiveItemHeight();

    if (props.JumpToActiveInitial) {
        setTimeout(() => {
            jumpToActive();
        })
    }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});

defineExpose({
    jumpToActive,
    reCaclulate
});
</script>

<style>
.scroll-container {
    overflow-y: auto;
}
.jumpBtn {
    position: absolute;
    box-shadow: 5px 5px 10px #ccc;
    background: #F4F5F7;
    color: white;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0px;
    border: 1px solid #CECECE;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    cursor: pointer;
    padding: 6px 10px;
    transition: all 0.3s ease;
    margin: 0!important;
}

.jumpBtn .rotate-down {
    transform: rotateZ(270deg)
}
.jumpBtn img {
    transform: rotateZ(90deg)
}

.jumpBtn span {
    width: 0px;
    height: 0;
    transition: height 0.1s ease, width 0.4s ease;
    overflow: hidden;
    margin-left: 0px;
    line-height: 1;
}
.jumpBtn:hover span {
    width: 70px;
    height: 13px;
    margin-left: 5px;
}

.style-scroll::-webkit-scrollbar {
    display: none;
}
</style>
