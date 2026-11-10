import sys
from pathlib import Path

# Add backend directory and root verisight directory to sys.path
backend_dir = Path(__file__).resolve().parent
verisight_dir = backend_dir.parent

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(verisight_dir) not in sys.path:
    sys.path.insert(0, str(verisight_dir))
