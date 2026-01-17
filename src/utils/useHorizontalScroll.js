import { useEffect } from "react";

export default function useHorizontalScroll(ref) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onWheel = (e) => {
            if (e.deltaY === 0) return;
            // If the user is scrolling vertically (e.deltaY), treat it as horizontal scroll
            // Use 'auto' behavior for immediate response to wheel, 'smooth' can be laggy with wheel
            el.scrollTo({
                left: el.scrollLeft + e.deltaY * 2, // Multiplier for speed
                behavior: "auto"
            });
            // preventDefault only if we want to stop vertical page scroll while over the element
            // e.preventDefault(); 
        };

        // Variables for Drag (Slide)
        let isDown = false;
        let startX;
        let scrollLeft;

        const onMouseDown = (e) => {
            isDown = true;
            el.style.cursor = 'grabbing';
            el.style.userSelect = 'none'; // Prevent text selection while dragging
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        };

        const onMouseLeave = () => {
            isDown = false;
            el.style.cursor = 'grab';
            el.style.removeProperty('user-select');
        };

        const onMouseUp = () => {
            isDown = false;
            el.style.cursor = 'grab';
            el.style.removeProperty('user-select');
        };

        const onMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed multiplier
            el.scrollLeft = scrollLeft - walk;
        };

        // Initial cursor style
        el.style.cursor = 'grab';

        el.addEventListener("wheel", onWheel);
        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('mousemove', onMouseMove);

        return () => {
            el.removeEventListener("wheel", onWheel);
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mouseleave', onMouseLeave);
            el.removeEventListener('mouseup', onMouseUp);
            el.removeEventListener('mousemove', onMouseMove);
            // Cleanup styles
            if (el) {
                el.style.cursor = '';
                el.style.removeProperty('user-select');
            }
        };
    }, [ref]);
}
