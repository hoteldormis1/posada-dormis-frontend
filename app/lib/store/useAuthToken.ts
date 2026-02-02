export const TOKEN_KEY = "accessToken";

let accessToken: string | null = null;

export const setAuthToken = (token: string | null) => {
	accessToken = token;

	if (token) {
		sessionStorage.setItem(TOKEN_KEY, token);
	} else {
		sessionStorage.removeItem(TOKEN_KEY);
	}
};

export const getAuthToken = () => {
	if (!accessToken && typeof window !== "undefined") {
		accessToken = sessionStorage.getItem(TOKEN_KEY);
	}
	return accessToken;
};