from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import os
import asyncio
import httpx
import json
from datetime import datetime
from typing import AsyncGenerator, Dict, Any



# Test queries
TEST_QUERIES = [
    # "What's the MLB schedule for the 2024 season?",
    # "Show me Shohei Ohtani's pitching stats for the 2024 season",
    # "What's the box score for the last Dodgers game?",
    # "Show me the play-by-play for the 3rd inning of yesterday's Yankees game",
    # "What were the win probabilities in the 9th inning of the World Series Game 7?",
    # "Get me advanced metrics for Mike Trout's performance in the last game",
    # "Who were the pitchers in the game decisions for the Cubs vs Cardinals game?",
    "Show me the line score for the Astros vs Rangers game"
]

async def stream_query(client: httpx.AsyncClient, query: str) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream a query to the MLB Data Agent API"""
    url = "http://localhost:8000/query/stream"
    headers = {
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
    }
    data = {"query": query}
    
    try:
        async with client.stream("POST", url, json=data, headers=headers) as response:
            if response.status_code != 200:
                error_msg = await response.aread()
                print(f"Error: {error_msg}")
                return
            
            buffer = ""
            async for line in response.aiter_lines():
                if not line.strip():
                    continue
                    
                buffer += line
                
                try:
                    # Handle SSE format
                    if buffer.startswith("data: "):
                        buffer = buffer[6:]  # Remove "data: " prefix
                    
                    event_data = json.loads(buffer)
                    buffer = ""  # Reset buffer after successful parse
                    
                    # Clean up response formats
                    if "data" in event_data:
                        data = event_data["data"]
                        
                        # Clean message format
                        if "message" in data and isinstance(data["message"], str):
                            if "content='" in data["message"]:
                                data["message"] = data["message"].split("content='")[1].split("' additional_kwargs=")[0]
                        
                        # Clean response format
                        if "response" in data and isinstance(data["response"], str):
                            if "content='" in data["response"]:
                                data["response"] = data["response"].split("content='")[1].split("' additional_kwargs=")[0]
                        
                        # Clean final answer format
                        if "final_answer" in data and isinstance(data["final_answer"], str):
                            if "content='" in data["final_answer"]:
                                data["final_answer"] = data["final_answer"].split("content='")[1].split("' additional_kwargs=")[0]
                    
                    yield event_data
                except json.JSONDecodeError:
                    # If we can't parse the JSON yet, continue buffering
                    continue
                except Exception as e:
                    print(f"Error processing event: {str(e)}")
                    print(f"Event data: {buffer}")
                    buffer = ""  # Reset buffer after error
                    
    except Exception as e:
        print(f"Error streaming query: {str(e)}")
        if hasattr(e, '__context__') and e.__context__:
            print(f"Caused by: {str(e.__context__)}")

async def test_single_query(client: httpx.AsyncClient, query: str):
    """Test a single query and print its streaming results"""
    print(f"\n\nTesting query: {query}")
    print("-" * 80)
    
    start_time = datetime.now()
    try:
        async for event in stream_query(client, query):
            event_type = event.get("event")
            data = event.get("data", {})
            
            # Handle missing timestamp
            timestamp = datetime.now()
            if "timestamp" in data:
                try:
                    timestamp = datetime.fromisoformat(data["timestamp"])
                except (ValueError, TypeError):
                    pass
            
            if event_type == "analysis_start":
                print(f"[{timestamp}] Analysis started: {data.get('message', '')}")
            elif event_type == "analysis_complete":
                print(f"[{timestamp}] Analysis completed: {data.get('message', '')}")
            elif event_type == "routing_decision":
                print(f"[{timestamp}] Routing query: {data.get('query', '')}")
            elif event_type == "tool_start":
                print(f"[{timestamp}] Starting tool: {data.get('tool_name', '')}")
                print(f"Input data: {json.dumps(data.get('input_data', {}), indent=2)}")
            elif event_type == "tool_complete":
                print(f"[{timestamp}] Tool completed: {data.get('tool_name', '')}")
                print(f"Execution time: {data.get('execution_time', 0)}s")
                if "output_data" in data:
                    print(f"Output data: {json.dumps(data['output_data'], indent=2)}")
            elif event_type == "tool_error":
                print(f"[{timestamp}] Tool error: {data.get('error', '')}")
            elif event_type == "response_generation_start":
                print(f"[{timestamp}] Generating response...")
            elif event_type == "response_generation_complete":
                print(f"[{timestamp}] Final response: {data.get('response', '')}")
            elif event_type == "workflow_complete":
                total_time = data.get('total_execution_time', 0)
                print(f"\nWorkflow completed in {total_time}s")
                print(f"Final answer: {data.get('final_answer', '')}")
            elif event_type == "workflow_error":
                print(f"[{timestamp}] Workflow error: {data.get('error', '')}")
            else:
                print(f"[{timestamp}] Unknown event type: {event_type}")
                print(f"Data: {json.dumps(data, indent=2)}")
    except Exception as e:
        print(f"Error in test execution: {str(e)}")
        if hasattr(e, '__context__') and e.__context__:
            print(f"Caused by: {str(e.__context__)}")
    finally:
        end_time = datetime.now()
        print(f"\nTotal test time: {(end_time - start_time).total_seconds()}s")

async def main():
    """Run tests for all example queries"""
    print("Starting MLB Data Agent API Tests")
    print("=" * 80)
    
    # Increase timeout for httpx client
    timeout = httpx.Timeout(30.0, connect=30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        for query in TEST_QUERIES:
            if not query.startswith("#"):  # Skip commented queries
                await test_single_query(client, query)
                await asyncio.sleep(1)  # Small delay between tests

if __name__ == "__main__":
    asyncio.run(main())