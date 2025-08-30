# 📧 Email OTP Setup Guide for LUXORO

## 🚀 Quick Setup Steps

### 1. Gmail App Password Setup
1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to [Google Account Settings](https://myaccount.google.com/) → Security
3. Under "2-Step Verification", click **App passwords**
4. Select **Mail** as the app type
5. Copy the generated 16-character app password

### 2. Update Environment Variables
Edit `/backend/.env` file:
```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### 3. Test Email Configuration
Run the test script:
```bash
cd backend
node test-otp.js
```

## ✅ Features Implemented

### Frontend (SignupForm.tsx)
- ✅ Email input with "Send OTP" button
- ✅ 6-digit OTP input field
- ✅ Email verification with green checkmark
- ✅ Resend OTP with 60-second cooldown
- ✅ Loading states and error handling
- ✅ Form validation (prevents signup without verification)

### Backend (authRoutes.js)
- ✅ `/api/auth/send-otp` endpoint
- ✅ `/api/auth/verify-otp` endpoint
- ✅ Professional LUXORO-branded email template
- ✅ 5-minute OTP expiration
- ✅ Duplicate email prevention

## 🎯 User Flow
1. User enters email → clicks "Send OTP"
2. Receives branded email with 6-digit OTP
3. Enters OTP → clicks "Verify"
4. Email verified with green checkmark ✅
5. Can complete signup

## 🔧 Troubleshooting

### Authentication Error
- Ensure 2-factor authentication is enabled
- Use app password, not regular Gmail password
- Check EMAIL_USER and EMAIL_PASS in .env

### OTP Not Received
- Check spam/junk folder
- Verify email address is correct
- Run test script to verify email setup

## 📱 Production Considerations
- Replace in-memory OTP storage with Redis/database
- Add rate limiting for OTP requests
- Consider SMS OTP as backup option
- Add email template customization

## 🎨 Email Template
The OTP emails feature:
- LUXORO branding
- Professional design
- Clear OTP display
- Security messaging
- Mobile-responsive layout
