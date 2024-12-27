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

document.getElementById('password').addEventListener('keydown', strength);


form.addEventListener('submit', async (e) => {
    if(!passwordok) {
        e.preventDefault();
        alert('A senha deve conter letra maiuscula e caracteres especiais')
        return;
    }


    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/submited', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const result = await response.json();
            if (result.field === 'login') {
                loginInput.classList.add('is-invalid');
                const invalidFeedback = loginInput.nextElementSibling;
                invalidFeedback.textContent = result.message;
            }
            return;
        }
        window.location.href = '/users';
    } catch (err) {
        console.error({error: 'erro na requisição:', message: err});
    }
});
