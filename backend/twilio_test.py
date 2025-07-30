# Download the helper library from https://www.twilio.com/docs/python/install
import os
import json
import requests
from datetime import datetime
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
# Find your Account SID and Auth Token at twilio.com/console
# and set the environment variables. See http://twil.io/secure
load_dotenv()  # Loads variables from .env file in project root

# Twilio credentials
account_sid = os.getenv("TWILIO_ACCOUNTSID")
auth_token = os.getenv("TWILIO_AUTHTOKEN")
number = os.getenv("TWILIO_NUMBER")
client = Client(account_sid, auth_token)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# In-memory storage for demo (replace with real database)
citizen_reports = []

@app.route("/", methods=['GET', 'POST'])
def handle_citizen_call():
    """Handle incoming citizen reports via phone calls."""
    resp = VoiceResponse()
    
    # Welcome message
    resp.say(
        "Hello! Thank you for calling the City Report Line. "
        "Please describe the issue you'd like to report after the beep. "
        "Include the location if possible. Press any key when finished.",
        voice='Polly.Amy'
    )
    
    # Record the caller's report
    resp.record(
        timeout=30,
        finish_on_key='#*',
        action='/process_recording',
        method='POST',
        transcribe=True,
        transcribe_callback='/transcription_complete'
    )
    
    return str(resp)

@app.route("/process_recording", methods=['POST'])
def process_recording():
    """Process the recorded message."""
    resp = VoiceResponse()
    
    # Get caller information
    caller_number = request.form.get('From', 'Unknown')
    recording_url = request.form.get('RecordingUrl', '')
    call_sid = request.form.get('CallSid', '')
    
    # Thank the caller
    resp.say(
        "Thank you for your report. We have recorded your message and will investigate the issue. "
        "You may receive a follow-up call if we need additional information.",
        voice='Polly.Amy'
    )
    
    # Store basic call info (transcription will be added later)
    report = {
        'id': call_sid,
        'caller_number': caller_number,
        'recording_url': recording_url,
        'call_time': datetime.now().isoformat(),
        'transcription': 'Processing...',
        'location': 'Location detection in progress',
        'status': 'new',
        'type': 'citizen_report'
    }
    
    citizen_reports.append(report)
    
    return str(resp)

@app.route("/transcription_complete", methods=['POST'])
def transcription_complete():
    """Handle completed transcription."""
    call_sid = request.form.get('CallSid', '')
    transcription_text = request.form.get('TranscriptionText', '')
    
    # Find and update the report
    for report in citizen_reports:
        if report['id'] == call_sid:
            report['transcription'] = transcription_text
            report['location'] = extract_location_from_text(transcription_text)
            
            # Create activity entry for the frontend
            create_activity_entry(report)
            break
    
    return '', 200

def extract_location_from_text(text):
    """Extract location information from transcribed text."""
    # Simple location extraction (enhance with AI/NLP for better results)
    location_keywords = ['street', 'avenue', 'road', 'boulevard', 'lane', 'way', 'drive', 'court']
    words = text.lower().split()
    
    for i, word in enumerate(words):
        if any(keyword in word for keyword in location_keywords):
            # Try to get 2-3 words before and after street name
            start = max(0, i-2)
            end = min(len(words), i+3)
            potential_location = ' '.join(words[start:end])
            return potential_location.title()
    
    # Look for address-like patterns
    import re
    address_pattern = r'\b\d+\s+[A-Za-z\s]+(?:street|avenue|road|boulevard|lane|way|drive|court)\b'
    matches = re.findall(address_pattern, text, re.IGNORECASE)
    if matches:
        return matches[0].title()
    
    return "Location not specified"

def create_activity_entry(report):
    """Create an activity entry for the frontend dashboard."""
    activity = {
        'id': f"citizen_report_{report['id']}",
        'type': 'citizen_report',
        'title': 'Citizen Report Received',
        'description': f"Phone report: {report['transcription'][:100]}{'...' if len(report['transcription']) > 100 else ''}",
        'location': report['location'],
        'caller_number': report['caller_number'],
        'recording_url': report['recording_url'],
        'full_transcription': report['transcription'],
        'timestamp': report['call_time'],
        'status': 'new',
        'priority': determine_priority(report['transcription']),
        'coordinates': geocode_location(report['location'])  # You'd implement this
    }
    
    # Here you would save to your actual database
    # For now, we'll store in memory and provide an API endpoint
    print(f"New citizen report created: {activity}")
    return activity

def determine_priority(transcription):
    """Determine priority based on transcription content.""" 
    urgent_keywords = ['emergency', 'dangerous', 'urgent', 'broken', 'flooding', 'fire', 'accident']
    high_keywords = ['pothole', 'traffic light', 'stop sign', 'water', 'gas leak']
    
    text_lower = transcription.lower()
    
    if any(keyword in text_lower for keyword in urgent_keywords):
        return 'urgent'
    elif any(keyword in text_lower for keyword in high_keywords):
        return 'high'
    else:
        return 'medium'

def geocode_location(location_text):
    """Convert location text to coordinates using Google Maps Geocoding API."""
    if not location_text or location_text == "Location not specified":
        return None
        
    try:
        # Using your existing Google Maps API key
        api_key = 'AIzaSyBZwtfECQcocEuWwXKrzrn-VkwRe_zOPgc'
        base_url = 'https://maps.googleapis.com/maps/api/geocode/json'
        
        params = {
            'address': location_text,
            'key': api_key
        }
        
        response = requests.get(base_url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            
            if data['status'] == 'OK' and data['results']:
                location = data['results'][0]['geometry']['location']
                return {
                    'lat': location['lat'],
                    'lng': location['lng']
                }
            else:
                print(f"Geocoding failed for '{location_text}': {data['status']}")
                
    except Exception as e:
        print(f"Error geocoding location '{location_text}': {e}")
    
    # Fallback to approximate city center if geocoding fails
    return {
        'lat': 40.0,
        'lng': -82.75
    }

@app.route("/api/citizen-reports", methods=['GET'])
def get_citizen_reports():
    """API endpoint to get all citizen reports for the frontend."""
    return jsonify(citizen_reports)

@app.route("/api/citizen-reports/<report_id>", methods=['GET'])
def get_citizen_report(report_id):
    """Get a specific citizen report."""
    for report in citizen_reports:
        if report['id'] == report_id:
            return jsonify(report)
    return jsonify({'error': 'Report not found'}), 404

@app.route("/api/citizen-reports/<report_id>/status", methods=['PUT'])
def update_report_status(report_id):
    """Update the status of a citizen report."""
    new_status = request.json.get('status')
    
    for report in citizen_reports:
        if report['id'] == report_id:
            report['status'] = new_status
            return jsonify(report)
    
    return jsonify({'error': 'Report not found'}), 404

if __name__ == "__main__":
    print(f"Citizen Report Line ready!")
    print(f"Phone number: {number}")
    print(f"Webhook URL: Configure your Twilio phone number to point to this server")
    app.run(debug=True, port=5000)