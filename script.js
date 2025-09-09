// --- Background Animation Script ---
const canvas = document.getElementById('interactive-bg');
const ctx = canvas.getContext('2d');
let mouse = { x: null, y: null };
let particles = [];

class Particle {
    constructor(x, y, size, color, velocity, shape) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.velocity = velocity;
        this.shape = shape;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        switch (this.shape) {
            case 'hexagon':
                ctx.moveTo(this.size, 0);
                for (let i = 1; i <= 6; i++) {
                    ctx.lineTo(this.size * Math.cos(i * 2 * Math.PI / 6), this.size * Math.sin(i * 2 * Math.PI / 6));
                }
                break;
            case 'triangle':
                ctx.moveTo(0, -this.size);
                ctx.lineTo(this.size * 0.866, this.size * 0.5);
                ctx.lineTo(-this.size * 0.866, this.size * 0.5);
                break;
            case 'square':
                 ctx.rect(-this.size / 1.4, -this.size / 1.4, (this.size * 2)/1.4, (this.size * 2)/1.4);
                 break;
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    update() {
        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = 100;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < maxDistance) {
                this.x -= directionX;
                this.y -= directionY;
            }
        }
        
        // Keep particles on screen and update position/rotation
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;

        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.angle += this.rotationSpeed;
    }
}

function initParticles() {
    particles = [];
    const numberOfParticles = (canvas.width * canvas.height) / 10000;
    const shapes = ['hexagon', 'triangle', 'square'];

    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 4) + 4;
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let color = 'rgba(56, 189, 248, 0.4)';
        let velocity = {
            x: (Math.random() - 0.5) * 1.0, // Further increased speed
            y: (Math.random() - 0.5) * 1.0  // Further increased speed
        };
        let shape = shapes[Math.floor(Math.random() * shapes.length)];
        particles.push(new Particle(x, y, size, color, velocity, shape));
    }
}

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

function drawGrid() {
    const gridSize = 32;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(); 

    // Draw connecting lines (spider web)
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) { // Connection threshold
                let opacity = 1 - (distance / 150);
                ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.2})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
    
    // Draw mouse spotlight
    if (mouse.x !== null && mouse.y !== null) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw particles on top of lines
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    requestAnimationFrame(animate);
}

window.addEventListener('resize', setCanvasSize);
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

setCanvasSize();
animate();

// --- Scroll to Top Button Script ---
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }
};

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
