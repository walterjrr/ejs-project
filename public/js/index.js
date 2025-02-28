const form = document.getElementById('registrationForm');
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');

let passwordok = false;

const strength = (() => {
    let passwordValue = document.getElementById('password').value;
    let strengthpassword = ["fraca", "média", "forte"];

    if (passwordValue.length < 4) {
        document.getElementById('showpassword').innerHTML = strengthpassword[0];
        passwordok = false;
    }
    if (/[A-Z]/.test(passwordValue)) {
        document.getElementById('showpassword').innerHTML = strengthpassword[1];
        passwordok = true;
    }
    if (/[^a-zA-Z0-9]/g.test(passwordValue)) {
        document.getElementById('showpassword').innerHTML = strengthpassword[2];
        passwordok = true;
    }
});

document.getElementById('password').addEventListener('keydown', strength);

document.getElementById("registrationForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!passwordok) {
        alert("A senha não atende aos requisitos de segurança.");
        return;
    }

    const formData = new FormData(e.target);

    try {
        const response = await fetch("/submited", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem("token", result.token);
            window.location.href = result.redirect;
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Erro:", err);
        alert("Erro ao cadastrar usuário");
    }
});

// Add token verification on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem("token");
    const currentPath = window.location.pathname;

    // Skip token check for login and register pages
    if (currentPath === '/login' || currentPath === '/cadastrar') {
        return;
    }

    if (!token) {
        window.location.href = "/login";
        
    if (token) {
    window.location.href = `/edit/${login}?token=${token}`;
}
    } else {
        // Verify token on protected routes
        fetch("/users", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .catch(() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
        });
    }
});

// Example of how to include the token in the URL for protected routes

