export default {
    toastNotification(self, title, text, type) {
        return self.$vs.notify({
            title: title,
            text: text,
            iconPack: "feather",
            icon: "icon-alert-circle",
            color: type,
            position: 'top-right'
        });
    }
};