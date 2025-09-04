
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    signup: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => {},
    signup: async () => {},
    logout: async () => {},
    loginWithGoogle: async () => {},
    error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                router.push('/dashboard');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const login = async (email: string, pass: string) => {
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            // onAuthStateChanged will handle redirect
        } catch (e: any) {
            setError(mapFirebaseError(e.code));
            console.error(e);
        }
    };

    const signup = async (email: string, pass: string) => {
        setError(null);
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
            // onAuthStateChanged will handle redirect
        } catch (e: any) {
             if (e.code === 'auth/email-already-in-use') {
                setError('auth/email-already-in-use');
            } else {
                setError(mapFirebaseError(e.code));
            }
            console.error(e);
        }
    };
    
    const loginWithGoogle = async () => {
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // onAuthStateChanged will handle redirect
        } catch (e: any) {
            setError(mapFirebaseError(e.code));
            console.error(e);
        }
    }

    const logout = async () => {
        setUser(null);
        await signOut(auth);
        router.push('/auth');
    };
    
    const mapFirebaseError = (errorCode: string) => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'El correo electrónico no es válido.';
            case 'auth/user-not-found':
                return 'No se encontró ningún usuario con este correo.';
            case 'auth/wrong-password':
                return 'La contraseña es incorrecta.';
            case 'auth/email-already-in-use':
                return 'Este correo electrónico ya está en uso.';
            case 'auth/weak-password':
                return 'La contraseña debe tener al menos 6 caracteres.';
             case 'auth/popup-closed-by-user':
                return 'El proceso fue cancelado. Inténtalo de nuevo.';
            default:
                return 'Ocurrió un error. Por favor, inténtalo de nuevo.';
        }
    };


    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        loginWithGoogle,
        error
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
