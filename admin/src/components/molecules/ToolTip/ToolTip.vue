<template>
    <div ref="tooltipTrigger"  :id="dyid" @mouseover="handleHover" @mouseleave="handleMouseLeave">
        <span v-if="props.isLabel" class="text-ellipsis label_ellipsis">{{ props.label }}</span>
        <div v-else id="without_label_id" class="without_label text-ellipsis">
            <img class="error_message_image" :src="image || errorImage" />
        </div>
        <teleport to="body">
            <div :id="`dd_${dyid}`" @mouseover="hoverTooltip = true" @mouseleave="handleLeave" :class="{'tooltip_without_label': !props.isLabel, 'tooltip': true}" :style="tooltipStyle" ref="tooltipContent">
                <div v-if="showTooltip && !showFullText" class="tooltip-read-more">
                    <span class="tooltip-text-wrapper">{{ truncatedText }}</span>
                    <span class="blue cursor-pointer" v-if="isTruncated">...<span @click="showTooltip = false,showFullText=true">read more</span></span>
                </div>
                <div v-if="showFullText" class="tooltip-full-text">
                    <div class="tooltip-hover-text style-scroll">
                        <span class="tooltip-text-wrapper">{{fullText}}</span>
                    </div>
                </div>
            </div>
        </teleport>
    </div>
</template>
<script setup>
    import { onMounted, ref, watch, nextTick } from "vue";
    import { useCustomComposable } from "@/composable";

    const {makeUniqueId} = useCustomComposable();
    const errorImage = require("@/assets/images/svg/error_message.svg");
    const props = defineProps({
        image: {
            type: String,
        },
        label:{
            type: String,
            default:''
        },
        descriptions:{
            type: String,
            default:''
        },
        isLabel:{
            type: Boolean,
            default:true
        },
        startFromEndWord: {
            type: Boolean,
            default: false
        }
    });

    // Refs
    const fullText = ref('');
    const truncatedText = ref('');
    const showTooltip = ref(false);
    const isTruncated = ref(false);
    const showFullText = ref(false);
    const hoverTooltip = ref(false);
    const dyid = ref(makeUniqueId(5));
    const tooltipTrigger = ref(null);
    const tooltipContent = ref(null);
    const description = ref(props?.descriptions || '');
    const tooltipStyle = ref({});

    // watch
    watch(description, () => {
        truncateText();
    });

    //onMounted
    onMounted(() => {
        truncateText();
    });

    //function
    const truncateText = () => {
        const maxLength = props.isLabel ? 20 : 200;
        if (description.value.length > maxLength) {
            truncatedText.value = description.value.substring(0, maxLength);
            fullText.value = description.value;
            isTruncated.value = true;
        } else {
            truncatedText.value = description.value;
            fullText.value = '';
            isTruncated.value = false;
        }
    };
    const handleHover = () => {
        showTooltip.value = true;
        nextTick(setPosition);
    };
    
    const handleMouseLeave = () => {
        setTimeout(()=>{
            if(hoverTooltip.value === false){
                showTooltip.value = false;
                showFullText.value = false; 
            }
        })
    };

    const setPosition = () => {
        const trigger = document.getElementById(dyid.value);
        const tooltip = document.getElementById(`dd_${dyid.value}`);

        if (!trigger || !tooltip) return;

        // Get the bounding rectangle of the trigger element
        const triggerRect = trigger.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let left, top;

        if (props.startFromEndWord) {
            // Get the last word's position
            const words = trigger.innerText.split(' ');
            const lastWord = words[words.length - 1];
            
            // Create a temporary span to measure the last word's position
            const tempSpan = document.createElement('span');
            tempSpan.textContent = lastWord;
            trigger.appendChild(tempSpan);
            const lastWordRect = tempSpan.getBoundingClientRect();
            trigger.removeChild(tempSpan);

            // Calculate position based on last word
            left = lastWordRect.right - tooltipRect.width + 15;
            top = triggerRect.top - tooltipRect.height - 5; // Position above the trigger
        } else {
            // Default positioning - left side of the trigger
            left = triggerRect.left - 20;
            top = triggerRect.top - tooltipRect.height - 5;
        }

        // Ensure tooltip doesn't go off-screen
        const windowWidth = document.documentElement.clientWidth;
        // const windowHeight = document.documentElement.clientHeight;

        // Adjust horizontal position if tooltip goes off-screen
        if (left < 0) {
            left = 10; // Small padding from left edge
        } else if (left + tooltipRect.width > windowWidth) {
            left = windowWidth - tooltipRect.width - 10;
        }

        // Adjust vertical position if tooltip goes off-screen
        if (top < 0) {
            top = triggerRect.bottom + 5; // If no space on top, move below
        }

        // Set the tooltip style
        tooltipStyle.value = {
            position: 'fixed',
            left: `${left}px`,
            top: `${top}px`,
            zIndex: '1000'
        };
    };

    const handleLeave = () => {
        hoverTooltip.value = false;
        showTooltip.value = false;
        showFullText.value = false;
    };
</script>
<style>
    @import '@/components/molecules/ToolTip/style.css';
</style>