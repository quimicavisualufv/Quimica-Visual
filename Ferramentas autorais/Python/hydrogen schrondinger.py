import json
import numpy as np
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
from scipy.special import eval_genlaguerre, factorial

try:
    from scipy.special import sph_harm_y

    def Ylm(l, m, theta, phi):
        return sph_harm_y(l, m, theta, phi)
except ImportError:
    from scipy.special import sph_harm

    def Ylm(l, m, theta, phi):
        return sph_harm(m, l, phi, theta)

a0 = 1.0
N_OPTIONS = [1, 2, 3, 4, 5]
ORBITAL_OPTIONS = ["s", "p_x", "p_y", "p_z", "d_xy", "d_yz", "d_xz", "d_x2_y2", "d_z2"]
PLOT_OPTIONS = ["Função de onda 2D", "Densidade 2D", "Radial", "Orbital 3D"]
PLANE_OPTIONS = ["xy", "xz", "yz"]


def radial_hydrogen(n, l, r, a0=1.0):
    rho = 2.0 * r / (n * a0)
    pref = (2.0 / (n * a0)) ** 1.5
    norm = np.sqrt(float(factorial(n - l - 1)) / (2.0 * n * float(factorial(n + l))))
    lag = eval_genlaguerre(n - l - 1, 2 * l + 1, rho)
    return pref * norm * np.exp(-rho / 2.0) * rho**l * lag


def orbital_to_l(orbital):
    if orbital == "s":
        return 0
    if orbital in ["p_x", "p_y", "p_z"]:
        return 1
    if orbital in ["d_xy", "d_yz", "d_xz", "d_x2_y2", "d_z2"]:
        return 2
    raise ValueError("Orbital inválido.")


def orbital_compact_name(orbital):
    mapping = {
        "s": "s",
        "p_x": "px",
        "p_y": "py",
        "p_z": "pz",
        "d_xy": "dxy",
        "d_yz": "dyz",
        "d_xz": "dxz",
        "d_x2_y2": "dx2-y2",
        "d_z2": "dz2"
    }
    if orbital not in mapping:
        raise ValueError("Orbital inválido.")
    return mapping[orbital]


def orbital_compact_label(n, orbital):
    return f"{int(n)}{orbital_compact_name(orbital)}"


def orbital_aliases(n, orbital):
    compact = orbital_compact_name(orbital)
    aliases = [
        orbital,
        compact,
        f"{int(n)}_{orbital}",
        orbital_compact_label(n, orbital)
    ]
    compact_flat = compact.replace("-", "")
    if compact_flat not in aliases:
        aliases.append(compact_flat)
    flat_label = f"{int(n)}{compact_flat}"
    if flat_label not in aliases:
        aliases.append(flat_label)
    return aliases


def angular_real(orbital, theta, phi):
    if orbital == "s":
        return Ylm(0, 0, theta, phi).real
    if orbital == "p_z":
        return Ylm(1, 0, theta, phi).real
    if orbital == "p_x":
        return ((Ylm(1, -1, theta, phi) - Ylm(1, 1, theta, phi)) / np.sqrt(2)).real
    if orbital == "p_y":
        return ((Ylm(1, -1, theta, phi) + Ylm(1, 1, theta, phi)) / (np.sqrt(2) * 1j)).real
    if orbital == "d_z2":
        return Ylm(2, 0, theta, phi).real
    if orbital == "d_xz":
        return ((Ylm(2, -1, theta, phi) - Ylm(2, 1, theta, phi)) / np.sqrt(2)).real
    if orbital == "d_yz":
        return ((Ylm(2, -1, theta, phi) + Ylm(2, 1, theta, phi)) / (np.sqrt(2) * 1j)).real
    if orbital == "d_x2_y2":
        return ((Ylm(2, 2, theta, phi) + Ylm(2, -2, theta, phi)) / np.sqrt(2)).real
    if orbital == "d_xy":
        return ((Ylm(2, -2, theta, phi) - Ylm(2, 2, theta, phi)) / (np.sqrt(2) * 1j)).real
    raise ValueError("Orbital inválido.")


def psi_real(n, orbital, r, theta, phi, a0=1.0):
    l = orbital_to_l(orbital)
    if n <= l:
        raise ValueError(f"Para {orbital}, use n >= {l + 1}.")
    R = radial_hydrogen(n, l, r, a0=a0)
    Y = angular_real(orbital, theta, phi)
    return R * Y


def cartesian_to_spherical(x, y, z):
    r = np.sqrt(x**2 + y**2 + z**2)
    theta = np.zeros_like(r)
    mask = r > 0
    theta[mask] = np.arccos(np.clip(z[mask] / r[mask], -1.0, 1.0))
    phi = np.arctan2(y, x) % (2 * np.pi)
    return r, theta, phi


def psi_grid(n, orbital, X, Y, Z):
    r, theta, phi = cartesian_to_spherical(X, Y, Z)
    return psi_real(n, orbital, r, theta, phi)


def prob_density_grid(n, orbital, X, Y, Z):
    psi = psi_grid(n, orbital, X, Y, Z)
    return np.abs(psi) ** 2


def get_radial_nodes(n, l, rmax, samples=50000):
    if n - l - 1 <= 0:
        return []
    r = np.linspace(1e-6, rmax, samples)
    R = np.real(radial_hydrogen(n, l, r))
    signs = np.sign(R)
    for i in range(1, len(signs)):
        if signs[i] == 0:
            signs[i] = signs[i - 1]
    if signs[0] == 0:
        signs[0] = 1
    indices = np.where(signs[:-1] * signs[1:] < 0)[0]
    nodes = []
    for i in indices:
        r1 = r[i]
        r2 = r[i + 1]
        y1 = R[i]
        y2 = R[i + 1]
        if y2 != y1:
            node = r1 - y1 * (r2 - r1) / (y2 - y1)
        else:
            node = 0.5 * (r1 + r2)
        nodes.append(float(node))
    return nodes


def radial_probability(n, l, r):
    R = radial_hydrogen(n, l, r)
    return r**2 * np.abs(R)**2


def compute_effective_extent(n, orbital, base_extent=None):
    if base_extent is None:
        base_extent = 8 * n**2
    l = orbital_to_l(orbital)
    r = np.linspace(0.0, base_extent, 24000)
    P = radial_probability(n, l, r)
    if np.all(P == 0):
        return float(base_extent)
    cumulative = np.zeros_like(r)
    cumulative[1:] = np.cumsum(0.5 * (P[:-1] + P[1:]) * np.diff(r))
    total = cumulative[-1]
    if total <= 0:
        return float(base_extent)
    cumulative /= total
    target = 0.997 if orbital == "s" else 0.995
    index = int(np.searchsorted(cumulative, target))
    index = min(index, len(r) - 1)
    effective = float(r[index])
    if orbital == "s":
        nodes = get_radial_nodes(n, l, base_extent)
        if nodes:
            effective = max(effective, nodes[-1] * 1.35)
    effective = max(effective * 1.10, 6.0)
    return float(min(base_extent, effective))


def fibonacci_sphere(count, offset=0):
    if count <= 0:
        return np.empty((0, 3))
    i = np.arange(count, dtype=float) + 0.5
    golden = np.pi * (3.0 - np.sqrt(5.0))
    z = 1.0 - 2.0 * i / count
    z = np.clip(z, -1.0, 1.0)
    radial = np.sqrt(np.maximum(0.0, 1.0 - z * z))
    theta = golden * (i + float(offset))
    x = radial * np.cos(theta)
    y = radial * np.sin(theta)
    return np.column_stack([x, y, z])


def allocate_surface_shell_counts(peak_radii, max_points):
    shell_count = len(peak_radii)
    if shell_count == 0:
        return np.array([], dtype=int)
    minimum = min(900, max(240, max_points // max(1, 3 * shell_count)))
    allocations = np.full(shell_count, minimum, dtype=int)
    if allocations.sum() > max_points:
        base = max(1, max_points // shell_count)
        allocations[:] = base
        while allocations.sum() > max_points:
            j = int(np.argmax(allocations))
            allocations[j] -= 1
        return allocations
    remaining = max_points - allocations.sum()
    weights = np.square(np.maximum(np.array(peak_radii, dtype=float), 1e-6))
    weights /= weights.sum()
    extra = np.floor(weights * remaining).astype(int)
    allocations += extra
    remainder = weights * remaining - extra
    order = np.argsort(-remainder)
    i = 0
    while allocations.sum() < max_points:
        allocations[order[i % shell_count]] += 1
        i += 1
    return allocations


def build_exact_s_point_data(n, max_points, points_axis):
    extent = compute_effective_extent(n, "s")
    radial_samples = max(40000, int(points_axis) * 600)
    r = np.linspace(0.0, extent, radial_samples)
    theta0 = np.zeros_like(r)
    phi0 = np.zeros_like(r)
    psi_r = np.real(psi_real(n, "s", r, theta0, phi0))
    density_r = np.abs(psi_r) ** 2
    radial_prob = r**2 * density_r
    nodes = get_radial_nodes(n, 0, extent, samples=radial_samples)
    boundaries = [0.0] + list(nodes) + [float(extent)]

    shell_defs = []
    for shell_id, (left, right) in enumerate(zip(boundaries[:-1], boundaries[1:])):
        region = (r >= left) & (r <= right)
        if not np.any(region):
            continue
        rr = r[region]
        region_prob = radial_prob[region]
        region_psi = psi_r[region]
        peak_index = int(np.argmax(region_prob))
        peak_r = float(rr[peak_index])
        region_width = max(float(right - left), 1e-6)
        half_gap = max(min(peak_r - left, right - peak_r), 0.12)
        shell_half_width = max(0.08, 0.22 * half_gap)
        margin = min(0.08 * region_width, 0.4 * half_gap)
        if shell_half_width < 0.15 or region_width < 0.6:
            layer_fracs = [0.0]
        else:
            layer_fracs = [-0.45, 0.0, 0.45]
        surface_radii = []
        for frac in layer_fracs:
            radius = peak_r + frac * shell_half_width
            radius = max(left + margin, min(right - margin, radius))
            surface_radii.append(float(radius))
        surface_radii = sorted({round(v, 6): v for v in surface_radii}.values())
        sign = 1
        if region_psi[peak_index] < 0:
            sign = -1
        shell_defs.append({
            "shell_id": shell_id,
            "left": float(left),
            "right": float(right),
            "peak_r": peak_r,
            "half_width": float(shell_half_width),
            "surface_radii": surface_radii,
            "sign": sign
        })

    if not shell_defs:
        raise ValueError("Nenhum ponto 3D foi gerado para este orbital.")

    peak_radii = [entry["peak_r"] for entry in shell_defs]
    shell_alloc = allocate_surface_shell_counts(peak_radii, max_points)

    points_xyz = []
    points_psi = []
    points_density = []
    points_shell = []
    direction_offset = 0

    for entry, allocation in zip(shell_defs, shell_alloc):
        if allocation <= 0:
            continue
        radii = entry["surface_radii"]
        per_surface = np.full(len(radii), allocation // len(radii), dtype=int)
        per_surface[: allocation % len(radii)] += 1
        for radius, count in zip(radii, per_surface):
            if count <= 0:
                continue
            directions = fibonacci_sphere(int(count), direction_offset)
            xyz = directions * float(radius)
            psi_value = float(np.interp(radius, r, psi_r))
            density_value = float(np.interp(radius, r, density_r))
            points_xyz.append(xyz)
            points_psi.append(np.full(int(count), psi_value, dtype=float))
            points_density.append(np.full(int(count), density_value, dtype=float))
            points_shell.append(np.full(int(count), entry["shell_id"], dtype=int))
            direction_offset += int(count)

    xyz = np.concatenate(points_xyz, axis=0)
    psi_values = np.concatenate(points_psi)
    density_values = np.concatenate(points_density)
    shell_values = np.concatenate(points_shell)

    return {
        "x": xyz[:, 0],
        "y": xyz[:, 1],
        "z": xyz[:, 2],
        "psi": psi_values,
        "density": density_values,
        "shell_index": shell_values,
        "radial_nodes": np.array(nodes, dtype=float),
        "shell_peak_radii": np.array([entry["peak_r"] for entry in shell_defs], dtype=float),
        "shell_inner_radii": np.array([min(entry["surface_radii"]) for entry in shell_defs], dtype=float),
        "shell_outer_radii": np.array([max(entry["surface_radii"]) for entry in shell_defs], dtype=float),
        "extent": float(extent),
        "grid_points_per_axis": int(points_axis),
        "point_count_before_limit": int(len(psi_values)),
        "point_count": int(len(psi_values)),
        "sampling_mode": "s_exact_radial_surfaces"
    }


def build_cartesian_point_data(n, orbital, level, max_points, points_axis):
    extent = compute_effective_extent(n, orbital)
    axis = np.linspace(-extent, extent, points_axis)
    X, Y, Z = np.meshgrid(axis, axis, axis, indexing="ij")
    psi = np.real(psi_grid(n, orbital, X, Y, Z))
    density = np.abs(psi) ** 2
    amplitude = np.max(np.abs(psi))
    if amplitude <= 0:
        raise ValueError("Nenhum ponto 3D foi gerado para este orbital.")
    mask = np.abs(psi) >= level * amplitude
    x = X[mask].reshape(-1)
    y = Y[mask].reshape(-1)
    z = Z[mask].reshape(-1)
    psi_values = psi[mask].reshape(-1)
    density_values = density[mask].reshape(-1)
    original_count = int(x.size)
    if original_count == 0:
        raise ValueError("Nenhum ponto 3D foi gerado para este orbital.")
    if original_count > max_points:
        indices = np.linspace(0, original_count - 1, max_points, dtype=int)
        x = x[indices]
        y = y[indices]
        z = z[indices]
        psi_values = psi_values[indices]
        density_values = density_values[indices]
    return {
        "x": x,
        "y": y,
        "z": z,
        "psi": psi_values,
        "density": density_values,
        "shell_index": np.zeros(len(psi_values), dtype=int),
        "radial_nodes": np.array([], dtype=float),
        "shell_peak_radii": np.array([], dtype=float),
        "shell_inner_radii": np.array([], dtype=float),
        "shell_outer_radii": np.array([], dtype=float),
        "extent": float(extent),
        "grid_points_per_axis": int(points_axis),
        "point_count_before_limit": original_count,
        "point_count": int(len(psi_values)),
        "sampling_mode": "cartesian_threshold_sampling"
    }


def build_orbital3d_point_data(n, orbital, level, max_points, points_axis):
    if points_axis < 10:
        raise ValueError("Use pelo menos 10 pontos por eixo no JSON 3D.")
    if max_points <= 0:
        raise ValueError("O máximo de pontos por orbital deve ser maior que 0.")
    if level <= 0:
        raise ValueError("O limiar relativo deve ser maior que 0.")
    effective_points_axis = int(points_axis)
    if orbital == "s":
        effective_points_axis = max(int(points_axis), 55)
        return build_exact_s_point_data(n, max_points, effective_points_axis)
    return build_cartesian_point_data(n, orbital, level, max_points, effective_points_axis)


def build_point_records(x, y, z, psi_values, density_values, shell_indices):
    records = []
    for xi, yi, zi, psii, rhoi, shell_id in zip(x, y, z, psi_values, density_values, shell_indices):
        sign = 0
        if psii > 0:
            sign = 1
        elif psii < 0:
            sign = -1
        records.append({
            "x": float(xi),
            "y": float(yi),
            "z": float(zi),
            "psi": float(psii),
            "abs_psi": float(abs(psii)),
            "density": float(rhoi),
            "sign": sign,
            "shell_index": int(shell_id)
        })
    return records


def compute_axis_limit(x, y, z, fallback_extent):
    if len(x) == 0:
        return float(max(1.0, fallback_extent))
    max_abs = max(float(np.max(np.abs(x))), float(np.max(np.abs(y))), float(np.max(np.abs(z))), 1.0)
    return float(min(max(fallback_extent, max_abs * 1.08), fallback_extent * 1.05))


JSON_2D_POINTS_DEFAULT = 180
JSON_RADIAL_POINTS_DEFAULT = 1200


def quantize_signed_matrix(matrix, max_abs_value):
    max_abs = max(float(max_abs_value), 1e-12)
    quantized = np.round(np.clip(matrix / max_abs, -1.0, 1.0) * 32767.0).astype(np.int16)
    return quantized, max_abs


def quantize_unsigned_matrix(matrix):
    quantized = np.round(np.clip(matrix, 0.0, 1.0) * 65535.0).astype(np.uint16)
    return quantized


def build_compact_wave2d_dataset(psi, extent, plane, labels):
    quantized, max_abs = quantize_signed_matrix(np.real(psi), np.max(np.abs(psi)))
    return {
        "encoding": "int16_normalized_flat",
        "shape": [int(quantized.shape[0]), int(quantized.shape[1])],
        "u_min": float(-extent),
        "u_max": float(extent),
        "v_min": float(-extent),
        "v_max": float(extent),
        "psi_max_abs": float(max_abs),
        "plane": plane,
        "labels": [labels[0], labels[1]],
        "points": int(quantized.shape[0]),
        "data": quantized.reshape(-1).astype(int).tolist()
    }


def build_compact_density2d_dataset(rho, extent, plane, labels):
    quantized = quantize_unsigned_matrix(rho)
    return {
        "encoding": "uint16_normalized_flat",
        "shape": [int(quantized.shape[0]), int(quantized.shape[1])],
        "u_min": float(-extent),
        "u_max": float(extent),
        "v_min": float(-extent),
        "v_max": float(extent),
        "rho_min": 0.0,
        "rho_max": 1.0,
        "plane": plane,
        "labels": [labels[0], labels[1]],
        "points": int(quantized.shape[0]),
        "data": quantized.reshape(-1).astype(int).tolist()
    }


def build_compact_radial_dataset(r, radial_values, probability_values, l_value):
    r_out = np.round(np.asarray(r, dtype=float), 6)
    radial_out = np.round(np.asarray(radial_values, dtype=float), 8)
    probability_out = np.round(np.asarray(probability_values, dtype=float), 8)
    return {
        "encoding": "float_lists",
        "r": r_out.tolist(),
        "R": radial_out.tolist(),
        "probability": probability_out.tolist(),
        "l": int(l_value),
        "rmax": float(r_out[-1]) if len(r_out) else 0.0,
        "points": int(len(r_out))
    }


class App:
    def __init__(self, root):
        self.root = root
        self.root.title("Orbitais do Hidrogênio")
        self.root.geometry("1180x760")

        self.n_var = tk.IntVar(value=2)
        self.orbital_var = tk.StringVar(value="p_z")
        self.plot_var = tk.StringVar(value="Função de onda 2D")
        self.plane_var = tk.StringVar(value="xz")
        self.export_radial_var = tk.BooleanVar(value=True)
        self.export_wave2d_var = tk.BooleanVar(value=True)
        self.export_density2d_var = tk.BooleanVar(value=True)
        self.export_orbital3d_var = tk.BooleanVar(value=True)
        self.export_metadata_var = tk.BooleanVar(value=True)
        self.json_level_var = tk.DoubleVar(value=0.14)
        self.json_max_points_var = tk.IntVar(value=12000)
        self.json_points_axis_var = tk.IntVar(value=55)
        self.json_2d_points_var = tk.IntVar(value=JSON_2D_POINTS_DEFAULT)

        layout = ttk.Frame(root)
        layout.pack(fill="both", expand=True)

        controls_container = ttk.Frame(layout)
        controls_container.pack(side="left", fill="y")

        self.controls_canvas = tk.Canvas(controls_container, highlightthickness=0, borderwidth=0, width=320)
        self.controls_canvas.pack(side="left", fill="y", expand=False)

        controls_scrollbar = ttk.Scrollbar(controls_container, orient="vertical", command=self.controls_canvas.yview)
        controls_scrollbar.pack(side="right", fill="y")

        self.controls_canvas.configure(yscrollcommand=controls_scrollbar.set)

        controls = ttk.Frame(self.controls_canvas, padding=12)
        self.controls_window = self.controls_canvas.create_window((0, 0), window=controls, anchor="nw")

        def _update_controls_scrollregion(event=None):
            self.controls_canvas.configure(scrollregion=self.controls_canvas.bbox("all"))

        def _sync_controls_width(event):
            self.controls_canvas.itemconfigure(self.controls_window, width=event.width)

        controls.bind("<Configure>", _update_controls_scrollregion)
        self.controls_canvas.bind("<Configure>", _sync_controls_width)
        self.controls_canvas.bind("<Enter>", self._bind_controls_mousewheel)
        self.controls_canvas.bind("<Leave>", self._unbind_controls_mousewheel)

        plot_frame = ttk.Frame(layout, padding=12)
        plot_frame.pack(side="right", fill="both", expand=True)

        ttk.Label(controls, text="n").pack(anchor="w", pady=(0, 4))
        ttk.Combobox(controls, textvariable=self.n_var, values=N_OPTIONS, state="readonly", width=18).pack(anchor="w", pady=(0, 10))

        ttk.Label(controls, text="Orbital").pack(anchor="w", pady=(0, 4))
        ttk.Combobox(controls, textvariable=self.orbital_var, values=ORBITAL_OPTIONS, state="readonly", width=18).pack(anchor="w", pady=(0, 10))

        ttk.Label(controls, text="Gráfico").pack(anchor="w", pady=(0, 4))
        ttk.Combobox(controls, textvariable=self.plot_var, values=PLOT_OPTIONS, state="readonly", width=18).pack(anchor="w", pady=(0, 10))

        ttk.Label(controls, text="Plano").pack(anchor="w", pady=(0, 4))
        ttk.Combobox(controls, textvariable=self.plane_var, values=PLANE_OPTIONS, state="readonly", width=18).pack(anchor="w", pady=(0, 14))

        ttk.Button(controls, text="Plotar", command=self.plot).pack(anchor="w", fill="x", pady=(0, 8))
        ttk.Button(controls, text="Exemplo 1s", command=lambda: self.set_example(1, "s", "Função de onda 2D", "xz")).pack(anchor="w", fill="x", pady=4)
        ttk.Button(controls, text="Exemplo 2p_z", command=lambda: self.set_example(2, "p_z", "Função de onda 2D", "xz")).pack(anchor="w", fill="x", pady=4)
        ttk.Button(controls, text="Exemplo 3d_z2", command=lambda: self.set_example(3, "d_z2", "Orbital 3D", "xz")).pack(anchor="w", fill="x", pady=4)

        ttk.Separator(controls, orient="horizontal").pack(fill="x", pady=12)

        export_box = ttk.LabelFrame(controls, text="Exportação", padding=10)
        export_box.pack(fill="x")

        ttk.Checkbutton(export_box, text="Radial", variable=self.export_radial_var).pack(anchor="w")
        ttk.Checkbutton(export_box, text="Função de onda 2D", variable=self.export_wave2d_var).pack(anchor="w")
        ttk.Checkbutton(export_box, text="Densidade 2D", variable=self.export_density2d_var).pack(anchor="w")
        ttk.Checkbutton(export_box, text="Orbital 3D", variable=self.export_orbital3d_var).pack(anchor="w")
        ttk.Checkbutton(export_box, text="Metadados", variable=self.export_metadata_var).pack(anchor="w")
        ttk.Button(export_box, text="Exportar .npz", command=self.export_npz).pack(fill="x", pady=(10, 6))
        ttk.Button(export_box, text="Exportar JSON atual", command=self.export_json_current).pack(fill="x", pady=(0, 6))
        ttk.Button(export_box, text="Exportar tudo JSON", command=self.export_json_all).pack(fill="x", pady=(0, 6))
        ttk.Button(export_box, text="Exportar JSON 3D atual", command=self.export_json_3d_current).pack(fill="x", pady=(0, 6))
        ttk.Button(export_box, text="Exportar tudo JSON 3D", command=self.export_json_3d_all).pack(fill="x")

        json_box = ttk.LabelFrame(controls, text="JSON 3D", padding=10)
        json_box.pack(fill="x", pady=(12, 0))
        ttk.Label(json_box, text="Limiar relativo").pack(anchor="w")
        ttk.Entry(json_box, textvariable=self.json_level_var, width=12).pack(anchor="w", pady=(0, 6))
        ttk.Label(json_box, text="Máximo de pontos por orbital").pack(anchor="w")
        ttk.Entry(json_box, textvariable=self.json_max_points_var, width=12).pack(anchor="w", pady=(0, 6))
        ttk.Label(json_box, text="Pontos por eixo na malha").pack(anchor="w")
        ttk.Entry(json_box, textvariable=self.json_points_axis_var, width=12).pack(anchor="w", pady=(0, 6))
        ttk.Label(json_box, text="Pontos 2D no JSON").pack(anchor="w")
        ttk.Entry(json_box, textvariable=self.json_2d_points_var, width=12).pack(anchor="w")

        self.info_label = ttk.Label(controls, text="Selecione os parâmetros e clique em Plotar.", wraplength=240)
        self.info_label.pack(anchor="w", pady=(16, 0))

        self.figure = Figure(figsize=(7, 6), dpi=100)
        self.figure.add_subplot(111)
        self.canvas = FigureCanvasTkAgg(self.figure, master=plot_frame)
        self.canvas.get_tk_widget().pack(fill="both", expand=True)

        self.plot()

    def _bind_controls_mousewheel(self, event=None):
        self.controls_canvas.bind_all("<MouseWheel>", self._on_controls_mousewheel)
        self.controls_canvas.bind_all("<Button-4>", self._on_controls_mousewheel_linux)
        self.controls_canvas.bind_all("<Button-5>", self._on_controls_mousewheel_linux)

    def _unbind_controls_mousewheel(self, event=None):
        self.controls_canvas.unbind_all("<MouseWheel>")
        self.controls_canvas.unbind_all("<Button-4>")
        self.controls_canvas.unbind_all("<Button-5>")

    def _on_controls_mousewheel(self, event):
        if event.delta == 0:
            return
        step = -1 if event.delta > 0 else 1
        self.controls_canvas.yview_scroll(step, "units")

    def _on_controls_mousewheel_linux(self, event):
        if getattr(event, "num", None) == 4:
            self.controls_canvas.yview_scroll(-1, "units")
        elif getattr(event, "num", None) == 5:
            self.controls_canvas.yview_scroll(1, "units")

    def set_example(self, n, orbital, plot_type, plane):
        self.n_var.set(n)
        self.orbital_var.set(orbital)
        self.plot_var.set(plot_type)
        self.plane_var.set(plane)
        self.plot()

    def validate_quantum_numbers(self, n, orbital):
        l = orbital_to_l(orbital)
        if n <= l:
            raise ValueError(f"Para o orbital {orbital}, o valor mínimo é n = {l + 1}.")

    def get_plane_grid(self, extent, points, plane):
        u = np.linspace(-extent, extent, points)
        v = np.linspace(-extent, extent, points)
        U, V = np.meshgrid(u, v)
        if plane == "xy":
            X, Y, Z = U, V, np.zeros_like(U)
            labels = ("x / a0", "y / a0")
        elif plane == "xz":
            X, Y, Z = U, np.zeros_like(U), V
            labels = ("x / a0", "z / a0")
        elif plane == "yz":
            X, Y, Z = np.zeros_like(U), U, V
            labels = ("y / a0", "z / a0")
        else:
            raise ValueError("Plano inválido.")
        return X, Y, Z, labels, u, v

    def build_export_payload(self):
        n = int(self.n_var.get())
        orbital = self.orbital_var.get()
        plot_type = self.plot_var.get()
        plane = self.plane_var.get()
        self.validate_quantum_numbers(n, orbital)

        payload = {}
        manifest = {
            "n": n,
            "orbital": orbital,
            "plot": plot_type,
            "plane": plane,
            "a0": a0,
            "included": []
        }

        if self.export_metadata_var.get():
            payload["meta_n_selected"] = np.array(n)
            payload["meta_orbital_selected"] = np.array(orbital)
            payload["meta_plot_selected"] = np.array(plot_type)
            payload["meta_graph_selected"] = np.array(plot_type)
            payload["meta_plane_selected"] = np.array(plane)
            payload["meta_n_available"] = np.array(N_OPTIONS, dtype=int)
            payload["meta_orbitals_available"] = np.array(ORBITAL_OPTIONS, dtype="<U20")
            payload["meta_plots_available"] = np.array(PLOT_OPTIONS, dtype="<U40")
            payload["meta_graphs_available"] = np.array(PLOT_OPTIONS, dtype="<U40")
            payload["meta_planes_available"] = np.array(PLANE_OPTIONS, dtype="<U10")

        if self.export_radial_var.get():
            l = orbital_to_l(orbital)
            rmax = max(20 * n**2, compute_effective_extent(n, orbital) * 1.4)
            points = 2400
            r = np.linspace(0, rmax, points)
            R = radial_hydrogen(n, l, r)
            P = r**2 * np.abs(R)**2
            payload["radial_r"] = r
            payload["radial_R"] = np.real(R)
            payload["radial_probability"] = P
            manifest["included"].append({
                "dataset": "radial",
                "arrays": ["radial_r", "radial_R", "radial_probability"],
                "points": points,
                "rmax": float(rmax),
                "l": l
            })

        if self.export_wave2d_var.get():
            extent = compute_effective_extent(n, orbital)
            points = 420
            X, Y, Z, labels, u, v = self.get_plane_grid(extent, points, plane)
            psi = np.real(psi_grid(n, orbital, X, Y, Z))
            payload["wave2d_axis_u"] = u
            payload["wave2d_axis_v"] = v
            payload["wave2d_psi"] = psi
            manifest["included"].append({
                "dataset": "wave2d",
                "arrays": ["wave2d_axis_u", "wave2d_axis_v", "wave2d_psi"],
                "points": points,
                "extent": float(extent),
                "plane": plane,
                "labels": labels
            })

        if self.export_density2d_var.get():
            extent = compute_effective_extent(n, orbital)
            points = 420
            X, Y, Z, labels, u, v = self.get_plane_grid(extent, points, plane)
            rho = prob_density_grid(n, orbital, X, Y, Z)
            rho = rho / max(float(np.max(rho)), 1e-12)
            payload["density2d_axis_u"] = u
            payload["density2d_axis_v"] = v
            payload["density2d_rho"] = rho
            manifest["included"].append({
                "dataset": "density2d",
                "arrays": ["density2d_axis_u", "density2d_axis_v", "density2d_rho"],
                "points": points,
                "extent": float(extent),
                "plane": plane,
                "labels": labels
            })

        if self.export_orbital3d_var.get():
            point_data = build_orbital3d_point_data(
                n=n,
                orbital=orbital,
                level=float(self.json_level_var.get()),
                max_points=int(self.json_max_points_var.get()),
                points_axis=int(self.json_points_axis_var.get())
            )
            payload["orbital3d_x"] = point_data["x"]
            payload["orbital3d_y"] = point_data["y"]
            payload["orbital3d_z"] = point_data["z"]
            payload["orbital3d_psi"] = point_data["psi"]
            payload["orbital3d_density"] = point_data["density"]
            payload["orbital3d_shell_index"] = point_data["shell_index"]
            payload["orbital3d_radial_nodes"] = point_data["radial_nodes"]
            payload["orbital3d_shell_peak_radii"] = point_data["shell_peak_radii"]
            payload["orbital3d_shell_inner_radii"] = point_data["shell_inner_radii"]
            payload["orbital3d_shell_outer_radii"] = point_data["shell_outer_radii"]
            manifest["included"].append({
                "dataset": "orbital3d",
                "arrays": [
                    "orbital3d_x",
                    "orbital3d_y",
                    "orbital3d_z",
                    "orbital3d_psi",
                    "orbital3d_density",
                    "orbital3d_shell_index",
                    "orbital3d_radial_nodes",
                    "orbital3d_shell_peak_radii",
                    "orbital3d_shell_inner_radii",
                    "orbital3d_shell_outer_radii"
                ],
                "points_per_axis": int(point_data["grid_points_per_axis"]),
                "extent": float(point_data["extent"]),
                "level": float(self.json_level_var.get()),
                "exported_points": int(point_data["point_count"]),
                "sampling_mode": point_data["sampling_mode"]
            })

        if not manifest["included"]:
            raise ValueError("Marque pelo menos um item para exportar.")

        if self.export_metadata_var.get():
            payload["manifest"] = np.array(json.dumps(manifest, ensure_ascii=False))

        return payload, manifest

    def build_point_cloud_entry(self, n, orbital, source_plot, source_plane):
        self.validate_quantum_numbers(n, orbital)
        point_data = build_orbital3d_point_data(
            n=n,
            orbital=orbital,
            level=float(self.json_level_var.get()),
            max_points=int(self.json_max_points_var.get()),
            points_axis=int(self.json_points_axis_var.get())
        )
        points = build_point_records(
            point_data["x"],
            point_data["y"],
            point_data["z"],
            point_data["psi"],
            point_data["density"],
            point_data["shell_index"]
        )

        return {
            "entry_id": f"n{n}__{orbital}__pointcloud3d",
            "entry_id_compact": orbital_compact_label(n, orbital),
            "n": int(n),
            "orbital": orbital,
            "orbital_compact": orbital_compact_name(orbital),
            "orbital_compact_label": orbital_compact_label(n, orbital),
            "orbital_aliases": orbital_aliases(n, orbital),
            "plot": "Orbital 3D",
            "graph": "Orbital 3D",
            "plane": None,
            "source_plot_selected": source_plot,
            "source_graph_selected": source_plot,
            "source_plane_selected": source_plane,
            "representation": "point_cloud",
            "coordinates_unit": "a0",
            "value_field": "psi_real_and_density",
            "extent": float(point_data["extent"]),
            "grid_points_per_axis": int(point_data["grid_points_per_axis"]),
            "threshold_relative": float(self.json_level_var.get()),
            "point_count": int(point_data["point_count"]),
            "point_count_before_limit": int(point_data["point_count_before_limit"]),
            "max_points": int(self.json_max_points_var.get()),
            "sampling_mode": point_data["sampling_mode"],
            "radial_nodes": [float(v) for v in point_data["radial_nodes"]],
            "shell_peak_radii": [float(v) for v in point_data["shell_peak_radii"]],
            "shell_inner_radii": [float(v) for v in point_data["shell_inner_radii"]],
            "shell_outer_radii": [float(v) for v in point_data["shell_outer_radii"]],
            "points": points
        }

    def build_json_payload_current(self):
        n = int(self.n_var.get())
        orbital = self.orbital_var.get()
        source_plot = self.plot_var.get()
        source_plane = self.plane_var.get()
        entry = self.build_point_cloud_entry(n, orbital, source_plot, source_plane)
        return {
            "metadata": {
                "a0": a0,
                "representation": "point_cloud",
                "export_scope": "current",
                "selected_n": n,
                "selected_orbital": orbital,
                "selected_orbital_compact": orbital_compact_name(orbital),
                "selected_orbital_compact_label": orbital_compact_label(n, orbital),
                "selected_plot": source_plot,
                "selected_graph": source_plot,
                "selected_plane": source_plane,
                "n_available": list(N_OPTIONS),
                "orbitals_available": list(ORBITAL_OPTIONS),
                "plots_available": list(PLOT_OPTIONS),
                "graphs_available": list(PLOT_OPTIONS),
                "planes_available": list(PLANE_OPTIONS),
                "threshold_relative": float(self.json_level_var.get()),
                "max_points_per_orbital": int(self.json_max_points_var.get()),
                "grid_points_per_axis": int(self.json_points_axis_var.get()),
                "coordinates_unit": "a0",
                "value_field": "psi_real_and_density"
            },
            "entries": [entry],
            "skipped": []
        }

    def build_json_payload_all(self):
        source_plot = self.plot_var.get()
        source_plane = self.plane_var.get()
        payload = {
            "metadata": {
                "a0": a0,
                "representation": "point_cloud",
                "export_scope": "all_valid_combinations",
                "selected_ns": list(N_OPTIONS),
                "selected_orbitals": list(ORBITAL_OPTIONS),
                "selected_orbitals_compact": [orbital_compact_name(item) for item in ORBITAL_OPTIONS],
                "selected_plot": source_plot,
                "selected_graph": source_plot,
                "selected_plane": source_plane,
                "plots_available": list(PLOT_OPTIONS),
                "graphs_available": list(PLOT_OPTIONS),
                "planes_available": list(PLANE_OPTIONS),
                "n_available": list(N_OPTIONS),
                "orbitals_available": list(ORBITAL_OPTIONS),
                "threshold_relative": float(self.json_level_var.get()),
                "max_points_per_orbital": int(self.json_max_points_var.get()),
                "grid_points_per_axis": int(self.json_points_axis_var.get()),
                "coordinates_unit": "a0",
                "value_field": "psi_real_and_density"
            },
            "entries": [],
            "skipped": []
        }

        for n in N_OPTIONS:
            for orbital in ORBITAL_OPTIONS:
                try:
                    payload["entries"].append(self.build_point_cloud_entry(n, orbital, source_plot, source_plane))
                except Exception as e:
                    payload["skipped"].append({
                        "n": int(n),
                        "orbital": orbital,
                        "orbital_compact": orbital_compact_name(orbital),
                        "orbital_compact_label": orbital_compact_label(n, orbital),
                        "orbital_aliases": orbital_aliases(n, orbital),
                        "plot": "Orbital 3D",
                        "graph": "Orbital 3D",
                        "plane": None,
                        "reason": str(e)
                    })

        if not payload["entries"]:
            raise ValueError("Nenhuma combinação válida foi gerada para o JSON 3D.")

        return payload

    def build_json_dataset_bundle(self, n, orbital, plot_type, plane):
        self.validate_quantum_numbers(n, orbital)
        datasets = {}
        included = []
        json_2d_points = int(self.json_2d_points_var.get())
        if json_2d_points < 40:
            raise ValueError("Use pelo menos 40 pontos 2D no JSON.")

        if self.export_radial_var.get():
            l = orbital_to_l(orbital)
            rmax = max(20 * n**2, compute_effective_extent(n, orbital) * 1.4)
            points = JSON_RADIAL_POINTS_DEFAULT
            r = np.linspace(0, rmax, points)
            R = radial_hydrogen(n, l, r)
            P = r**2 * np.abs(R)**2
            datasets["radial"] = build_compact_radial_dataset(r, np.real(R), P, l)
            included.append("radial")

        if self.export_wave2d_var.get():
            extent = compute_effective_extent(n, orbital)
            points = json_2d_points
            X, Y, Z, labels, _, _ = self.get_plane_grid(extent, points, plane)
            psi = np.real(psi_grid(n, orbital, X, Y, Z))
            datasets["wave2d"] = build_compact_wave2d_dataset(psi, extent, plane, labels)
            included.append("wave2d")

        if self.export_density2d_var.get():
            extent = compute_effective_extent(n, orbital)
            points = json_2d_points
            X, Y, Z, labels, _, _ = self.get_plane_grid(extent, points, plane)
            rho = prob_density_grid(n, orbital, X, Y, Z)
            rho = rho / max(float(np.max(rho)), 1e-12)
            datasets["density2d"] = build_compact_density2d_dataset(rho, extent, plane, labels)
            included.append("density2d")

        if self.export_orbital3d_var.get():
            point_data = build_orbital3d_point_data(
                n=n,
                orbital=orbital,
                level=float(self.json_level_var.get()),
                max_points=int(self.json_max_points_var.get()),
                points_axis=int(self.json_points_axis_var.get())
            )
            datasets["orbital3d"] = {
                "extent": float(point_data["extent"]),
                "grid_points_per_axis": int(point_data["grid_points_per_axis"]),
                "threshold_relative": float(self.json_level_var.get()),
                "point_count": int(point_data["point_count"]),
                "point_count_before_limit": int(point_data["point_count_before_limit"]),
                "max_points": int(self.json_max_points_var.get()),
                "sampling_mode": point_data["sampling_mode"],
                "radial_nodes": [float(v) for v in point_data["radial_nodes"]],
                "shell_peak_radii": [float(v) for v in point_data["shell_peak_radii"]],
                "shell_inner_radii": [float(v) for v in point_data["shell_inner_radii"]],
                "shell_outer_radii": [float(v) for v in point_data["shell_outer_radii"]],
                "points": build_point_records(
                    point_data["x"],
                    point_data["y"],
                    point_data["z"],
                    point_data["psi"],
                    point_data["density"],
                    point_data["shell_index"]
                )
            }
            included.append("orbital3d")

        if not included:
            raise ValueError("Marque pelo menos um item para exportar.")

        return {
            "entry_id": f"n{int(n)}__{orbital}",
            "entry_id_compact": orbital_compact_label(n, orbital),
            "n": int(n),
            "orbital": orbital,
            "orbital_compact": orbital_compact_name(orbital),
            "orbital_compact_label": orbital_compact_label(n, orbital),
            "orbital_aliases": orbital_aliases(n, orbital),
            "plot": plot_type,
            "graph": plot_type,
            "plane": plane,
            "included_datasets": included,
            "datasets": datasets
        }

    def build_json_payload_current_full(self):
        n = int(self.n_var.get())
        orbital = self.orbital_var.get()
        plot_type = self.plot_var.get()
        plane = self.plane_var.get()
        entry = self.build_json_dataset_bundle(n, orbital, plot_type, plane)
        return {
            "metadata": {
                "a0": a0,
                "export_scope": "current_selection",
                "selected_n": int(n),
                "selected_orbital": orbital,
                "selected_orbital_compact": orbital_compact_name(orbital),
                "selected_orbital_compact_label": orbital_compact_label(n, orbital),
                "selected_plot": plot_type,
                "selected_graph": plot_type,
                "selected_plane": plane,
                "included_datasets": list(entry["included_datasets"]),
                "n_available": list(N_OPTIONS),
                "orbitals_available": list(ORBITAL_OPTIONS),
                "plots_available": list(PLOT_OPTIONS),
                "graphs_available": list(PLOT_OPTIONS),
                "planes_available": list(PLANE_OPTIONS),
                "threshold_relative": float(self.json_level_var.get()),
                "max_points_per_orbital": int(self.json_max_points_var.get()),
                "grid_points_per_axis": int(self.json_points_axis_var.get()),
                "coordinates_unit": "a0",
                "json_2d_points": int(self.json_2d_points_var.get())
            },
            "entry": entry
        }

    def build_json_payload_all_full(self):
        plot_type = self.plot_var.get()
        plane = self.plane_var.get()
        included = []
        if self.export_radial_var.get():
            included.append("radial")
        if self.export_wave2d_var.get():
            included.append("wave2d")
        if self.export_density2d_var.get():
            included.append("density2d")
        if self.export_orbital3d_var.get():
            included.append("orbital3d")
        if not included:
            raise ValueError("Marque pelo menos um item para exportar.")

        payload = {
            "metadata": {
                "a0": a0,
                "export_scope": "all_valid_combinations",
                "selected_ns": list(N_OPTIONS),
                "selected_orbitals": list(ORBITAL_OPTIONS),
                "selected_orbitals_compact": [orbital_compact_name(item) for item in ORBITAL_OPTIONS],
                "selected_plot": plot_type,
                "selected_graph": plot_type,
                "selected_plane": plane,
                "included_datasets": included,
                "n_available": list(N_OPTIONS),
                "orbitals_available": list(ORBITAL_OPTIONS),
                "plots_available": list(PLOT_OPTIONS),
                "graphs_available": list(PLOT_OPTIONS),
                "planes_available": list(PLANE_OPTIONS),
                "threshold_relative": float(self.json_level_var.get()),
                "max_points_per_orbital": int(self.json_max_points_var.get()),
                "grid_points_per_axis": int(self.json_points_axis_var.get()),
                "coordinates_unit": "a0",
                "json_2d_points": int(self.json_2d_points_var.get())
            },
            "entries": [],
            "skipped": []
        }

        for n in N_OPTIONS:
            for orbital in ORBITAL_OPTIONS:
                try:
                    payload["entries"].append(self.build_json_dataset_bundle(n, orbital, plot_type, plane))
                except Exception as e:
                    payload["skipped"].append({
                        "n": int(n),
                        "orbital": orbital,
                        "orbital_compact": orbital_compact_name(orbital),
                        "orbital_compact_label": orbital_compact_label(n, orbital),
                        "orbital_aliases": orbital_aliases(n, orbital),
                        "plot": plot_type,
                        "graph": plot_type,
                        "plane": plane,
                        "reason": str(e)
                    })

        if not payload["entries"]:
            raise ValueError("Nenhuma combinação válida foi gerada para o JSON completo.")

        return payload

    def export_npz(self):
        try:
            payload, manifest = self.build_export_payload()
            default_name = f"hidrogenio_n{manifest['n']}_{manifest['orbital']}.npz"
            filepath = filedialog.asksaveasfilename(
                title="Salvar arquivo .npz",
                defaultextension=".npz",
                initialfile=default_name,
                filetypes=[("NumPy compactado", "*.npz")]
            )
            if not filepath:
                return
            np.savez_compressed(filepath, **payload)
            names = ", ".join(item["dataset"] for item in manifest["included"])
            messagebox.showinfo("Exportação concluída", f"Arquivo salvo com sucesso.\n\nItens exportados: {names}")
        except Exception as e:
            messagebox.showerror("Erro ao exportar", str(e))

    def export_json_current(self):
        try:
            payload = self.build_json_payload_current_full()
            default_name = f"hidrogenio_json_n{payload['metadata']['selected_n']}_{payload['metadata']['selected_orbital']}.json"
            filepath = filedialog.asksaveasfilename(
                title="Salvar arquivo JSON",
                defaultextension=".json",
                initialfile=default_name,
                filetypes=[("JSON", "*.json")]
            )
            if not filepath:
                return
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
            messagebox.showinfo(
                "Exportação JSON concluída",
                f"Arquivo salvo com sucesso.\n\nDatasets exportados: {', '.join(payload['metadata']['included_datasets'])}"
            )
        except Exception as e:
            messagebox.showerror("Erro ao exportar JSON", str(e))

    def export_json_all(self):
        try:
            payload = self.build_json_payload_all_full()
            filepath = filedialog.asksaveasfilename(
                title="Salvar arquivo JSON",
                defaultextension=".json",
                initialfile="hidrogenio_tudo.json",
                filetypes=[("JSON", "*.json")]
            )
            if not filepath:
                return
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
            messagebox.showinfo(
                "Exportação JSON concluída",
                f"Arquivo salvo com sucesso.\n\nEntradas exportadas: {len(payload['entries'])}\nCombinações ignoradas: {len(payload['skipped'])}"
            )
        except Exception as e:
            messagebox.showerror("Erro ao exportar JSON", str(e))

    def export_json_3d_current(self):
        try:
            payload = self.build_json_payload_current()
            default_name = f"hidrogenio_pointcloud_n{payload['metadata']['selected_n']}_{payload['metadata']['selected_orbital']}.json"
            filepath = filedialog.asksaveasfilename(
                title="Salvar arquivo JSON 3D",
                defaultextension=".json",
                initialfile=default_name,
                filetypes=[("JSON", "*.json")]
            )
            if not filepath:
                return
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
            messagebox.showinfo(
                "Exportação JSON concluída",
                f"Arquivo salvo com sucesso.\n\nOrbitais exportados: {len(payload['entries'])}\nPontos no orbital: {payload['entries'][0]['point_count']}"
            )
        except Exception as e:
            messagebox.showerror("Erro ao exportar JSON", str(e))

    def export_json_3d_all(self):
        try:
            payload = self.build_json_payload_all()
            filepath = filedialog.asksaveasfilename(
                title="Salvar arquivo JSON 3D",
                defaultextension=".json",
                initialfile="hidrogenio_pointcloud_tudo.json",
                filetypes=[("JSON", "*.json")]
            )
            if not filepath:
                return
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
            messagebox.showinfo(
                "Exportação JSON concluída",
                f"Arquivo salvo com sucesso.\n\nOrbitais exportados: {len(payload['entries'])}\nCombinações ignoradas: {len(payload['skipped'])}"
            )
        except Exception as e:
            messagebox.showerror("Erro ao exportar JSON", str(e))

    def plot(self):
        try:
            n = int(self.n_var.get())
            orbital = self.orbital_var.get()
            plot_type = self.plot_var.get()
            plane = self.plane_var.get()

            self.validate_quantum_numbers(n, orbital)
            self.figure.clear()

            if plot_type == "Radial":
                ax = self.figure.add_subplot(111)
                l = orbital_to_l(orbital)
                rmax = max(20 * n**2, compute_effective_extent(n, orbital) * 1.4)
                r = np.linspace(0, rmax, 2400)
                R = radial_hydrogen(n, l, r)
                P = r**2 * np.abs(R)**2
                ax.plot(r, np.real(R), label="R(r)")
                ax.plot(r, P, label="r²|R(r)|²")
                ax.set_title(f"Parte radial | n={n}, orbital={orbital}")
                ax.set_xlabel("r / a0")
                ax.set_ylabel("Amplitude")
                ax.legend()
                self.info_label.config(text=f"Mostrando a parte radial para n={n}, orbital={orbital}.")
            elif plot_type == "Orbital 3D":
                ax = self.figure.add_subplot(111, projection="3d")
                point_data = build_orbital3d_point_data(
                    n=n,
                    orbital=orbital,
                    level=float(self.json_level_var.get()),
                    max_points=int(self.json_max_points_var.get()),
                    points_axis=int(self.json_points_axis_var.get())
                )
                x = point_data["x"]
                y = point_data["y"]
                z = point_data["z"]
                psi_values = point_data["psi"]
                shell_index = point_data["shell_index"]
                limit = compute_axis_limit(x, y, z, point_data["extent"])
                ax.set_box_aspect((1, 1, 1))

                if orbital == "s" and len(x) > 0:
                    shell_order = np.argsort(point_data["shell_peak_radii"])[::-1]
                    shell_count = max(len(shell_order), 1)
                    base_size = max(2.0, min(4.6, 22000.0 / max(len(x), 1)))
                    positive_color = "#b54b64"
                    negative_color = "#4c7eb7"
                    for draw_rank, shell_id in enumerate(shell_order):
                        shell_mask = shell_index == shell_id
                        shell_psi = psi_values[shell_mask]
                        color = positive_color if np.mean(shell_psi) >= 0 else negative_color
                        alpha = 0.26 + 0.06 * (shell_count - 1 - draw_rank)
                        alpha = min(0.46, max(0.24, alpha))
                        local_size = base_size + 0.18 * (shell_count - 1 - draw_rank)
                        ax.scatter(
                            x[shell_mask],
                            y[shell_mask],
                            z[shell_mask],
                            c=color,
                            s=local_size,
                            alpha=alpha,
                            edgecolors="none"
                        )
                else:
                    point_size = max(2.2, min(11.0, 24000.0 / max(len(x), 1)))
                    ax.scatter(x, y, z, c=psi_values, s=point_size, alpha=0.35, cmap="RdBu_r", edgecolors="none")

                ax.set_title(f"Orbital real 3D | n={n}, orbital={orbital}")
                ax.set_xlabel("x / a0")
                ax.set_ylabel("y / a0")
                ax.set_zlabel("z / a0")
                ax.set_xlim(-limit, limit)
                ax.set_ylim(-limit, limit)
                ax.set_zlim(-limit, limit)
                self.info_label.config(text=f"Mostrando o orbital 3D para n={n}, orbital={orbital}. Pontos: {point_data['point_count']}. Modo: {point_data['sampling_mode']}.")
            else:
                ax = self.figure.add_subplot(111)
                extent = compute_effective_extent(n, orbital)
                points = 420
                X, Y, Z, labels, _, _ = self.get_plane_grid(extent, points, plane)
                if plot_type == "Função de onda 2D":
                    psi = np.real(psi_grid(n, orbital, X, Y, Z))
                    vmax = np.max(np.abs(psi))
                    img = ax.imshow(
                        psi,
                        extent=[-extent, extent, -extent, extent],
                        origin="lower",
                        aspect="equal",
                        cmap="RdBu_r",
                        vmin=-vmax,
                        vmax=vmax
                    )
                    self.figure.colorbar(img, ax=ax, label="ψ")
                    ax.set_title(f"Função de onda real | n={n}, orbital={orbital}, plano={plane}")
                    self.info_label.config(text=f"Mostrando ψ no plano {plane} para n={n}, orbital={orbital}.")
                else:
                    rho = prob_density_grid(n, orbital, X, Y, Z)
                    rho = rho / max(float(np.max(rho)), 1e-12)
                    img = ax.imshow(
                        rho,
                        extent=[-extent, extent, -extent, extent],
                        origin="lower",
                        aspect="equal"
                    )
                    self.figure.colorbar(img, ax=ax, label="|ψ|²")
                    ax.set_title(f"Densidade de probabilidade | n={n}, orbital={orbital}, plano={plane}")
                    self.info_label.config(text=f"Mostrando |ψ|² no plano {plane} para n={n}, orbital={orbital}.")
                ax.set_xlabel(labels[0])
                ax.set_ylabel(labels[1])

            self.figure.tight_layout()
            self.canvas.draw()
        except Exception as e:
            messagebox.showerror("Erro", str(e))


if __name__ == "__main__":
    root = tk.Tk()
    style = ttk.Style()
    try:
        style.theme_use("clam")
    except Exception:
        pass
    app = App(root)
    root.mainloop()
