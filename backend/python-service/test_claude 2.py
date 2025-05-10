import os
from dotenv import load_dotenv
import anthropic
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_claude():
    # Load environment variables
    load_dotenv()
    
    # Get API key
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
    if not anthropic_api_key:
        logger.error("ANTHROPIC_API_KEY environment variable is not set!")
        return
    
    # Initialize client
    logger.info("Initializing Anthropic client...")
    client = anthropic.Anthropic(api_key=anthropic_api_key)
    
    try:
        # Test prompt
        test_transcript = "This is a test transcript. We want to make sure Claude can generate a summary from it."
        prompt = "Please provide a concise summary of the following transcript:\n\n" + test_transcript
        
        logger.info("Testing Claude API...")
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=150,
            temperature=0.7,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        logger.info("Success! Got response from Claude:")
        print("\nResponse: " + response.content[0].text)
    except Exception as e:
        logger.error("Error testing Claude: " + str(e))

if __name__ == "__main__":
    test_claude() 