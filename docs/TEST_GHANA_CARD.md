# Testing Ghana Card Verification

## ✅ What Was Fixed

**BEFORE:** The system was using **simulated/demo data** - it wasn't actually reading the Ghana Card image.

**NOW:** The system uses **real Groq Vision AI** to extract text from your Ghana Card image!

## 🧪 How to Test

### Step 1: Get a Ghana Card Image
You need a clear photo of a Ghana Card. You can:
- Use your own Ghana Card (take a photo with good lighting)
- Search online for "Ghana Card sample" (for testing purposes only)
- Ask a friend for a photo of their Ghana Card

### Step 2: Start the App
```bash
npm run dev
```

### Step 3: Sign Up
1. Go to http://localhost:5173/signup
2. Fill in the form:
   - Name: Your full name
   - Email: Your email
   - Password: At least 8 characters
   - District: Select any district
3. Click **"Create Account"**

### Step 4: Upload Ghana Card
After clicking "Create Account", the verification modal will appear:

1. **Drag & drop** your Ghana Card image, or **click "browse files"**
2. Wait for the AI to process (you'll see):
   - ✅ "Reading image..."
   - ✅ "Extracting Ghana Card details using AI..."
   - ✅ "Ghana Card Verified!" (if successful)

3. **Review the extracted data:**
   - Name (should match the card)
   - Card Number (format: GHA-XXXXXXXXX-X)
   - District (if readable)

4. Click **"Continue"** if the data is correct

### Step 5: You're In!
You'll be redirected to the home page, fully verified and ready to vote and post!

## 📋 What the AI Extracts

The Groq Vision AI reads these fields from the Ghana Card:

| Field | Format | Example |
|-------|--------|---------|
| Card Number | GHA-XXXXXXXXX-X | GHA-123456789-0 |
| Full Name | As shown on card | KWAME NKRUMAH |
| Date of Birth | DD/MM/YYYY | 21/09/1909 |
| Gender | Male/Female | Male |
| District | District name | Accra Metropolitan |
| Expiry Date | DD/MM/YYYY | 31/12/2030 |

## 🎯 Expected Results

### ✅ Success Case
**When:** Clear, well-lit Ghana Card image
**Result:** 
- Green checkmark appears
- All details extracted correctly
- "Continue" button enabled
- You can proceed to the app

### ❌ Error Cases

#### Poor Image Quality
**When:** Blurry, dark, or low-resolution image
**Result:** 
```
Could not extract card details from image. Please ensure:
• The Ghana Card is clearly visible
• Good lighting without glare
• All text is readable
• Image is not blurry
```

#### Invalid Card Number
**When:** AI misreads the card number
**Result:**
```
Invalid Ghana Card number format: [extracted number]
Expected format: GHA-XXXXXXXXX-X
```

#### API Issues
**When:** No internet or Groq API problems
**Result:**
```
Verification process failed: [error details]

Please check:
• Your internet connection
• Image file is valid
• Ghana Card is clearly visible
```

## 🔧 Troubleshooting

### Problem: "Groq API key not configured"
**Solution:** Check your `.env` file has:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### Problem: AI can't read the card
**Try these tips:**
1. ✅ Use better lighting (natural daylight is best)
2. ✅ Lay the card flat on a dark background
3. ✅ Make sure all text is in focus
4. ✅ Avoid reflections and glare
5. ✅ Take the photo straight-on (not at an angle)
6. ✅ Use a higher resolution image

### Problem: "Image file is too large"
**Solution:** Resize the image to under 10MB using:
- Phone camera settings (lower resolution)
- Online tools like TinyPNG
- Image editing software

### Problem: Modal doesn't appear
**Check:**
1. Account was created successfully (check console logs)
2. No errors in browser console (press F12)
3. You're on the signup page, not login page

## 🎨 Image Quality Tips

### ✅ Good Image Examples:
- Card centered in frame
- All four corners visible
- Even lighting across the card
- No shadows or glare
- Text is sharp and clear
- Camera held steady

### ❌ Bad Image Examples:
- Card at an angle
- Part of card cut off
- Blurry or out of focus
- Too dark or overexposed
- Glare from flash or lights
- Fingers covering text

## 🔍 Technical Details

### What Happens Behind the Scenes:
1. **Image Upload:** File is converted to base64
2. **API Call:** Sent to Groq Vision API (`llama-3.2-90b-vision-preview`)
3. **AI Processing:** Model analyzes the image and extracts text
4. **JSON Response:** AI returns structured data
5. **Validation:** Card number format checked (GHA-XXXXXXXXX-X)
6. **Optional NIA Check:** If configured, verifies with Ghana's NIA database
7. **Result:** User sees extracted data and confirms

### API Used:
- **Service:** Groq Cloud
- **Model:** `llama-3.2-90b-vision-preview`
- **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
- **Cost:** Free tier available

## 📊 Success Metrics

After testing, you should see:
- ✅ AI correctly reads card number
- ✅ AI correctly reads full name
- ✅ Format validation passes
- ✅ Extracted data displays in modal
- ✅ User can continue after confirmation
- ✅ Account is marked as verified
- ✅ User can now vote and post

## 🐛 Debugging

### Check Browser Console:
Press F12 and look for:
```
Starting Ghana Card verification...
Extracting Ghana Card data using Groq Vision AI...
Groq Vision API response: {...}
Extracted Ghana Card data: {...}
Ghana Card verification successful
```

### Check Network Tab:
Look for a POST request to:
```
https://api.groq.com/openai/v1/chat/completions
```
Status should be: **200 OK**

## 🎉 Next Steps After Testing

Once verification works:
1. Test with multiple Ghana Cards
2. Test error cases (blurry images, wrong files)
3. Check the extracted data accuracy
4. Verify the user can vote/post after verification
5. Test the retry mechanism
6. Consider adding manual review for failed verifications

---

**Need Help?** Check:
- Browser console for errors (F12)
- Network tab for API calls
- Supabase dashboard for user records
- `GHANA_CARD_VERIFICATION.md` for full documentation
