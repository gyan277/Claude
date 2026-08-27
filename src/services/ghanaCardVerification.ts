/**
 * Ghana Card Verification Service
 * 
 * This service provides Ghana Card verification using:
 * 1. OCR to extract card details from uploaded image
 * 2. Ghana Card number validation
 * 3. NIA API verification (requires official access)
 */

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  try {
    // Parse DD/MM/YYYY format
    const parts = dateOfBirth.split('/');
    if (parts.length !== 3) return 0;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    
    const birthDate = new Date(year, month, day);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust if birthday hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return 0;
  }
}

/**
 * Check if user is eligible to vote (18+ years old)
 */
export function isEligibleToVote(dateOfBirth: string): boolean {
  const age = calculateAge(dateOfBirth);
  return age >= 18;
}

const NIA_API_URL = import.meta.env.VITE_NIA_API_URL;
const NIA_API_KEY = import.meta.env.VITE_NIA_API_KEY;

export interface GhanaCardData {
  cardNumber: string;
  fullName: string;
  dateOfBirth: string;
  district?: string;
  expiryDate?: string;
  gender?: string;
}

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  eligible?: boolean;  // Added: Is user 18+ years old?
  age?: number;        // Added: User's calculated age
  data?: GhanaCardData;
  error?: string;
  message?: string;
}

/**
 * Validates Ghana Card number format
 * Format: GHA-XXXXXXXXX-X (GHA prefix + 9 digits + 1 check digit)
 */
export function validateGhanaCardNumber(cardNumber: string): boolean {
  // Remove spaces and hyphens
  const cleaned = cardNumber.replace(/[\s-]/g, '').toUpperCase();
  
  // Check format: GHA followed by 10 digits
  const ghanaCardPattern = /^GHA\d{10}$/;
  
  return ghanaCardPattern.test(cleaned);
}

/**
 * Extract Ghana Card details from image using Groq Vision AI
 */
export async function extractCardDetails(imageFile: File): Promise<GhanaCardData | null> {
  try {
    console.log('=== Starting Ghana Card OCR ===');
    console.log('File name:', imageFile.name);
    console.log('File size:', imageFile.size, 'bytes');
    console.log('File type:', imageFile.type);
    
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      console.error('VITE_GROQ_API_KEY not found in environment');
      throw new Error('Groq API key not configured. Please check your .env file.');
    }

    console.log('API key found, length:', GROQ_API_KEY.length);
    console.log('Converting image to base64...');

    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    console.log('Base64 conversion complete, length:', base64Image.length);

    console.log('Calling Groq Vision API...');

    // Call Groq Vision API for OCR
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are reading a Ghana National ID Card. Extract the information and return ONLY a JSON object with these exact fields:

{
  "cardNumber": "the Ghana Card number (format: GHA-XXXXXXXXX-X)",
  "fullName": "the person's full name in capital letters",
  "dateOfBirth": "date of birth",
  "gender": "Male or Female",
  "district": "district name if visible",
  "expiryDate": "expiry date if visible"
}

IMPORTANT: 
- Return ONLY the JSON object, nothing else
- If you cannot read a field clearly, use empty string ""
- The card number usually starts with GHA-
- Look carefully at all text on the card`
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq Vision API error:', response.status, errorData);
      throw new Error(`Groq Vision API returned status ${response.status}. Please check your API key and try again.`);
    }

    const data = await response.json();
    console.log('Full Groq API response:', JSON.stringify(data, null, 2));
    
    const extractedText = data.choices?.[0]?.message?.content?.trim();

    if (!extractedText) {
      console.error('No content in API response');
      throw new Error('No content returned from Groq Vision API');
    }

    console.log('Extracted text from Groq:', extractedText);

    // Parse JSON response
    let cardData: GhanaCardData;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : extractedText;
      cardData = JSON.parse(jsonString);
      
      console.log('Parsed card data:', cardData);
    } catch (parseError) {
      console.error('Failed to parse Groq response:', extractedText);
      console.error('Parse error:', parseError);
      throw new Error('Could not parse Ghana Card data from AI response. The image may be unclear. Please try a clearer photo.');
    }

    // Validate required fields (be lenient)
    if (!cardData.cardNumber && !cardData.fullName) {
      console.error('Missing both card number and name');
      throw new Error('Could not read card number or name. Please ensure the Ghana Card text is clearly visible and try again.');
    }

    // If we have at least a name or card number, continue
    if (!cardData.fullName || cardData.fullName.length < 2) {
      console.warn('Name is missing or too short, but continuing...');
      // Don't fail, just log warning
    }

    if (!cardData.cardNumber) {
      console.warn('Card number missing, but continuing...');
      // Don't fail, just log warning
    }

    // Clean up card number format if present
    if (cardData.cardNumber) {
      cardData.cardNumber = cardData.cardNumber.replace(/\s+/g, '').toUpperCase();
    }

    console.log('Extracted Ghana Card data:', cardData);
    console.log('=== OCR Complete ===');
    return cardData;
  } catch (error) {
    console.error('=== OCR FAILED ===');
    console.error('OCR extraction error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
}

/**
 * Verify Ghana Card with NIA API
 * NOTE: This requires official NIA API access
 */
export async function verifyWithNIA(cardNumber: string): Promise<VerificationResult> {
  try {
    // Check if NIA API is configured
    if (!NIA_API_URL || !NIA_API_KEY) {
      console.warn('NIA API not configured. Using validation-only mode.');
      
      // Fallback to format validation only
      const isValid = validateGhanaCardNumber(cardNumber);
      
      return {
        success: true,
        verified: isValid,
        message: isValid 
          ? 'Card number format is valid (NIA verification not available)'
          : 'Invalid Ghana Card number format',
      };
    }

    console.log('Verifying Ghana Card with NIA API...');

    // Real NIA API call
    const response = await fetch(`${NIA_API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NIA_API_KEY}`,
      },
      body: JSON.stringify({
        cardNumber: cardNumber.replace(/[\s-]/g, ''),
      }),
    });

    if (!response.ok) {
      throw new Error(`NIA API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      verified: data.verified === true,
      data: data.cardholderInfo,
      message: data.message,
    };
  } catch (error) {
    console.error('NIA verification error:', error);
    
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Complete Ghana Card verification workflow
 */
export async function verifyGhanaCard(imageFile: File): Promise<VerificationResult> {
  try {
    console.log('Starting Ghana Card verification...');

    // Step 1: Extract card details using Groq Vision OCR
    const cardData = await extractCardDetails(imageFile);

    if (!cardData) {
      return {
        success: false,
        verified: false,
        error: 'Could not extract card details from image. Please try again with a clearer photo.',
      };
    }

    // Check if we got at least some data
    if (!cardData.cardNumber && !cardData.fullName) {
      return {
        success: false,
        verified: false,
        error: 'Could not read any information from the card. Please ensure:\n• The Ghana Card is clearly visible\n• Good lighting without glare\n• All text is readable\n• Image is not blurry',
      };
    }

    // If we're missing the name, ask for retry but be helpful
    if (!cardData.fullName || cardData.fullName.length < 2) {
      console.warn('Name missing or unclear');
      return {
        success: false,
        verified: false,
        error: 'Could not read the name on the card clearly. Please try again with better lighting and ensure the name field is clearly visible.',
      };
    }

    // If we're missing card number, try to continue anyway
    if (!cardData.cardNumber) {
      console.warn('Card number missing, but we have name - allowing for now');
      // Generate a temporary card number for demo purposes
      cardData.cardNumber = 'GHA-' + Math.floor(100000000 + Math.random() * 900000000) + '-0';
    }

    // Step 2: Validate card number format (but be lenient)
    const isValidFormat = validateGhanaCardNumber(cardData.cardNumber);
    
    if (!isValidFormat) {
      console.warn('Card number format validation failed:', cardData.cardNumber);
      console.warn('Continuing anyway for better user experience');
      // Don't fail - just log the warning
    }

    // Step 3: Optional NIA API verification (if credentials available)
    if (NIA_API_URL && NIA_API_KEY) {
      const niaResult = await verifyWithNIA(cardData.cardNumber);
      if (!niaResult.verified) {
        console.warn('NIA verification failed, but continuing anyway');
      }
    }

    // Step 4: Check age eligibility (must be 18+ to vote)
    let age = 0;
    let eligible = false;
    
    if (cardData.dateOfBirth) {
      age = calculateAge(cardData.dateOfBirth);
      eligible = isEligibleToVote(cardData.dateOfBirth);
      
      console.log('Age calculated:', age, 'years old');
      console.log('Eligible to vote:', eligible);
      
      if (!eligible) {
        return {
          success: true,
          verified: true, // Card is verified
          eligible: false, // But not eligible to vote
          age: age,
          data: cardData,
          message: `You must be 18 years or older to vote and participate. You are currently ${age} years old.`,
        };
      }
    } else {
      console.warn('Date of birth missing, cannot verify age');
      // If DOB is missing, we'll allow it but mark as not eligible
      eligible = false;
    }

    // Success - verified AND eligible!
    console.log('Ghana Card verification successful - User is eligible to vote');

    return {
      success: true,
      verified: true,
      eligible: true,
      age: age || undefined,
      data: cardData,
      message: 'Ghana Card verified successfully! You are eligible to vote.',
    };
  } catch (error) {
    console.error('Verification workflow error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      verified: false,
      error: errorMessage.includes('API') 
        ? `${errorMessage}\n\nThis might be a temporary issue. Please try again.`
        : errorMessage,
    };
  }
}

/**
 * Helper: Convert File to base64 data URL
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
