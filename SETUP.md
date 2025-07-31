# 🏛️ Citizen Reporting System - Quick Setup

Your **professional-grade citizen reporting system** is ready! Follow these simple steps to run it locally:

---

## 🚀 **3 Terminal Setup**

### **Terminal 1: Frontend (React)**
```bash
# Navigate to project root
# Navigate to your project root directory

# Start the React development server
npm run dev
```
**📱 Opens at:** http://localhost:5174/ (Note: Must be HTTP, not HTTPS)

---

### **Terminal 2: Backend (Flask + Twilio)**
```bash
# Navigate to backend folder
# Navigate to your project's backend folder
cd backend

# Start the Python backend server
py twilio_test.py
```
**🖥️ Runs at:** http://localhost:5000

---

### **Terminal 3: Public Tunnel (ngrok)**
```bash
# Create public HTTPS tunnel (any directory)
# Make sure you've signed up at ngrok.com and added your authtoken
ngrok http 5000
```
**🌐 Gives you:** Public HTTPS URL for Twilio webhooks

---

## 🎯 **Testing Your System**

1. **✅ All 3 terminals running**
2. **📱 Visit:** http://localhost:5174/ to see your dashboard (ensure it's HTTP, not HTTPS)
3. **📞 Configure Twilio:** Use your ngrok HTTPS URL as webhook in Twilio Console
4. **🗺️ Make calls:** Call your Twilio number to create live reports with Google Maps!

---

## 🔧 **What Each Part Does**

- **Frontend (React):** Beautiful dashboard with Google Maps integration
- **Backend (Flask):** Handles phone calls, speech-to-text, location extraction
- **ngrok:** Makes your local server accessible to Twilio for webhooks

---

## 💡 **Pro Tips**

- Keep all 3 terminals open while developing
- If you get "Failed to fetch" errors, ensure both frontend and backend use HTTP (not HTTPS) for local development
- Clear browser cache for localhost if you're getting HTTPS redirects
- Check the Activity section to see all citizen reports
- Reports show real-time on interactive Google Maps
- Status management: new → in_progress → resolved → closed

---

**🎉 Your citizen reporting system is production-ready!**