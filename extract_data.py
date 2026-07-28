import json
import os
import sys

# Load the first 20 questions
mock3_file = r"d:\KVJ Analytics Internship\KVJ Python Quiz\Quiz DD\KVJ Analytics\Quiz DD\mock3_1_20.json"
with open(mock3_file, "r", encoding="utf-8") as f:
    mock1_first_20 = json.load(f)

# Ensure the IDs are exactly 1-20
for i, q in enumerate(mock1_first_20):
    q["id"] = i + 1

# We need to extract the variants from the inject_mock1_variants.py script.
# We'll just read it by importing it, but since it has execution logic at the bottom that depends on files that might not exist,
# we should safely parse it.
variants_file = r"d:\KVJ Analytics Internship\KVJ Python Quiz\Quiz DD\KVJ Analytics\Quiz DD\inject_mock1_variants.py"
with open(variants_file, "r", encoding="utf-8") as f:
    code = f.read()

# Isolate the `variants = [...]` part and `exec` it securely in our namespace.
# Find the start of `variants = [` and the end before the open file call.
start_idx = code.find("variants = [")
end_idx = code.find("with open(", start_idx)

variants_code = code[start_idx:end_idx]
local_vars = {}
exec(variants_code, globals(), local_vars)

variants = local_vars["variants"]

# Ensure variants IDs are exactly 21-40
for i, q in enumerate(variants):
    q["id"] = i + 21

full_mock1 = mock1_first_20 + variants

output_dir = r"d:\KVJ Analytics Internship\python-quiz-app\frontend\data"
os.makedirs(output_dir, exist_ok=True)
output_file = os.path.join(output_dir, "mock_test_1_data.json")

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(full_mock1, f, indent=4)

print(f"Successfully generated {output_file} with {len(full_mock1)} questions.")
