

export async function login(user) {
    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        })
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
        console.log(data.user)
        return data.user
    } catch (error) {
        console.log(error)
        return error.message
    }

}

export async function register (user){
    try {
        
    } catch (error) {
        
    }
}