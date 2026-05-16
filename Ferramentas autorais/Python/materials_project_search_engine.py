import os
import re
import threading
from pathlib import Path
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, colorchooser

import numpy as np
import trimesh
from mp_api.client import MPRester
from pymatgen.core import Structure
try:
    from pymatgen.symmetry.groups import SpaceGroup
except Exception:
    SpaceGroup = None

DEFAULT_API_KEY = "BmC2Yk6KdLN0DYdiWyeaua7uCZSNscif"

DEFAULT_ELEMENT_COLORS = {
    "H": "#ffffff",
    "He": "#d9ffff",
    "Li": "#cc80ff",
    "Be": "#c2ff00",
    "B": "#ffb5b5",
    "C": "#222222",
    "N": "#3050f8",
    "O": "#ff0d0d",
    "F": "#90e050",
    "Ne": "#b3e3f5",
    "Na": "#ab5cf2",
    "Mg": "#8aff00",
    "Al": "#bfa6a6",
    "Si": "#f0c8a0",
    "P": "#ff8000",
    "S": "#ffff30",
    "Cl": "#1ff01f",
    "Ar": "#80d1e3",
    "K": "#8f40d4",
    "Ca": "#3dff00",
    "Ti": "#bfc2c7",
    "V": "#a6a6ab",
    "Cr": "#8a99c7",
    "Mn": "#9c7ac7",
    "Fe": "#e06633",
    "Co": "#f090a0",
    "Ni": "#50d050",
    "Cu": "#c88033",
    "Zn": "#7d80b0",
    "Ga": "#c28f8f",
    "Ge": "#668f8f",
    "As": "#bd80e3",
    "Se": "#ffa100",
    "Br": "#a62929",
    "Kr": "#5cb8d1",
    "Rb": "#702eb0",
    "Sr": "#00ff00",
    "Y": "#94ffff",
    "Zr": "#94e0e0",
    "Nb": "#73c2c9",
    "Mo": "#54b5b5",
    "Tc": "#3b9e9e",
    "Ru": "#248f8f",
    "Rh": "#0a7d8c",
    "Pd": "#006985",
    "Ag": "#c0c0c0",
    "Cd": "#ffd98f",
    "In": "#a67573",
    "Sn": "#668080",
    "Sb": "#9e63b5",
    "Te": "#d47a00",
    "I": "#940094",
    "Xe": "#429eb0",
    "Cs": "#57178f",
    "Ba": "#00c900",
    "La": "#70d4ff",
    "Ce": "#ffffc7",
    "Pr": "#d9ffc7",
    "Nd": "#c7ffc7",
    "Pm": "#a3ffc7",
    "Sm": "#8fffc7",
    "Eu": "#61ffc7",
    "Gd": "#45ffc7",
    "Tb": "#30ffc7",
    "Dy": "#1fffc7",
    "Ho": "#00ff9c",
    "Er": "#00e675",
    "Tm": "#00d452",
    "Yb": "#00bf38",
    "Lu": "#00ab24",
    "Hf": "#4dc2ff",
    "Ta": "#4da6ff",
    "W": "#2194d6",
    "Re": "#267dab",
    "Os": "#266696",
    "Ir": "#175487",
    "Pt": "#d0d0e0",
    "Au": "#ffd123",
    "Hg": "#b8b8d0",
    "Tl": "#a6544d",
    "Pb": "#575961",
    "Bi": "#9e4fb5"
}

ELEMENT_SYMBOLS = {
    "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar",
    "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr",
    "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe",
    "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu",
    "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn",
    "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr",
    "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
}

CRYSTAL_SYSTEM_PT = {
    "cubic": "Cúbico",
    "hexagonal": "Hexagonal",
    "trigonal": "Trigonal",
    "tetragonal": "Tetragonal",
    "orthorhombic": "Ortorrômbico",
    "monoclinic": "Monoclínico",
    "triclinic": "Triclínico",
    "unknown": "Desconhecido",
    "": "Desconhecido"
}


def rgba_from_hex(hex_color, alpha=255):
    value = str(hex_color).strip().replace("#", "")
    if len(value) != 6:
        return np.array([80, 80, 80, alpha], dtype=np.uint8)
    try:
        return np.array([int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), alpha], dtype=np.uint8)
    except Exception:
        return np.array([80, 80, 80, alpha], dtype=np.uint8)


def safe_filename(text):
    text = str(text)
    text = re.sub(r"[^\w\-.]+", "_", text, flags=re.UNICODE)
    text = re.sub(r"_+", "_", text).strip("_")
    return text or "material"


def unique_output_path(path):
    path = Path(path)
    if not path.exists():
        return path
    stem = path.stem
    suffix = path.suffix
    parent = path.parent
    index = 2
    while True:
        candidate = parent / f"{stem}_{index}{suffix}"
        if not candidate.exists():
            return candidate
        index += 1


def value_to_text(value):
    if value is None:
        return ""
    if hasattr(value, "value"):
        value = value.value
    text = str(value)
    if "." in text:
        text = text.split(".")[-1]
    return text.strip()


def parse_element_list(text):
    found = re.findall(r"[A-Z][a-z]?", str(text or ""))
    elements = []
    for element in found:
        if element not in elements:
            elements.append(element)
    return elements


def normalize_crystal_system(value):
    text = value_to_text(value).lower().replace(" ", "_").replace("-", "_")
    text = text.replace("crystalsystem_", "")
    text = text.replace("crystalsystem", "")
    text = text.strip("._ ")
    if text in CRYSTAL_SYSTEM_PT:
        return CRYSTAL_SYSTEM_PT[text]
    return text.capitalize() if text else "Desconhecido"


def lattice_matrix_from_parameters(a, b, c, alpha, beta, gamma):
    alpha = np.deg2rad(float(alpha))
    beta = np.deg2rad(float(beta))
    gamma = np.deg2rad(float(gamma))
    a = float(a)
    b = float(b)
    c = float(c)
    sin_gamma = np.sin(gamma)
    if abs(sin_gamma) < 1e-8:
        return None
    va = np.array([a, 0.0, 0.0], dtype=float)
    vb = np.array([b * np.cos(gamma), b * sin_gamma, 0.0], dtype=float)
    cx = c * np.cos(beta)
    cy = c * (np.cos(alpha) - np.cos(beta) * np.cos(gamma)) / sin_gamma
    cz2 = (c * c) - (cx * cx) - (cy * cy)
    cz = np.sqrt(max(cz2, 0.0))
    vc = np.array([cx, cy, cz], dtype=float)
    return np.array([va, vb, vc], dtype=float)



def get_float(value, default=None):
    try:
        if value is None:
            return default
        return float(value)
    except Exception:
        return default


def get_observed_status(doc):
    theoretical = getattr(doc, "theoretical", None)
    if theoretical is False:
        return "Observada"
    if theoretical is True:
        return "Teórica"
    return "Origem indefinida"


def get_stability_status(doc):
    ehull = get_float(getattr(doc, "energy_above_hull", None))
    is_stable = bool(getattr(doc, "is_stable", False))
    if is_stable or (ehull is not None and ehull <= 0.000001):
        return "Estável MP"
    if ehull is None:
        return "Sem dado de estabilidade"
    if ehull <= 0.025:
        return "Quase estável"
    return "Metastável"


def get_material_status(doc):
    return f"{get_observed_status(doc)} • {get_stability_status(doc)}"

def get_symmetry_field(symmetry, field):
    if symmetry is None:
        return ""
    if isinstance(symmetry, dict):
        return symmetry.get(field, "") or ""
    return getattr(symmetry, field, "") or ""


def get_crystal_system(doc):
    symmetry = getattr(doc, "symmetry", None)
    value = get_symmetry_field(symmetry, "crystal_system")
    return normalize_crystal_system(value)


def get_space_group(doc):
    symmetry = getattr(doc, "symmetry", None)
    symbol = get_symmetry_field(symmetry, "symbol")
    number = get_symmetry_field(symmetry, "number")
    if symbol and number:
        return f"{symbol} ({number})"
    return str(symbol or "")



def get_site_element(site):
    try:
        specie = getattr(site, "specie", None)
        symbol = getattr(specie, "symbol", None)
        if symbol:
            return str(symbol)
    except Exception:
        pass
    try:
        species = getattr(site, "species", None)
        elements = getattr(species, "elements", None)
        if elements:
            symbol = getattr(elements[0], "symbol", None)
            if symbol:
                return str(symbol)
    except Exception:
        pass
    try:
        species_string = getattr(site, "species_string", "")
        if species_string:
            match = re.match(r"[A-Z][a-z]?", str(species_string))
            if match:
                return match.group(0)
            return str(species_string)
    except Exception:
        pass
    return "X"


def get_structure_elements(structure):
    if structure is None:
        return []
    elements = set()
    for site in structure.sites:
        elements.add(get_site_element(site))
    return sorted(elements)


def get_doc_elements(doc):
    return get_structure_elements(getattr(doc, "structure", None))


def default_element_color(element):
    return DEFAULT_ELEMENT_COLORS.get(str(element), "#888888")


def canonical_element(token):
    clean = re.sub(r"[^A-Za-z]", "", str(token or ""))
    if not clean:
        return None
    if len(clean) >= 2:
        candidate = clean[0].upper() + clean[1].lower()
        if candidate in ELEMENT_SYMBOLS:
            return candidate
    candidate = clean[0].upper()
    if candidate in ELEMENT_SYMBOLS:
        return candidate
    return None


def infer_mol2_element(atom_name, atom_type):
    atom_type_head = str(atom_type or "").split(".")[0]
    for token in (atom_type_head, atom_name):
        element = canonical_element(token)
        if element:
            return element
    return "X"


def parse_mol2(file_path):
    atoms = []
    bonds = []
    name = Path(file_path).stem
    atom_ids = {}
    lattice_matrix = None
    crystal_info = None
    section = ""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as handle:
        for raw in handle:
            line = raw.strip()
            if not line:
                continue
            upper = line.upper()
            if upper.startswith("@<TRIPOS>"):
                section = upper
                continue
            if section == "@<TRIPOS>MOLECULE" and name == Path(file_path).stem:
                name = line or name
                section = "@<TRIPOS>MOLECULE_NAME_READ"
                continue
            if section == "@<TRIPOS>ATOM":
                parts = line.split()
                if len(parts) >= 6:
                    atom_id = parts[0]
                    atom_name = parts[1]
                    x, y, z = float(parts[2]), float(parts[3]), float(parts[4])
                    atom_type = parts[5]
                    residue_id = parts[6] if len(parts) >= 7 else ""
                    element = infer_mol2_element(atom_name, atom_type)
                    atom_ids[atom_id] = len(atoms)
                    atoms.append({"id": atom_id, "name": atom_name, "type": atom_type, "element": element, "residue_id": residue_id, "coord": np.array([x, y, z], dtype=float)})
                continue
            if section == "@<TRIPOS>BOND":
                parts = line.split()
                if len(parts) >= 4:
                    a = parts[1]
                    b = parts[2]
                    if a in atom_ids and b in atom_ids:
                        bonds.append((atom_ids[a], atom_ids[b]))
                continue
            if section == "@<TRIPOS>CRYSIN":
                parts = line.split()
                if len(parts) >= 6:
                    try:
                        a, b, c, alpha, beta, gamma = [float(v) for v in parts[:6]]
                        spacegroup_number = int(float(parts[6])) if len(parts) >= 7 else None
                        setting = int(float(parts[7])) if len(parts) >= 8 else None
                        lattice_matrix = lattice_matrix_from_parameters(a, b, c, alpha, beta, gamma)
                        crystal_info = {"a": a, "b": b, "c": c, "alpha": alpha, "beta": beta, "gamma": gamma, "spacegroup_number": spacegroup_number, "setting": setting}
                    except Exception:
                        lattice_matrix = None
                        crystal_info = None
                continue
    if not atoms:
        raise ValueError("Nenhum átomo encontrado no arquivo MOL2.")
    coords = np.array([atom["coord"] for atom in atoms], dtype=float)
    elements = [atom["element"] for atom in atoms]
    residue_ids = [atom.get("residue_id", "") for atom in atoms]
    return {"name": name, "coords": coords, "elements": elements, "residue_ids": residue_ids, "bonds": bonds, "lattice_matrix": lattice_matrix, "crystal_info": crystal_info}


def get_connected_components(total_atoms, bonds, residue_ids=None):
    parent = list(range(total_atoms))

    def find(value):
        while parent[value] != value:
            parent[value] = parent[parent[value]]
            value = parent[value]
        return value

    def union(a, b):
        ra = find(a)
        rb = find(b)
        if ra != rb:
            parent[rb] = ra

    for a, b in bonds:
        if 0 <= a < total_atoms and 0 <= b < total_atoms:
            union(a, b)

    if residue_ids:
        by_residue = {}
        for index, residue_id in enumerate(residue_ids):
            if residue_id:
                by_residue.setdefault(residue_id, []).append(index)
        for members in by_residue.values():
            if len(members) > 1:
                first = members[0]
                for member in members[1:]:
                    union(first, member)

    components = {}
    for index in range(total_atoms):
        components.setdefault(find(index), []).append(index)
    return list(components.values())


def mol2_symmetry_operations(spacegroup_number):
    if not spacegroup_number:
        return [lambda frac: frac]
    if SpaceGroup is not None:
        try:
            group = SpaceGroup.from_int_number(int(spacegroup_number))
            return [lambda frac, op=op: np.array(op.operate(frac), dtype=float) for op in group.symmetry_ops]
        except Exception:
            pass
    if int(spacegroup_number) == 2:
        return [lambda frac: frac, lambda frac: -frac]
    return [lambda frac: frac]


def prepare_mol2_geometry(molecule_data, options):
    coords = np.array(molecule_data["coords"], dtype=float)
    elements = list(molecule_data["elements"])
    bonds = list(molecule_data.get("bonds", []))
    lattice_matrix = molecule_data.get("lattice_matrix")
    crystal_info = molecule_data.get("crystal_info") or {}

    if lattice_matrix is None:
        return {"coords": coords, "elements": elements, "bonds": bonds, "lattice_matrix": lattice_matrix}

    use_symmetry = options.get("mol2_apply_symmetry", True)
    wrap_components = options.get("mol2_wrap_components", True)
    frac = coords @ np.linalg.inv(np.array(lattice_matrix, dtype=float))
    components = get_connected_components(len(coords), bonds, molecule_data.get("residue_ids"))
    component_bonds = []
    for component in components:
        component_set = set(component)
        component_bonds.append([(a, b) for a, b in bonds if a in component_set and b in component_set])

    operations = mol2_symmetry_operations(crystal_info.get("spacegroup_number")) if use_symmetry else [lambda value: value]
    generated_coords = []
    generated_elements = []
    generated_bonds = []
    seen = set()

    for operation in operations:
        for component, bonds_in_component in zip(components, component_bonds):
            transformed = np.array([operation(frac[index]) for index in component], dtype=float)
            if wrap_components and len(transformed):
                transformed = transformed - np.floor(transformed.mean(axis=0))
            key_values = []
            for old_index, fcoords in zip(component, transformed):
                key_values.append((elements[old_index], tuple(np.round(fcoords % 1.0, 5))))
            key = tuple(sorted(key_values))
            if key in seen:
                continue
            seen.add(key)
            base_index = len(generated_coords)
            old_to_new = {}
            for local_index, old_index in enumerate(component):
                old_to_new[old_index] = base_index + local_index
                generated_coords.append(transformed[local_index] @ lattice_matrix)
                generated_elements.append(elements[old_index])
            for a, b in bonds_in_component:
                if a in old_to_new and b in old_to_new:
                    generated_bonds.append((old_to_new[a], old_to_new[b]))

    if not generated_coords:
        generated_coords = list(coords)
        generated_elements = list(elements)
        generated_bonds = list(bonds)

    return {"coords": np.array(generated_coords, dtype=float), "elements": generated_elements, "bonds": generated_bonds, "lattice_matrix": lattice_matrix}


def molecule_to_scene(molecule_data, options):
    prepared = prepare_mol2_geometry(molecule_data, options)
    original_coords = np.array(prepared["coords"], dtype=float)
    coords = np.array(original_coords, dtype=float)
    elements = list(prepared["elements"])
    lattice_matrix = prepared.get("lattice_matrix")

    if options["center"] and len(coords):
        if lattice_matrix is not None:
            center_shift = (np.array(lattice_matrix[0]) + np.array(lattice_matrix[1]) + np.array(lattice_matrix[2])) / 2.0
        else:
            center_shift = coords.mean(axis=0)
        coords = coords - center_shift
    else:
        center_shift = np.zeros(3)

    scene = trimesh.Scene()
    bond_color = rgba_from_hex(options["bond_color"], 255)
    cell_color = rgba_from_hex(options["cell_color"], 255)
    poly_color = rgba_from_hex(options["poly_color"], max(1, min(255, int(options["poly_alpha"] * 255))))

    for i, coord in enumerate(coords):
        element = elements[i] if i < len(elements) else "X"
        if options.get("use_element_colors", False):
            color_hex = options.get("element_colors", {}).get(element, default_element_color(element))
        else:
            color_hex = options["atom_color"]
        atom_mesh = make_sphere(coord, options["atom_radius"], rgba_from_hex(color_hex, 255), options["sphere_quality"])
        scene.add_geometry(atom_mesh, geom_name=f"atom_{i}_{element}")

    bond_pairs = []
    if options["show_bonds"]:
        source_bonds = list(prepared.get("bonds", []))
        for i, j in source_bonds:
            if 0 <= i < len(coords) and 0 <= j < len(coords):
                bond_pairs.append((i, j))
                bond_mesh = make_cylinder(coords[i], coords[j], options["bond_radius"], bond_color, options["cylinder_quality"])
                if bond_mesh is not None:
                    scene.add_geometry(bond_mesh, geom_name=f"bond_{i}_{j}")

    if options["show_cell"] and lattice_matrix is not None:
        cell_radius = max(options["bond_radius"] * 0.55, 0.008)
        for k, (p1, p2) in enumerate(build_unit_cell_edges(lattice_matrix)):
            p1 = p1 - center_shift if options["center"] else p1
            p2 = p2 - center_shift if options["center"] else p2
            cell_mesh = make_cylinder(p1, p2, cell_radius, cell_color, 12)
            if cell_mesh is not None:
                scene.add_geometry(cell_mesh, geom_name=f"cell_{k}")

    if options["show_polyhedra"]:
        neighbors = {i: [] for i in range(len(coords))}
        for i, j in bond_pairs:
            if 0 <= i < len(coords) and 0 <= j < len(coords):
                neighbors[i].append(coords[j])
                neighbors[j].append(coords[i])
        for i, pts in neighbors.items():
            if len(pts) >= 4:
                poly_mesh = make_polyhedron(pts, poly_color)
                if poly_mesh is not None:
                    scene.add_geometry(poly_mesh, geom_name=f"poly_{i}")

    return scene


def make_sphere(center, radius, color, subdivisions=2):
    mesh = trimesh.creation.icosphere(subdivisions=int(subdivisions), radius=float(radius))
    mesh.apply_translation(np.array(center, dtype=float))
    mesh.visual.vertex_colors = np.tile(color, (len(mesh.vertices), 1))
    return mesh


def make_cylinder(p1, p2, radius, color, sections=20):
    p1 = np.array(p1, dtype=float)
    p2 = np.array(p2, dtype=float)
    vector = p2 - p1
    length = float(np.linalg.norm(vector))
    if length <= 1e-8:
        return None
    try:
        mesh = trimesh.creation.cylinder(radius=float(radius), sections=int(sections), segment=np.vstack([p1, p2]))
    except TypeError:
        direction = vector / length
        mesh = trimesh.creation.cylinder(radius=float(radius), height=length, sections=int(sections))
        transform = trimesh.geometry.align_vectors([0, 0, 1], direction)
        transform[:3, 3] = (p1 + p2) / 2
        mesh.apply_transform(transform)
    mesh.visual.vertex_colors = np.tile(color, (len(mesh.vertices), 1))
    return mesh


def make_polyhedron(points, color):
    points = np.array(points, dtype=float)
    if len(points) < 4:
        return None
    try:
        mesh = trimesh.Trimesh(vertices=points).convex_hull
        mesh.visual.vertex_colors = np.tile(color, (len(mesh.vertices), 1))
        return mesh
    except Exception:
        return None


def build_unit_cell_edges(lattice_matrix):
    a, b, c = np.array(lattice_matrix, dtype=float)
    vertices = [
        np.zeros(3), a, b, c,
        a + b, a + c, b + c, a + b + c
    ]
    edge_ids = [
        (0, 1), (0, 2), (0, 3),
        (1, 4), (1, 5),
        (2, 4), (2, 6),
        (3, 5), (3, 6),
        (4, 7), (5, 7), (6, 7)
    ]
    return [(vertices[i], vertices[j]) for i, j in edge_ids]


def get_structure_label(doc):
    mpid = str(getattr(doc, "material_id", ""))
    formula = str(getattr(doc, "formula_pretty", ""))
    sg = get_space_group(doc).replace(" ", "")
    system = get_crystal_system(doc)
    if sg:
        return f"{formula}_{system}_{sg}_{mpid}"
    return f"{formula}_{system}_{mpid}"


def get_api_structure(mpr, material_id, use_conventional_cell):
    structure = mpr.get_structure_by_material_id(
        str(material_id),
        final=True,
        conventional_unit_cell=bool(use_conventional_cell)
    )
    if isinstance(structure, list):
        if not structure:
            return None
        return structure[-1]
    return structure


def doc_value(doc, names):
    for name in names:
        if isinstance(doc, dict) and name in doc:
            return doc.get(name)
        if hasattr(doc, name):
            return getattr(doc, name)
    return None


def search_materials_subendpoint(mpr, endpoint_name, material_id, fields=None):
    try:
        rester = getattr(mpr.materials, endpoint_name)
    except Exception:
        return []
    attempts = []
    base_values = [[str(material_id)], str(material_id)]
    for value in base_values:
        if fields:
            attempts.append({"material_ids": value, "fields": fields})
        attempts.append({"material_ids": value})
    for kwargs in attempts:
        try:
            docs = rester.search(**kwargs)
            if docs:
                return list(docs)
        except Exception:
            continue
    return []


def structure_graph_from_doc(doc):
    graph_obj = doc_value(doc, ["structure_graph", "bond_graph", "graph", "graphs"])
    if isinstance(graph_obj, list) and graph_obj:
        graph_obj = graph_obj[0]
    if graph_obj is None:
        return None
    if hasattr(graph_obj, "graph") and hasattr(graph_obj, "structure"):
        return graph_obj
    if isinstance(graph_obj, dict):
        try:
            from pymatgen.analysis.graphs import StructureGraph
            return StructureGraph.from_dict(graph_obj)
        except Exception:
            return None
    try:
        if hasattr(graph_obj, "as_dict"):
            from pymatgen.analysis.graphs import StructureGraph
            return StructureGraph.from_dict(graph_obj.as_dict())
    except Exception:
        return None
    return None


def structure_species_signature(structure):
    try:
        return [get_site_element(site) for site in structure.sites]
    except Exception:
        return []


def structures_match_for_graph(target_structure, graph_structure):
    if target_structure is None or graph_structure is None:
        return False
    try:
        if len(target_structure.sites) != len(graph_structure.sites):
            return False
        return structure_species_signature(target_structure) == structure_species_signature(graph_structure)
    except Exception:
        return False


def fetch_api_bond_edges(mpr, material_id, target_structure):
    docs = search_materials_subendpoint(mpr, "bonds", material_id)
    if not docs:
        return [], "sem bond graph na API", None
    first_graph_structure = None
    first_edges = []
    for doc in docs:
        structure_graph = structure_graph_from_doc(doc)
        if structure_graph is None:
            continue
        graph_structure = getattr(structure_graph, "structure", None)
        edges = []
        try:
            for u, v, data in structure_graph.graph.edges(data=True):
                image = data.get("to_jimage", (0, 0, 0)) if isinstance(data, dict) else (0, 0, 0)
                image = tuple(int(round(float(x))) for x in image)
                edges.append((int(u), int(v), image))
        except Exception:
            return [], "bond graph da API veio em formato não reconhecido", None
        if not edges:
            continue
        if first_graph_structure is None:
            first_graph_structure = graph_structure
            first_edges = edges
        if structures_match_for_graph(target_structure, graph_structure):
            return edges, f"{len(edges)} ligações vindas da API", graph_structure
    if first_edges and first_graph_structure is not None:
        return first_edges, f"bond graph da API usa outra célula; exportação ajustada para a célula do bond graph com {len(first_edges)} ligações", first_graph_structure
    return [], "bond graph da API sem ligações utilizáveis", None


def fetch_api_chemenv_available(mpr, material_id):
    docs = search_materials_subendpoint(mpr, "chemenv", material_id)
    return bool(docs), "chemenv encontrado na API" if docs else "sem chemenv na API"


def repeated_structure_geometry(structure, repeats):
    base_coords = np.array([site.coords for site in structure.sites], dtype=float)
    base_elements = [get_site_element(site) for site in structure.sites]
    lattice = np.array(structure.lattice.matrix, dtype=float)
    rx, ry, rz = [max(1, int(x)) for x in repeats]
    coords = []
    elements = []
    index_map = {}
    for ix in range(rx):
        for iy in range(ry):
            for iz in range(rz):
                cell = (ix, iy, iz)
                shift = np.dot(np.array(cell, dtype=float), lattice)
                for site_index, coord in enumerate(base_coords):
                    index_map[(site_index, ix, iy, iz)] = len(coords)
                    coords.append(coord + shift)
                    elements.append(base_elements[site_index])
    repeated_lattice = np.array([lattice[0] * rx, lattice[1] * ry, lattice[2] * rz], dtype=float)
    return np.array(coords, dtype=float), elements, repeated_lattice, index_map, (rx, ry, rz)


def angle_between_vectors(u, v):
    u = np.array(u, dtype=float)
    v = np.array(v, dtype=float)
    nu = np.linalg.norm(u)
    nv = np.linalg.norm(v)
    if nu <= 1e-12 or nv <= 1e-12:
        return 90.0
    value = float(np.dot(u, v) / (nu * nv))
    value = max(-1.0, min(1.0, value))
    return float(np.degrees(np.arccos(value)))


def standard_lattice_from_lengths_angles(a_len, b_len, c_len, alpha, beta, gamma):
    alpha = np.radians(float(alpha))
    beta = np.radians(float(beta))
    gamma = np.radians(float(gamma))
    sin_gamma = np.sin(gamma)
    if abs(sin_gamma) <= 1e-10:
        return None
    a_vec = np.array([a_len, 0.0, 0.0], dtype=float)
    b_vec = np.array([b_len * np.cos(gamma), b_len * np.sin(gamma), 0.0], dtype=float)
    cx = c_len * np.cos(beta)
    cy = c_len * (np.cos(alpha) - np.cos(beta) * np.cos(gamma)) / sin_gamma
    cz2 = c_len * c_len - cx * cx - cy * cy
    if cz2 < 0 and abs(cz2) < 1e-8:
        cz2 = 0.0
    if cz2 < 0:
        return None
    c_vec = np.array([cx, cy, np.sqrt(cz2)], dtype=float)
    return np.array([a_vec, b_vec, c_vec], dtype=float)


def orient_lattice_to_viewer(coords, lattice_matrix):
    lattice_matrix = np.array(lattice_matrix, dtype=float)
    if lattice_matrix.shape != (3, 3):
        return coords, lattice_matrix
    lengths = np.linalg.norm(lattice_matrix, axis=1)
    if np.any(lengths <= 1e-10):
        return coords, lattice_matrix
    c_index = int(np.argmax(lengths))
    remaining = [i for i in range(3) if i != c_index]
    a_index, b_index = remaining[0], remaining[1]
    ordered = [lattice_matrix[a_index], lattice_matrix[b_index], lattice_matrix[c_index]]
    a_len, b_len, c_len = [float(np.linalg.norm(v)) for v in ordered]
    alpha = angle_between_vectors(ordered[1], ordered[2])
    beta = angle_between_vectors(ordered[0], ordered[2])
    gamma = angle_between_vectors(ordered[0], ordered[1])
    new_lattice = standard_lattice_from_lengths_angles(a_len, b_len, c_len, alpha, beta, gamma)
    if new_lattice is None:
        return coords, lattice_matrix
    try:
        frac = np.array(coords, dtype=float) @ np.linalg.inv(lattice_matrix)
    except Exception:
        return coords, lattice_matrix
    frac = frac[:, [a_index, b_index, c_index]]
    oriented_coords = frac @ new_lattice
    cell_vertices = np.array([
        np.zeros(3),
        new_lattice[0],
        new_lattice[1],
        new_lattice[2],
        new_lattice[0] + new_lattice[1],
        new_lattice[0] + new_lattice[2],
        new_lattice[1] + new_lattice[2],
        new_lattice[0] + new_lattice[1] + new_lattice[2]
    ], dtype=float)
    combined = np.vstack([oriented_coords, cell_vertices]) if len(oriented_coords) else cell_vertices
    extents = combined.max(axis=0) - combined.min(axis=0)
    axis_order = list(np.argsort(extents))
    remap = [axis_order[0], axis_order[1], axis_order[2]]
    oriented_coords = oriented_coords[:, remap]
    new_lattice = new_lattice[:, remap]
    return oriented_coords, new_lattice


def structure_to_scene(structure, options, api_bond_edges=None, api_chemenv_available=False):
    repeats = [options["repeat_x"], options["repeat_y"], options["repeat_z"]]
    coords, elements, lattice_matrix, index_map, repeat_tuple = repeated_structure_geometry(structure, repeats)

    if options.get("viewer_orientation", True):
        coords, lattice_matrix = orient_lattice_to_viewer(coords, lattice_matrix)

    if options["center"] and len(coords):
        if options.get("center_on_cell", True):
            center = 0.5 * (lattice_matrix[0] + lattice_matrix[1] + lattice_matrix[2])
        else:
            center = coords.mean(axis=0)
        coords = coords - center
        lattice_shift = center
    else:
        lattice_shift = np.zeros(3)

    scene = trimesh.Scene()
    bond_color = rgba_from_hex(options["bond_color"], 255)
    cell_color = rgba_from_hex(options["cell_color"], 255)
    poly_color = rgba_from_hex(options["poly_color"], max(1, min(255, int(options["poly_alpha"] * 255))))
    atom_radius = options["atom_radius"]
    bond_radius = options["bond_radius"]
    cell_radius = max(options["bond_radius"] * 0.55, 0.008)

    for i, coord in enumerate(coords):
        element = elements[i] if i < len(elements) else "X"
        if options.get("use_element_colors", False):
            color_hex = options.get("element_colors", {}).get(element, default_element_color(element))
        else:
            color_hex = options["atom_color"]
        atom_mesh = make_sphere(coord, atom_radius, rgba_from_hex(color_hex, 255), options["sphere_quality"])
        scene.add_geometry(atom_mesh, geom_name=f"atom_{i}_{element}")

    bond_pairs = []
    api_bond_edges = api_bond_edges or []
    if options["show_bonds"] and api_bond_edges:
        rx, ry, rz = repeat_tuple
        used_bonds = set()
        periodic_atom_cache = {}
        base_lattice = np.array(lattice_matrix, dtype=float)
        divisors = np.array([max(1, rx), max(1, ry), max(1, rz)], dtype=float)
        base_lattice = base_lattice / divisors[:, None]
        for ix in range(rx):
            for iy in range(ry):
                for iz in range(rz):
                    for i, j, image in api_bond_edges:
                        start_key = (int(i), ix, iy, iz)
                        if start_key not in index_map:
                            continue
                        a = index_map[start_key]
                        tx = ix + int(image[0])
                        ty = iy + int(image[1])
                        tz = iz + int(image[2])
                        end_key = (int(j), tx, ty, tz)
                        if end_key in index_map:
                            b = index_map[end_key]
                            end_coord = coords[b]
                            pair_key = (min(a, b), max(a, b), 0, 0, 0)
                            neighbor_index = b
                        else:
                            local_key = (int(j), ix, iy, iz)
                            if local_key not in index_map:
                                continue
                            local_b = index_map[local_key]
                            shift = np.dot(np.array(image, dtype=float), base_lattice)
                            end_coord = coords[local_b] + shift
                            cache_key = (int(j), round(float(end_coord[0]), 8), round(float(end_coord[1]), 8), round(float(end_coord[2]), 8))
                            if cache_key in periodic_atom_cache:
                                neighbor_index = periodic_atom_cache[cache_key]
                            else:
                                neighbor_index = len(coords) + len(periodic_atom_cache)
                                periodic_atom_cache[cache_key] = neighbor_index
                                element = elements[local_b] if local_b < len(elements) else "X"
                                if options.get("use_element_colors", False):
                                    color_hex = options.get("element_colors", {}).get(element, default_element_color(element))
                                else:
                                    color_hex = options["atom_color"]
                                atom_mesh = make_sphere(end_coord, atom_radius, rgba_from_hex(color_hex, 255), options["sphere_quality"])
                                scene.add_geometry(atom_mesh, geom_name=f"periodic_atom_{neighbor_index}_{element}")
                            pair_key = (a, neighbor_index, int(image[0]), int(image[1]), int(image[2]))
                        if pair_key in used_bonds:
                            continue
                        used_bonds.add(pair_key)
                        bond_pairs.append((a, neighbor_index))
                        bond_mesh = make_cylinder(coords[a], end_coord, bond_radius, bond_color, options["cylinder_quality"])
                        if bond_mesh is not None:
                            scene.add_geometry(bond_mesh, geom_name=f"bond_{a}_{neighbor_index}")

    if options["show_cell"]:
        for k, (p1, p2) in enumerate(build_unit_cell_edges(lattice_matrix)):
            p1 = p1 - lattice_shift if options["center"] else p1
            p2 = p2 - lattice_shift if options["center"] else p2
            cell_mesh = make_cylinder(p1, p2, cell_radius, cell_color, 12)
            if cell_mesh is not None:
                scene.add_geometry(cell_mesh, geom_name=f"cell_{k}")

    if options["show_polyhedra"] and api_chemenv_available and bond_pairs:
        neighbors = {i: [] for i in range(len(coords))}
        for i, j in bond_pairs:
            if 0 <= i < len(coords) and 0 <= j < len(coords):
                neighbors[i].append(coords[j])
                neighbors[j].append(coords[i])
        for i, pts in neighbors.items():
            if len(pts) >= 4:
                poly_mesh = make_polyhedron(pts, poly_color)
                if poly_mesh is not None:
                    scene.add_geometry(poly_mesh, geom_name=f"poly_{i}")

    return scene


class MaterialsDownloaderApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Materials project search engine")
        self.geometry("1260x790")
        self.minsize(1100, 700)

        self.all_docs = []
        self.docs = []
        self.selected = {}

        self.api_key_var = tk.StringVar(value=os.environ.get("MP_API_KEY", DEFAULT_API_KEY))
        self.element_var = tk.StringVar(value="C")
        self.observed_var = tk.BooleanVar(value=True)
        self.stable_var = tk.BooleanVar(value=False)
        self.system_filter_var = tk.StringVar(value="Todos")
        self.output_var = tk.StringVar(value=str(Path.home() / "Desktop" / "materials_project_glb"))

        self.show_bonds_var = tk.BooleanVar(value=True)
        self.show_cell_var = tk.BooleanVar(value=True)
        self.show_polyhedra_var = tk.BooleanVar(value=False)
        self.center_var = tk.BooleanVar(value=True)
        self.center_on_cell_var = tk.BooleanVar(value=True)
        self.use_summary_structure_var = tk.BooleanVar(value=True)
        self.use_conventional_cell_var = tk.BooleanVar(value=False)
        self.viewer_orientation_var = tk.BooleanVar(value=True)
        self.mol2_apply_symmetry_var = tk.BooleanVar(value=True)
        self.mol2_wrap_components_var = tk.BooleanVar(value=True)

        self.atom_color_var = tk.StringVar(value="#222222")
        self.use_element_colors_var = tk.BooleanVar(value=True)
        self.element_color_vars = {}
        self.element_colors_frame = None
        self.bond_color_var = tk.StringVar(value="#6b6b6b")
        self.cell_color_var = tk.StringVar(value="#2f80ed")
        self.poly_color_var = tk.StringVar(value="#ff9900")

        self.atom_radius_var = tk.DoubleVar(value=0.22)
        self.bond_radius_var = tk.DoubleVar(value=0.055)
        self.poly_alpha_var = tk.DoubleVar(value=0.28)

        self.repeat_x_var = tk.IntVar(value=1)
        self.repeat_y_var = tk.IntVar(value=1)
        self.repeat_z_var = tk.IntVar(value=1)

        self.sphere_quality_var = tk.IntVar(value=2)
        self.cylinder_quality_var = tk.IntVar(value=20)

        self.option_checks = {}

        self.build_ui()

    def build_ui(self):
        root = ttk.Frame(self, padding=12)
        root.pack(fill="both", expand=True)

        top = ttk.LabelFrame(root, text="Busca na API")
        top.pack(fill="x", pady=(0, 10))

        ttk.Label(top, text="API Key").grid(row=0, column=0, sticky="w", padx=8, pady=6)
        ttk.Entry(top, textvariable=self.api_key_var, show="*", width=54).grid(row=0, column=1, sticky="we", padx=8, pady=6)

        ttk.Label(top, text="Elemento(s)").grid(row=0, column=2, sticky="w", padx=8, pady=6)
        ttk.Entry(top, textvariable=self.element_var, width=8).grid(row=0, column=3, sticky="w", padx=8, pady=6)

        ttk.Checkbutton(top, text="Somente observadas", variable=self.observed_var).grid(row=0, column=4, sticky="w", padx=8, pady=6)
        ttk.Checkbutton(top, text="Somente estáveis", variable=self.stable_var).grid(row=0, column=5, sticky="w", padx=8, pady=6)
        ttk.Button(top, text="Buscar estruturas", command=self.search_materials).grid(row=0, column=6, sticky="e", padx=8, pady=6)

        ttk.Label(top, text="Pasta de saída").grid(row=1, column=0, sticky="w", padx=8, pady=6)
        ttk.Entry(top, textvariable=self.output_var).grid(row=1, column=1, columnspan=5, sticky="we", padx=8, pady=6)
        ttk.Button(top, text="Escolher", command=self.choose_output).grid(row=1, column=6, sticky="e", padx=8, pady=6)

        ttk.Label(top, text="Sistema cristalino").grid(row=2, column=0, sticky="w", padx=8, pady=6)
        self.system_combo = ttk.Combobox(top, textvariable=self.system_filter_var, values=["Todos"], state="readonly", width=22)
        self.system_combo.grid(row=2, column=1, sticky="w", padx=8, pady=6)
        self.system_combo.bind("<<ComboboxSelected>>", lambda event: self.apply_system_filter())
        ttk.Label(top, text="Dica: use esse filtro para separar cúbico, hexagonal, trigonal e outros.").grid(row=2, column=2, columnspan=5, sticky="w", padx=8, pady=6)

        top.columnconfigure(1, weight=1)
        top.columnconfigure(5, weight=1)

        middle = ttk.PanedWindow(root, orient="horizontal")
        middle.pack(fill="both", expand=True)

        list_frame = ttk.LabelFrame(middle, text="Estruturas encontradas")
        middle.add(list_frame, weight=4)

        tree_wrap = ttk.Frame(list_frame)
        tree_wrap.pack(fill="both", expand=True, padx=8, pady=(8, 4))

        self.tree = ttk.Treeview(
            tree_wrap,
            columns=("sel", "mpid", "formula", "system", "spacegroup", "ehull", "status", "sites"),
            show="headings",
            height=18
        )
        self.tree.heading("sel", text="")
        self.tree.heading("mpid", text="MP ID")
        self.tree.heading("formula", text="Fórmula")
        self.tree.heading("system", text="Sistema")
        self.tree.heading("spacegroup", text="Grupo espacial")
        self.tree.heading("ehull", text="E acima hull")
        self.tree.heading("status", text="Status")
        self.tree.heading("sites", text="Sites")

        self.tree.column("sel", width=42, anchor="center", stretch=False)
        self.tree.column("mpid", width=110, anchor="w")
        self.tree.column("formula", width=80, anchor="w")
        self.tree.column("system", width=130, anchor="w")
        self.tree.column("spacegroup", width=150, anchor="w")
        self.tree.column("ehull", width=110, anchor="e")
        self.tree.column("status", width=185, anchor="w")
        self.tree.column("sites", width=70, anchor="e")

        yscroll = ttk.Scrollbar(tree_wrap, orient="vertical", command=self.tree.yview)
        xscroll = ttk.Scrollbar(tree_wrap, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=yscroll.set, xscrollcommand=xscroll.set)
        self.tree.grid(row=0, column=0, sticky="nsew")
        yscroll.grid(row=0, column=1, sticky="ns")
        xscroll.grid(row=1, column=0, sticky="we")
        tree_wrap.rowconfigure(0, weight=1)
        tree_wrap.columnconfigure(0, weight=1)

        self.tree.bind("<Double-1>", self.toggle_row)
        self.tree.bind("<space>", self.toggle_focused_row)

        controls = ttk.Frame(list_frame)
        controls.pack(fill="x", padx=8, pady=(4, 8))
        ttk.Button(controls, text="Selecionar visíveis", command=self.select_visible).pack(side="left", padx=(0, 6))
        ttk.Button(controls, text="Selecionar tudo", command=self.select_all).pack(side="left", padx=(0, 6))
        ttk.Button(controls, text="Limpar seleção", command=self.clear_selection).pack(side="left", padx=(0, 6))
        ttk.Button(controls, text="Converter CIF/MOL2 em .glb", command=self.convert_files_to_glb).pack(side="right", padx=(6, 0))
        ttk.Button(controls, text="Exportar selecionadas em .glb", command=self.export_selected).pack(side="right")

        status_note = ttk.Label(list_frame, text="Status: Estável MP = no hull; Quase estável ≤ 0.025 eV/átomo; Metastável > 0.025 eV/átomo.")
        status_note.pack(fill="x", padx=8, pady=(0, 8))

        options_shell = ttk.LabelFrame(middle, text="Visual do GLB")
        middle.add(options_shell, weight=2)
        options = self.create_scrollable_frame(options_shell)

        self.option_checks["show_bonds"] = self.add_checkbox(options, "Mostrar ligações", self.show_bonds_var, 0, command=lambda: self.update_option_conflicts("show_bonds"))
        self.option_checks["show_cell"] = self.add_checkbox(options, "Mostrar célula unitária", self.show_cell_var, 1, command=self.update_option_conflicts)
        self.option_checks["show_polyhedra"] = self.add_checkbox(options, "Mostrar poliedros", self.show_polyhedra_var, 2, command=lambda: self.update_option_conflicts("show_polyhedra"))
        self.option_checks["center"] = self.add_checkbox(options, "Centralizar modelo", self.center_var, 3, command=lambda: self.update_option_conflicts("center"))
        self.option_checks["center_on_cell"] = self.add_checkbox(options, "Centralizar pela célula", self.center_on_cell_var, 4, command=lambda: self.update_option_conflicts("center_on_cell"))
        self.option_checks["use_summary_structure"] = self.add_checkbox(options, "Materials Project: usar estrutura do Summary/viewer", self.use_summary_structure_var, 5, command=lambda: self.update_option_conflicts("use_summary_structure"))
        self.option_checks["use_conventional_cell"] = self.add_checkbox(options, "Materials Project: pedir célula convencional", self.use_conventional_cell_var, 6, command=lambda: self.update_option_conflicts("use_conventional_cell"))
        self.option_checks["viewer_orientation"] = self.add_checkbox(options, "Orientar GLB como viewer", self.viewer_orientation_var, 7, command=self.update_option_conflicts)
        self.option_checks["mol2_apply_symmetry"] = self.add_checkbox(options, "MOL2: aplicar simetria do CRYSIN", self.mol2_apply_symmetry_var, 8, command=lambda: self.update_option_conflicts("mol2_apply_symmetry"))
        self.option_checks["mol2_wrap_components"] = self.add_checkbox(options, "MOL2: encaixar componentes na célula", self.mol2_wrap_components_var, 9, command=lambda: self.update_option_conflicts("mol2_wrap_components"))
        self.conflict_note_var = tk.StringVar(value="")
        ttk.Label(options, textvariable=self.conflict_note_var, wraplength=360, justify="left").grid(row=10, column=0, columnspan=3, sticky="we", padx=8, pady=(2, 8))

        self.add_spin(options, "Raio dos átomos", self.atom_radius_var, 11, 0.03, 1.0, 0.01)
        self.add_spin(options, "Raio das ligações", self.bond_radius_var, 12, 0.005, 0.3, 0.005)
        self.add_spin(options, "Alpha dos poliedros", self.poly_alpha_var, 13, 0.05, 1.0, 0.05)

        reps = ttk.LabelFrame(options, text="Repetição da célula")
        reps.grid(row=14, column=0, columnspan=3, sticky="we", padx=8, pady=8)
        ttk.Label(reps, text="X").grid(row=0, column=0, padx=6, pady=6)
        ttk.Spinbox(reps, from_=1, to=5, textvariable=self.repeat_x_var, width=6).grid(row=0, column=1, padx=6, pady=6)
        ttk.Label(reps, text="Y").grid(row=0, column=2, padx=6, pady=6)
        ttk.Spinbox(reps, from_=1, to=5, textvariable=self.repeat_y_var, width=6).grid(row=0, column=3, padx=6, pady=6)
        ttk.Label(reps, text="Z").grid(row=0, column=4, padx=6, pady=6)
        ttk.Spinbox(reps, from_=1, to=5, textvariable=self.repeat_z_var, width=6).grid(row=0, column=5, padx=6, pady=6)

        colors = ttk.LabelFrame(options, text="Cores")
        colors.grid(row=15, column=0, columnspan=3, sticky="we", padx=8, pady=8)
        self.add_color(colors, "Átomos padrão", self.atom_color_var, 0)
        ttk.Checkbutton(
            colors,
            text="Usar uma cor por tipo de átomo",
            variable=self.use_element_colors_var,
            command=self.refresh_element_color_controls
        ).grid(row=1, column=0, columnspan=3, sticky="w", padx=6, pady=(2, 5))
        self.element_colors_frame = ttk.LabelFrame(colors, text="Tipos de átomo")
        self.element_colors_frame.grid(row=2, column=0, columnspan=3, sticky="we", padx=6, pady=(2, 8))
        self.add_color(colors, "Ligações", self.bond_color_var, 3)
        self.add_color(colors, "Célula", self.cell_color_var, 4)
        self.add_color(colors, "Poliedros", self.poly_color_var, 5)
        self.ensure_element_color_vars(["C"])
        self.refresh_element_color_controls()

        quality = ttk.LabelFrame(options, text="Qualidade")
        quality.grid(row=16, column=0, columnspan=3, sticky="we", padx=8, pady=8)
        ttk.Label(quality, text="Esferas").grid(row=0, column=0, sticky="w", padx=6, pady=6)
        ttk.Spinbox(quality, from_=1, to=4, textvariable=self.sphere_quality_var, width=6).grid(row=0, column=1, sticky="w", padx=6, pady=6)
        ttk.Label(quality, text="Cilindros").grid(row=1, column=0, sticky="w", padx=6, pady=6)
        ttk.Spinbox(quality, from_=8, to=48, textvariable=self.cylinder_quality_var, width=6).grid(row=1, column=1, sticky="w", padx=6, pady=6)

        options.columnconfigure(1, weight=1)

        bottom = ttk.LabelFrame(root, text="Log")
        bottom.pack(fill="x", pady=(10, 0))
        self.log_box = tk.Text(bottom, height=7, wrap="word")
        log_scroll = ttk.Scrollbar(bottom, orient="vertical", command=self.log_box.yview)
        self.log_box.configure(yscrollcommand=log_scroll.set)
        self.log_box.pack(side="left", fill="both", expand=True, padx=(8, 0), pady=8)
        log_scroll.pack(side="right", fill="y", padx=(0, 8), pady=8)
        self.update_option_conflicts()

    def create_scrollable_frame(self, parent):
        outer = ttk.Frame(parent)
        outer.pack(fill="both", expand=True)
        canvas = tk.Canvas(outer, highlightthickness=0)
        scrollbar = ttk.Scrollbar(outer, orient="vertical", command=canvas.yview)
        inner = ttk.Frame(canvas)
        window_id = canvas.create_window((0, 0), window=inner, anchor="nw")

        def update_scroll_region(event=None):
            canvas.configure(scrollregion=canvas.bbox("all"))

        def resize_inner(event):
            canvas.itemconfigure(window_id, width=event.width)

        def on_mousewheel(event):
            if getattr(event, "num", None) == 4:
                canvas.yview_scroll(-1, "units")
            elif getattr(event, "num", None) == 5:
                canvas.yview_scroll(1, "units")
            else:
                canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

        def bind_scroll(event=None):
            canvas.bind_all("<MouseWheel>", on_mousewheel)
            canvas.bind_all("<Button-4>", on_mousewheel)
            canvas.bind_all("<Button-5>", on_mousewheel)

        def unbind_scroll(event=None):
            canvas.unbind_all("<MouseWheel>")
            canvas.unbind_all("<Button-4>")
            canvas.unbind_all("<Button-5>")

        inner.bind("<Configure>", update_scroll_region)
        canvas.bind("<Configure>", resize_inner)
        canvas.bind("<Enter>", bind_scroll)
        canvas.bind("<Leave>", unbind_scroll)
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.grid(row=0, column=0, sticky="nsew")
        scrollbar.grid(row=0, column=1, sticky="ns")
        outer.rowconfigure(0, weight=1)
        outer.columnconfigure(0, weight=1)
        return inner

    def ensure_element_color_vars(self, elements):
        for element in sorted(set(elements)):
            if element not in self.element_color_vars:
                self.element_color_vars[element] = tk.StringVar(value=default_element_color(element))

    def refresh_element_color_controls(self):
        if self.element_colors_frame is None:
            return
        for child in self.element_colors_frame.winfo_children():
            child.destroy()
        elements = sorted(self.element_color_vars.keys())
        if not elements:
            ttk.Label(self.element_colors_frame, text="Busque uma estrutura para carregar os tipos.").grid(row=0, column=0, sticky="w", padx=6, pady=5)
            return
        state = "normal" if self.use_element_colors_var.get() else "disabled"
        for row, element in enumerate(elements):
            ttk.Label(self.element_colors_frame, text=element, width=4).grid(row=row, column=0, sticky="w", padx=6, pady=4)
            entry = ttk.Entry(self.element_colors_frame, textvariable=self.element_color_vars[element], width=12)
            entry.grid(row=row, column=1, sticky="w", padx=6, pady=4)
            entry.configure(state=state)
            button = ttk.Button(self.element_colors_frame, text="Escolher", command=lambda el=element: self.pick_color(self.element_color_vars[el]))
            button.grid(row=row, column=2, sticky="w", padx=6, pady=4)
            button.configure(state=state)

    def update_element_colors_from_docs(self, docs):
        elements = []
        for doc in docs:
            elements.extend(get_doc_elements(doc))
        self.ensure_element_color_vars(elements)
        self.refresh_element_color_controls()

    def add_checkbox(self, parent, text, variable, row, command=None):
        widget = ttk.Checkbutton(parent, text=text, variable=variable, command=command)
        widget.grid(row=row, column=0, columnspan=3, sticky="w", padx=8, pady=5)
        return widget

    def update_option_conflicts(self, source=None):
        notes = []

        if not self.center_var.get():
            self.center_on_cell_var.set(False)
            self.set_option_state("center_on_cell", "disabled")
            notes.append("Centralizar pela célula fica bloqueado enquanto Centralizar modelo estiver desligado.")
        else:
            self.set_option_state("center_on_cell", "normal")

        if not self.show_bonds_var.get():
            self.show_polyhedra_var.set(False)
            self.set_option_state("show_polyhedra", "disabled")
            notes.append("Poliedros ficam bloqueados sem ligações da API/arquivo.")
        else:
            self.set_option_state("show_polyhedra", "normal")

        if self.show_bonds_var.get():
            if self.use_conventional_cell_var.get():
                self.use_conventional_cell_var.set(False)
            self.set_option_state("use_conventional_cell", "disabled")
            notes.append("Célula convencional fica bloqueada enquanto Mostrar ligações estiver ligado, para não misturar estrutura e bond graph.")
        else:
            if self.use_summary_structure_var.get():
                self.use_conventional_cell_var.set(False)
                self.set_option_state("use_conventional_cell", "disabled")
                self.set_option_state("use_summary_structure", "normal")
                notes.append("Célula convencional fica bloqueada enquanto a estrutura do Summary/viewer estiver ligada.")
            elif self.use_conventional_cell_var.get():
                self.use_summary_structure_var.set(False)
                self.set_option_state("use_summary_structure", "disabled")
                self.set_option_state("use_conventional_cell", "normal")
                notes.append("Summary/viewer fica bloqueado enquanto célula convencional estiver ligada.")
            else:
                self.set_option_state("use_summary_structure", "normal")
                self.set_option_state("use_conventional_cell", "normal")

        if not self.mol2_apply_symmetry_var.get():
            self.mol2_wrap_components_var.set(False)
            self.set_option_state("mol2_wrap_components", "disabled")
            notes.append("Encaixar componentes MOL2 fica bloqueado sem aplicar a simetria do CRYSIN.")
        else:
            self.set_option_state("mol2_wrap_components", "normal")

        if hasattr(self, "conflict_note_var"):
            if notes:
                self.conflict_note_var.set("Bloqueios automáticos:\n" + "\n".join(f"• {note}" for note in notes))
            else:
                self.conflict_note_var.set("Sem conflitos ativos. Materials Project usa a estrutura escolhida; MOL2 usa as ligações do arquivo.")

    def set_option_state(self, key, state):
        widget = self.option_checks.get(key) if hasattr(self, "option_checks") else None
        if widget is not None:
            widget.configure(state=state)

    def add_spin(self, parent, label, variable, row, start, end, increment):
        ttk.Label(parent, text=label).grid(row=row, column=0, sticky="w", padx=8, pady=5)
        spin = ttk.Spinbox(parent, from_=start, to=end, increment=increment, textvariable=variable, width=10)
        spin.grid(row=row, column=1, sticky="w", padx=8, pady=5)

    def add_color(self, parent, label, variable, row):
        ttk.Label(parent, text=label).grid(row=row, column=0, sticky="w", padx=6, pady=5)
        ttk.Entry(parent, textvariable=variable, width=12).grid(row=row, column=1, sticky="w", padx=6, pady=5)
        ttk.Button(parent, text="Escolher", command=lambda: self.pick_color(variable)).grid(row=row, column=2, sticky="w", padx=6, pady=5)

    def pick_color(self, variable):
        chosen = colorchooser.askcolor(color=variable.get())
        if chosen and chosen[1]:
            variable.set(chosen[1])

    def choose_output(self):
        folder = filedialog.askdirectory(initialdir=self.output_var.get() or str(Path.cwd()))
        if folder:
            self.output_var.set(folder)

    def log(self, text):
        self.log_box.insert("end", str(text) + "\n")
        self.log_box.see("end")
        self.update_idletasks()

    def threaded(self, target):
        threading.Thread(target=target, daemon=True).start()

    def search_materials(self):
        def task():
            self.after(0, lambda: self.log("Buscando no Materials Project..."))
            try:
                api_key = self.api_key_var.get().strip() or DEFAULT_API_KEY
                element_text = self.element_var.get().strip()
                elements = parse_element_list(element_text)
                if not elements:
                    raise ValueError("Informe pelo menos um elemento, por exemplo C ou NaCl.")

                theoretical = False if self.observed_var.get() else None
                is_stable = True if self.stable_var.get() else None

                with MPRester(api_key) as mpr:
                    docs = mpr.materials.summary.search(
                        elements=elements,
                        num_elements=(len(elements), len(elements)),
                        theoretical=theoretical,
                        deprecated=False,
                        is_stable=is_stable,
                        include_gnome=False,
                        fields=[
                            "material_id",
                            "formula_pretty",
                            "structure",
                            "symmetry",
                            "energy_above_hull",
                            "is_stable",
                            "theoretical"
                        ]
                    )

                docs = sorted(docs, key=lambda d: (
                    float(getattr(d, "energy_above_hull", 9999) or 9999),
                    get_crystal_system(d),
                    str(getattr(d, "material_id", ""))
                ))

                self.after(0, lambda result=docs: self.populate_all_docs(result))
                self.after(0, lambda count=len(docs), el=", ".join(elements): self.log(f"Encontradas {count} estruturas para {el}."))
                self.after(0, lambda: self.log("Status atualizado: Estável MP, Quase estável ou Metastável, separado da origem Observada/Teórica."))
                self.after(0, lambda: self.log("Na exportação, o app prioriza a estrutura do Summary/viewer; se as ligações da API usarem outra célula, ele ajusta para a célula do bond graph."))
            except Exception as e:
                err = str(e)
                self.after(0, lambda msg=err: messagebox.showerror("Erro na busca", msg))
                self.after(0, lambda msg=err: self.log(f"Erro: {msg}"))

        self.threaded(task)

    def populate_all_docs(self, docs):
        self.all_docs = docs
        self.update_element_colors_from_docs(docs)
        self.selected = {str(getattr(doc, "material_id", idx)): True for idx, doc in enumerate(docs)}
        systems = sorted(set(get_crystal_system(doc) for doc in docs))
        self.system_combo.configure(values=["Todos"] + systems)
        if self.system_filter_var.get() not in ["Todos"] + systems:
            self.system_filter_var.set("Todos")
        self.apply_system_filter()

    def apply_system_filter(self):
        chosen_system = self.system_filter_var.get()
        if chosen_system == "Todos":
            self.docs = list(self.all_docs)
        else:
            self.docs = [doc for doc in self.all_docs if get_crystal_system(doc) == chosen_system]
        self.populate_tree(self.docs)
        self.log(f"Filtro de sistema: {chosen_system}. Visíveis: {len(self.docs)}.")

    def populate_tree(self, docs):
        for item in self.tree.get_children():
            self.tree.delete(item)

        for idx, doc in enumerate(docs):
            mpid = str(getattr(doc, "material_id", f"item_{idx}"))
            formula = str(getattr(doc, "formula_pretty", ""))
            structure = getattr(doc, "structure", None)
            sites = len(structure.sites) if structure is not None else ""
            system = get_crystal_system(doc)
            sg = get_space_group(doc)
            ehull = getattr(doc, "energy_above_hull", None)
            ehull_text = "" if ehull is None else f"{float(ehull):.5f}"
            status = get_material_status(doc)
            if mpid not in self.selected:
                self.selected[mpid] = True
            marker = "☑" if self.selected.get(mpid, False) else "☐"
            self.tree.insert("", "end", iid=mpid, values=(marker, mpid, formula, system, sg, ehull_text, status, sites))

    def toggle_row(self, event=None):
        item = self.tree.identify_row(event.y) if event else self.tree.focus()
        if item:
            self.set_selected(item, not self.selected.get(item, False))

    def toggle_focused_row(self, event=None):
        item = self.tree.focus()
        if item:
            self.set_selected(item, not self.selected.get(item, False))
        return "break"

    def set_selected(self, item, value):
        self.selected[item] = value
        if self.tree.exists(item):
            values = list(self.tree.item(item, "values"))
            values[0] = "☑" if value else "☐"
            self.tree.item(item, values=values)

    def select_visible(self):
        for item in self.tree.get_children():
            self.set_selected(item, True)

    def select_all(self):
        for doc in self.all_docs:
            mpid = str(getattr(doc, "material_id", ""))
            self.selected[mpid] = True
        self.populate_tree(self.docs)

    def clear_selection(self):
        for doc in self.all_docs:
            mpid = str(getattr(doc, "material_id", ""))
            self.selected[mpid] = False
        self.populate_tree(self.docs)

    def get_options(self):
        return {
            "show_bonds": self.show_bonds_var.get(),
            "show_cell": self.show_cell_var.get(),
            "show_polyhedra": self.show_polyhedra_var.get(),
            "center": self.center_var.get(),
            "center_on_cell": self.center_on_cell_var.get(),
            "use_summary_structure": self.use_summary_structure_var.get(),
            "use_conventional_cell": self.use_conventional_cell_var.get(),
            "viewer_orientation": self.viewer_orientation_var.get(),
            "mol2_apply_symmetry": self.mol2_apply_symmetry_var.get(),
            "mol2_wrap_components": self.mol2_wrap_components_var.get(),
            "atom_color": self.atom_color_var.get(),
            "use_element_colors": self.use_element_colors_var.get(),
            "element_colors": {element: var.get() for element, var in self.element_color_vars.items()},
            "bond_color": self.bond_color_var.get(),
            "cell_color": self.cell_color_var.get(),
            "poly_color": self.poly_color_var.get(),
            "atom_radius": float(self.atom_radius_var.get()),
            "bond_radius": float(self.bond_radius_var.get()),
            "poly_alpha": float(self.poly_alpha_var.get()),
            "repeat_x": int(self.repeat_x_var.get()),
            "repeat_y": int(self.repeat_y_var.get()),
            "repeat_z": int(self.repeat_z_var.get()),
            "sphere_quality": int(self.sphere_quality_var.get()),
            "cylinder_quality": int(self.cylinder_quality_var.get())
        }

    def convert_files_to_glb(self):
        files = filedialog.askopenfilenames(
            title="Escolha arquivo(s) CIF ou MOL2",
            filetypes=[
                ("Arquivos CIF e MOL2", "*.cif *.mcif *.mol2"),
                ("CIF files", "*.cif *.mcif"),
                ("MOL2 files", "*.mol2"),
                ("All files", "*.*")
            ]
        )
        if not files:
            return

        def task():
            try:
                out_dir = Path(self.output_var.get()).expanduser().resolve()
                out_dir.mkdir(parents=True, exist_ok=True)
                options = self.get_options()
                self.after(0, lambda count=len(files): self.log(f"Convertendo {count} arquivo(s) em GLB..."))

                for file_path in files:
                    source = Path(file_path)
                    suffix = source.suffix.lower()
                    try:
                        output = unique_output_path(out_dir / f"{safe_filename(source.stem)}.glb")
                        if suffix == ".mol2":
                            molecule_data = parse_mol2(source)
                            scene = molecule_to_scene(molecule_data, options)
                            scene.export(str(output))
                            self.after(0, lambda f=output: self.log(f"MOL2 convertido: {f}"))
                        elif suffix in [".cif", ".mcif"]:
                            structure = Structure.from_file(str(source))
                            scene = structure_to_scene(structure, options, api_bond_edges=[], api_chemenv_available=False)
                            scene.export(str(output))
                            self.after(0, lambda f=output: self.log(f"CIF convertido sem ligações inferidas: {f}"))
                        else:
                            self.after(0, lambda n=source.name: self.log(f"Formato ignorado: {n}"))
                    except Exception as inner_error:
                        message = f"Erro ao converter {source.name}: {inner_error}"
                        self.after(0, lambda msg=message: self.log(msg))

                self.after(0, lambda folder=out_dir: messagebox.showinfo("Finalizado", f"Conversão finalizada em:\n{folder}"))
            except Exception as e:
                err = str(e)
                self.after(0, lambda msg=err: messagebox.showerror("Erro na conversão", msg))
                self.after(0, lambda msg=err: self.log(f"Erro: {msg}"))

        self.threaded(task)

    def export_selected(self):
        def task():
            try:
                chosen = []
                for doc in self.all_docs:
                    mpid = str(getattr(doc, "material_id", ""))
                    if self.selected.get(mpid, False):
                        chosen.append(doc)

                if not chosen:
                    self.after(0, lambda: messagebox.showwarning("Nada selecionado", "Selecione pelo menos uma estrutura."))
                    return

                out_dir = Path(self.output_var.get()).expanduser().resolve()
                out_dir.mkdir(parents=True, exist_ok=True)
                options = self.get_options()
                api_key = self.api_key_var.get().strip() or DEFAULT_API_KEY

                self.after(0, lambda count=len(chosen): self.log(f"Exportando {count} estrutura(s) com dados da API..."))

                with MPRester(api_key) as mpr:
                    for n, doc in enumerate(chosen, start=1):
                        mpid = str(getattr(doc, "material_id", ""))
                        try:
                            structure = None
                            if options.get("use_summary_structure", True):
                                structure = getattr(doc, "structure", None)
                                if structure is not None:
                                    self.after(0, lambda current=mpid: self.log(f"{current}: usando estrutura do Summary/viewer."))
                            if structure is None:
                                structure = get_api_structure(mpr, mpid, options["use_conventional_cell"])
                                if structure is not None and options["use_conventional_cell"]:
                                    self.after(0, lambda current=mpid: self.log(f"{current}: usando célula convencional pedida ao Materials Project."))
                            if structure is None:
                                self.after(0, lambda current=mpid: self.log(f"Pulando {current}: API não retornou estrutura."))
                                continue

                            api_bond_edges = []
                            if options["show_bonds"]:
                                api_bond_edges, bond_status, graph_structure = fetch_api_bond_edges(mpr, mpid, structure)
                                if graph_structure is not None and api_bond_edges and not structures_match_for_graph(structure, graph_structure):
                                    structure = graph_structure
                                self.after(0, lambda current=mpid, status=bond_status: self.log(f"{current}: {status}."))

                            api_chemenv_available = False
                            if options["show_polyhedra"]:
                                api_chemenv_available, chemenv_status = fetch_api_chemenv_available(mpr, mpid)
                                self.after(0, lambda current=mpid, status=chemenv_status: self.log(f"{current}: {status}."))
                                if not api_bond_edges:
                                    self.after(0, lambda current=mpid: self.log(f"{current}: poliedros não foram montados sem bond graph compatível da API."))

                            label = safe_filename(get_structure_label(doc))
                            filename = unique_output_path(out_dir / f"{n:03d}_{label}.glb")
                            scene = structure_to_scene(
                                structure,
                                options,
                                api_bond_edges=api_bond_edges,
                                api_chemenv_available=api_chemenv_available
                            )
                            scene.export(str(filename))
                            self.after(0, lambda f=filename: self.log(f"Salvo: {f}"))
                        except Exception as inner_error:
                            message = f"Erro ao exportar {mpid}: {inner_error}"
                            self.after(0, lambda msg=message: self.log(msg))

                self.after(0, lambda folder=out_dir: messagebox.showinfo("Finalizado", f"Arquivos .glb salvos em:\n{folder}"))
            except Exception as e:
                err = str(e)
                self.after(0, lambda msg=err: messagebox.showerror("Erro na exportação", msg))
                self.after(0, lambda msg=err: self.log(f"Erro: {msg}"))

        self.threaded(task)


if __name__ == "__main__":
    app = MaterialsDownloaderApp()
    app.mainloop()
