export function secondsToHMS(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;

	if (h == 0 && m == 0) return `${s}s`;
	if (h == 0 && m != 0) return `${m}m ${s}s`;
	return `${h}h ${m}m ${s}s`;
}

export const dateFormatter = (date: Date): string => {
	const now = new Date();
	const options: Intl.DateTimeFormatOptions = {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	};

	if (
		date.getDate() === now.getDate() &&
		date.getMonth() === now.getMonth() &&
		date.getFullYear() === now.getFullYear()
	) {
		return `Aujourd'hui à ${date.toLocaleTimeString("fr-FR", {
			hour: "2-digit",
			minute: "2-digit",
		})}`;
	}

	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (
		date.getDate() === yesterday.getDate() &&
		date.getMonth() === yesterday.getMonth() &&
		date.getFullYear() === yesterday.getFullYear()
	) {
		return `Hier à ${date.toLocaleTimeString("fr-FR", {
			hour: "2-digit",
			minute: "2-digit",
		})}`;
	}

	return date.toLocaleDateString("fr-FR", options);
};
