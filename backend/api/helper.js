
export const getCookie = (cookieHeader, name) => {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";").map((c) => c.trim());

    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return value;
    }

    return null;
};