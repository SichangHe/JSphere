import itertools
from typing import Iterable, OrderedDict


def inv_color2color(
    inv_color: tuple[float, float, float],
):
    return (
        int(255 * (1 - inv_color[0])),
        int(255 * (1 - inv_color[1])),
        int(255 * (1 - inv_color[2])),
    )


def sum_inv_colors(inv_colors: Iterable[tuple[float, float, float]]):
    return (
        sum(color[0] for color in inv_colors),
        sum(color[1] for color in inv_colors),
        sum(color[2] for color in inv_colors),
    )


def color2hex(color: tuple[float, float, float]):
    return f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}"


spheres = [
    "sure_frontend_processing",
    "sure_dom_element_generation",
    "sure_ux_enhancement",
    "sure_extensional_featuers",
]

sphere2inv_color: dict[str, tuple[float, float, float]] = {
    "sure_frontend_processing": (11 / 16, 0, 0),
    "sure_dom_element_generation": (0, 7 / 16, 7 / 16),
    "sure_ux_enhancement": (3 / 16, 7 / 16, 0),
    "sure_extensional_featuers": (2 / 16, 2 / 16, 9 / 16),
}

multisphere2inv_colors = OrderedDict([(s, sphere2inv_color[s]) for s in spheres])
for name1, name2 in itertools.combinations(spheres, 2):
    name = f"{name1}&{name2}"
    multisphere2inv_colors[name] = sum_inv_colors(
        tuple(sphere2inv_color[n] for n in (name1, name2))
    )
for name1, name2, name3 in itertools.combinations(spheres, 3):
    name = f"{name1}&{name2}&{name3}"
    multisphere2inv_colors[name] = sum_inv_colors(
        tuple(sphere2inv_color[n] for n in (name1, name2, name3))
    )
name = "&".join(spheres)
multisphere2inv_colors[name] = sum_inv_colors(
    tuple(sphere2inv_color[n] for n in spheres)
)
multisphere2colors = OrderedDict(
    (s, inv_color2color(c)) for s, c in multisphere2inv_colors.items()
)
"""
for s, c in multisphere2colors.items():
    print(f"{color2hex(c)} {s}")

#4fffff sure_frontend_processing
#ff8f8f sure_dom_element_generation
#cf8fff sure_ux_enhancement
#dfdf6f sure_extensional_featuers
#4f8f8f sure_frontend_processing&sure_dom_element_generation
#1f8fff sure_frontend_processing&sure_ux_enhancement
#2fdf6f sure_frontend_processing&sure_extensional_featuers
#cf1f8f sure_dom_element_generation&sure_ux_enhancement
#df6f00 sure_dom_element_generation&sure_extensional_featuers
#af6f6f sure_ux_enhancement&sure_extensional_featuers
#1f1f8f sure_frontend_processing&sure_dom_element_generation&sure_ux_enhancement
#2f6f00 sure_frontend_processing&sure_dom_element_generation&sure_extensional_featuers
#006f6f sure_frontend_processing&sure_ux_enhancement&sure_extensional_featuers
#af0000 sure_dom_element_generation&sure_ux_enhancement&sure_extensional_featuers
#000000 sure_frontend_processing&sure_dom_element_generation&sure_ux_enhancement&sure_extensional_featuers
"""
