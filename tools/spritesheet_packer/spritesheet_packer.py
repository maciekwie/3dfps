import json
import os
from PIL import Image

def create_sprite_sheet(atlas_data_path, input_images_dir, output_image_path, output_json_path):
    # Load animation data from the JSON file
    with open(atlas_data_path, 'r') as file:
        atlas_data = json.load(file)
    
    frames = []
    total_area = 0

    # Collect all frames and their dimensions
    for animation in atlas_data['animations']:
        for frame_num in range(animation['frames']):
            frame_name = f"{animation['name']}_{str(frame_num).zfill(3)}"
            frame_path = os.path.join(input_images_dir, f"{frame_name}.png")
            if os.path.exists(frame_path):
                frame_image = Image.open(frame_path)
                width, height = frame_image.size
                frames.append({
                    'name': frame_name,
                    'path': frame_path,
                    'image': frame_image,
                    'width': width,
                    'height': height
                })
                total_area += width * height
            else:
                print(f"Warning: Frame {frame_path} not found.")

    # Estimate atlas size (starting with the smallest square that can contain all frames)
    atlas_size = int(total_area ** 0.5)
    max_frame_width = max(frame['width'] for frame in frames)
    max_frame_height = max(frame['height'] for frame in frames)

    # Ensure the atlas is at least as big as the largest frame
    atlas_width = max(atlas_size, max_frame_width)
    atlas_height = max(atlas_size, max_frame_height)

    # Sort frames by height descending (can improve packing efficiency)
    frames.sort(key=lambda x: x['height'], reverse=True)

    # Implement a simple shelf packing algorithm
    shelves = []
    x, y = 0, 0
    shelf_height = frames[0]['height']
    current_shelf = []

    for frame in frames:
        if x + frame['width'] > atlas_width:
            # Start new shelf
            shelves.append({'y': y, 'frames': current_shelf, 'height': shelf_height})
            y += shelf_height
            x = 0
            shelf_height = frame['height']
            current_shelf = []

        current_shelf.append({'frame': frame, 'x': x})
        x += frame['width']
        shelf_height = max(shelf_height, frame['height'])

    # Add the last shelf
    if current_shelf:
        shelves.append({'y': y, 'frames': current_shelf, 'height': shelf_height})
        y += shelf_height

    atlas_height = y

    # Create the blank atlas image
    atlas_image = Image.new('RGBA', (atlas_width, atlas_height))
    frames_metadata = []

    # Ensure output directory exists for the image and JSON file
    os.makedirs(os.path.dirname(output_image_path), exist_ok=True)
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)

    # Paste frames into the atlas
    for shelf in shelves:
        for item in shelf['frames']:
            frame = item['frame']
            x = item['x']
            y = shelf['y']
            atlas_image.paste(frame['image'], (x, y))
            frames_metadata.append({
                "name": frame['name'],
                "x": x,
                "y": y,
                "width": frame['width'],
                "height": frame['height']
            })

    # Save the atlas image
    atlas_image.save(output_image_path)

    # Save frames metadata as JSON
    with open(output_json_path, 'w') as json_file:
        json.dump({"frames": frames_metadata}, json_file, indent=4)


# Example usage
create_sprite_sheet(
    atlas_data_path="./input/animations.json",
    input_images_dir="./input",
    output_image_path="./output/atlas.png",
    output_json_path="./output/atlas_data.json"
)
