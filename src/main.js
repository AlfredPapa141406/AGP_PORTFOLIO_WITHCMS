// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    for (const link of navLinks) {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    }
}

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar && navbar.classList.add('scrolled');
    } else {
        navbar && navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    }
}, observerOptions);

// Observe all fade-in elements
const fadeElements = document.querySelectorAll('.fade-in');
for (const el of fadeElements) {
    observer.observe(el);
}

// Parse markdown frontmatter and content
function parseMarkdown(text) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = text.match(frontmatterRegex);

    if (!match) {
        return { frontmatter: {}, content: text };
    }

    const frontmatterText = match[1];
    const content = match[2];

    const frontmatter = {};
    const lines = frontmatterText.split('\n');
    for (const line of lines) {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
    }

    return { frontmatter, content };
}

// Load projects
async function loadProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    try {
        const projectFiles = ['project1.md', 'project2.md', 'project3.md'];
        const projects = [];

        for (const file of projectFiles) {
            try {
                const response = await fetch(`./content/projects/${file}`);
                if (response.ok) {
                    const text = await response.text();
                    const { frontmatter, content } = parseMarkdown(text);

                    projects.push({
                        title: frontmatter.title || 'Untitled Project',
                        description: (content || '').trim() || frontmatter.description || '',
                        image: frontmatter.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
                        link: frontmatter.link || '#',
                        featured: frontmatter.featured === 'true'
                    });
                }
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
            }
        }

        projectsGrid.innerHTML = projects.map(project => `
            <div class="project-card fade-in">
                <img src="${project.image}" alt="${project.title}" class="project-image">
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <a href="${project.link}" target="_blank" rel="noopener" class="project-link">
                        View Project →
                    </a>
                </div>
            </div>
        `).join('');

        const newFadeElements = projectsGrid.querySelectorAll('.fade-in');
        for (const el of newFadeElements) {
            observer.observe(el);
        }

    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Load about content
async function loadAboutContent() {
    try {
        const response = await fetch('./content/about.md');
        if (response.ok) {
            const text = await response.text();
            const { frontmatter, content } = parseMarkdown(text);

            const aboutHeading = document.getElementById('about-heading');
            const aboutDescription = document.getElementById('about-description');
            const skillsList = document.getElementById('skills-list');
            const aboutImage = document.getElementById('about-image');

            if (aboutHeading && frontmatter.heading) {
                aboutHeading.textContent = frontmatter.heading;
            }

            if (aboutDescription && content) {
                aboutDescription.textContent = content.trim();
            }

            if (skillsList && frontmatter.skills) {
                const skills = frontmatter.skills.split(',').map((s) => s.trim());
                skillsList.innerHTML = skills.map((skill) => `<li>${skill}</li>`).join('');
            }

            if (aboutImage && frontmatter.image) {
                aboutImage.src = frontmatter.image;
            }
        }
    } catch (error) {
        console.error('Error loading about content:', error);
    }
}

// Load site settings for global content
async function loadSiteSettings() {
    try {
        const response = await fetch('./content/site.json');
        if (!response.ok) return;
        const settings = await response.json();

        const logoText = document.getElementById('logo-text');
        const heroName = document.getElementById('hero-name');
        const heroSubtitle = document.getElementById('hero-subtitle');
        const heroDescription = document.getElementById('hero-description');
        const heroCta = document.getElementById('hero-cta');
        const heroSection = document.getElementById('home');
        const socialGithub = document.getElementById('social-github');
        const socialLinkedin = document.getElementById('social-linkedin');
        const socialTwitter = document.getElementById('social-twitter');
        const socialEmail = document.getElementById('social-email');
        const footerName = document.getElementById('footer-name');
        const footerYear = document.getElementById('footer-year');
        const contactForm = document.querySelector('form.contact-form');

        if (logoText && settings.logo_text) logoText.textContent = settings.logo_text;
        if (heroName && settings.hero_name) heroName.textContent = settings.hero_name;
        if (heroSubtitle && settings.hero_subtitle) heroSubtitle.textContent = settings.hero_subtitle;
        if (heroDescription && settings.hero_description) heroDescription.textContent = settings.hero_description;
        if (heroCta && settings.hero_cta_text) heroCta.textContent = settings.hero_cta_text;
        if (heroCta && settings.hero_cta_link) heroCta.setAttribute('href', settings.hero_cta_link);

        // Apply hero background image if provided
        if (heroSection && settings.hero_background_image) {
            heroSection.style.background = `url('${settings.hero_background_image}') center/cover no-repeat`;
        }

        if (socialGithub && settings.social && settings.social.github) socialGithub.href = settings.social.github;
        if (socialLinkedin && settings.social && settings.social.linkedin) socialLinkedin.href = settings.social.linkedin;
        if (socialTwitter && settings.social && settings.social.twitter) socialTwitter.href = settings.social.twitter;
        if (socialEmail && settings.social && settings.social.email) socialEmail.href = `mailto:${settings.social.email}`;

        if (footerName && settings.footer_name) footerName.textContent = settings.footer_name;
        if (footerYear && settings.footer_year) footerYear.textContent = `${settings.footer_year}`;
    } catch (error) {
        console.error('Error loading site settings:', error);
    }
}

// Handle form submission success
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadAboutContent();
    loadSiteSettings();
    
    // Check for form submission success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('submitted') === 'true') {
        const formSuccess = document.getElementById('form-success');
        if (formSuccess) {
            formSuccess.style.display = 'block';
            // Scroll to form
            setTimeout(() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }
});

// Smooth scroll for all anchor links
const anchorLinks = document.querySelectorAll('a[href^="#"]');
for (const anchor of anchorLinks) {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        const target = href ? document.querySelector(href) : null;
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
}


