# AI Image Transformer

A modern web application that allows users to upload images and transform them using AI models. Users can provide text prompts to describe how they want their images to be modified.

## Features

- 🖼️ **Image Upload**: Drag and drop or click to upload images
- ✍️ **Text Prompts**: Describe the transformation you want
- 🤖 **AI Integration**: Ready to integrate with your AI model API
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 💾 **Download Results**: Download transformed images
- 🎨 **Modern UI**: Beautiful, intuitive interface

## Setup Instructions

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## API Integration

The application is ready for AI API integration. To connect your AI model:

1. **Update `server.js`:**
   - Replace `YOUR_AI_API_ENDPOINT_HERE` with your actual API endpoint
   - Replace `YOUR_API_KEY_HERE` with your API key
   - Uncomment the API call section in the `/api/transform-image` route

2. **API Configuration:**
   ```javascript
   const aiApiConfig = {
     url: 'YOUR_AI_API_ENDPOINT_HERE',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer YOUR_API_KEY_HERE'
     },
     data: {
       image: base64Image,
       prompt: prompt
       // Add any other parameters your AI API requires
     }
   };
   ```

3. **Expected API Response:**
   Your AI API should return a response with the transformed image in base64 format:
   ```json
   {
     "image": "base64_encoded_image_data",
     "success": true
   }
   ```

## File Structure

```
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # CSS styles
│   └── script.js       # Frontend JavaScript
├── uploads/            # Uploaded images (created automatically)
├── server.js           # Express server
├── package.json        # Dependencies
└── README.md          # This file
```

## Usage

1. **Upload an Image**: Drag and drop an image or click "Choose File"
2. **Enter a Prompt**: Describe how you want to transform the image
3. **Transform**: Click "Transform Image" to process with AI
4. **Download**: Download the transformed image when ready

## Supported Image Formats

- JPEG/JPG
- PNG
- GIF
- WebP
- Maximum file size: 10MB

## Development

- **Development mode**: `npm run dev` (uses nodemon for auto-restart)
- **Production mode**: `npm start`

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **File Upload**: Multer
- **HTTP Client**: Axios
- **Styling**: Custom CSS with responsive design

## License

MIT License - feel free to use and modify as needed.

## Support

If you need help integrating your AI API or have questions about the application, please check the code comments in `server.js` for integration guidance. 