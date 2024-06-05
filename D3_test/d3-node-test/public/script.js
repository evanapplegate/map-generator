document.getElementById('mapperForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission

    const formData = new FormData();
    const userInput = document.getElementById('userInput').value;
    const fileInput = document.getElementById('fileInput').files[0]; // Assuming you have an <input type="file" id="fileInput">
    
    formData.append('userInput', userInput);
    if (fileInput) formData.append('file', fileInput);

    fetch('/generate-map', {
      method: 'POST',
      body: formData, // Send as FormData
    })
    .then(response => response.json())
    .then(data => {
      console.log('Map Script:', data.mapScript);
    })
    .catch(error => {
      console.error('Error:', error);
    });

    .then(data => {
      console.log('Map Script:', data.mapScript);
      // Fetch the generated script
      fetch(data.filePath)
        .then(response => response.text())
        .then(scriptContent => {
          const scriptEl = document.createElement('script');
          scriptEl.textContent = scriptContent;
          document.getElementById('scriptContainer').appendChild(scriptEl);
        });
    })
});