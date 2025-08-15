let accessToken: string | null = null;

export const setAuthToken = (token: string | null) => {
	accessToken = token;
};

export const getAuthToken = () => accessToken;