document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Contact Form Validation
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Simple validation logic
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }

            if (!validateEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Simulate form submission
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;

            btn.textContent = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = 'Message Sent!';
                btn.classList.add('success');
                contactForm.reset();

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.classList.remove('success');
                }, 3000);
            }, 1500);
        });
    }

    // Fluid Gradient Mesh Animation (Canvas)
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        // Configuration for the atmospheric flow
        const config = {
            particleCount: 50,
            baseColor: { h: 220, s: 70, l: 20 }, // Navy base
            colors: [
                { h: 225, s: 100, l: 60 }, // Bright Blue
                { h: 260, s: 80, l: 60 },  // Purple
                { h: 180, s: 80, l: 50 }   // Teal
            ]
        };

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 200 + 100;

                // Assign a color from the palette
                const colorConfig = config.colors[Math.floor(Math.random() * config.colors.length)];
                this.color = `hsla(${colorConfig.h}, ${colorConfig.s}%, ${colorConfig.l}%, 0.15)`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges with damping
                if (this.x < -100 || this.x > width + 100) this.vx *= -1;
                if (this.y < -100 || this.y > height + 100) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                // Create a soft radial gradient for each particle
                const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                g.addColorStop(0, this.color);
                g.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = g;
                ctx.globalCompositeOperation = 'screen'; // Blend mode for glowing effect
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            for (let i = 0; i < config.particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            // Clear with a deep navy fade to create trails/atmosphere
            ctx.fillStyle = 'rgba(10, 17, 40, 1)'; // Deep Navy base
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // Header scroll background effect
    const header = document.querySelector('.header');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.9)';
            header.style.boxShadow = 'var(--shadow-sm)';
            header.style.backdropFilter = 'blur(20px)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.8)';
            header.style.boxShadow = 'none';
            header.style.backdropFilter = 'blur(16px)';
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init state

    // Scroll Reveal Animation using IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
