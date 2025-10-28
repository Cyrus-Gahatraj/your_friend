import {createContext, useContext, useState} from 'react'

const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    const accessToken = 'access_token';
    const refreshToken = 'refresh_token';

    const [auth, setAuth] = useState(()=>{
        const access = localStorage.getItem(accessToken);
        const refresh = localStorage.getItem(refreshToken);
        return {access, refresh};
    });

    const login = (access, refresh) => {
        localStorage.setItem(accessToken, access)
        localStorage.setItem(refresh, refresh)
        setAuth({access, refresh});
    };

    const logout = () => {
        localStorage.removeItem(accessToken);
        localStorage.removeItem(refreshToken);
        setAuth({access: null, refresh: null})
    };

    return (
        <AuthContext.Provider value={{auth, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);