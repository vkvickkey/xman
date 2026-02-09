import { useEffect, useState } from "react";

export default function useDragScroll(ref, dependency = null) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let isDown = false;
        let startX;
        let scrollLeft;
        let isDragging = false; // Flag to track if user is dragging

        const onMouseDown = (e) => {
            isDown = true;
            isDragging = false; // Reset drag flag
            el.classList.add("active");
            el.style.cursor = 'grabbing';
            el.style.userSelect = 'none';
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        };

        const onMouseLeave = () => {
            isDown = false;
            el.classList.remove("active");
            el.style.cursor = 'grab';
            el.style.removeProperty('user-select');
        };

        const onMouseUp = () => {
            isDown = false;
            el.classList.remove("active");
            el.style.cursor = 'grab';
            el.style.removeProperty('user-select');

            // Delay resetting isDragging to allow click handler to check it
            setTimeout(() => {
                isDragging = false;
            }, 0);
        };

        const onMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed multiplier

            // If movement is significant, mark as dragging and scroll
            if (Math.abs(walk) > 5) {
                isDragging = true;
                el.scrollLeft = scrollLeft - walk;
            }
        };

        // Capture click event to prevent default action if dragging occurred
        const onClickCapture = (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        // Initial cursor style
        el.style.cursor = 'grab';

        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('mousemove', onMouseMove);

        // Add capture listener to intercept clicks
        el.addEventListener('click', onClickCapture, true);

        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mouseleave', onMouseLeave);
            el.removeEventListener('mouseup', onMouseUp);
            el.removeEventListener('mousemove', onMouseMove);
            el.removeEventListener('click', onClickCapture, true);
            // Cleanup styles
            if (el) {
                el.style.cursor = '';
                el.style.removeProperty('user-select');
            }
        };
    }, [ref, dependency]);
}
