import bpy
import json
import os

def load_maze_from_json(filepath):
    # Load JSON data
    with open(filepath, 'r') as f:
        data = json.load(f)

    vertices = data['vertices']
    normals = data['normals']
    colors = data['colors']
    indices = data['indices']

    # Prepare data
    # Group vertices, normals, and colors into tuples of 3
    vertices = [tuple(vertices[i:i+3]) for i in range(0, len(vertices), 3)]
    normals = [tuple(normals[i:i+3]) for i in range(0, len(normals), 3)]
    colors = [tuple(colors[i:i+3]) for i in range(0, len(colors), 3)]
    # Faces (triangles) from indices
    faces = [tuple(indices[i:i+3]) for i in range(0, len(indices), 3)]

    # Create a new mesh and object
    mesh = bpy.data.meshes.new("MazeMesh")
    obj = bpy.data.objects.new("MazeObject", mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    # Construct the mesh from vertices and faces
    mesh.from_pydata(vertices, [], faces)
    mesh.update()

    # Set normals
    # Enable auto-smooth to use custom normals
    mesh.use_auto_smooth = True
    # Create a custom normals layer
    mesh.create_normals_split()
    # Assign normals to loops
    loops = mesh.loops
    for i, loop in enumerate(loops):
        loop.normal = normals[loop.vertex_index]
    mesh.normals_split_custom_set(tuple(normals for _ in mesh.polygons))
    mesh.validate(clean_customdata=False)
    mesh.update()

    # Add vertex colors
    if len(colors) == len(vertices):
        # Create a new color layer
        color_layer = mesh.vertex_colors.new(name="Col")
        color_data = color_layer.data
        # Assign colors to each loop (vertex per face corner)
        for poly in mesh.polygons:
            for loop_index in poly.loop_indices:
                vertex_index = mesh.loops[loop_index].vertex_index
                color = colors[vertex_index]
                color_data[loop_index].color = (color[0], color[1], color[2], 1.0)  # RGBA
    else:
        print("Color data does not match vertex count. Skipping vertex colors.")

    # Set shading to smooth
    for polygon in mesh.polygons:
        polygon.use_smooth = True

def main():
    # Replace 'output.json' with the path to your JSON file
    # If the JSON file is in the same directory as the Blender file, use:
    json_path = bpy.path.abspath("//output.json")
    if not os.path.exists(json_path):
        # Alternatively, set the path directly
        json_path = "/path/to/your/output.json"
    load_maze_from_json(json_path)

if __name__ == "__main__":
    main()
