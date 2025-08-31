// Helper function to get direct download URL from Google Drive
function getGoogleDriveDirectUrl(driveUrl) {
    const fileId = driveUrl.match(/\/d\/(.*?)\/view/)?.[1];
    if (!fileId) return null;
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
