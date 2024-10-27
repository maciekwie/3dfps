import numpy as np
from PIL import Image
import json

def add_face(vertices_list, normals_list, tex_coords_list, indices_list, face_vertices, normal, tex_coords, vertex_offset):
    # Adds a face to the lists
    for i in range(4):
        vertices_list.extend(face_vertices[i])
        normals_list.extend(normal)
        tex_coords_list.extend(tex_coords[i])

    # Add indices for two triangles
    indices_list.extend([
        vertex_offset, vertex_offset + 1, vertex_offset + 2,
        vertex_offset, vertex_offset + 2, vertex_offset + 3
    ])

    vertex_offset += 4
    return vertex_offset

def main():
    # Load the image and invert pixels
    image = Image.open('input.png').convert('L')
    pixels = np.array(image)
    height, width = pixels.shape

    # Create wall_map where wall_map[x][y] = 1 when pixel at position x, y is black
    # Initialize wall_map with zeros
    wall_map = np.zeros((width, height), dtype=int)

    # Populate wall_map
    for i in range(height):
        for j in range(width):
            if pixels[i, j] == 0:
                wall_map[j, i] = 1

    # Invert the pixels to fix the inversion issue
    pixels = 255 - pixels

    # Parameters
    wall_height = 2.0  # Adjust as needed
    vertices = []
    normals = []
    tex_coords = []
    indices = []
    vertex_offset = 0

    # Create heights array
    heights = pixels * (wall_height / 255.0)

    # Texture coordinates for each face
    face_tex_coords = [
        [0, 0],  # Bottom left
        [1, 0],  # Bottom right
        [1, 1],  # Top right
        [0, 1],  # Top left
    ]

    for i in range(height):
        for j in range(width):
            h = heights[i, j]
            if h > 0:
                x = j
                y = 0
                z = i
                dx = 1
                dy = h
                dz = 1

                # Define the 8 corner vertices of the cuboid
                v0 = [x, y, z]
                v1 = [x + dx, y, z]
                v2 = [x + dx, y, z + dz]
                v3 = [x, y, z + dz]
                v4 = [x, y + dy, z]
                v5 = [x + dx, y + dy, z]
                v6 = [x + dx, y + dy, z + dz]
                v7 = [x, y + dy, z + dz]

                # Neighbor checks and face generation
                # Left face (-X direction)
                if j == 0 or heights[i, j - 1] == 0:
                    face_vertices = [v0, v3, v7, v4]
                    normal = [-1, 0, 0]
                    vertex_offset = add_face(vertices, normals, tex_coords, indices,
                                             face_vertices, normal, face_tex_coords, vertex_offset)

                # Right face (+X direction)
                if j == width - 1 or heights[i, j + 1] == 0:
                    face_vertices = [v1, v2, v6, v5]
                    normal = [1, 0, 0]
                    vertex_offset = add_face(vertices, normals, tex_coords, indices,
                                             face_vertices, normal, face_tex_coords, vertex_offset)

                # Front face (-Z direction)
                if i == 0 or heights[i - 1, j] == 0:
                    face_vertices = [v0, v1, v5, v4]
                    normal = [0, 0, -1]
                    vertex_offset = add_face(vertices, normals, tex_coords, indices,
                                             face_vertices, normal, face_tex_coords, vertex_offset)

                # Back face (+Z direction)
                if i == height - 1 or heights[i + 1, j] == 0:
                    face_vertices = [v3, v2, v6, v7]
                    normal = [0, 0, 1]
                    vertex_offset = add_face(vertices, normals, tex_coords, indices,
                                             face_vertices, normal, face_tex_coords, vertex_offset)

                # Top face (+Y direction)
                face_vertices = [v4, v5, v6, v7]
                normal = [0, 1, 0]
                vertex_offset = add_face(vertices, normals, tex_coords, indices,
                                         face_vertices, normal, face_tex_coords, vertex_offset)

                # Bottom face (-Y direction) - Uncomment if needed
                # face_vertices = [v0, v1, v2, v3]
                # normal = [0, -1, 0]
                # vertex_offset = add_face(vertices, normals, tex_coords, indices,
                #                          face_vertices, normal, face_tex_coords, vertex_offset)

    # Prepare data for JSON
    data = {
        "vertices": vertices,
        "normals": normals,
        "textureCoords": tex_coords,
        "indices": indices,
        "wall_map": wall_map.tolist()
    }

    # Write to JSON file
    with open('output.json', 'w') as f:
        json.dump(data, f)

if __name__ == "__main__":
    main()
