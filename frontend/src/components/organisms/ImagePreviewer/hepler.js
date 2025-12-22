import { nextTick, ref } from "vue";

import fileIconsArr from "./fileIcons.js"

const fileImages = ref([]);

import defaultImage from "@/assets/images/icon/error.png";

export function dragScroll() {
    let isDown = false;
    let startX;
    let scrollLeft;
    let slider;

    function initSlider(id) {
        setTimeout(() => {
            slider = document.querySelector(`#${id}`);
        })
    }

    function mouseDown(e) {
        isDown = true;
        slider?.classList.add('active');
        slider?.classList.remove('scroll-smooth');
        startX = e.pageX - slider?.offsetLeft;
        scrollLeft = slider?.scrollLeft;
        e.target.style.cursor = 'grabbing';
    }
    function mouseUp(e) {
        isDown = false;
        slider?.classList.remove('active');
        slider?.classList.add('scroll-smooth');
        e.target.style.cursor = 'grab';
    }
    function mouseLeave() {
        isDown = false;
        slider?.classList.remove('active');
        slider?.classList.add('scroll-smooth');
    }
    function mouseMove(e) {
        if(!isDown) return;
        // e.preventDefault();
        const x = e.pageX - slider?.offsetLeft;
        const walk = (x - startX);
        slider.scrollLeft = scrollLeft - walk;

    }
    return {
        initSlider,
        mouseDown,
        mouseUp,
        mouseLeave,
        mouseMove
    }
}

export function imagesContainerAdjust() {
    function checkPosition({direction, containerId = "CONTAINER", previewImage}) {
        nextTick(() => {
            try {
                const container = document.getElementById(containerId);
                const newImage = document.getElementById(`image_item_${previewImage.value.index}`)?.getBoundingClientRect()

                const mid = container?.clientWidth / 2;
                if(direction === "right") {
                    let location = newImage.left + newImage.width;
                    if(location >= mid) {
                        const offset = location - (mid + (newImage.width / 2)) + 15;
                        container.scrollLeft = container.scrollLeft + offset;
                    }
                } else {
                    let location = newImage.right;
                    if((location) <= mid) {
                        const offset = (mid + (newImage.width / 2)) - location - 15;
                        container.scrollLeft = container.scrollLeft - offset;

                    }
                }

            } catch (error) {
                console.error("ERROR: ", error);
            }
        })
    }

    return {
        checkPosition
    }
}

export function fileImageReplacer() {
    function setFileImage(icons=[]) {
        if(!icons?.length) {
            fileImages.value = fileIconsArr;
        } else {
            fileImages.value = icons
        }
    }

    function getFileImage(type, extension) {
        const defaultFileImage = defaultImage;
        if(!(type || extension) || type === "DEFAULT") {
            return {url: defaultFileImage, width: "80px"}
        } else {
            const tmp = fileImages.value.find((x) => {
                return x?.type?.includes(type) || x?.ext?.includes(extension)
            })?.url ?? defaultFileImage;

            return {url: tmp, width: "80px"}
        }
    }

    return {
        getFileImage,
        setFileImage
    }
}

export function dragHelper() {
    let isDragging = false;
    let startX = 0, startY = 0, offsetX = 0, offsetY = 0;
    let scale = 1;

    function setScale(newScale) {
        scale = newScale;
    }
    function resetOffsets() {
        offsetX = 0;
        offsetY = 0;
    }
    function handleMouseDown(event, targetSelector) {
        const target = targetSelector ? document.querySelector(targetSelector) : event.target;
        isDragging = true;
        const transform = target.style.transform.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/);
        offsetX = transform ? parseFloat(transform[1]) : 0;
        offsetY = transform ? parseFloat(transform[2]) : 0;

        startX = event.clientX;
        startY = event.clientY;

        target.style.cursor = 'grabbing';
    }

    function handleMouseMove(event, targetSelector) {
        if (!isDragging) return;
        const target = targetSelector ? document.querySelector(targetSelector) : event.target;

        const deltaX = (event.clientX - startX) / scale;
        const deltaY = (event.clientY - startY) / scale;

        const newX = offsetX + deltaX;
        const newY = offsetY + deltaY;

        target.style.transform = `translate(${newX}px, ${newY}px)`;
    }

    function handleMouseUp(event, targetSelector) {
        const target = targetSelector ? document.querySelector(targetSelector) : event.target;
        isDragging = false;
        startX = undefined;
        startY = undefined;
        target.style.cursor = 'grab';
    }

    function handleTouchStart(event, targetSelector) {
        const target = targetSelector ? document.querySelector(targetSelector) : event.target;
        isDragging = true;
        const touch = event.touches[0];
        startX = touch.clientX - offsetX;
        startY = touch.clientY - offsetY;
        target.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    function handleTouchMove(event, targetSelector) {
        if (!isDragging) return;
        const target = targetSelector ? document.querySelector(targetSelector) : event.target;

        const touch = event.touches[0];

        const deltaX = (touch.clientX - startX) / scale;
        const deltaY = (touch.clientY - startY) / scale;

        const newX = offsetX + deltaX;
        const newY = offsetY + deltaY;

        target.style.transform = `translate(${newX}px, ${newY}px)`;
    }

    function handleTouchEnd() {
        isDragging = false;
        startX = undefined;
        startY = undefined;
    }
    return {
        setScale,
        resetOffsets,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleTouchStart,
        handleTouchEnd,
        handleTouchMove
    };
}