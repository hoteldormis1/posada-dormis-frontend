export const TOKEN_KEY = "accessToken";

let accessToken: string | null = null;

export const setAuthToken = (token: string | null) => {
	accessToken = token;

	if (typeof window === "undefined") return;

	if (token) {
		localStorage.setItem(TOKEN_KEY, token);
	} else {
		localStorage.removeItem(TOKEN_KEY);
	}
};

export const getAuthToken = () => {
	if (!accessToken && typeof window !== "undefined") {
		accessToken = localStorage.getItem(TOKEN_KEY);
	}
	return accessToken;
};