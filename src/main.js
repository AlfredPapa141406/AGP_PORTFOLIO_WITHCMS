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

const defaultProjectCategories = [
    {
        title: 'Web Design Projects',
        projects: [
            {
                title: 'Nomnoms',
                description: 'Cozy cookie brand website focused on storytelling, product highlights, and warm visual design.',
                image: 'https://nomnomsmkt.netlify.app/assets/uploads/nomnomsphoto.png',
                link: 'https://nomnomsmkt.netlify.app/'
            },
            {
                title: 'Cozy Stayins - Baguio',
                description: 'Transient house booking site built for clarity, trust, and easy access to essential property details.',
                image: 'https://cozystayinsbaguio.netlify.app/assets/uploads/cozystayins.png',
                link: 'https://cozystayinsbaguio.netlify.app/'
            }
        ]
    },
    {
        title: 'Canva Design Edits',
        projects: [
            {
                title: 'Brand Social Pack',
                description: 'Bold social media templates crafted for consistent branding across Facebook and Instagram.',
                image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=600&h=400&fit=crop',
                link: '#'
            },
            {
                title: 'Pitch Deck Redesign',
                description: 'Professional presentation refresh aligned with brand colors, typography, and visual hierarchy.',
                image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
                link: '#'
            }
        ]
    }
];

function renderProjectCategories(projectsGrid, categories) {
    projectsGrid.innerHTML = '';

    if (!Array.isArray(categories) || categories.length === 0) {
        projectsGrid.innerHTML = `<p class="project-empty">Projects coming soon. Check back later!</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    const fallbackImage = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop';

    for (const category of categories) {
        if (!category || !Array.isArray(category.projects) || category.projects.length === 0) continue;

        const categoryEl = document.createElement('div');
        categoryEl.className = 'project-category fade-in';

        const heading = document.createElement('h3');
        heading.className = 'project-category-title';
        heading.textContent = category.title || 'Projects';
        categoryEl.appendChild(heading);

        for (const project of category.projects) {
            const card = document.createElement('div');
            card.className = 'project-card fade-in';

            const image = document.createElement('img');
            image.className = 'project-image';
            image.src = project?.image || fallbackImage;
            image.alt = project?.title ? `${project.title}` : 'Project preview';
            card.appendChild(image);

            const content = document.createElement('div');
            content.className = 'project-content';

            const title = document.createElement('h3');
            title.className = 'project-title';
            title.textContent = project?.title || 'Untitled Project';

            const description = document.createElement('p');
            description.className = 'project-description';
            description.textContent = project?.description || '';

            const linkValue = project?.link || '#';
            const link = document.createElement('a');
            link.className = 'project-link';
            link.href = linkValue;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'View Project →';
            if (!linkValue || linkValue === '#') {
                link.setAttribute('aria-disabled', 'true');
                link.classList.add('project-link--disabled');
            }

            content.appendChild(title);
            if (description.textContent.trim().length > 0) {
                content.appendChild(description);
            }
            content.appendChild(link);

            card.appendChild(content);
            categoryEl.appendChild(card);
        }

        fragment.appendChild(categoryEl);
    }

    if (!fragment.childNodes.length) {
        projectsGrid.innerHTML = `<p class="project-empty">Projects coming soon. Check back later!</p>`;
        return;
    }

    projectsGrid.appendChild(fragment);

    const newFadeElements = projectsGrid.querySelectorAll('.fade-in, .project-card');
    for (const el of newFadeElements) {
        observer.observe(el);
    }
}

// Load projects
async function loadProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    let categories = [];

    try {
        const response = await fetch('./content/projects.json', { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                categories = data;
            } else if (Array.isArray(data?.categories)) {
                categories = data.categories;
            }
        }
    } catch (error) {
        console.warn('Falling back to default project data.', error);
    }

    if (!Array.isArray(categories) || categories.length === 0) {
        categories = defaultProjectCategories;
    }

    renderProjectCategories(projectsGrid, categories);
}

// Load about content
async function loadAboutContent() {
    try {
        const response = await fetch('./content/about.json', { cache: 'no-store' });
        if (response.ok) {
            const aboutData = await response.json();

            const aboutHeading = document.getElementById('about-heading');
            const aboutDescription = document.getElementById('about-description');
            const webSkillsList = document.getElementById('web-skills-list');
            const businessSkillsList = document.getElementById('business-skills-list');
            const toolsSkillsList = document.getElementById('tools-skills-list');
            const aboutImage = document.getElementById('about-image');

            if (aboutHeading && aboutData.heading) {
                aboutHeading.textContent = aboutData.heading;
            }

            if (aboutDescription && aboutData.body) {
                aboutDescription.textContent = aboutData.body.trim();
            }

            if (businessSkillsList && Array.isArray(aboutData.business_skills)) {
                businessSkillsList.innerHTML = aboutData.business_skills
                    .filter((skill) => typeof skill === 'string' && skill.trim().length > 0)
                    .map((skill) => `<li>${skill.trim()}</li>`)
                    .join('');
            }

            if (webSkillsList && Array.isArray(aboutData.web_skills)) {
                webSkillsList.innerHTML = aboutData.web_skills
                    .filter((skill) => typeof skill === 'string' && skill.trim().length > 0)
                    .map((skill) => `<li>${skill.trim()}</li>`)
                    .join('');
            }

            if (toolsSkillsList && Array.isArray(aboutData.tools_skills)) {
                toolsSkillsList.innerHTML = aboutData.tools_skills
                    .filter((skill) => typeof skill === 'string' && skill.trim().length > 0)
                    .map((skill) => `<li>${skill.trim()}</li>`)
                    .join('');
            }

            if (aboutImage && aboutData.image) {
                aboutImage.src = aboutData.image;
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
        const socialFacebook = document.getElementById('social-facebook');
        const socialInstagram = document.getElementById('social-instagram');
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
        if (socialFacebook && settings.social && settings.social.facebook) socialFacebook.href = settings.social.facebook;
        if (socialInstagram && settings.social && settings.social.instagram) socialInstagram.href = settings.social.instagram;
        if (socialEmail && settings.social && settings.social.email) {
            const socialEmailValue = settings.social.email.trim();
            if (socialEmailValue.startsWith('mailto:')) {
                socialEmail.href = socialEmailValue;
                socialEmail.removeAttribute('download');
            } else if (socialEmailValue.includes('@') && !socialEmailValue.includes('/') && !socialEmailValue.includes('://')) {
                socialEmail.href = `mailto:${socialEmailValue}`;
                socialEmail.removeAttribute('download');
            } else {
                socialEmail.href = socialEmailValue;
                if (!socialEmail.hasAttribute('download')) {
                    socialEmail.setAttribute('download', '');
                }
            }

            const socialEmailLabel = socialEmail.querySelector('span');
            if (socialEmailLabel) {
                if (settings.social_email_label && settings.social_email_label.trim().length > 0) {
                    socialEmailLabel.textContent = settings.social_email_label.trim();
                } else if (socialEmailValue.startsWith('mailto:') || socialEmailValue.includes('@')) {
                    socialEmailLabel.textContent = 'Email';
                } else {
                    socialEmailLabel.textContent = 'Download CV';
                }
            }
        }

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


