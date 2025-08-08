document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const promptInput = document.getElementById('promptInput');
    const transformBtn = document.getElementById('transformBtn');
    const resultsSection = document.getElementById('resultsSection');
    const originalImage = document.getElementById('originalImage');
    const transformedImage = document.getElementById('transformedImage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const appliedPrompt = document.getElementById('appliedPrompt');
    const downloadBtn = document.getElementById('downloadBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const historySection = document.getElementById('historySection');
    const historyContainer = document.getElementById('historyContainer');

    let selectedFile = null;

    // Load history on page load
    loadHistory();

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // File input change
    imageInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Prompt input change
    promptInput.addEventListener('input', function() {
        updateTransformButton();
    });

    // Transform button click
    transformBtn.addEventListener('click', function() {
        if (selectedFile && promptInput.value.trim()) {
            transformImage();
        }
    });

    // Download button click
    downloadBtn.addEventListener('click', function() {
        downloadImage();
    });

    function handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File size must be less than 10MB.');
            return;
        }

        selectedFile = file;
        
        // Display the selected image
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage.src = e.target.result;
            originalImage.style.display = 'block';
            loadingSpinner.style.display = 'none';
        };
        reader.readAsDataURL(file);

        // Show results section
        resultsSection.style.display = 'block';
        
        // Update transform button
        updateTransformButton();
    }

    function updateTransformButton() {
        const hasFile = selectedFile !== null;
        const hasPrompt = promptInput.value.trim() !== '';
        transformBtn.disabled = !(hasFile && hasPrompt);
    }

    async function transformImage() {
        if (!selectedFile || !promptInput.value.trim()) {
            return;
        }

        console.log('Starting image transformation...');
        console.log('Selected file:', selectedFile.name);
        console.log('Prompt:', promptInput.value.trim());

        // Show loading overlay
        loadingOverlay.classList.add('show');
        
        // Show loading spinner in results
        loadingSpinner.style.display = 'flex';
        transformedImage.style.display = 'none';

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('prompt', promptInput.value.trim());

        try {
            console.log('Sending request to server...');
            const response = await fetch('/api/transform-image', {
                method: 'POST',
                body: formData
            });

            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Server response:', result);

            if (result.success) {
                // Display the transformed image
                if (result.generatedImage) {
                    const imageUrl = `/uploads/${result.generatedImage}`;
                    console.log('Setting transformed image src:', imageUrl);
                    
                    // Set the image source first
                    transformedImage.src = imageUrl;
                    
                    // Add error handling for image load
                    transformedImage.onerror = function() {
                        console.error('Failed to load transformed image:', imageUrl);
                        alert('Failed to load the transformed image. Please try again.');
                        loadingSpinner.style.display = 'none';
                    };
                    
                    transformedImage.onload = function() {
                        console.log('Transformed image loaded successfully');
                        transformedImage.style.display = 'block';
                        loadingSpinner.style.display = 'none';
                        
                        // Display the applied prompt
                        appliedPrompt.textContent = result.prompt;
                        
                        // Show download button
                        downloadBtn.style.display = 'block';
                        
                        // Show success message with request ID
                        if (result.requestId) {
                            console.log('Transformation completed! Request ID:', result.requestId);
                        }
                        
                        // Reload history to show the new entry
                        loadHistory();
                    };
                    
                } else {
                    throw new Error('No generated image received');
                }
            } else {
                throw new Error(result.error || 'Failed to transform image');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error transforming image: ' + error.message);
            loadingSpinner.style.display = 'none';
        } finally {
            // Hide loading overlay
            loadingOverlay.classList.remove('show');
        }
    }

    function downloadImage() {
        if (transformedImage.src && !transformedImage.src.includes('data:image/svg+xml')) {
            const link = document.createElement('a');
            link.href = transformedImage.src;
            link.download = 'transformed-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('No transformed image available for download.');
        }
    }

    // History functions
    async function loadHistory() {
        try {
            const response = await fetch('/api/history');
            const result = await response.json();
            
            if (result.success) {
                displayHistory(result.history);
            } else {
                console.error('Failed to load history:', result.error);
                displayEmptyHistory();
            }
        } catch (error) {
            console.error('Error loading history:', error);
            displayEmptyHistory();
        }
    }

    function displayHistory(history) {
        if (history.length === 0) {
            displayEmptyHistory();
            return;
        }

        historyContainer.innerHTML = history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-images">
                    <div class="history-image-container">
                        <h4>Original</h4>
                        <img src="/uploads/${item.originalImage}" alt="Original image" onerror="this.style.display='none'">
                    </div>
                    <div class="history-image-container">
                        <h4>Generated</h4>
                        <img src="/uploads/${item.generatedImage}" alt="Generated image" onerror="this.style.display='none'">
                    </div>
                </div>
                <div class="history-details">
                    <div class="history-prompt">
                        <h4>Prompt:</h4>
                        <p>${item.prompt}</p>
                    </div>
                    <div class="history-meta">
                        <span><i class="fas fa-clock"></i> ${formatDate(item.timestamp)}</span>
                        <span><i class="fas fa-hashtag"></i> ID: ${item.requestId}</span>
                    </div>
                    <div class="history-actions">
                        <button class="history-download-btn" onclick="downloadHistoryImage('${item.generatedImage}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="history-delete-btn" onclick="deleteHistoryItem('${item.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function displayEmptyHistory() {
        historyContainer.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-history"></i>
                <h3>No History Yet</h3>
                <p>Your generated images will appear here</p>
            </div>
        `;
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    function downloadHistoryImage(filename) {
        const link = document.createElement('a');
        link.href = `/uploads/${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function deleteHistoryItem(id) {
        if (confirm('Are you sure you want to delete this item from history?')) {
            try {
                const response = await fetch(`/api/history/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    // Reload history
                    loadHistory();
                } else {
                    alert('Failed to delete history item');
                }
            } catch (error) {
                console.error('Error deleting history item:', error);
                alert('Error deleting history item');
            }
        }
    }

    // Add some helpful tips
    console.log('AI Image Transformer loaded successfully!');
    console.log('Upload an image and provide a prompt to transform it.');
    console.log('FAL AI Flux Pro integration is ready!');
}); 