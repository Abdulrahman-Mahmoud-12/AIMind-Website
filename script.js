// ============================================
// 1. CONSTANTS AND CONFIGURATION
// ============================================
const CONFIG = {
  colors: {
    cyan: "#00F5FF",
    purple: "#8B5CF6",
    dimLine: "rgba(148, 163, 184, 0.2)",
    dimNode: "rgba(148, 163, 184, 0.35)"
  },
  particles: {
    desktopCount: 200,
    mobileCount: 80,
    connectionDistance: 100,
    mouseRadius: 150,
    resizeDelay: 250
  },
  typing: {
    typeSpeed: 80,
    deleteSpeed: 40,
    pauseTime: 2000,
    strings: [
      "Artificial Intelligence is shaping the future.",
      "Machine Learning is redefining possibilities.",
      "The AI revolution starts here."
    ]
  },
  game: {
    choices: ["rock", "paper", "scissors"],
    thinkingDelay: 800
  }
};

function debounce(callback, delay) {
  let timeoutId;
  return function debouncedFunction(...args) {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback.apply(this, args), delay);
  };
}

// ============================================
// 2. PARTICLE SYSTEM
// ============================================
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.animationId = null;
    this.resize = this.resize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  init() {
    this.resize();
    this.createParticles();
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseleave", () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
    window.addEventListener("resize", debounce(this.resize, CONFIG.particles.resizeDelay));
    this.animate();
  }

  createParticles() {
    const isMobile = window.innerWidth <= 480;
    const particleCount = isMobile ? CONFIG.particles.mobileCount : CONFIG.particles.desktopCount;
    this.particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 1.8 + 0.8,
      opacity: Math.random() * 0.55 + 0.25,
      color: Math.random() > 0.5 ? CONFIG.colors.cyan : CONFIG.colors.purple
    }));
  }

  animate() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawConnections();
    this.drawParticles();
    this.animationId = window.requestAnimationFrame(() => this.animate());
  }

  drawParticles() {
    this.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x <= 0 || particle.x >= this.canvas.width) particle.vx *= -1;
      if (particle.y <= 0 || particle.y >= this.canvas.height) particle.vy *= -1;

      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.hypot(dx, dy);
        if (distance < CONFIG.particles.mouseRadius && distance > 0) {
          const pushForce = (CONFIG.particles.mouseRadius - distance) / CONFIG.particles.mouseRadius;
          particle.x += (dx / distance) * pushForce * 2.4;
          particle.y += (dy / distance) * pushForce * 2.4;
        }
      }

      this.context.save();
      this.context.globalAlpha = particle.opacity;
      this.context.fillStyle = particle.color;
      this.context.shadowBlur = 14;
      this.context.shadowColor = particle.color;
      this.context.beginPath();
      this.context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.context.fill();
      this.context.restore();
    });
  }

  drawConnections() {
    for (let firstIndex = 0; firstIndex < this.particles.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < this.particles.length; secondIndex += 1) {
        const firstParticle = this.particles[firstIndex];
        const secondParticle = this.particles[secondIndex];
        const distance = Math.hypot(firstParticle.x - secondParticle.x, firstParticle.y - secondParticle.y);
        if (distance < CONFIG.particles.connectionDistance) {
          const opacity = 1 - distance / CONFIG.particles.connectionDistance;
          this.context.strokeStyle = `rgba(0, 245, 255, ${opacity * 0.28})`;
          this.context.lineWidth = 1;
          this.context.beginPath();
          this.context.moveTo(firstParticle.x, firstParticle.y);
          this.context.lineTo(secondParticle.x, secondParticle.y);
          this.context.stroke();
        }
      }
    }
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.offsetWidth;
    this.canvas.height = parent.offsetHeight;
    this.createParticles();
  }
}

// ============================================
// 3. TYPING ANIMATION
// ============================================
class TypingAnimation {
  constructor(element, strings) {
    this.element = element;
    this.strings = strings;
    this.stringIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
  }

  type() {
    const currentString = this.strings[this.stringIndex];
    this.element.textContent = currentString.slice(0, this.charIndex + 1);
    this.charIndex += 1;

    if (this.charIndex === currentString.length) {
      window.setTimeout(() => {
        this.isDeleting = true;
        this.delete();
      }, CONFIG.typing.pauseTime);
      return;
    }

    window.setTimeout(() => this.type(), CONFIG.typing.typeSpeed);
  }

  delete() {
    const currentString = this.strings[this.stringIndex];
    this.element.textContent = currentString.slice(0, this.charIndex - 1);
    this.charIndex -= 1;

    if (this.charIndex === 0) {
      this.next();
      return;
    }

    window.setTimeout(() => this.delete(), CONFIG.typing.deleteSpeed);
  }

  next() {
    this.isDeleting = false;
    this.stringIndex = (this.stringIndex + 1) % this.strings.length;
    window.setTimeout(() => this.type(), CONFIG.typing.typeSpeed);
  }

  start() {
    this.type();
  }
}

// ============================================
// 4. NEURAL NETWORK VISUALIZATION
// ============================================
class NeuralNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.isAnimating = false;
    this.progress = 0;
    this.nodes = {
      input: [{ x: 90, y: 75 }, { x: 90, y: 150 }, { x: 90, y: 225 }],
      hidden: [{ x: 300, y: 50 }, { x: 300, y: 116 }, { x: 300, y: 184 }, { x: 300, y: 250 }],
      output: [{ x: 510, y: 105 }, { x: 510, y: 195 }]
    };
    this.connections = this.createConnections();
  }

  createConnections() {
    const connections = [];
    this.nodes.input.forEach((inputNode) => {
      this.nodes.hidden.forEach((hiddenNode) => connections.push([inputNode, hiddenNode]));
    });
    this.nodes.hidden.forEach((hiddenNode) => {
      this.nodes.output.forEach((outputNode) => connections.push([hiddenNode, outputNode]));
    });
    return connections;
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.connections.forEach(([startNode, endNode], index) => {
      this.context.strokeStyle = this.isAnimating ? "rgba(0, 245, 255, 0.45)" : CONFIG.colors.dimLine;
      this.context.lineWidth = this.isAnimating ? 2 : 1;
      this.context.beginPath();
      this.context.moveTo(startNode.x, startNode.y);
      this.context.lineTo(endNode.x, endNode.y);
      this.context.stroke();

      if (this.isAnimating) {
        const offsetProgress = (this.progress + index * 0.06) % 1;
        const dotX = startNode.x + (endNode.x - startNode.x) * offsetProgress;
        const dotY = startNode.y + (endNode.y - startNode.y) * offsetProgress;
        this.context.save();
        this.context.fillStyle = CONFIG.colors.cyan;
        this.context.shadowBlur = 18;
        this.context.shadowColor = CONFIG.colors.cyan;
        this.context.beginPath();
        this.context.arc(dotX, dotY, 4, 0, Math.PI * 2);
        this.context.fill();
        this.context.restore();
      }
    });

    this.drawLayer(this.nodes.input, CONFIG.colors.cyan);
    this.drawLayer(this.nodes.hidden, CONFIG.colors.purple);
    this.drawLayer(this.nodes.output, CONFIG.colors.cyan, true);
  }

  drawLayer(nodes, color, isOutput = false) {
    nodes.forEach((node) => {
      const pulse = this.isAnimating ? Math.sin(this.progress * Math.PI * 8) * 3 : 0;
      const flash = this.isAnimating && isOutput && this.progress > 0.68 ? 10 : 0;
      this.context.save();
      this.context.fillStyle = this.isAnimating ? color : CONFIG.colors.dimNode;
      this.context.shadowBlur = this.isAnimating ? 22 + flash : 4;
      this.context.shadowColor = color;
      this.context.beginPath();
      this.context.arc(node.x, node.y, 13 + pulse + flash * 0.2, 0, Math.PI * 2);
      this.context.fill();
      this.context.restore();
    });
  }

  animate() {
    this.isAnimating = true;
    this.progress = 0;
    const statusElement = document.getElementById("training-status");
    statusElement.textContent = "";
    const animationStart = performance.now();

    const animateFrame = (time) => {
      this.progress = Math.min((time - animationStart) / 3000, 1);
      this.draw();
      if (this.progress < 1) {
        window.requestAnimationFrame(animateFrame);
      } else {
        statusElement.textContent = "Training Complete - Accuracy: 94.7%";
        window.setTimeout(() => this.reset(), 800);
      }
    };

    window.requestAnimationFrame(animateFrame);
  }

  reset() {
    this.isAnimating = false;
    this.progress = 0;
    this.draw();
  }
}

// ============================================
// 5. MODAL MANAGER
// ============================================
const ModalManager = {
  modal: null,
  video: null,

  open(videoSrc) {
    this.modal.classList.add("active");
    this.modal.setAttribute("aria-hidden", "false");
    this.video.src = videoSrc;
    this.video.currentTime = 0;
    const playPromise = this.video.play();
    if (playPromise) {
      playPromise.catch(() => {});
    }
    document.body.style.overflow = "hidden";
  },

  close() {
    this.modal.classList.remove("active");
    this.modal.setAttribute("aria-hidden", "true");
    this.video.pause();
    this.video.currentTime = 0;
    this.video.removeAttribute("src");
    this.video.load();
    document.body.style.overflow = "";
  },

  handleKeydown(event) {
    if (event.key === "Escape" && this.modal.classList.contains("active")) {
      this.close();
    }
  },

  init() {
    this.modal = document.getElementById("video-modal");
    this.video = document.getElementById("modal-video");
    document.querySelectorAll(".demo-button").forEach((button) => {
      button.addEventListener("click", () => this.open(button.dataset.video));
    });
    document.querySelector(".modal-close").addEventListener("click", () => this.close());
    this.modal.addEventListener("click", (event) => {
      if (event.target === this.modal) this.close();
    });
    document.addEventListener("keydown", (event) => this.handleKeydown(event));
  }
};

// ============================================
// 6. GAME LOGIC
// ============================================
const RPSGame = {
  scores: { player: 0, ai: 0, draws: 0 },
  icons: {
    rock: "fa-hand-rock",
    paper: "fa-hand-paper",
    scissors: "fa-hand-scissors"
  },

  init() {
    document.querySelectorAll(".choice-button").forEach((button) => {
      button.addEventListener("click", () => this.playerChoice(button.dataset.choice));
    });
    document.getElementById("reset-game").addEventListener("click", () => this.reset());
    this.updateScore();
  },

  playerChoice(choice) {
    const aiIcon = document.getElementById("ai-icon");
    const resultText = document.getElementById("result-text");
    this.setIcon("player-icon", this.icons[choice]);
    aiIcon.classList.add("thinking");
    aiIcon.innerHTML = '<i class="fa-solid fa-spinner" aria-hidden="true"></i>';
    resultText.className = "result-text";
    resultText.textContent = "AI is thinking...";

    window.setTimeout(() => {
      aiIcon.classList.remove("thinking");
      const ai = this.aiChoice();
      const result = this.determineWinner(choice, ai);
      this.updateScore(result);
      this.displayResult(choice, ai, result);
    }, CONFIG.game.thinkingDelay);
  },

  aiChoice() {
    const randomIndex = Math.floor(Math.random() * CONFIG.game.choices.length);
    return CONFIG.game.choices[randomIndex];
  },

  determineWinner(player, ai) {
    if (player === ai) return "draw";
    if (
      (player === "rock" && ai === "scissors") ||
      (player === "paper" && ai === "rock") ||
      (player === "scissors" && ai === "paper")
    ) {
      return "win";
    }
    return "lose";
  },

  updateScore(result) {
    if (result === "win") this.scores.player += 1;
    if (result === "lose") this.scores.ai += 1;
    if (result === "draw") this.scores.draws += 1;
    document.getElementById("score-display").textContent = `You: ${this.scores.player} | AI: ${this.scores.ai} | Draws: ${this.scores.draws}`;
  },

  displayResult(player, ai, result) {
    this.setIcon("player-icon", this.icons[player]);
    this.setIcon("ai-icon", this.icons[ai]);
    const resultText = document.getElementById("result-text");
    const messages = {
      win: "You Win!",
      lose: "AI Wins!",
      draw: "It's a Draw!"
    };
    const classes = {
      win: "result-win",
      lose: "result-lose",
      draw: "result-draw"
    };
    resultText.className = `result-text ${classes[result]}`;
    resultText.textContent = messages[result];
  },

  setIcon(elementId, iconClass) {
    document.getElementById(elementId).innerHTML = `<i class="fa-solid ${iconClass}" aria-hidden="true"></i>`;
  },

  reset() {
    this.scores = { player: 0, ai: 0, draws: 0 };
    this.updateScore();
    document.getElementById("player-icon").innerHTML = '<i class="fa-solid fa-user-astronaut" aria-hidden="true"></i>';
    document.getElementById("ai-icon").innerHTML = '<i class="fa-solid fa-robot" aria-hidden="true"></i>';
    const resultText = document.getElementById("result-text");
    resultText.className = "result-text";
    resultText.textContent = "Choose your move.";
  }
};

// ============================================
// 7. TIMELINE REVEAL
// ============================================
const TimelineReveal = {
  observer: null,

  init() {
    this.observer = new IntersectionObserver((entries) => this.observe(entries), {
      threshold: 0.15
    });
    document.querySelectorAll(".reveal, .timeline-reveal").forEach((entry) => {
      this.observer.observe(entry);
    });
  },

  observe(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.reveal(entry.target);
      }
    });
  },

  reveal(entry) {
    entry.classList.add("visible");
    this.observer.unobserve(entry);
  }
};

// ============================================
// 8. NAVBAR BEHAVIOR
// ============================================
const Navbar = {
  navbar: null,
  menuButton: null,
  navLinks: null,

  init() {
    this.navbar = document.getElementById("navbar");
    this.menuButton = document.querySelector(".mobile-menu-button");
    this.navLinks = document.querySelector(".nav-links");
    window.addEventListener("scroll", () => this.handleScroll());
    this.menuButton.addEventListener("click", () => this.toggleMobile());
    document.querySelectorAll('a[href^="#"], button[data-scroll-target]').forEach((item) => {
      item.addEventListener("click", (event) => {
        const target = item.dataset.scrollTarget || item.getAttribute("href");
        if (target && target.startsWith("#")) {
          event.preventDefault();
          this.smoothScroll(target);
        }
      });
    });
    this.handleScroll();
  },

  handleScroll() {
    this.navbar.classList.toggle("scrolled", window.scrollY > 24);
  },

  toggleMobile() {
    const isOpen = this.navLinks.classList.toggle("open");
    this.menuButton.setAttribute("aria-expanded", String(isOpen));
    this.menuButton.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  },

  smoothScroll(target) {
    const element = document.querySelector(target);
    if (!element) return;
    const navHeight = this.navbar.offsetHeight;
    const topPosition = element.getBoundingClientRect().top + window.scrollY - navHeight + 2;
    window.scrollTo({ top: topPosition, behavior: "smooth" });
    this.navLinks.classList.remove("open");
    this.menuButton.setAttribute("aria-expanded", "false");
    this.menuButton.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  }
};

// ============================================
// 9. INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  const particleCanvas = document.getElementById("particles-canvas");
  const typingElement = document.getElementById("typing-text");
  const neuralCanvas = document.getElementById("neural-canvas");

  if (particleCanvas) {
    const particleSystem = new ParticleSystem(particleCanvas);
    particleSystem.init();
  }

  if (typingElement) {
    const typingAnimation = new TypingAnimation(typingElement, CONFIG.typing.strings);
    typingAnimation.start();
  }

  if (neuralCanvas) {
    const neuralNetwork = new NeuralNetwork(neuralCanvas);
    neuralNetwork.draw();
    document.getElementById("train-button").addEventListener("click", () => neuralNetwork.animate());
  }

  ModalManager.init();
  RPSGame.init();
  TimelineReveal.init();
  Navbar.init();
});
