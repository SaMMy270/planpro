function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const parentFolderId = "1Qok_XpqP6oH03VTB94rfFCG_9-wd4AcN"; 
    
    let parentFolder;
    try {
      // Try to get the specific folder
      parentFolder = DriveApp.getFolderById(parentFolderId);
    } catch (fErr) {
      // Fallback to Root if the ID is invalid or inaccessible
      console.warn("Folder ID not found, using Root folder instead.");
      parentFolder = DriveApp.getRootFolder();
    }
    
    // Choose sub-folder based on file type
    let folderName = (data.mimeType && data.mimeType.includes("image")) ? "AI_Uploads" : "3D_Models";
    
    let targetFolder;
    const folders = parentFolder.getFoldersByName(folderName);
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = parentFolder.createFolder(folderName);
    }
    
    const extension = data.mimeType.includes("png") ? "png" : (data.mimeType.includes("glb") ? "glb" : "jpg");
    const fileName = data.filename || `File_${Date.now()}.${extension}`;
    const base64Data = data.file.split(",")[1];
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), data.mimeType, fileName);
    
    const file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      url: `https://drive.google.com/uc?export=download&id=${file.getId()}`
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("PlanPro Storage Service is Online");
}