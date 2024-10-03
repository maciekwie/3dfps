import numpy as np
from PIL import Image
import json

def create_cuboid(x, y, z, dx, dy, dz, vertex_offset):
    # Vertices (flattened)
    v = [
        x, y, z,
        x + dx, y, z,
        x + dx, y, z + dz,
        x, y, z + dz,
        x, y + dy, z,
        x + dx, y + dy, z,
        x + dx, y + dy, z + dz,
        x, y + dy, z + dz,
    ]

    # Indices for the 12 triangles (6 faces x 2 triangles per face)
    idx = [
        # Bottom face
        vertex_offset + 0, vertex_offset + 1, vertex_offset + 2,
        vertex_offset + 0, vertex_offset + 2, vertex_offset + 3,
        # Top face
        vertex_offset + 4, vertex_offset + 6, vertex_offset + 5,
        vertex_offset + 4, vertex_offset + 7, vertex_offset + 6,
        # Front face
        vertex_offset + 0, vertex_offset + 4, vertex_offset + 5,
        vertex_offset + 0, vertex_offset + 5, vertex_offset + 1,
        # Back face
        vertex_offset + 3, vertex_offset + 2, vertex_offset + 6,
        vertex_offset + 3, vertex_offset + 6, vertex_offset + 7,
        # Left face
        vertex_offset + 0, vertex_offset + 3, vertex_offset + 7,
        vertex_offset + 0, vertex_offset + 7, vertex_offset + 4,
        # Right face
        vertex_offset + 1, vertex_offset + 5, vertex_offset + 6,
        vertex_offset + 1, vertex_offset + 6, vertex_offset + 2,
    ]

    return v, idx

def main():
    # Load the image
    image = Image.open('input.png').convert('L')  # Convert to grayscale
    pixels = np.array(image)
    height, width = pixels.shape

    # Parameters
    height_scale = 0.1  # Adjust as needed
    vertices = []
    indices = []
    colors = []
    vertex_offset = 0

    for i in range(height):
        for j in range(width):
            pixel_value = pixels[i, j]
            h = pixel_value * height_scale
            if h > 0:
                x = j
                y = 0
                z = i
                dx = 1
                dy = h
                dz = 1
                v, idx = create_cuboid(x, y, z, dx, dy, dz, vertex_offset)
                vertices.extend(v)
                indices.extend(idx)
                # Assign color based on height or pixel value
                color = [pixel_value / 255.0] * 3  # Grayscale color
                colors.extend(color * 8)  # Repeat for each vertex
                vertex_offset += 8  # 8 vertices per cuboid

    # Prepare data for JSON
    data = {
        "vertices": vertices,
        "colors": colors,
        "indices": indices
    }

    # Write to JSON file
    with open('output.json', 'w') as f:
        json.dump(data, f)

if __name__ == "__main__":
    main()
