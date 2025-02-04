from fastapi import FastAPI, HTTPException, Request
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Annotated, TypedDict, Literal, Dict, Any, AsyncGenerator
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from langgraph.graph.message import add_messages
import logging
from langchain_openai import ChatOpenAI
import json
from datetime import datetime
import asyncio
from queue import Queue
from threading import Thread
from langgraph.graph import Graph
from langgraph.agent import Agent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("MLB_Agent")

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="MLB Data Agent API", version="1.0.0")

# Initialize Gemini with retry logic
def create_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-pro",
        temperature=0,
        top_p=1,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

llm = create_llm()

# Configure requests session with retry logic
session = requests.Session()
retries = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[500, 502, 503, 504]
)
session.mount('http://', HTTPAdapter(max_retries=retries))
session.mount('https://', HTTPAdapter(max_retries=retries))

# MLB API Base URLs
MLB_API_BASE_V1 = "https://statsapi.mlb.com/api/v1"
MLB_API_BASE_V1_1 = "https://statsapi.mlb.com/api/v1.1"

# Define the state
class AgentState(TypedDict):
    query: str
    messages: Annotated[list, add_messages]
    tools_output: List[Dict[str, Any]]
    final_answer: Optional[str]

# API Models
class QueryRequest(BaseModel):
    query: str = Field(description="The user's query about MLB data")
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "query": "What's the MLB schedule for the 2024 season?"
                },
                {
                    "query": "Show me Shohei Ohtani's pitching stats for the 2023 season"
                },
                {
                    "query": "What's the box score for the Dodgers game today?"
                },
                {
                    "query": "Show me the play-by-play for the 3rd inning of yesterday's Yankees game"
                },
                {
                    "query": "What were the win probabilities in the 9th inning of the World Series Game 7?"
                },
                {
                    "query": "Get me advanced metrics for Mike Trout's performance in the last game"
                },
                {
                    "query": "Who were the pitchers in the game decisions for the Cubs vs Cardinals game?"
                },
                {
                    "query": "Show me the line score for the Astros vs Rangers game"
                }
            ]
        }
    }

class QueryResponse(BaseModel):
    answer: str = Field(description="The agent's response to the query")
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "answer": "Here is the MLB schedule for the 2024 season..."
                }
            ]
        }
    }

class ToolOutput(BaseModel):
    tool_name: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    execution_time: float

class NodeExecution(BaseModel):
    node_name: str
    start_time: datetime
    end_time: datetime
    tool_outputs: Optional[List[ToolOutput]] = None
    messages: Optional[List[str]] = None

class DetailedQueryResponse(BaseModel):
    query: str
    final_answer: str
    execution_steps: List[NodeExecution]
    total_execution_time: float
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "query": "What's the MLB schedule for the 2024 season?",
                    "final_answer": "Here is the MLB schedule...",
                    "execution_steps": [
                        {
                            "node_name": "analyze_query",
                            "start_time": "2024-02-03T12:00:00",
                            "end_time": "2024-02-03T12:00:01",
                            "messages": ["Analyzing query for tool selection"]
                        }
                    ],
                    "total_execution_time": 1.5
                }
            ]
        }
    }

class DetailedAgentState(TypedDict):
    query: str
    messages: List[str]
    tools_output: List[Dict[str, Any]]
    final_answer: Optional[str]
    player_id: Optional[str]
    team_id: Optional[str]
    game_pk: Optional[str]
    execution_steps: List[Dict[str, Any]]
    start_time: datetime

# Tool definitions with proper node structure
class MLBTools:
    @staticmethod
    @tool("get_live_game_data", return_direct=True)
    def get_live_game_data(tool_input: str) -> dict:
        """Get live game data from MLB API
        Args:
            tool_input: JSON string containing:
                game_pk: Unique identifier for the game
                timecode: Optional timestamp in format yyyymmdd_###### for historical data
        """
        params = json.loads(tool_input)
        game_pk = params.get("game_pk")
        timecode = params.get("timecode")
        
        logger.info(f"Fetching live game data for game_pk: {game_pk}")
        base_url = f"{MLB_API_BASE_V1_1}/game/{game_pk}/feed/live"
        url = f"{base_url}?timecode={timecode}" if timecode else base_url
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Live game data fetched successfully for game_pk: {game_pk}")
        return response.json()

    @staticmethod
    @tool("get_season_schedule", return_direct=True)
    def get_season_schedule(tool_input: str) -> dict:
        """Get MLB season schedule
        Args:
            tool_input: JSON string containing:
                season: Year of the season
                game_type: Type of game (R=Regular Season, P=Postseason, S=Spring Training)
                sportId: Sport ID (1 for MLB)
                date: Specific date in MM/DD/YYYY format
                hydrate: Additional data to include (e.g., 'team,stats')
        """
        params = json.loads(tool_input)
        season = params.get("season")
        game_type = params.get("game_type", "R")
        sportId = params.get("sportId", "1")
        date = params.get("date")
        hydrate = params.get("hydrate")
        
        logger.info(f"Fetching season schedule for {season}, game type: {game_type}")
        url = f"{MLB_API_BASE_V1}/schedule?sportId={sportId}&season={season}&gameType={game_type}"
        if date:
            url += f"&date={date}"
        if hydrate:
            url += f"&hydrate={hydrate}"
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Season schedule fetched successfully for {season}")
        return response.json()

    @staticmethod
    @tool("get_team_roster", return_direct=True)
    def get_team_roster(tool_input: str) -> dict:
        """Get team roster for a specific season
        Args:
            tool_input: JSON string containing:
                team_id: Unique identifier for the team (e.g., 119 for LA Dodgers)
                season: Year of the season
                hydrate: Additional data to include (e.g., 'person,stats')
        """
        params = json.loads(tool_input)
        team_id = params.get("team_id")
        season = params.get("season")
        hydrate = params.get("hydrate")
        
        logger.info(f"Fetching team roster for team_id: {team_id}, season: {season}")
        url = f"{MLB_API_BASE_V1}/teams/{team_id}/roster?season={season}"
        if hydrate:
            url += f"&hydrate={hydrate}"
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Team roster fetched successfully for team_id: {team_id}")
        return response.json()

    @staticmethod
    @tool("get_team_info", return_direct=True)
    def get_team_info(tool_input: str) -> dict:
        """Get detailed information about a team
        Args:
            tool_input: JSON string containing:
                team_id: Unique identifier for the team (e.g., 119 for LA Dodgers)
                season: Optional year to get team info for a specific season
        """
        params = json.loads(tool_input)
        team_id = params.get("team_id")
        season = params.get("season")
        
        logger.info(f"Fetching team info for team_id: {team_id}")
        url = f"{MLB_API_BASE_V1}/teams/{team_id}"
        if season:
            url += f"?season={season}"
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Team info fetched successfully for team_id: {team_id}")
        return response.json()

    @staticmethod
    @tool("get_player_info", return_direct=True)
    def get_player_info(tool_input: str) -> dict:
        """Get detailed information about a player
        Args:
            tool_input: JSON string containing:
                player_id: Unique identifier for the player (e.g., 660271 for Shohei Ohtani)
                season: Optional year to get player info for a specific season
        """
        params = json.loads(tool_input)
        player_id = params.get("player_id")
        season = params.get("season")
        
        logger.info(f"Fetching player info for player_id: {player_id}")
        url = f"{MLB_API_BASE_V1}/people/{player_id}"
        if season:
            url += f"?season={season}"
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Player info fetched successfully for player_id: {player_id}")
        return response.json()

    @staticmethod
    @tool("get_game_boxscore", return_direct=True)
    def get_game_boxscore(tool_input: str) -> dict:
        """Get detailed boxscore information for a specific game
        Args:
            tool_input: JSON string containing:
                game_pk: Unique identifier for the game
                timecode: Optional timestamp in format yyyymmdd_###### for historical data
        """
        params = json.loads(tool_input)
        game_pk = params.get("game_pk")
        timecode = params.get("timecode")
        
        logger.info(f"Fetching boxscore for game_pk: {game_pk}")
        url = f"{MLB_API_BASE_V1_1}/game/{game_pk}/boxscore"
        if timecode:
            url += f"?timecode={timecode}"
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Boxscore fetched successfully for game_pk: {game_pk}")
        return response.json()

    @staticmethod
    @tool("get_game_linescore", return_direct=True)
    def get_game_linescore(tool_input: str) -> dict:
        """Get linescore information for a specific game
        Args:
            tool_input: JSON string containing:
                game_pk: Unique identifier for the game
                timecode: Optional timestamp in format yyyymmdd_###### for historical data
        """
        params = json.loads(tool_input)
        game_pk = params.get("game_pk")
        timecode = params.get("timecode")
        
        logger.info(f"Fetching linescore for game_pk: {game_pk}")
        url = f"{MLB_API_BASE_V1_1}/game/{game_pk}/linescore"
        if timecode:
            url += f"?timecode={timecode}"
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Linescore fetched successfully for game_pk: {game_pk}")
        return response.json()

    @staticmethod
    @tool("get_game_plays", return_direct=True)
    def get_game_plays(tool_input: str) -> dict:
        """Get detailed play-by-play information for a specific game
        Args:
            tool_input: JSON string containing:
                game_pk: Unique identifier for the game
                timecode: Optional timestamp in format yyyymmdd_###### for historical data
                inning: Optional specific inning to retrieve
                top_bottom: Optional 'top' or 'bottom' of inning
        """
        params = json.loads(tool_input)
        game_pk = params.get("game_pk")
        timecode = params.get("timecode")
        inning = params.get("inning")
        top_bottom = params.get("top_bottom")
        
        logger.info(f"Fetching plays for game_pk: {game_pk}")
        url = f"{MLB_API_BASE_V1_1}/game/{game_pk}/plays"
        params = []
        if timecode:
            params.append(f"timecode={timecode}")
        if inning:
            params.append(f"inning={inning}")
        if top_bottom:
            params.append(f"topBottom={top_bottom}")
        if params:
            url += "?" + "&".join(params)
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Plays fetched successfully for game_pk: {game_pk}")
        return response.json()

    @staticmethod
    @tool("get_player_stats", return_direct=True)
    def get_player_stats(tool_input: str) -> dict:
        """Get detailed statistics for a specific player
        Args:
            tool_input: JSON string containing:
                player_id: Unique identifier for the player
                season: Optional year to get stats for a specific season
                group: Optional stat group (hitting, pitching, fielding)
                game_type: Optional type of games (R=Regular Season, P=Postseason, S=Spring Training)
        """
        params = json.loads(tool_input)
        player_id = params.get("player_id")
        season = params.get("season")
        group = params.get("group")
        game_type = params.get("game_type", "R")
        
        logger.info(f"Fetching stats for player_id: {player_id}")
        url = f"{MLB_API_BASE_V1}/people/{player_id}/stats"
        query_params = []
        if season:
            query_params.append(f"season={season}")
        if group:
            query_params.append(f"group={group}")
        if game_type:
            query_params.append(f"gameType={game_type}")
        if query_params:
            url += "?" + "&".join(query_params)
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Stats fetched successfully for player_id: {player_id}")
        return response.json()

    @staticmethod
    @tool("get_game_timestamps", return_direct=True)
    def get_game_timestamps(tool_input: str) -> dict:
        """Get list of available timestamps for a specific game
        Args:
            tool_input: JSON string containing:
                game_pk: Unique identifier for the game
        """
        params = json.loads(tool_input)
        game_pk = params.get("game_pk")
        
        logger.info(f"Fetching timestamps for game_pk: {game_pk}")
        url = f"{MLB_API_BASE_V1_1}/game/{game_pk}/feed/live/timestamps"
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Timestamps fetched successfully for game_pk: {game_pk}")
        return response.json()

    @staticmethod
    @tool("get_game_decisions", return_direct=True)
    def get_game_decisions(tool_input: str) -> dict:
        """Get game decisions (winning/losing pitcher, save) for a specific game
        Args:
            tool_input: JSON string containing:
                game_pk: Unique identifier for the game
        """
        params = json.loads(tool_input)
        game_pk = params.get("game_pk")
        
        logger.info(f"Fetching decisions for game_pk: {game_pk}")
        url = f"{MLB_API_BASE_V1_1}/game/{game_pk}/decisions"
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Decisions fetched successfully for game_pk: {game_pk}")
        return response.json()

    @staticmethod
    @tool("get_game_contextMetrics", return_direct=True)
    def get_game_contextMetrics(tool_input: str) -> dict:
        """Get advanced metrics and context for a specific game
        Args:
            tool_input: JSON string containing:
                game_pk: Unique identifier for the game
                timecode: Optional timestamp in format yyyymmdd_###### for historical data
        """
        params = json.loads(tool_input)
        game_pk = params.get("game_pk")
        timecode = params.get("timecode")
        
        logger.info(f"Fetching context metrics for game_pk: {game_pk}")
        url = f"{MLB_API_BASE_V1_1}/game/{game_pk}/contextMetrics"
        if timecode:
            url += f"?timecode={timecode}"
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Context metrics fetched successfully for game_pk: {game_pk}")
        return response.json()

    @staticmethod
    @tool("get_game_winProbability", return_direct=True)
    def get_game_winProbability(tool_input: str) -> dict:
        """Get win probability metrics for a specific game
        Args:
            tool_input: JSON string containing:
                game_pk: Unique identifier for the game
                timecode: Optional timestamp in format yyyymmdd_###### for historical data
        """
        params = json.loads(tool_input)
        game_pk = params.get("game_pk")
        timecode = params.get("timecode")
        
        logger.info(f"Fetching win probability for game_pk: {game_pk}")
        url = f"{MLB_API_BASE_V1_1}/game/{game_pk}/winProbability"
        if timecode:
            url += f"?timecode={timecode}"
        response = session.get(url)
        response.raise_for_status()
        logger.info(f"Win probability fetched successfully for game_pk: {game_pk}")
        return response.json()

    @staticmethod
    @tool("search_player", return_direct=True)
    def search_player(tool_input: str) -> dict:
        """Search for a player by name
        Args:
            tool_input: JSON string containing:
                name: Player name to search for (e.g., 'Shohei Ohtani')
        """
        params = json.loads(tool_input)
        name = params.get("name")
        
        logger.info(f"Searching for player: {name}")
        url = f"{MLB_API_BASE_V1}/people/search"
        response = session.get(url, params={"names": name})
        response.raise_for_status()
        logger.info(f"Player search completed for: {name}")
        return response.json()

    @staticmethod
    @tool("search_teams", return_direct=True)
    def search_teams(tool_input: str) -> dict:
        """Get list of all MLB teams or search for specific teams
        Args:
            tool_input: JSON string containing:
                season: Optional year to get teams for a specific season
                sportId: Optional sport ID (default: 1 for MLB)
                activeStatus: Optional boolean to filter active/inactive teams
        """
        params = json.loads(tool_input)
        season = params.get("season")
        sportId = params.get("sportId", "1")
        activeStatus = params.get("activeStatus")
        
        logger.info("Fetching teams list")
        url = f"{MLB_API_BASE_V1}/teams"
        query_params = []
        if season:
            query_params.append(f"season={season}")
        if sportId:
            query_params.append(f"sportId={sportId}")
        if activeStatus is not None:
            query_params.append(f"activeStatus={str(activeStatus).lower()}")
        if query_params:
            url += "?" + "&".join(query_params)
        response = session.get(url)
        response.raise_for_status()
        logger.info("Teams list fetched successfully")
        return response.json()

# Add a global event queue for streaming
event_queue = Queue()

class StreamEvent(BaseModel):
    event_type: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.now)

async def event_generator(request: Request) -> AsyncGenerator[str, None]:
    """Generate SSE events for streaming."""
    while True:
        if await request.is_disconnected():
            logger.info("Client disconnected")
            break

        try:
            # Non-blocking check for new events
            try:
                event = event_queue.get_nowait()
                yield json.dumps({
                    "event": event.event_type,
                    "data": {
                        "timestamp": event.timestamp.isoformat(),
                        **event.data
                    }
                })
            except:
                await asyncio.sleep(0.1)  # Small delay to prevent CPU overuse
        except Exception as e:
            logger.error(f"Error in event generator: {str(e)}")
            break

def create_workflow() -> Graph:
    """Create the workflow graph for the MLB Data Agent"""
    workflow = Graph()

    # Define the workflow nodes
    workflow.add_node("start", start)
    workflow.add_node("should_use_tool", should_use_tool)
    
    # Add tool execution nodes
    tools_map = {
        "get_live_game_data": execute_live_game_data,
        "get_season_schedule": execute_season_schedule,
        "get_team_roster": execute_team_roster,
        "get_team_info": execute_team_info,
        "get_player_info": execute_player_info,
        "get_game_boxscore": execute_game_boxscore,
        "get_game_linescore": execute_game_linescore,
        "get_game_plays": execute_game_plays,
        "get_player_stats": execute_player_stats,
        "get_game_timestamps": execute_game_timestamps,
        "get_game_decisions": execute_game_decisions,
        "get_game_contextMetrics": execute_game_contextMetrics,
        "get_game_winProbability": execute_game_winProbability,
        "search_player": execute_search_player,
        "search_teams": execute_search_teams,
        "generate_response": generate_response
    }
    
    for node_name, node_func in tools_map.items():
        workflow.add_node(node_name, node_func)

    # Add edges
    workflow.add_edge("start", "should_use_tool")
    
    # Connect tool selection to execution
    for tool_name in tools_map.keys():
        workflow.add_edge("should_use_tool", tool_name)
        if tool_name != "generate_response":
            workflow.add_edge(tool_name, "should_use_tool")  # Allow chaining tools
        workflow.add_edge(tool_name, "generate_response")    # All tools can lead to response

    workflow.add_edge("generate_response", END)

    return workflow

def create_agent() -> Agent:
    """Create the MLB Data Agent"""
    workflow = create_workflow()
    
    return Agent(
        workflow,
        DetailedAgentState(
            query="",
            messages=[],
            tools_output=[],
            final_answer=None,
            player_id=None,
            team_id=None,
            game_pk=None,
            execution_steps=[],
            start_time=datetime.now()
        )
    )

# Initialize streaming agent workflow
streaming_agent_workflow = create_agent()

@app.post("/query/stream")
async def stream_query(request: Request, query_request: QueryRequest):
    """Stream the query processing steps in real-time"""
    try:
        logger.info(f"Received streaming query: {query_request.query}")
        
        # Clear the event queue
        while not event_queue.empty():
            event_queue.get()
        
        # Start workflow execution in a separate thread
        def execute_workflow():
            try:
                start_time = datetime.now()
                result = streaming_agent_workflow.invoke({
                    "query": query_request.query,
                    "messages": [],
                    "tools_output": [],
                    "final_answer": None,
                    "execution_steps": [],
                    "start_time": start_time
                })
                
                # Stream workflow completion event
                event_queue.put(StreamEvent(
                    event_type="workflow_complete",
                    data={
                        "final_answer": result["final_answer"],
                        "total_execution_time": (datetime.now() - start_time).total_seconds()
                    }
                ))
            except Exception as e:
                logger.error(f"Error in workflow execution: {str(e)}")
                event_queue.put(StreamEvent(
                    event_type="workflow_error",
                    data={"error": str(e)}
                ))
        
        # Start workflow execution thread
        Thread(target=execute_workflow).start()
        
        # Return SSE response
        return EventSourceResponse(event_generator(request))
    except Exception as e:
        logger.error(f"Error setting up streaming: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    logger.info("Starting MLB Data Agent API")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 