#!/usr/bin/env python3
"""
Demo Setup for Citizen Reporting System

This script demonstrates how to test the citizen reporting system with sample data.
Run this after setting up your Twilio webhook to see the system in action.
"""

import requests
import json
from datetime import datetime
import time

# Sample citizen reports for testing
DEMO_REPORTS = [
    {
        'id': 'demo_call_001',
        'type': 'citizen_report',
        'title': 'Citizen Report Received',
        'description': 'Phone report: There is a large pothole on Main Street near the intersection with Oak Avenue. It\'s causing damage to cars and is quite dangerous.',
        'location': 'Main Street Near Oak Avenue',
        'caller_number': '+15551234567',
        'recording_url': 'https://api.twilio.com/demo-recording-1.mp3',
        'full_transcription': 'Hi, I want to report a large pothole on Main Street near the intersection with Oak Avenue. It\'s causing damage to cars and is quite dangerous. Cars are swerving to avoid it. Please fix this as soon as possible.',
        'timestamp': datetime.now().isoformat(),
        'status': 'new',
        'priority': 'high',
        'coordinates': {'lat': 40.0123, 'lng': -82.4567}
    },
    {
        'id': 'demo_call_002', 
        'type': 'citizen_report',
        'title': 'Citizen Report Received',
        'description': 'Phone report: The traffic light at Fifth and Elm is not working properly. It\'s stuck on red and creating traffic backup.',
        'location': 'Fifth Street and Elm Street Intersection',
        'caller_number': '+15559876543',
        'recording_url': 'https://api.twilio.com/demo-recording-2.mp3',
        'full_transcription': 'Hello, the traffic light at Fifth and Elm is not working properly. It\'s been stuck on red for about 20 minutes now and it\'s creating a big traffic backup. Please send someone to look at it.',
        'timestamp': datetime.now().isoformat(),
        'status': 'new',
        'priority': 'high', 
        'coordinates': {'lat': 40.0234, 'lng': -82.4678}
    },
    {
        'id': 'demo_call_003',
        'type': 'citizen_report', 
        'title': 'Citizen Report Received',
        'description': 'Phone report: There are several loose boards on the sidewalk outside the city library. Someone could trip and get hurt.',
        'location': 'City Library Sidewalk',
        'caller_number': '+15555551234',
        'recording_url': 'https://api.twilio.com/demo-recording-3.mp3', 
        'full_transcription': 'I want to report some loose boards on the sidewalk right outside the city library on Second Street. Several of them are sticking up and someone could trip and get hurt. Please fix this before someone gets injured.',
        'timestamp': datetime.now().isoformat(),
        'status': 'new',
        'priority': 'medium',
        'coordinates': {'lat': 40.0345, 'lng': -82.4789}
    }
]

def add_demo_reports(base_url='http://localhost:5000'):
    """Add demo reports to the system for testing."""
    print("🚀 Setting up demo citizen reports...")
    
    # Add each demo report
    for i, report in enumerate(DEMO_REPORTS, 1):
        try:
            # Simulate the backend creating the report
            print(f"📞 Adding demo report {i}: {report['description'][:50]}...")
            
            # In a real system, this would come from Twilio webhook
            # For demo, we'll just print what would happen
            print(f"   📍 Location: {report['location']}")
            print(f"   ⚠️  Priority: {report['priority']}")
            print(f"   📊 Status: {report['status']}")
            print()
            
            time.sleep(1)  # Simulate processing time
            
        except Exception as e:
            print(f"❌ Error adding report {i}: {e}")
    
    print("✅ Demo setup complete!")
    print()
    print("🎯 How to test:")
    print("1. Start the backend server: python twilio_test.py")
    print("2. Start the frontend: npm run dev") 
    print("3. View the Dashboard to see citizen reports")
    print("4. Click on reports to see details and map locations")
    print()
    print("📞 To test with real calls:")
    print("1. Set up ngrok: ngrok http 5000")
    print("2. Configure Twilio webhook URL to your ngrok URL")
    print("3. Call your Twilio number to create real reports")

def test_api_endpoints(base_url='http://localhost:5000'):
    """Test the API endpoints."""
    print("🧪 Testing API endpoints...")
    
    try:
        # Test GET all reports
        response = requests.get(f"{base_url}/api/citizen-reports")
        if response.status_code == 200:
            reports = response.json()
            print(f"✅ GET /api/citizen-reports - Found {len(reports)} reports")
        else:
            print(f"❌ GET /api/citizen-reports - Status: {response.status_code}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server")
        print("   Make sure to run: python twilio_test.py")
    except Exception as e:
        print(f"❌ API test error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🏛️  CITIZEN REPORTING SYSTEM - DEMO SETUP")
    print("=" * 60)
    print()
    
    add_demo_reports()
    test_api_endpoints()
    
    print("=" * 60)
    print("📋 Next Steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Set up .env file with Twilio credentials") 
    print("3. Run backend: python twilio_test.py")
    print("4. Run frontend: npm run dev")
    print("5. Test by calling your Twilio phone number!")
    print("=" * 60)