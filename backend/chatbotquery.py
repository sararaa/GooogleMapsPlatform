


from flask import Blueprint, request, jsonify
import pandas as pd
import google.generativeai as genai
import os

import google.generativeai as genai

genai.configure(api_key="AIzaSyD6x7cS97BIwWh0dIYJ_Zck6Adj22PuBMk")  # Hardcoded okay for now
model = genai.GenerativeModel(model_name="models/gemini-1.5-flash-8b")


# Create the Blueprint
bp = Blueprint('chatbot', __name__)

# Load CSV once on startup
df = pd.read_csv("311_Alerts_Dataset.csv")  
csv_context = df.head(100).to_string(index=False)

@bp.route("/ask-chatbot", methods=["POST"])
def ask_chatbot():
    user_input = request.json.get("message")
    if not user_input:
        return jsonify({"error": "Message required"}), 400

    prompt = f"""
    You are a helpful assistant trained on city work order data. Answer based on the following CSV:

    {csv_context}

    User asked: "{user_input}"
    """

    try:
        response = model.generate_content(prompt)
        return jsonify({"response": response.text})
    except Exception as e:
        print("Gemini error:", e)
        return jsonify({"error": str(e)}), 500

# ✅ DEBUGGING ROUTE — TEST IF GEMINI WORKS AT ALL
@bp.route("/ping", methods=["GET"])
def ping():
    try:
        response = model.generate_content("Hello Gemini!")
        return jsonify({"ok": True, "message": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
