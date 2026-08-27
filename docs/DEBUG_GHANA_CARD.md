# Debugging Ghana Card Verification

## 🔍 How to Debug

### Step 1: Open Browser Console
1. Press **F12** (or right-click → Inspect)
2. Go to **Console** tab
3. Try uploading a Ghana Card
4. Look for these log messages:

```
=== Starting Ghana Card OCR ===
File name: [your file]
File size: [size] bytes
File type: image/jpeg
API key found, length: [number]
Converting image to base64...
Base64 conversion complete, length: [number]
Calling Groq Vision API...
Full Groq API response: {...}
Extracted text from Groq: {...}
Parsed card data: {...}
=== OCR Complete ===
```

### Step 2: Check for Errors

#### Error: "Groq API key not configured"
**Problem:** API key missing or not loaded
**Fix:**
```bash
# Check .env file has:
VITE_GROQ_API_KEY=your_groq_api_key_here

# Restart server
npm run dev
```

#### Error: "Groq Vision API returned status 401"
**Problem:** Invalid API key
**Fix:** Get a new API key from https://console.groq.com/

#### Error: "Groq Vision API returned status 429"
**Problem:** Rate limit exceeded
**Fix:** Wait a few minutes and try again

#### Error: "Groq Vision API returned status 500"
**Problem:** Groq server error
**Fix:** Try again later, it's a temporary issue

#### Error: "Could not parse Ghana Card data"
**Problem:** AI returned unexpected format
**Check console for:** "Extracted text from Groq" - see what AI actually said

### Step 3: Network Tab Debug

1. Open **F12** → **Network** tab
2. Upload Ghana Card
3. Look for request to: `api.groq.com/openai/v1/chat/completions`
4. Click on it
5. Check:
   - **Status:** Should be 200
   - **Response:** Should have `choices[0].message.content`

#### If Status is 400:
The model might not support vision. Check response message.

#### If Status is 401:
API key is invalid or expired.

#### If Status is 429:
You've hit the rate limit. Wait and try again.

### Step 4: Test API Key Directly

Create a test file `test-groq.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Test Groq Vision</title></head>
<body>
  <h1>Test Groq Vision API</h1>
  <button onclick="testAPI()">Test API</button>
  <pre id="result"></pre>
  
  <script>
    async function testAPI() {
      const apiKey = 'your_groq_api_key_here';
      
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.2-90b-vision-preview',
            messages: [{
              role: 'user',
              content: [{
                type: 'text',
                text: 'Say "API is working!"'
              }]
            }],
            max_tokens: 50,
          }),
        });
        
        const data = await response.json();
        document.getElementById('result').textContent = JSON.stringify(data, null, 2);
        
        if (response.ok) {
          alert('✅ API is working!');
        } else {
          alert('❌ API error: ' + response.status);
        }
      } catch (error) {
        document.getElementById('result').textContent = 'Error: ' + error.message;
        alert('❌ Error: ' + error.message);
      }
    }
  </script>
</body>
</html>
```

Open this file in your browser and click "Test API" to verify the API key works.

## 🔧 Alternative: Fallback OCR

If Groq Vision isn't working, we can use Tesseract.js as a fallback.

### Install Tesseract.js:
```bash
npm install tesseract.js
```

### Update `ghanaCardVerification.ts`:
```typescript
import Tesseract from 'tesseract.js';

// Add fallback function
async function extractWithTesseract(imageFile: File): Promise<GhanaCardData | null> {
  try {
    console.log('Using Tesseract.js fallback OCR...');
    
    const { data: { text } } = await Tesseract.recognize(imageFile, 'eng');
    console.log('Tesseract extracted text:', text);
    
    // Parse the text to find Ghana Card data
    const cardNumberMatch = text.match(/GHA[-\s]?(\d{9})[-\s]?(\d)/);
    const cardNumber = cardNumberMatch 
      ? `GHA-${cardNumberMatch[1]}-${cardNumberMatch[2]}`
      : '';
    
    // Extract name (usually in capital letters)
    const nameMatch = text.match(/([A-Z\s]{3,50})/);
    const fullName = nameMatch ? nameMatch[1].trim() : '';
    
    return {
      cardNumber,
      fullName,
      dateOfBirth: '',
      gender: '',
      district: '',
      expiryDate: '',
    };
  } catch (error) {
    console.error('Tesseract extraction failed:', error);
    return null;
  }
}

// Then in extractCardDetails, add fallback:
export async function extractCardDetails(imageFile: File): Promise<GhanaCardData | null> {
  try {
    // Try Groq Vision first
    const groqResult = await extractWithGroq(imageFile);
    if (groqResult) return groqResult;
    
    console.log('Groq failed, trying Tesseract...');
    // Fallback to Tesseract
    return await extractWithTesseract(imageFile);
  } catch (error) {
    console.error('All OCR methods failed');
    return null;
  }
}
```

## 📊 Common Issues

### Issue: Groq Vision Model Not Available
**Symptom:** Status 400, "model not found"
**Fix:** The vision model might not be available. Use Tesseract fallback.

### Issue: Image Too Large
**Symptom:** Timeout or error
**Fix:** Resize image before sending:
```typescript
async function resizeImage(file: File, maxWidth: number = 1024): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.9);
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

### Issue: API Response Not JSON
**Symptom:** "Could not parse Ghana Card data"
**Check:** Console log "Extracted text from Groq"
**Fix:** The AI might be returning text explanation instead of JSON. Update prompt to be more explicit.

## 🎯 Quick Test

```bash
# 1. Open browser console (F12)
# 2. Go to signup page
# 3. Create account
# 4. Upload Ghana Card
# 5. Watch console logs
# 6. Copy any errors
# 7. Check this guide for solutions
```

## 📞 Get Help

If you see errors, send me:
1. Screenshot of browser console (F12)
2. Screenshot of Network tab showing the Groq API request
3. The error message shown to user
4. Image file size and type

This will help identify the exact issue!
