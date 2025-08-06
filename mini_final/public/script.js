const serverUrl = "http://localhost:9000";

async function uploadFiles() {
  const fileInput = document.getElementById("fileInput");
  const files = fileInput.files;
  const formData = new FormData();

  if (files.length === 0) {
    alert("Please select at least one file to upload.");
    return;
  }

  for (const file of files) {
    formData.append("files", file);
  }

  try {
    const response = await fetch(`${serverUrl}/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    alert("Files uploaded successfully!");
    displayFiles(data.files);
    fileInput.value = ""; // Reset file input
  } catch (error) {
    console.error("Error uploading files:", error);
    alert("Error uploading files. Please try again.");
  }
}

async function deleteFile(filename) {
  if (!confirm(`Are you sure you want to securely delete "${filename}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${serverUrl}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    const data = await response.json();
    alert(data.message);
    loadFiles();
  } catch (error) {
    console.error("Error deleting file:", error);
    alert("Error deleting file. Please try again.");
  }
}

async function loadFiles() {
  try {
    const response = await fetch(`${serverUrl}/files`);
    const data = await response.json();
    displayFiles(data.files);
  } catch (error) {
    console.error("Error loading files:", error);
  }
}

function displayFiles(files) {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  if (files.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty";
    emptyMessage.textContent = "No files uploaded yet.";
    fileList.appendChild(emptyMessage);
    return;
  }

  files.forEach((file) => {
    const li = document.createElement("li");

    const fileName = document.createElement("span");
    fileName.textContent = file;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Securely";
    deleteButton.className = "delete-button";
    deleteButton.onclick = () => deleteFile(file);

    li.appendChild(fileName);
    li.appendChild(deleteButton);
    fileList.appendChild(li);
  });
}

// Load files on page load
window.onload = loadFiles;
