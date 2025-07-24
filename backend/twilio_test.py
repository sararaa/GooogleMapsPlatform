# Download the helper library from https://www.twilio.com/docs/python/install
import os
from twilio.rest import Client
from dotenv import load_dotenv
# Find your Account SID and Auth Token at twilio.com/console
# and set the environment variables. See http://twil.io/secure
load_dotenv()  # Loads variables from .env file in project root

account_sid = os.getenv("TWILIO_ACCOUNTSID")
auth_token = os.getenv("TWILIO_AUTHTOKEN")
number = os.getenv("TWILIO_NUMBER")
client = Client(account_sid, auth_token)



from flask import Flask
from twilio.twiml.voice_response import VoiceResponse

app = Flask(__name__)

@app.route("/", methods=['GET', 'POST'])
def answer_call():
    """Respond to incoming phone calls with a brief message."""
    # Start our TwiML response
    resp = VoiceResponse()

    # Read a message aloud to the caller
    resp.say("Thank you for calling! Have a great day.", voice='Polly.Amy')

    return str(resp)

if __name__ == "__main__":
    app.run(debug=True)