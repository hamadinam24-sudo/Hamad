// script.js - Main Portfolio Website
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Portfolio script loaded!');
    
    // Initialize database
    const db = new PortfolioDB();
    
    // Load portfolio data
    function loadPortfolioData() {
        console.log('📥 Loading portfolio data...');
        const data = db.getPortfolioData();
        
        // Debug log
        console.log('Current profile:', {
            name: data.profile.name,
            heroDesc: data.profile.heroDesc,
            about: data.profile.about
        });
        
        // Update profile information
        updateProfileData(data.profile);
        
        // Update experience timeline
        updateExperienceData(data.experience);
        
        // Update projects grid
        updateProjectsData(data.projects);
        
        // Update contact info
        updateContactData(data.profile);
        
        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        console.log('✅ Portfolio data loaded!');
    }
    
    // Update profile data on page
    function updateProfileData(profile) {
        // Hero section
        if (profile.name) {
            document.getElementById('user-name').textContent = profile.name;
            console.log('✓ Updated name:', profile.name);
        }
        if (profile.heroDesc) {
            document.getElementById('hero-description').textContent = profile.heroDesc;
            console.log('✓ Updated hero desc');
        }
        if (profile.title) {
            document.getElementById('hero-subtitle').textContent = profile.title;
            console.log('✓ Updated title:', profile.title);
        }
        if (profile.image) {
            const img = document.getElementById('profile-image');
            img.src = profile.image;
            img.onerror = function() {
                this.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
            };
            console.log('✓ Updated profile image');
        }
        
        // About section
        if (profile.about) {
            document.getElementById('about-bio').innerHTML = profile.about.replace(/\n/g, '<br>');
            console.log('✓ Updated about bio');
        }
        if (profile.name) document.getElementById('info-name').textContent = profile.name;
        if (profile.email) document.getElementById('info-email').textContent = profile.email;
        if (profile.phone) document.getElementById('info-phone').textContent = profile.phone;
        if (profile.location) document.getElementById('info-location').textContent = profile.location;
        if (profile.title) document.getElementById('info-title').textContent = profile.title;
        
        // Statistics
        if (profile.expYears) document.getElementById('stat-experience').textContent = profile.expYears + '+';
        if (profile.projectCount) document.getElementById('stat-projects').textContent = profile.projectCount + '+';
        if (profile.clientCount) document.getElementById('stat-clients').textContent = profile.clientCount + '+';
        if (profile.awardCount) document.getElementById('stat-awards').textContent = profile.awardCount;
    }
    
    // Update experience timeline
    function updateExperienceData(experience) {
        const timelineContainer = document.getElementById('experience-timeline');
        timelineContainer.innerHTML = '';
        
        // Sort by order
        const sortedExperience = [...experience].sort((a, b) => a.order - b.order);
        
        sortedExperience.forEach(exp => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-date">${exp.period}</div>
                <h3 class="timeline-title">${exp.title}</h3>
                <div class="timeline-company">
                    <i class="fas fa-building"></i> ${exp.company}
                    ${exp.location ? `<span style="margin-left: 15px;"><i class="fas fa-map-marker-alt"></i> ${exp.location}</span>` : ''}
                </div>
                <p class="timeline-description">${exp.description}</p>
            `;
            timelineContainer.appendChild(timelineItem);
        });
    }
    
    // Update projects grid
    function updateProjectsData(projects) {
        const projectsContainer = document.getElementById('projects-grid');
        projectsContainer.innerHTML = '';
        
        // Sort by order
        const sortedProjects = [...projects].sort((a, b) => a.order - b.order);
        
        sortedProjects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title}" onerror="this.src='https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    ${project.tags && project.tags.length > 0 ? `
                        <div class="project-tags">
                            ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${project.link ? `<a href="${project.link}" class="project-link" target="_blank">View Project <i class="fas fa-arrow-right"></i></a>` : ''}
                </div>
            `;
            projectsContainer.appendChild(projectCard);
        });
    }
    
    // Update contact information
    function updateContactData(profile) {
        if (profile.email) document.getElementById('contact-email').textContent = profile.email;
        if (profile.phone) document.getElementById('contact-phone').textContent = profile.phone;
        if (profile.location) document.getElementById('contact-location').textContent = profile.location;
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                timestamp: new Date().toISOString()
            };
            
            // Show success message
            formStatus.textContent = `Thank you, ${formData.name}! Your message has been sent successfully. I'll get back to you within 24 hours.`;
            formStatus.className = 'success';
            formStatus.style.display = 'block';
            
            // Reset form
            contactForm.reset();
            
            // Hide status message after 5 seconds
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 5000);
            
            // Store message in local storage (simulated)
            const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
            messages.push(formData);
            localStorage.setItem('portfolio_messages', JSON.stringify(messages));
        });
    }
    
    // Mobile navigation toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Listen for database updates
    window.addEventListener('portfolioDataUpdated', function(event) {
        console.log('🔔 Received update event!', event.detail);
        loadPortfolioData();
    });
    
    // Also check for updates from other tabs
    window.addEventListener('storage', function(event) {
        if (event.key === 'portfolio_last_update') {
            console.log('📡 Update detected from other tab');
            loadPortfolioData();
        }
    });
    
    // Check for updates periodically (every 3 seconds)
    setInterval(() => {
        const lastUpdate = parseInt(localStorage.getItem('portfolio_last_update') || '0');
        const now = new Date().getTime();
        
        if (now - lastUpdate < 5000) { // If updated in last 5 seconds
            loadPortfolioData();
            localStorage.removeItem('portfolio_last_update'); // Clear flag
        }
    }, 3000);
    
    // Initial load
    loadPortfolioData();
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements to animate
    document.querySelectorAll('.skill-card, .project-card, .about-content, .contact-content, .timeline-item').forEach(el => {
        observer.observe(el);
    });
    
    // Force check on page focus (when returning from admin tab)
    window.addEventListener('focus', loadPortfolioData);
});