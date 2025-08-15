/*
 * Renderiza dinámicamente un ícono a partir del mapa `icons`, usando la prop `name`.
 */

import { icons } from "@/data/icons";

export default function AppIcon({ name, size = 24, className = "", ...props }) {
	const IconComponent = icons[name];

	if (!IconComponent) {
		return null;
	}

	return <IconComponent size={size} className={className} {...props} />;
}
