import { createApp, h } from "vue";
import AlertBox from "./AlertBox.vue";

export function showAlertModal({title, message, type, cancelButtonText,confirmButtonText, showCancel, fields,isHtml}) {
    return new Promise((resolve, reject) => {
        const container = document.createElement("div");
        document.body.appendChild(container);

        const app = createApp({
            setup() {
                const handleClose = (result) => {
                    app.unmount(); // Unmount the app
                    container.remove(); // Remove the container
                    if(result === true) {
                        resolve(result); // Resolve the promise if result = true 
                    } else {
                        reject(result); // Reject the promise if result = false
                    }
                };

                return () =>
                    h(AlertBox, {
                        title,
                        message,
                        type,
                        cancelButtonText,
                        confirmButtonText,
                        showCancel,
                        fields,
                        onClose: handleClose,
                        isHtml: isHtml,
                    });
            },
        });

        app.mount(container);
    });
}
