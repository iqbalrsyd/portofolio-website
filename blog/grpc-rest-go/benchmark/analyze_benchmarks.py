#!/usr/bin/env python3
"""
Benchmark Result Analyzer
Processes k6 JSON output and generates comparison tables
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any

def load_k6_json(filepath: str) -> Dict[str, Any]:
    """Load k6 JSON output file"""
    with open(filepath, 'r') as f:
        return json.load(f)

def extract_metrics(data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract key metrics from k6 JSON output"""
    metrics = {}
    
    if 'metrics' in data:
        for metric_name, metric_data in data['metrics'].items():
            if 'values' in metric_data:
                values = metric_data['values']
                if isinstance(values, dict):
                    metrics[metric_name] = values
                elif isinstance(values, list) and len(values) > 0:
                    metrics[metric_name] = values[0]
    
    return metrics

def analyze_scenario(rest_json: str, grpc_json: str, scenario_name: str) -> Dict[str, Any]:
    """Compare REST vs gRPC for a specific scenario"""
    
    print(f"\n{'='*70}")
    print(f"Scenario: {scenario_name}")
    print(f"{'='*70}")
    
    try:
        rest_data = load_k6_json(rest_json)
        grpc_data = load_k6_json(grpc_json)
    except Exception as e:
        print(f"Error loading JSON files: {e}")
        return {}
    
    # Extract metrics
    rest_metrics = extract_metrics(rest_data)
    grpc_metrics = extract_metrics(grpc_data)
    
    # Look for latency metrics
    comparison = {}
    
    print(f"\nREST Metrics:")
    for key, value in rest_metrics.items():
        if 'latency' in key.lower() or 'duration' in key.lower():
            print(f"  {key}: {value}")
            if key not in comparison:
                comparison[key] = {}
            comparison[key]['rest'] = value
    
    print(f"\ngRPC Metrics:")
    for key, value in grpc_metrics.items():
        if 'latency' in key.lower() or 'duration' in key.lower():
            print(f"  {key}: {value}")
            if key not in comparison:
                comparison[key] = {}
            comparison[key]['grpc'] = value
    
    return comparison

def main():
    """Main analysis"""
    print("""
╔════════════════════════════════════════════════════════════════════╗
║  REST vs gRPC Benchmark Analysis Tool                             ║
║  Processes k6 JSON output for performance comparison               ║
╚════════════════════════════════════════════════════════════════════╝
    """)
    
    if len(sys.argv) > 1:
        # Specific timestamp provided
        timestamp = sys.argv[1]
        results_dir = Path(f"benchmark/results/raw_json/{timestamp}")
    else:
        print("Usage: python3 analyze_benchmarks.py <timestamp>")
        print("  Example: python3 analyze_benchmarks.py 20260525_140000")
        sys.exit(1)
    
    if not results_dir.exists():
        print(f"Results directory not found: {results_dir}")
        sys.exit(1)
    
    print(f"Analyzing results from: {results_dir}\n")
    
    # Find JSON files
    json_files = list(results_dir.glob("*.json"))
    if not json_files:
        print(f"No JSON files found in {results_dir}")
        sys.exit(1)
    
    print(f"Found {len(json_files)} benchmark result files:")
    for f in sorted(json_files):
        print(f"  - {f.name}")
    
    # Create summary report
    report_file = results_dir.parent / "analysis" / f"{timestamp}_ANALYSIS_REPORT.txt"
    report_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_file, 'w') as f:
        f.write("REST vs gRPC Benchmark Analysis Report\n")
        f.write("=" * 70 + "\n\n")
        f.write(f"Generated: {timestamp}\n\n")
        
        # Print file list
        f.write("Benchmark Files Analyzed:\n")
        for file in sorted(json_files):
            f.write(f"  - {file.name}\n")
        f.write("\n")
    
    print(f"\nReport written to: {report_file}")

if __name__ == "__main__":
    main()
