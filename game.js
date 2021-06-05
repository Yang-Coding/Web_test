const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth - 5
canvas.height = innerHeight - 5

const score = document.querySelector('#score')
const point = document.querySelector('#point')
const btn = document.querySelector('#startBtn')
const gameUI = document.querySelector('#gameUI')

// Player class //
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

// projectile class // 
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

// enemy class// 
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.98
    // particle class //
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}


const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 15, 'white')
let projectiles = []
let enemies = []
let particles = []

let animationId
let points = 0

function init() {
    player = new Player(x, y, 15, 'white')
    projectiles = []
    enemies = []
    particles = []
    points = 0
    score.innerHTML = points
    point.innerHTML = points
}

// animation //
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw() // draw player // 

    // draw particle // 
    particles.forEach((Particle, index) => {
        if (Particle.alpha <= 0) {
            particles.splice(index, 1)
        } else { Particle.update() }

    })

    // draw projectile //
    projectiles.forEach((Projectile, Index) => {
        Projectile.update()

        if (Projectile.x + Projectile.radius < 0 ||
            Projectile.x - Projectile.radius > canvas.width ||
            Projectile.y + Projectile.radius < 0 ||
            Projectile.y - Projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(Index, 1)
            }, 0)
        }
    })

    enemies.forEach((Enemy, index) => {
        Enemy.update()

        //endgame 
        const dist = Math.hypot(player.x - Enemy.x, player.y - Enemy.y)
        if (dist - Enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            gameUI.style.display = 'flex'
            point.innerHTML = points
        }

        projectiles.forEach((Projectile, ProjectileIndex) => {
            const dist = Math.hypot(Projectile.x - Enemy.x, Projectile.y - Enemy.y)
                //when projectiles touch enemy //
            if (dist - Enemy.radius - Projectile.radius < 1) {

                // explosions // 
                for (let i = 0; i < Enemy.radius * 2; i++) {
                    particles.push(new Particle(Projectile.x, Projectile.y, Math.random() * 2, Enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 5),
                        y: (Math.random() - 0.5) * (Math.random() * 5)
                    }))
                }

                // shrink large enemies // 
                if (Enemy.radius - 10 > 10) {

                    // add score // 
                    points += 50
                    score.innerHTML = points

                    gsap.to(Enemy, {
                        radius: Enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(ProjectileIndex, 1)
                    }, 0)
                } else {

                    // add score //
                    points += 100
                    score.innerHTML = points

                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(ProjectileIndex, 1)
                    }, 0)
                }
            }
        })
    })
}

function spawn() {
    setInterval(() => {

        const radius = Math.random() * (50 - 10) + 10

        let x
        let y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }



        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

// shoot projectile // 
window.addEventListener('click', (event) => {

    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        'white', velocity))
})

btn.addEventListener('click', () => {
    init()
    animate()
    spawn()
    gameUI.style.display = 'none'
})