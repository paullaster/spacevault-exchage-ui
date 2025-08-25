import { h, render } from "vue";
import Toast from "../components/Toast.vue";

export function useToast() {
    function show(message: string, type: "success" | "error" | "warning" | "info" = "info", duration = 3000) {
        const container = document.createElement("div");
        document.body.appendChild(container);

        const vnode = h(Toast, { message, type, duration });
        render(vnode, container);

        setTimeout(() => {
            render(null, container);
            document.body.removeChild(container);
        }, duration + 500);
    }

    return { show };
}
