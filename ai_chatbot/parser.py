from transformers import pipeline, set_seed
from typing import List, Dict
import re
import json

class LLMParser:
    def __init__(self, model_name="t5-small"):
        """
        Initializes the parser with a text-to-text generation model from Hugging Face.
        """
        try:
            self.pipe = pipeline('text2text-generation', model=model_name)
            set_seed(42)
            self.model_loaded = True
        except Exception as e:
            print(f"Warning: Could not load model {model_name}. LLMParser will be disabled. Error: {e}")
            self.model_loaded = False

    def parse_tasks(self, text: str) -> List[Dict]:
        """
        Uses a T5 model to parse tasks from free text into a structured format.
        Returns a list of dictionaries, e.g., [{'name': 'Laundry', 'hours': 2.0}].
        """
        if not self.model_loaded or not text.strip():
            return []

        prompt = f"""
        Extract tasks and their durations in hours from the following text.
        Provide the output as a list of JSON objects, where each object has a "name" and "hours" key.
        If no duration is mentioned for a task, assume it is 1 hour.

        Text:
        "{text}"

        JSON Output:
        """

        try:
            # Generate text using the model
            llm_output = self.pipe(prompt, max_length=128, num_beams=4, early_stopping=True)[0]['generated_text']

            # The model output can be messy. We need to robustly parse it.
            # It might be a stringified list of dicts, or just the dicts.
            # Find all occurrences of JSON-like objects in the generated string.
            json_objects = re.findall(r'\{.*?\}', llm_output)

            tasks = []
            for obj_str in json_objects:
                try:
                    task = json.loads(obj_str)
                    if 'name' in task and 'hours' in task:
                        # Ensure hours is a float
                        task['hours'] = float(task['hours'])
                        tasks.append(task)
                except (json.JSONDecodeError, TypeError):
                    # Ignore malformed JSON objects
                    continue

            return tasks

        except Exception as e:
            print(f"Error during LLM parsing: {e}")
            return []

# Example usage:
if __name__ == '__main__':
    parser = LLMParser()
    if parser.model_loaded:
        test_text = "I need to do laundry for 2 hours, then charge my EV for 3.5h. Also, run backups."
        parsed_tasks = parser.parse_tasks(test_text)
        print("Parsed tasks:")
        print(parsed_tasks)
    else:
        print("LLM Parser could not be initialized.")
