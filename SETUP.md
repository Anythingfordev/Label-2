# 🎨 AI Image Transformer - Setup Guide

## 🚀 **How to Run the Project**

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Start the Server**
```bash
npm run dev
```

### **Step 3: Open Your Browser**
Navigate to: `http://localhost:3000`

## 🎯 **How to Use the Application**

### **1. Upload an Image**
- **Drag and drop** an image onto the upload area, OR
- **Click "Choose File"** to browse and select an image

### **2. Enter a Prompt**
Describe how you want to transform the image:
- "Make this image more vibrant and colorful"
- "Transform this into anime style"
- "Add a sunset background"
- "Make this look like a watercolor painting"

### **3. Click "Transform Image"**
- The AI will process your image using FAL AI Flux Pro
- You'll see a loading spinner while it processes

### **4. View Results**
- **Original image** (left side)
- **Transformed image** (right side)
- **Applied prompt** displayed below

### **5. Download the Result**
- Click **"Download Result"** to save the transformed image

## 🔧 **Troubleshooting**

### **If the server won't start:**
```bash
# Kill any existing Node.js processes
taskkill /F /IM node.exe

# Then start the server
npm run dev
```

### **If images don't display:**
1. Check the browser console (F12) for errors
2. Make sure the uploads folder exists
3. Try refreshing the page

### **If the AI transformation fails:**
1. Check your internet connection
2. Verify the FAL AI API key is correct
3. Try a different prompt

## 📁 **Project Structure**
```
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # CSS styles
│   └── script.js       # Frontend JavaScript
├── uploads/            # Uploaded and generated images
├── server.js           # Express server with FAL AI integration
├── package.json        # Dependencies
└── README.md          # Documentation
```

## 🛠 **Features**
- ✅ **Drag & Drop** image upload
- ✅ **Real-time AI transformation** with FAL Flux Pro
- ✅ **Before/After comparison**
- ✅ **Download transformed images**
- ✅ **Responsive design**
- ✅ **Error handling**

## 🔍 **Debugging**
- Open browser console (F12) to see detailed logs
- Check server console for backend logs
- All image requests are logged for debugging

## 🎨 **Supported Image Formats**
- JPEG/JPG
- PNG
- GIF
- WebP
- Maximum file size: 10MB

## 🚀 **Ready to Use!**
The application is now fully functional with FAL AI integration. Upload an image, enter a prompt, and watch the magic happen! ✨ 