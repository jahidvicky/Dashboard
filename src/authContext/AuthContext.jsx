import React, {
    createContext,
    useEffect,
    useState,
    useContext,
} from "react";
import API from "../API/Api";

export const AuthContext = createContext();

/* ---------- Provider ---------- */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
                API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }
        } catch (err) {
            console.error("Failed to restore user:", err);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    }, []);

    /* ---------- login ---------- */
    const login = async (email, password) => {
        try {
            // const res = await API.post("/login", { email, password }); // baseURL already has /api
            const res = await API.post("/loginNew", { email, password });
            const { token, user } = res.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            /*   set default header so subsequent calls include token */
            API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            setUser(user);
            return true;
        } catch (err) {
            console.error("Login error:", err.response?.data?.message || err.message);
            return false;
        }
    };

    /* ---------- logout ---------- */
    const logout = () => {
        localStorage.clear();
        delete API.defaults.headers.common["Authorization"];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

/* ---------- hook ---------- */
export const useAuth = () => useContext(AuthContext);
