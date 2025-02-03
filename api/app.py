from flask import Flask, jsonify, request
from flask_cors import CORS
from pybaseball import statcast
from datetime import datetime, timedelta
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def process_baseball_stats(data):
    # Process and clean the data
    processed_stats = []
    
    for _, row in data.iterrows():
        # Helper function to handle NaN values
        def clean_value(value):
            if pd.isna(value) or pd.isnull(value):
                return None
            return value

        stat = {
            'game_date': row.get('game_date', '').strftime('%Y-%m-%d') if pd.notnull(row.get('game_date')) else None,
            'player_name': clean_value(row.get('player_name', '')),
            'pitch_type': clean_value(row.get('pitch_type', '')),
            'release_speed': float(row.get('release_speed')) if pd.notnull(row.get('release_speed')) else None,
            'effective_speed': float(row.get('effective_speed')) if pd.notnull(row.get('effective_speed')) else None,
            'strikes': int(row.get('strikes', 0)) if pd.notnull(row.get('strikes')) else 0,
            'balls': int(row.get('balls', 0)) if pd.notnull(row.get('balls')) else 0,
            'inning': int(row.get('inning', 0)) if pd.notnull(row.get('inning')) else 0,
            'stand': clean_value(row.get('stand', '')),
            'hit_distance_sc': float(row.get('hit_distance_sc')) if pd.notnull(row.get('hit_distance_sc')) else None,
            'hit_speed': float(row.get('launch_speed')) if pd.notnull(row.get('launch_speed')) else None,
            'events': clean_value(row.get('events', '')),
            'description': clean_value(row.get('description', '')),
            'zone': int(row.get('zone', 0)) if pd.notnull(row.get('zone')) else None,
            'home_team': clean_value(row.get('home_team', '')),
            'away_team': clean_value(row.get('away_team', '')),
            'home_score': int(row.get('home_score', 0)) if pd.notnull(row.get('home_score')) else 0,
            'away_score': int(row.get('away_score', 0)) if pd.notnull(row.get('away_score')) else 0
        }
        processed_stats.append(stat)
    
    return processed_stats

@app.route('/api/baseball-stats', methods=['GET'])
def get_baseball_stats():
    try:
        # Use 2023 season data as default (since 2024 season hasn't started yet)
        default_end_date = "2023-10-01"  # End of 2023 regular season
        default_start_date = "2023-09-24"  # A week before the end of season
        
        # Get date parameters or use defaults
        end_date = request.args.get('end_date', default_end_date)
        start_date = request.args.get('start_date', default_start_date)
        
        print(f"Fetching data from {start_date} to {end_date}")
        
        # Fetch data using pybaseball
        data = statcast(start_dt=start_date, end_dt=end_date)
        
        if data is None or data.empty:
            return jsonify({
                'error': 'No data available for the specified date range',
                'start_date': start_date,
                'end_date': end_date
            }), 404
        
        # Process the data
        processed_stats = process_baseball_stats(data)
        
        return jsonify({
            'data': processed_stats,
            'metadata': {
                'start_date': start_date,
                'end_date': end_date,
                'total_records': len(processed_stats)
            }
        })
        
    except Exception as e:
        print(f"Error fetching stats: {str(e)}")
        return jsonify({
            'error': str(e),
            'message': 'Failed to fetch baseball statistics'
        }), 500

@app.route('/api/pitch-types', methods=['GET'])
def get_pitch_types():
    try:
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        
        data = statcast(start_dt=start_date, end_dt=end_date)
        pitch_types = data['pitch_type'].unique().tolist()
        
        return jsonify({
            'pitch_types': [pt for pt in pitch_types if pd.notnull(pt)]
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to fetch pitch types'
        }), 500

@app.route('/api/player-stats', methods=['GET'])
def get_player_stats():
    try:
        player_name = request.args.get('player_name')
        if not player_name:
            return jsonify({'error': 'Player name is required'}), 400
            
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        data = statcast(start_dt=start_date, end_dt=end_date)
        player_data = data[data['player_name'] == player_name]
        
        if player_data.empty:
            return jsonify({'error': 'No data found for the specified player'}), 404
            
        stats = {
            'player_name': player_name,
            'games_played': len(player_data['game_date'].unique()),
            'avg_pitch_speed': player_data['release_speed'].mean(),
            'total_pitches': len(player_data),
            'strikes': len(player_data[player_data['type'] == 'S']),
            'balls': len(player_data[player_data['type'] == 'B']),
            'hit_stats': {
                'avg_hit_distance': player_data['hit_distance_sc'].mean(),
                'avg_launch_speed': player_data['launch_speed'].mean(),
                'total_hits': len(player_data[player_data['events'].isin(['single', 'double', 'triple', 'home_run'])])
            }
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to fetch player statistics'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 