"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear any previous errors
        setLoading(true);
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                // Save token to localStorage
                localStorage.setItem("token", data.token);
                // Redirect to chat page
                router.push("/chat");
            }
            else {
                // Show error message from server
                setError(data.error || "Login failed. Please try again.");
            }
        }
        catch (err) {
            console.error("Error during login:", err);
            setError("An unexpected error occurred. Please try again later.");
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { email: e.target.value }))} className="w-full p-2 mb-4 border rounded" required/>
        <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { password: e.target.value }))} className="w-full p-2 mb-4 border rounded" required/>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>);
};
export default Login;
