const form = document.getElementById('registrationForm');
const loginInput = document.getElementById('login');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/submited', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
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
        console.error('Erro na requisição:', err);
    }
});
