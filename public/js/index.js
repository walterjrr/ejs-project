const form = document.getElementById('registrationForm');
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password')

let passwordok = false

const strength = (() => {
    let passwordValue = document.getElementById('password').value;
    let strengthpassword = ["fraca", "média", "forte"]

    if (passwordValue.length < 4) {
        document.getElementById('showpassword').innerHTML = strengthpassword[0],
        passwordok = false
    }
    if (/[A-Z]/.test(passwordValue)) {
        document.getElementById('showpassword').innerHTML = strengthpassword[1],
        passwordok = true
    }
    if (/[^a-zA-Z0-9]/g.test(passwordValue)) {
        document.getElementById('showpassword').innerHTML = strengthpassword[2],
        passwordok = true
    }
    
})

const token = localStorage.getItem("token");


document.getElementById('password').addEventListener('keydown', strength);

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem("token", result.token);
            window.location.href = result.redirect; // Redireciona corretamente
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Erro:", err);
    }
});



if (!token) {
    window.location.href = "/login"; // Redireciona se não estiver autenticado
} else { fetch("/users", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${token}`, // Enviar o token JWT
        "Content-Type": "application/json",
    },
})
    .then((response) => {
        if (!response.ok) {
            throw new Error("Não autorizado");
        }
        return response.json();
    })
    .then((data) => console.log("Usuários:", data))
    .catch((error) => {
        console.error("Erro:", error);
        window.location.href = "/login"; // Redireciona se o usuário não estiver autenticado
    });
}
