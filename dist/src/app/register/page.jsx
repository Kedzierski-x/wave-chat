"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                // Zapisz token JWT i przekieruj na /chat
                localStorage.setItem("token", data.token);
                router.push("/chat");
            }
            else {
                setError(data.error || "Registration failed");
            }
        }
        catch (error) {
            console.error("Error during registration:", error);
            setError("An error occurred. Please try again.");
        }
    };
    return (<div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleRegister} className="flex flex-col gap-4 w-1/3">
        <h1 className="text-2xl font-bold">Register</h1>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border p-2" required/>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2" required/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2" required/>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Register
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>);
};
export default Register;
