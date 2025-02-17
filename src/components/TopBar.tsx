"use client"
import { useRouter } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "@/context/AuthContext";

interface TopBarProps {
    listOwner: { id: string; username: string } | null;
}

export default function TopBar({ listOwner }: TopBarProps) {
    const router = useRouter();
    const { user, email, setEmail, password, setPassword, login, register, logout } = useAuth();

    return (
        <div className="top-bar">
            <div className="title-container">
                <HomeIcon onClick={() => router.push("/")} />
                <h1 className="title">
                    {listOwner ? `Käyttäjän ${listOwner.username} Karkkilista` : "Karkkilista"}
                </h1>
            </div>
            {user ? (
                <div className="user">
                    <div className="auth-buttons">
                        <button className="auth-button" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="user">
                    <div className="credentials">
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            type="password"
                        />
                    </div>
                    <div className="auth-buttons">
                        <button className="auth-button" onClick={login}>
                            Login
                        </button>
                        <button className="auth-button" onClick={register}>
                            Register
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}