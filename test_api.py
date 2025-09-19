import openai
import os

# Option 1: Set API key directly
openai.api_key = "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"
try:
    models = openai.Model.list()
    print("API key is valid. Available models:")
    for model in models.data:
        print(f"- {model.id}")
except Exception as e:
    print(f"API key is NOT working. Error: {e}")