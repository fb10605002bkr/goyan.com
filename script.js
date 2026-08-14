document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Smooth scrolling removed (using multi-page navigation now)

    // --- Night Sky Star Generation ---
    const skyContainer = document.getElementById('night-sky-bg');
    if (skyContainer) {
        const createStars = () => {
            const numStars = 60;
            for (let i = 0; i < numStars; i++) {
                const star = document.createElement('div');
                star.className = 'night-star';
                
                // Random position
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 100}%`;
                
                // Random size
                const size = Math.random() * 2 + 1;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                
                // Random animation delay and duration
                star.style.setProperty('--twinkle-delay', `${Math.random() * 5}s`);
                star.style.setProperty('--twinkle-duration', `${Math.random() * 3 + 2}s`);
                star.style.setProperty('--max-opacity', `${Math.random() * 0.5 + 0.5}`);
                
                skyContainer.appendChild(star);
            }
        };

        const createShootingStars = () => {
            const numShootingStars = 3;
            for (let i = 0; i < numShootingStars; i++) {
                const star = document.createElement('div');
                star.className = 'shooting-star';
                
                // Random starting position (usually top left quadrant)
                star.style.left = `${Math.random() * 40}%`;
                star.style.top = `${Math.random() * 40}%`;
                
                // Random properties
                star.style.setProperty('--shoot-delay', `${Math.random() * 10 + 2}s`);
                star.style.setProperty('--shoot-duration', `${Math.random() * 1 + 1}s`);
                star.style.setProperty('--shoot-width', `${Math.random() * 100 + 80}px`);
                
                skyContainer.appendChild(star);
            }
        };

        createStars();
        createShootingStars();
    }

    // Language Switching Logic
    const langSwitch = document.getElementById('lang-switch');
    
    // Check local storage for saved language, default to 'nl'
    let currentLang = localStorage.getItem('goyan_lang') || 'nl';
    if(langSwitch) {
        langSwitch.value = currentLang;
    }

    function applyTranslations(lang) {
        if (typeof translations === 'undefined' || !translations[lang]) return;
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            }
        });
    }

    // Apply translations on initial load
    applyTranslations(currentLang);

    if(langSwitch) {
        langSwitch.addEventListener('change', (e) => {
            const newLang = e.target.value;
            localStorage.setItem('goyan_lang', newLang);
            applyTranslations(newLang);
        });
    }

    // --- Dynamic Projects Loader ---
    const projectsGrid = document.getElementById('frontend-projects-grid');
    if (projectsGrid) {
        let projects = JSON.parse(localStorage.getItem('mock_projects') || '[]');
        
        // If no dynamic projects exist, inject the default ones
        if (projects.length === 0) {
            projects = [
                { id: "1", title: "Renovatie Herenhuis", description: "Volledige renovatie van een historisch pand in Brussel.", icon: "fa-solid fa-house-chimney-crack" },
                { id: "2", title: "Nieuwbouw Appartementen", description: "Constructie van 12 moderne appartementen in Antwerpen.", icon: "fa-solid fa-city" },
                { id: "3", title: "Kantoorrenovatie", description: "Transformatie van een oude fabriek tot moderne kantoorruimte.", icon: "fa-solid fa-building" }
            ];
            // Don't save to localStorage automatically to let admin add their own, just display placeholders
        }

        projectsGrid.innerHTML = '';
        projects.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'service-card project-card';
            card.innerHTML = `
                <div class="project-img-placeholder">
                    <i class="${proj.icon}"></i>
                </div>
                <h3>${proj.title}</h3>
                <p>${proj.description}</p>
            `;
            projectsGrid.appendChild(card);
        });
    }

    // --- Contact Form Server-Side Logic ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const statusEl = document.getElementById('form-status');
            statusEl.style.display = 'block';
            statusEl.style.color = 'var(--text-primary)';
            statusEl.innerText = "Laden... / Loading..."; 

            const formData = new FormData(contactForm);
            const data = {
                user_name: formData.get('user_name'),
                user_email: formData.get('user_email'),
                message: formData.get('message')
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                const lang = localStorage.getItem('goyan_lang') || 'nl';

                if (response.ok) {
                    statusEl.style.color = '#4caf50'; // Green
                    statusEl.innerText = translations[lang]['form_success'];
                    contactForm.reset();
                } else {
                    statusEl.style.color = '#ff5252'; // Red
                    statusEl.innerText = result.error || translations[lang]['form_error'];
                }
            } catch (error) {
                console.error("Error sending email:", error);
                const lang = localStorage.getItem('goyan_lang') || 'nl';
                statusEl.style.color = '#ff5252';
                statusEl.innerText = translations[lang]['form_error'];
            }
        });
    }
});
