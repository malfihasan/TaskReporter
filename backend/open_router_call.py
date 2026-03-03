"""
This is a module for providing a function to call the Open Router API with a given payload and model name. It handles the API request, measures the elapsed time, and returns the response as a dictionary.

"""

# libraries
from typing import List
from datetime import datetime
import requests
import json
import os


# Define the Open Router endpoint
OPEN_ROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
#API_KEY = os.getenv("OPENROUTER_API_KEY") ## TODO: set in env variables
API_KEY = "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"

#from settings import OPEN_ROUTER_URL, API_KEY
import time

def call_with_openrouter(
    payload: dict,
    model_name: str
) -> dict:
    """
    Call Open Router API with the given payload and model name.
    
    Args:
        payload (dict): The request payload
        model_name (str): The Open Router model name
        
    Returns:
        dict: The response from Open Router API
    """

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    payload["model"] = model_name
    
    start_time = time.time()

    response = requests.post(OPEN_ROUTER_URL, headers=headers, data=json.dumps(payload))
    end_time = time.time()
    elapsed_time = end_time - start_time
    end_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    print(f" ✓ Done! (Ended at: {end_timestamp}, Elapsed: {elapsed_time:.2f}s)")
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Open Router API error {response.status_code}: {response.text}")
    
