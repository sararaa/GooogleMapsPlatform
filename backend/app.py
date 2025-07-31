from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import chatbotquery  # This contains the /ask-chatbot route as a Blueprint

# Load environment variables from .env (for Gemini API key, etc.)
load_dotenv()

# Create Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Register routes from chatbotquery.py
app.register_blueprint(chatbotquery.bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
