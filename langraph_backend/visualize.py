from IPython.display import Image, display
from main import create_agent_workflow

def visualize_workflow():
    # Get the workflow
    workflow = create_agent_workflow()
    
    # Get the graph representation
    graph = workflow.get_graph()
    
    # Generate and print Mermaid diagram
    print("\nMermaid Diagram Syntax:")
    print("```mermaid")
    print("%%{init: {'flowchart': {'curve': 'linear'}}}%%")
    mermaid = graph.draw_mermaid()
    print(mermaid)
    print("```")
    
    try:
        # Try to generate PNG using Mermaid.ink API
        png_bytes = graph.draw_mermaid_png()
        
        # Save the PNG if generation was successful
        with open("mlb_agent_workflow.png", "wb") as f:
            f.write(png_bytes)
        print("\nWorkflow visualization saved as 'mlb_agent_workflow.png'")
    except Exception as e:
        print("\nNote: Could not generate PNG. You can copy the Mermaid syntax above")
        print("and paste it into https://mermaid.live to generate an image.")
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    visualize_workflow() 