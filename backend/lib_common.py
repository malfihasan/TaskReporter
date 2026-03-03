"""
Common library functions for TaskReporter
Handles LLM interactions for task suggestions
"""
import json
from open_router_call import call_with_openrouter

# Default model - can be changed to any OpenRouter supported model
DEFAULT_MODEL = "arcee-ai/trinity-large-preview:free"


def get_task_suggestions(user_task_description: str, model_name: str = DEFAULT_MODEL) -> dict:
    """
    Get 3 task suggestions from LLM based on user's task description.
    
    Args:
        user_task_description: The user's description of their next task
        model_name: The OpenRouter model to use
        
    Returns:
        dict: Contains idea1, idea2, idea3 with task suggestions
    """
    prompt = f"""You are a super agent to help task management. User asking this item as next task. Give me three different ideas for this "{user_task_description}" task. Return as strictly as 3 item json where field names would be "idea1", "idea2" and "idea3". Do not return any other info other than json."""
    
    payload = {
        "messages": [
            {
                "role": "system",
                "content": "You are a task management assistant. Always respond with valid JSON only."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 500
    }
    
    try:
        response = call_with_openrouter(payload, model_name)
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "{}")
        
        # Parse the JSON response
        # Handle case where LLM might wrap JSON in markdown code blocks
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        suggestions = json.loads(content)
        return {
            "success": True,
            "suggestions": suggestions
        }
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": f"Failed to parse LLM response as JSON: {str(e)}",
            "raw_response": content if 'content' in locals() else None
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def create_task_story(selected_idea: str, original_description: str, model_name: str = DEFAULT_MODEL) -> dict:
    """
    Create a detailed task story based on the selected idea.
    
    Args:
        selected_idea: The idea user selected
        original_description: The original task description
        model_name: The OpenRouter model to use
        
    Returns:
        dict: Contains the task story with title and description
    """
    prompt = f"""Based on the original task "{original_description}" and the selected approach "{selected_idea}", create a detailed task story. Return as JSON with fields "title" (short, actionable title) and "description" (2-3 sentences explaining what needs to be done). Return only valid JSON."""
    
    payload = {
        "messages": [
            {
                "role": "system",
                "content": "You are a task management assistant. Always respond with valid JSON only."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 300
    }
    
    try:
        response = call_with_openrouter(payload, model_name)
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "{}")
        
        # Parse the JSON response
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        task_story = json.loads(content)
        return {
            "success": True,
            "task": task_story
        }
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": f"Failed to parse LLM response as JSON: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
