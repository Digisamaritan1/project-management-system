export const download = async (url, name, key) => {
    let fileUrl = url;

    try {
        let response = await fetch(fileUrl,{ mode: 'no-cors'});
        if (key === "rename") {
            response = await fetch(fileUrl);
        }
        const blob = await response.blob();
        if (key === "rename") {
            fileUrl = window.URL.createObjectURL(blob);
        }

        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        if (key === "rename") {
            window.URL.revokeObjectURL(fileUrl);
        }
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading the file:', error.message);
    }
};