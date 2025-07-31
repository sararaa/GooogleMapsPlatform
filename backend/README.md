# Citizen Reporting System - Backend

This backend system handles incoming Twilio phone calls from citizens reporting city issues like potholes, traffic problems, etc. The system automatically transcribes speech to text using Whisper AI, processes the content with Gemini AI for location and incident extraction, and creates activity entries for the frontend dashboard.

## Features

- **Voice Call Handling**: Receives and processes incoming citizen reports via phone
- **Speech-to-Text**: Automatically transcribes caller reports using Twilio's transcription service  
- **Location Extraction**: Uses NLP to extract location information from transcribed text
- **Priority Detection**: Automatically assigns priority levels based on keywords
- **REST API**: Provides endpoints for frontend integration
- **Real-time Updates**: Supports status updates and report management

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Server**:
   ```bash
   python twilio_test.py
   ```

3. **Configure Twilio Webhook**:
   - In your Twilio Console, configure your phone number's webhook URL to point to your server
   - For local development, use ngrok: `ngrok http 5000`
   - Set webhook URL to: `https://your-ngrok-url.ngrok.io/`

## API Endpoints

### GET /api/citizen-reports
Get all citizen reports

### GET /api/citizen-reports/{report_id}  
Get a specific citizen report

### PUT /api/citizen-reports/{report_id}/status
Update the status of a citizen report
```json
{
  "status": "new" | "in_progress" | "resolved" | "closed"
}
```

## How It Works

1. **Citizen calls** the Twilio phone number
2. **System greets** caller and asks them to describe the issue
3. **Call is recorded** and transcription begins automatically
4. **Location extraction** attempts to find address/location from speech
5. **Priority assignment** based on keywords (emergency, dangerous, etc.)
6. **Report creation** in the system with all details
7. **Frontend notification** via polling API calls

## Webhook Flow

```
Twilio Phone Call → handle_citizen_call() → process_recording() → transcription_complete()
                                                                           ↓
Frontend Dashboard ← create_activity_entry() ← extract_location_from_text()
```

## Priority Levels

- **Urgent**: emergency, dangerous, urgent, broken, flooding, fire, accident
- **High**: pothole, traffic light, stop sign, water, gas leak  
- **Medium**: all other reports

## Integration Notes

- Replace `geocode_location()` with actual Google Maps Geocoding API
- Implement proper database storage instead of in-memory storage
- Add authentication/security for production use
- Consider adding SMS confirmations to citizens
- Implement callback functionality for follow-up questions