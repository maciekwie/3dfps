import numpy as np
from PIL import Image
import json

def create_cuboid(x, y, z, dx, dy, dz, vertex_offset):
    # Define the 8 corner vertices
    v0 = [x, y, z]
    v1 = [x + dx, y, z]
    v2 = [x + dx, y, z + dz]
    v3 = [x, y, z + dz]
    v4 = [x, y + dy, z]
    v5 = [x + dx, y + dy, z]
    v6 = [x + dx, y + dy, z + dz]
    v7 = [x, y + dy, z + dz]

    # For each face, define vertices, normals, and indices
    vertices = []
    normals = []
    indices = []

    # Bottom face (0, -1, 0)
    face_vertices = [v0, v1, v2, v3]
    normal = [0, -1, 0]
    for i in range(4):
        vertices.extend(face_vertices[i])
        normals.extend(normal)
    indices.extend([vertex_offset + 0, vertex_offset + 1, vertex_offset + 2,
                    vertex_offset + 0, vertex_offset + 2, vertex_offset + 3])
    vertex_offset += 4

    # Top face (0, 1, 0)
    face_vertices = [v4, v5, v6, v7]
    normal = [0, 1, 0]
    for i in range(4):
        vertices.extend(face_vertices[i])
        normals.extend(normal)
    indices.extend([vertex_offset + 0, vertex_offset + 2, vertex_offset + 1,
                    vertex_offset + 0, vertex_offset + 3, vertex_offset + 2])
    vertex_offset += 4

    # Front face (0, 0, -1)
    face_vertices = [v0, v1, v5, v4]
    normal = [0, 0, -1]
    for i in range(4):
        vertices.extend(face_vertices[i])
        normals.extend(normal)
    indices.extend([vertex_offset + 0, vertex_offset + 1, vertex_offset + 2,
                    vertex_offset + 0, vertex_offset + 2, vertex_offset + 3])
    vertex_offset += 4

    # Back face (0, 0, 1)
    face_vertices = [v3, v2, v6, v7]
    normal = [0, 0, 1]
    for i in range(4):
        vertices.extend(face_vertices[i])
        normals.extend(normal)
    indices.extend([vertex_offset + 0, vertex_offset + 1, vertex_offset + 2,
                    vertex_offset + 0, vertex_offset + 2, vertex_offset + 3])
    vertex_offset += 4

    # Left face (-1, 0, 0)
    face_vertices = [v0, v3, v7, v4]
    normal = [-1, 0, 0]
    for i in range(4):
        vertices.extend(face_vertices[i])
        normals.extend(normal)
    indices.extend([vertex_offset + 0, vertex_offset + 1, vertex_offset + 2,
                    vertex_offset + 0, vertex_offset + 2, vertex_offset + 3])
    vertex_offset += 4

    # Right face (1, 0, 0)
    face_vertices = [v1, v2, v6, v5]
    normal = [1, 0, 0]
    for i in range(4):
        vertices.extend(face_vertices[i])
        normals.extend(normal)
    indices.extend([vertex_offset + 0, vertex_offset + 1, vertex_offset + 2,
                    vertex_offset + 0, vertex_offset + 2, vertex_offset + 3])
    vertex_offset += 4

    return vertices, normals, indices, vertex_offset

def main():
    # Load the image
    image = Image.open('input.png').convert('L')  # Convert to grayscale
    pixels = np.array(image)
    height, width = pixels.shape

    # Parameters
    height_scale = 0.1  # Adjust as needed
    vertices = []
    normals = []
    indices = []
    colors = []
    vertex_offset = 0

    for i in range(height):
        for j in range(width):
            pixel_value = pixels[i, j]
            #h = pixel_value * height_scale
            h = 1
            if pixel_value == 0:
                x = j
                y = 0
                z = i
                dx = 1
                dy = h
                dz = 1
                v, n, idx, vertex_offset = create_cuboid(x, y, z, dx, dy, dz, vertex_offset)
                vertices.extend(v)
                normals.extend(n)
                indices.extend(idx)
                # Assign color based on height or pixel value
                color = [pixel_value / 255.0] * 3  # Grayscale color
                colors.extend(color * (len(v) // 3))  # Repeat for each vertex

    # Prepare data for JSON
    data = {
        "vertices": vertices,
        "normals": normals,
        "colors": colors,
        "indices": indices
    }

    # Write to JSON file
    with open('output.json', 'w') as f:
        json.dump(data, f)

if __name__ == "__main__":
    main()
