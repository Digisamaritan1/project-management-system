export const download = async (url, name, key) => {
    let fileUrl = url;

    try {
        let response = await fetch(fileUrl);
        if (key === "rename") {
            response = await fetch(fileUrl);
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading the file:', error.message);
    }
};