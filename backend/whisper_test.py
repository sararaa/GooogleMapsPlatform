import os
import time
import numpy as np
import sounddevice as sd
import queue
from faster_whisper import WhisperModel
from google import genai  # Updated import for google-genai
from geocode_test import geocode_location
from dotenv import load_dotenv  # For loading .env
from supabase import create_client, Client  # Supabase integration

load_dotenv()  # Loads variables from .env file in project root

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use service role key for database writes
TRANSCRIBE_SECONDS = 10
SAMPLE_RATE = 16000
BLOCKSIZE = 4000
MODEL_SIZE = "large"

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

q = queue.Queue()

def audio_callback(indata, frames, time, status):
    q.put(indata.copy())

def transcribe_for_seconds(seconds=10):
    model = WhisperModel(MODEL_SIZE, compute_type="int8")
    buffer = np.empty((0,), dtype=np.float32)
    start_time = time.time()
    # this is the syntax for taking in input, needs to be chunked and such
    with sd.InputStream(callback=audio_callback, samplerate=SAMPLE_RATE, channels=1, blocksize=BLOCKSIZE):
        print(f"🎙️ Listening for {seconds} seconds...")
        while time.time() - start_time < seconds:
            try:
                audio_chunk = q.get(timeout=seconds)
                buffer = np.concatenate((buffer, audio_chunk.flatten()))
            except queue.Empty:
                break
    print("Transcribing...")
    segments, _ = model.transcribe(buffer, language="en")
    full_text = " ".join(seg.text.strip() for seg in segments)
    print(f"Transcript: {full_text}")
    return full_text

def extract_address_and_incident_from_text(text):
    # The client gets the API key from the environment variable `GEMINI_API_KEY`.
    client = genai.Client()
    prompt = (
        "Extract the address and incident type from the following text. "
        "Reply in this exact format: ADDRESS|INCIDENT_TYPE\n"
        "For example: '123 Main St, City, State|pothole' or '456 Oak Ave|broken streetlight'\n"
        "If no address is found, reply with: NO_ADDRESS|NO_INCIDENT\n\nText: " + text
    )
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    
    if hasattr(response, 'text') and response.text is not None:
        result = response.text.strip()
        print(f"Gemini response: {result}")
        
        # Parse the response
        if '|' in result and result != "NO_ADDRESS|NO_INCIDENT":
            parts = result.split('|', 1)  # Split on first | only
            if len(parts) == 2:
                address = parts[0].strip()
                incident_type = parts[1].strip()
                return address, incident_type
    
    return None, None

def upload_to_supabase(lat, lng, incident_type, formatted_address):
    if not supabase:
        print("Supabase not configured. Skipping database upload.")
        return False
    
    try:
        # Create geometry point from lat/lng
        point_geometry = f"POINT({lng} {lat})"  # PostGIS format: POINT(longitude latitude)
        
        # Insert into alerts table
        data = {
            "map_point": point_geometry,
            "type": incident_type
        }
        
        result = supabase.table("alerts").insert(data).execute()
        print(f"✅ Uploaded to Supabase: {incident_type} at {formatted_address}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to upload to Supabase: {e}")
        return False


if __name__ == "__main__":
    # Instructions for user
    if not GOOGLE_MAPS_API_KEY or not GEMINI_API_KEY:
        print("Please set GOOGLE_MAPS_API_KEY and GEMINI_API_KEY in your .env file.")
        exit(1)

    transcript = transcribe_for_seconds(TRANSCRIBE_SECONDS)
    address, incident_type = extract_address_and_incident_from_text(transcript)
    
    if not address or not incident_type:
        print("No address or incident type found in the transcript.")
        exit(1)
    
    print(f"Extracted address: {address}")
    print(f"Extracted incident type: {incident_type}")

    geocode = geocode_location(address, GOOGLE_MAPS_API_KEY)
    if not geocode:
        print("Geocoding failed.")
        exit(1)
    print(f"Geocoded: {geocode}")

    # Upload to Supabase
    upload_success = upload_to_supabase(
        geocode['lat'], 
        geocode['lng'], 
        incident_type, 
        geocode['formatted_address']
    )

