// admin.js - Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const db = new PortfolioDB();
    let currentData = db.getPortfolioData();
    let autoSaveInterval;
    let isSaving = false;

    // ========== INITIALIZATION ==========
    function init() {
        loadDashboard();
        setupTabs();
        setupEventListeners();
        startAutoSave();
        updateLastLogin();
    }

    function updateLastLogin() {
        const now = new Date();
        const loginTime = new Date(parseInt(sessionStorage.getItem('login_time')));
        const diffMinutes = Math.floor((now - loginTime) / (1000 * 60));
        
        const statusEl = document.querySelector('.admin-status');
        if (statusEl) {
            statusEl.innerHTML += `<br><small>Session active for ${diffMinutes} minutes</small>`;
        }
    }

    // ========== TAB MANAGEMENT ==========
    function setupTabs() {
        const navItems = document.querySelectorAll('.nav-item[data-tab]');
        const tabs = document.querySelectorAll('.admin-tab');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all nav items
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Hide all tabs
                tabs.forEach(tab => tab.classList.remove('active'));
                
                // Show selected tab
                const tabId = item.getAttribute('data-tab');
                const selectedTab = document.getElementById(tabId);
                if (selectedTab) {
                    selectedTab.classList.add('active');
                    updateHeaderTitle(tabId);
                    loadTabData(tabId);
                }
            });
        });
        
        // Load initial tab from URL hash or default to dashboard
        const hash = window.location.hash.substring(1);
        const initialTab = hash && document.getElementById(hash) ? hash : 'dashboard';
        
        // Trigger click on the initial tab
        const initialNavItem = document.querySelector(`.nav-item[data-tab="${initialTab}"]`);
        if (initialNavItem) {
            initialNavItem.click();
        }
    }

    function updateHeaderTitle(tabId) {
        const header = document.querySelector('.admin-header h1');
        const titles = {
            dashboard: 'Portfolio Database Manager',
            profile: 'Edit Profile Information',
            experience: 'Manage Work Experience',
            projects: 'Edit Portfolio Projects',
            skills: 'Manage Technical Skills',
            cv: 'CV Builder & Export',
            settings: 'Admin Settings'
        };
        if (header) {
            header.innerHTML = `<i class="fas fa-database"></i> ${titles[tabId] || 'Admin Panel'}`;
        }
    }

    function loadTabData(tabId) {
        switch(tabId) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'profile':
                loadProfileTab();
                break;
            case 'experience':
                loadExperienceTab();
                break;
            case 'projects':
                loadProjectsTab();
                break;
            case 'skills':
                loadSkillsTab();
                break;
            case 'cv':
                loadCVTab();
                break;
            case 'settings':
                loadSettingsTab();
                break;
        }
    }

    // ========== DASHBOARD TAB ==========
    function loadDashboard() {
        const stats = db.getStats();
        
        if (document.getElementById('db-profile-count')) {
            document.getElementById('db-profile-count').textContent = stats.profileComplete;
        }
        if (document.getElementById('db-exp-count')) {
            document.getElementById('db-exp-count').textContent = stats.experienceCount;
        }
        if (document.getElementById('db-project-count')) {
            document.getElementById('db-project-count').textContent = stats.projectCount;
        }
        if (document.getElementById('db-size')) {
            document.getElementById('db-size').textContent = stats.dbSize;
        }
        if (document.getElementById('db-profile-date')) {
            document.getElementById('db-profile-date').textContent = 
                new Date(stats.lastUpdated).toLocaleDateString();
        }
        if (document.getElementById('last-backup')) {
            document.getElementById('last-backup').textContent = 
                stats.lastBackup ? new Date(stats.lastBackup).toLocaleString() : 'Never';
        }
    }

    // ========== PROFILE TAB ==========
    function loadProfileTab() {
        const profile = currentData.profile;
        
        // Populate form fields
        const fieldMappings = {
            'input-name': 'name',
            'input-title': 'title',
            'input-email': 'email',
            'input-phone': 'phone',
            'input-location': 'location',
            'input-image': 'image',
            'input-hero-desc': 'heroDesc',
            'input-about': 'about',
            'input-exp-years': 'expYears',
            'input-project-count': 'projectCount',
            'input-client-count': 'clientCount',
            'input-award-count': 'awardCount'
        };
        
        Object.entries(fieldMappings).forEach(([elementId, field]) => {
            const element = document.getElementById(elementId);
            if (element && profile[field] !== undefined) {
                element.value = profile[field];
                
                // Add change event listener
                element.addEventListener('input', debounce(() => {
                    saveProfileField(field, element);
                }, 1000));
            }
        });
    }

    function saveProfileField(field, element) {
        const value = element.type === 'number' ? parseInt(element.value) || 0 : element.value;
        
        const updateData = {};
        updateData[field] = value;
        
        if (db.updateProfile(updateData)) {
            currentData = db.getPortfolioData();
            showToast(`${field} updated`, 'success');
        }
    }

    // ========== EXPERIENCE TAB ==========
    function loadExperienceTab() {
        const experienceList = document.getElementById('experienceList');
        const template = document.getElementById('experienceTemplate');
        
        if (!experienceList || !template) return;
        
        experienceList.innerHTML = '';
        
        // Sort by order
        const sortedExp = [...currentData.experience].sort((a, b) => a.order - b.order);
        
        sortedExp.forEach((exp) => {
            const clone = template.content.cloneNode(true);
            const item = clone.querySelector('.sortable-item');
            
            item.setAttribute('data-id', exp.id);
            
            // Populate fields
            item.querySelector('.item-title').textContent = exp.title || 'New Experience';
            item.querySelector('.exp-title').value = exp.title || '';
            item.querySelector('.exp-company').value = exp.company || '';
            item.querySelector('.exp-location').value = exp.location || '';
            item.querySelector('.exp-period').value = exp.period || '';
            item.querySelector('.exp-description').value = exp.description || '';
            
            // Add event listeners
            const deleteBtn = item.querySelector('.btn-delete');
            deleteBtn.addEventListener('click', () => deleteExperience(exp.id));
            
            const editBtn = item.querySelector('.btn-edit');
            editBtn.addEventListener('click', () => saveExperience(exp.id, item));
            
            const inputs = item.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', debounce(() => {
                    saveExperience(exp.id, item);
                }, 800));
            });
            
            experienceList.appendChild(item);
        });
        
        initSortableExperience();
    }

    function addNewExperience() {
        const newExp = {
            title: 'New Experience',
            company: '',
            location: '',
            period: new Date().getFullYear() + ' - Present',
            description: 'Add responsibilities and achievements here...',
            order: currentData.experience.length
        };
        
        db.addExperience(newExp);
        currentData = db.getPortfolioData();
        loadExperienceTab();
        showToast('Experience added', 'success');
    }

    function saveExperience(id, itemElement) {
        const data = {
            title: itemElement.querySelector('.exp-title').value,
            company: itemElement.querySelector('.exp-company').value,
            location: itemElement.querySelector('.exp-location').value,
            period: itemElement.querySelector('.exp-period').value,
            description: itemElement.querySelector('.exp-description').value
        };
        
        if (db.updateExperience(id, data)) {
            currentData = db.getPortfolioData();
            itemElement.querySelector('.item-title').textContent = data.title;
            showToast('Experience saved', 'success');
        }
    }

    function deleteExperience(id) {
        if (confirm('Are you sure you want to delete this experience?')) {
            db.deleteExperience(id);
            currentData = db.getPortfolioData();
            loadExperienceTab();
            showToast('Experience deleted', 'success');
        }
    }

    function initSortableExperience() {
        const list = document.getElementById('experienceList');
        let draggedItem = null;
        
        if (!list) return;
        
        list.querySelectorAll('.item-header').forEach(header => {
            header.setAttribute('draggable', true);
            
            header.addEventListener('dragstart', (e) => {
                draggedItem = e.target.closest('.sortable-item');
                setTimeout(() => {
                    if (draggedItem) draggedItem.style.opacity = '0.4';
                }, 0);
            });
            
            header.addEventListener('dragend', () => {
                setTimeout(() => {
                    if (draggedItem) {
                        draggedItem.style.opacity = '';
                        draggedItem = null;
                    }
                    
                    // Save new order
                    const ids = Array.from(list.querySelectorAll('.sortable-item')).map(item => 
                        item.getAttribute('data-id'));
                    db.reorderExperience(ids);
                    currentData = db.getPortfolioData();
                    showToast('Order updated', 'success');
                }, 0);
            });
            
            header.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            header.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem && draggedItem !== e.target.closest('.sortable-item')) {
                    const targetItem = e.target.closest('.sortable-item');
                    if (targetItem) {
                        list.insertBefore(draggedItem, targetItem);
                    }
                }
            });
        });
    }

    // ========== PROJECTS TAB ==========
    function loadProjectsTab() {
        const projectsGrid = document.getElementById('projectsAdminGrid');
        const template = document.getElementById('projectTemplate');
        
        if (!projectsGrid || !template) return;
        
        projectsGrid.innerHTML = '';
        
        // Sort by order
        const sortedProjects = [...currentData.projects].sort((a, b) => a.order - b.order);
        
        sortedProjects.forEach(project => {
            const clone = template.content.cloneNode(true);
            const card = clone.querySelector('.project-admin-card');
            
            card.setAttribute('data-id', project.id);
            
            // Populate fields
            const imgPreview = card.querySelector('.project-img-preview');
            if (project.image && project.image.trim()) {
                imgPreview.src = project.image;
                imgPreview.onerror = function() {
                    this.src = 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                };
            }
            
            card.querySelector('.project-image-input').value = project.image || '';
            card.querySelector('.project-title-input').value = project.title || '';
            card.querySelector('.project-desc-input').value = project.description || '';
            card.querySelector('.tag-input').value = project.tags ? project.tags.join(', ') : '';
            
            // Add event listeners
            const saveBtn = card.querySelector('.btn-save-project');
            saveBtn.addEventListener('click', () => saveProject(project.id, card));
            
            const deleteBtn = card.querySelector('.btn-delete-project');
            deleteBtn.addEventListener('click', () => deleteProject(project.id));
            
            const previewBtn = card.querySelector('.btn-preview-project');
            previewBtn.addEventListener('click', () => previewProject(project.id, card));
            
            // Auto-save on input
            const inputs = card.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', debounce(() => {
                    saveProject(project.id, card);
                }, 1000));
            });
            
            // Update image preview when URL changes
            const imageInput = card.querySelector('.project-image-input');
            imageInput.addEventListener('change', function() {
                if (this.value.trim()) {
                    imgPreview.src = this.value;
                }
            });
            
            projectsGrid.appendChild(card);
        });
    }

    function addNewProject() {
        const newProject = {
            title: 'New Project',
            description: 'Project description goes here...',
            image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            tags: ['New', 'Project'],
            link: '#',
            order: currentData.projects.length
        };
        
        db.addProject(newProject);
        currentData = db.getPortfolioData();
        loadProjectsTab();
        showToast('Project added', 'success');
    }

    function saveProject(id, cardElement) {
        const tags = cardElement.querySelector('.tag-input').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        
        const projectData = {
            title: cardElement.querySelector('.project-title-input').value,
            description: cardElement.querySelector('.project-desc-input').value,
            image: cardElement.querySelector('.project-image-input').value,
            tags: tags
        };
        
        if (db.updateProject(id, projectData)) {
            currentData = db.getPortfolioData();
            showToast('Project saved', 'success');
        }
    }

    function deleteProject(id) {
        if (confirm('Are you sure you want to delete this project?')) {
            db.deleteProject(id);
            currentData = db.getPortfolioData();
            loadProjectsTab();
            showToast('Project deleted', 'success');
        }
    }

    function previewProject(id, cardElement) {
        const project = currentData.projects.find(p => p.id === id);
        if (!project) return;
        
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Preview: ${project.title}</title>
                <link rel="stylesheet" href="style.css">
                <style>
                    body { padding: 40px; background: #0f172a; color: white; }
                    .preview-container { max-width: 800px; margin: 0 auto; }
                    .preview-image { width: 100%; height: 300px; object-fit: cover; border-radius: 10px; }
                </style>
            </head>
            <body>
                <div class="preview-container">
                    <h1>${project.title}</h1>
                    <img src="${project.image}" class="preview-image" alt="${project.title}">
                    <p>${project.description}</p>
                    ${project.tags && project.tags.length > 0 ? 
                        `<div style="margin-top: 20px;">
                            <strong>Tags:</strong> ${project.tags.map(tag => `<span style="background: #6366f1; padding: 5px 10px; border-radius: 4px; margin-right: 5px;">${tag}</span>`).join('')}
                        </div>` : ''}
                </div>
            </body>
            </html>
        `);
    }

    // ========== SKILLS TAB ==========
    function loadSkillsTab() {
        const skills = currentData.skills;
        
        // Load frontend skills
        const frontendList = document.getElementById('frontend-skills-list');
        if (frontendList && skills.frontend) {
            loadSkillList('frontend', skills.frontend, frontendList);
        }
        
        // Load backend skills
        const backendList = document.getElementById('backend-skills-list');
        if (backendList && skills.backend) {
            loadSkillList('backend', skills.backend, backendList);
        }
        
        // Setup skill level sliders
        setupSkillSliders();
    }

    function loadSkillList(category, skills, container) {
        container.innerHTML = '';
        
        skills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-list-item';
            skillItem.innerHTML = `
                <span>${skill.name}</span>
                <div class="skill-level-display">
                    <div class="skill-level-fill" style="width: ${skill.level}%"></div>
                </div>
                <span>${skill.level}%</span>
                <button class="btn-small btn-danger delete-skill" data-category="${category}" data-skill="${skill.name}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(skillItem);
        });
        
        // Add delete event listeners (delegated)
        container.addEventListener('click', function(e) {
            if (e.target.closest('.delete-skill')) {
                const button = e.target.closest('.delete-skill');
                const category = button.getAttribute('data-category');
                const skillName = button.getAttribute('data-skill');
                deleteSkill(category, skillName);
            }
        });
    }

    function setupSkillSliders() {
        // Frontend skill slider
        const frontendSlider = document.getElementById('frontend-skill-level');
        const frontendValue = document.getElementById('frontend-skill-value');
        if (frontendSlider && frontendValue) {
            frontendSlider.addEventListener('input', function() {
                frontendValue.textContent = this.value + '%';
            });
        }
        
        // Backend skill slider
        const backendSlider = document.getElementById('backend-skill-level');
        const backendValue = document.getElementById('backend-skill-value');
        if (backendSlider && backendValue) {
            backendSlider.addEventListener('input', function() {
                backendValue.textContent = this.value + '%';
            });
        }
    }

    function addSkill(category) {
        const nameInput = document.getElementById(`${category}-skill-name`);
        const levelInput = document.getElementById(`${category}-skill-level`);
        
        if (!nameInput || !nameInput.value.trim()) {
            showToast('Please enter a skill name', 'error');
            return;
        }
        
        const skillName = nameInput.value.trim();
        const skillLevel = parseInt(levelInput.value) || 50;
        
        const skills = [...currentData.skills[category]];
        const existingIndex = skills.findIndex(s => s.name.toLowerCase() === skillName.toLowerCase());
        
        if (existingIndex > -1) {
            // Update existing skill
            skills[existingIndex].level = skillLevel;
            showToast('Skill updated', 'success');
        } else {
            // Add new skill
            skills.push({ name: skillName, level: skillLevel });
            showToast('Skill added', 'success');
        }
        
        db.updateSkills(category, skills);
        currentData = db.getPortfolioData();
        loadSkillsTab();
        
        // Clear input
        nameInput.value = '';
        levelInput.value = '80';
        document.getElementById(`${category}-skill-value`).textContent = '80%';
    }

    function deleteSkill(category, skillName) {
        if (confirm(`Are you sure you want to delete the skill "${skillName}"?`)) {
            const skills = currentData.skills[category].filter(s => s.name !== skillName);
            db.updateSkills(category, skills);
            currentData = db.getPortfolioData();
            loadSkillsTab();
            showToast('Skill deleted', 'success');
        }
    }

    // ========== CV TAB ==========
    function loadCVTab() {
        generateCVPreview();
    }

    function generateCVPreview() {
        const cvPreview = document.getElementById('cvPreview');
        if (!cvPreview) return;
        
        const profile = currentData.profile;
        
        let html = `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white; color: #333;">
                <div style="background: #6366f1; padding: 40px; color: white; margin-bottom: 30px;">
                    <h1 style="margin: 0; font-size: 32px;">${profile.name || 'Your Name'}</h1>
                    <div style="font-size: 18px; opacity: 0.9; margin-top: 10px;">${profile.title || 'Your Title'}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 5px; margin-bottom: 15px;">Professional Summary</h2>
                        <p>${profile.about || 'Your professional summary goes here.'}</p>
                    </div>
                    <div>
                        <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 5px; margin-bottom: 15px;">Contact</h2>
                        <p><strong>Email:</strong> ${profile.email || 'your@email.com'}</p>
                        <p><strong>Phone:</strong> ${profile.phone || '+1 (555) 123-4567'}</p>
                        <p><strong>Location:</strong> ${profile.location || 'Your City'}</p>
                    </div>
                </div>
        `;
        
        // Experience
        if (currentData.experience.length > 0) {
            html += `<h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 5px; margin-bottom: 15px;">Work Experience</h2>`;
            currentData.experience.forEach(exp => {
                html += `
                    <div style="margin-bottom: 20px; padding-left: 20px; border-left: 2px solid #6366f1; padding-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <h3 style="margin: 0; font-size: 18px;">${exp.title}</h3>
                            <span style="color: #666;">${exp.period}</span>
                        </div>
                        <div style="color: #6366f1; margin-bottom: 10px;">${exp.company} • ${exp.location}</div>
                        <p style="margin: 0; color: #555;">${exp.description}</p>
                    </div>
                `;
            });
        }
        
        html += `</div>`;
        cvPreview.innerHTML = html;
    }

    // ========== SETTINGS TAB ==========
    function loadSettingsTab() {
        const settings = currentData.settings;
        
        // Auto-save interval
        const autoSaveSelect = document.getElementById('autosave-interval');
        if (autoSaveSelect) {
            autoSaveSelect.value = settings.autoSaveInterval || 30000;
            autoSaveSelect.addEventListener('change', function() {
                settings.autoSaveInterval = parseInt(this.value);
                db.updateSettings({ autoSaveInterval: settings.autoSaveInterval });
                startAutoSave();
                showToast('Auto-save interval updated', 'success');
            });
        }
        
        // Password change
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', changePassword);
        }
        
        // Backup/restore
        const exportBackupBtn = document.getElementById('exportBackupBtn');
        if (exportBackupBtn) {
            exportBackupBtn.addEventListener('click', () => db.exportData());
        }
        
        const backupFileInput = document.getElementById('backup-file');
        if (backupFileInput) {
            backupFileInput.addEventListener('change', restoreBackup);
        }
        
        // Reset buttons
        const resetProfileBtn = document.getElementById('resetProfileBtn');
        if (resetProfileBtn) {
            resetProfileBtn.addEventListener('click', () => resetProfile());
        }
        
        const resetAllBtn = document.getElementById('resetAllBtn');
        if (resetAllBtn) {
            resetAllBtn.addEventListener('click', () => resetAllData());
        }
    }

    function changePassword() {
        const currentPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;
        
        if (!currentPass || !newPass || !confirmPass) {
            showToast('Please fill all password fields', 'error');
            return;
        }
        
        if (newPass !== confirmPass) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        if (newPass.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Check current password
        const storedPass = currentData.settings.adminPassword || 'admin123';
        if (currentPass !== storedPass) {
            showToast('Current password is incorrect', 'error');
            return;
        }
        
        // Update password
        db.updateSettings({ adminPassword: newPass });
        currentData = db.getPortfolioData();
        
        // Also update localStorage for login page
        localStorage.setItem('portfolio_admin_password', newPass);
        
        // Clear fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        showToast('Password changed successfully', 'success');
    }

    function restoreBackup(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!importedData.profile || !importedData.experience || !importedData.projects) {
                    throw new Error('Invalid backup file format');
                }
                
                if (confirm('This will replace all current data. Are you sure?')) {
                    db.saveData(importedData);
                    currentData = db.getPortfolioData();
                    showToast('Backup restored successfully!', 'success');
                    loadDashboard();
                    loadTabData(document.querySelector('.admin-tab.active').id);
                    
                    // Trigger update event for main site
                    window.dispatchEvent(new CustomEvent('portfolioDataUpdated'));
                }
            } catch (error) {
                showToast('Error restoring backup: ' + error.message, 'error');
            }
            
            // Reset file input
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    function resetProfile() {
        if (confirm('Reset profile to default values? This will only affect profile information.')) {
            const defaultData = db.getDefaultData();
            const profileOnly = {
                ...currentData,
                profile: defaultData.profile
            };
            db.saveData(profileOnly);
            currentData = db.getPortfolioData();
            showToast('Profile reset to defaults', 'success');
            loadProfileTab();
        }
    }

    function resetAllData() {
        if (confirm('Reset ALL data to defaults? This cannot be undone!')) {
            db.resetData();
            currentData = db.getPortfolioData();
            showToast('All data reset to defaults', 'success');
            loadDashboard();
            loadTabData(document.querySelector('.admin-tab.active').id);
            
            // Trigger update event for main site
            window.dispatchEvent(new CustomEvent('portfolioDataUpdated'));
        }
    }

    // ========== EVENT LISTENERS ==========
    function setupEventListeners() {
        // Save all button
        const saveAllBtn = document.getElementById('saveAllBtn');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', saveAllData);
        }
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => db.exportData());
        }
        
        // Add experience button
        const addExperienceBtn = document.getElementById('addExperienceBtn');
        if (addExperienceBtn) {
            addExperienceBtn.addEventListener('click', addNewExperience);
        }
        
        // Add project button
        const addProjectBtn = document.getElementById('addProjectBtn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', addNewProject);
        }
        
        // Add skill buttons
        const addFrontendSkillBtn = document.getElementById('addFrontendSkill');
        if (addFrontendSkillBtn) {
            addFrontendSkillBtn.addEventListener('click', () => addSkill('frontend'));
        }
        
        const addBackendSkillBtn = document.getElementById('addBackendSkill');
        if (addBackendSkillBtn) {
            addBackendSkillBtn.addEventListener('click', () => addSkill('backend'));
        }
        
        // Quick action buttons
        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => db.exportData());
        }
        
        const restoreBtn = document.getElementById('restoreBtn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                document.getElementById('backup-file')?.click();
            });
        }
        
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset ALL data to defaults? This will delete all your current data!')) {
                    db.resetData();
                    currentData = db.getPortfolioData();
                    showToast('All data reset to defaults', 'success');
                    loadDashboard();
                    loadTabData(document.querySelector('.admin-tab.active').id);
                }
            });
        }
        
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                window.open('index.html', '_blank');
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        // Generate CV button
        const generateCVBtn = document.getElementById('generateCVBtn');
        if (generateCVBtn) {
            generateCVBtn.addEventListener('click', generateCVPDF);
        }
        
        // Print CV button
        const printCVBtn = document.getElementById('printCVBtn');
        if (printCVBtn) {
            printCVBtn.addEventListener('click', () => {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(document.getElementById('cvPreview').innerHTML);
                printWindow.document.close();
                printWindow.print();
            });
        }
    }

    function saveAllData() {
        if (isSaving) return;
        
        isSaving = true;
        
        // Save profile data
        const profileData = {};
        document.querySelectorAll('#profile input, #profile textarea, #profile select').forEach(input => {
            const field = input.getAttribute('data-field');
            if (field) {
                const value = input.type === 'number' ? parseInt(input.value) || 0 : input.value;
                profileData[field] = value;
            }
        });
        
        db.updateProfile(profileData);
        currentData = db.getPortfolioData();
        
        showToast('All changes saved successfully!', 'success');
        loadDashboard();
        
        // Trigger update event for main site
        window.dispatchEvent(new CustomEvent('portfolioDataUpdated'));
        
        isSaving = false;
    }

    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('admin_authenticated');
            sessionStorage.removeItem('login_time');
            window.location.href = 'admin-login.html';
        }
    }

    function generateCVPDF() {
        showToast('PDF generation would require jsPDF library. Use Print function for now.', 'info');
        
        // For now, open print dialog
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>CV - ${currentData.profile.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                ${document.getElementById('cvPreview').innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // ========== AUTO-SAVE ==========
    function startAutoSave() {
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
        }
        
        const interval = currentData.settings.autoSaveInterval || 30000;
        autoSaveInterval = setInterval(() => {
            if (!isSaving) {
                saveAllData();
            }
        }, interval);
        
        console.log(`Auto-save started (${interval}ms interval)`);
    }

    // ========== UTILITY FUNCTIONS ==========
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.admin-toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}`;
        toast.innerHTML = `
            <div style="position: fixed; top: 100px; right: 30px; background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#6366f1'}; 
                         color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); 
                         z-index: 9999; animation: slideIn 0.3s ease;">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
        
        // Add CSS animations if not already present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ========== INITIALIZE ==========
    init();
});