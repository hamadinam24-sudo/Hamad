// database.js - Local Storage Database for Portfolio
console.log('🚀 Database.js loaded at:', new Date().toLocaleTimeString());
console.log('🌐 Protocol:', window.location.protocol);

// Fix for file:// protocol localStorage issues
if (window.location.protocol === 'file:') {
    console.warn('⚠️ WARNING: Running from file:// protocol');
    console.warn('💡 TIP: Use a local server (Live Server in VS Code) for best results');
    console.warn('💡 TIP: Or use: python -m http.server 8000');
    
    // Try to force localStorage to work
    try {
        localStorage.setItem('file_protocol_test', 'test');
        const test = localStorage.getItem('file_protocol_test');
        console.log('✅ localStorage test:', test === 'test' ? 'WORKING' : 'NOT WORKING');
        localStorage.removeItem('file_protocol_test');
    } catch (e) {
        console.error('❌ localStorage error:', e);
    }
}

class PortfolioDB {
    constructor() {
        this.STORAGE_KEY = 'portfolio_database_v2';
        console.log('🔑 Storage key:', this.STORAGE_KEY);
        console.log('🔄 Initializing database...');
        
        this.initDefaultData();
        
        // Log current state
        const data = this.getPortfolioData();
        console.log('📊 Initial data loaded:', {
            name: data.profile?.name || 'NO NAME',
            email: data.profile?.email || 'NO EMAIL',
            items: data.experience?.length || 0 + ' experiences',
            projects: data.projects?.length || 0 + ' projects'
        });
    }
    
    // Initialize with default data if empty
    initDefaultData() {
        const existing = localStorage.getItem(this.STORAGE_KEY);
        if (!existing) {
            console.log('📝 No existing data found. Creating default data...');
            const defaultData = this.getDefaultData();
            this.saveData(defaultData);
        } else {
            console.log('✅ Existing data found');
            try {
                const parsed = JSON.parse(existing);
                console.log('📋 Current profile name:', parsed.profile?.name);
            } catch (e) {
                console.error('❌ Error parsing existing data:', e);
            }
        }
    }
    
    // Get default data structure
    getDefaultData() {
        return {
            profile: {
                name: "Your Name",
                title: "Student Developer • Problem Solver",
                email: "hamad.inam24@gmail.com",
                phone: "Available upon request",
                location: "Remote • Available Worldwide",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                heroDesc: "Problem Solver • Tech Enthusiast • Polymath. Transforming complex challenges into elegant solutions through technology and interdisciplinary thinking.",
                about: "I am a talented learner who gracefully chases knowledge across all domains. My polymathic approach blends technology, creativity, and strategy to solve complex problems from unique perspectives. Each new skill I acquire becomes another tool in my arsenal for creating innovative, impactful solutions.",
                expYears: 1,
                projectCount: 10,
                clientCount: 5,
                awardCount: 100,
                lastUpdated: new Date().toISOString()
            },
            experience: [
                {
                    id: this.generateId(),
                    title: "Student Developer",
                    company: "Freelance & Academic Projects",
                    location: "Remote",
                    period: "2023 - Present",
                    description: "Working on various web development projects, building portfolio pieces, and developing problem-solving skills through practical application.",
                    order: 0
                },
                {
                    id: this.generateId(),
                    title: "Technical Research Assistant",
                    company: "Academic Projects",
                    location: "University",
                    period: "2022 - 2023",
                    description: "Conducted research on emerging technologies, prepared technical documentation, and assisted in project development.",
                    order: 1
                }
            ],
            projects: [
                {
                    id: this.generateId(),
                    title: "Portfolio Website",
                    description: "A fully responsive portfolio website with admin panel and local database system. Built with HTML, CSS, and JavaScript.",
                    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    tags: ["HTML", "CSS", "JavaScript", "LocalStorage"],
                    link: "#",
                    order: 0
                },
                {
                    id: this.generateId(),
                    title: "Task Management App",
                    description: "A simple task management application with drag-and-drop functionality and local storage.",
                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    tags: ["JavaScript", "LocalStorage", "UI/UX"],
                    link: "#",
                    order: 1
                }
            ],
            skills: {
                analytical: [
                    { name: "Problem Solving", level: 95 },
                    { name: "Critical Thinking", level: 90 },
                    { name: "Technical Research", level: 88 },
                    { name: "Data Analysis", level: 85 }
                ],
                professional: [
                    { name: "Communication", level: 92 },
                    { name: "Project Management", level: 85 },
                    { name: "Creative Problem-Solving", level: 90 },
                    { name: "Adaptability", level: 95 }
                ],
                digital: [
                    { name: "Web Technologies", level: 80 },
                    { name: "Digital Literacy", level: 95 },
                    { name: "Software Proficiency", level: 88 },
                    { name: "Learning Agility", level: 98 }
                ]
            },
            settings: {
                adminPassword: "admin123",
                autoSaveInterval: 30000,
                lastBackup: null,
                theme: "dark"
            },
            version: "1.0.0"
        };
    }
    
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Get all data
    getPortfolioData() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) {
                console.warn('❌ No data found in localStorage for key:', this.STORAGE_KEY);
                return this.getDefaultData();
            }
            const data = JSON.parse(raw);
            return data;
        } catch (error) {
            console.error('❌ Error getting portfolio data:', error);
            return this.getDefaultData();
        }
    }
    
    // Save all data
    saveData(data) {
        console.log('💾 Saving data...');
        console.log('📝 New profile name:', data.profile?.name);
        
        try {
            data.profile.lastUpdated = new Date().toISOString();
            const jsonString = JSON.stringify(data, null, 2);
            localStorage.setItem(this.STORAGE_KEY, jsonString);
            
            console.log('✅ Data saved successfully!');
            
            // Force update event
            this.triggerUpdateEvent();
            
            // Also set a timestamp for cross-tab detection
            localStorage.setItem('portfolio_last_save', Date.now().toString());
            
            return true;
        } catch (error) {
            console.error('❌ Error saving data:', error);
            return false;
        }
    }
    
    // Update profile
    updateProfile(profileData) {
        console.log('🔄 Updating profile:', profileData);
        const data = this.getPortfolioData();
        data.profile = { ...data.profile, ...profileData };
        return this.saveData(data);
    }
    
    // Add experience
    addExperience(experience) {
        const data = this.getPortfolioData();
        experience.id = this.generateId();
        experience.order = data.experience.length;
        data.experience.push(experience);
        console.log('➕ Adding experience:', experience.title);
        return this.saveData(data);
    }
    
    // Update experience
    updateExperience(id, experienceData) {
        const data = this.getPortfolioData();
        const index = data.experience.findIndex(exp => exp.id === id);
        if (index !== -1) {
            data.experience[index] = { ...data.experience[index], ...experienceData };
            console.log('📝 Updating experience:', experienceData.title);
            return this.saveData(data);
        }
        console.warn('❌ Experience not found:', id);
        return false;
    }
    
    // Delete experience
    deleteExperience(id) {
        const data = this.getPortfolioData();
        data.experience = data.experience.filter(exp => exp.id !== id);
        console.log('🗑️ Deleting experience:', id);
        return this.saveData(data);
    }
    
    // Reorder experience
    reorderExperience(orderedIds) {
        const data = this.getPortfolioData();
        const newOrder = [];
        
        orderedIds.forEach((id, index) => {
            const exp = data.experience.find(e => e.id === id);
            if (exp) {
                exp.order = index;
                newOrder.push(exp);
            }
        });
        
        data.experience = newOrder;
        console.log('🔀 Reordering experiences');
        return this.saveData(data);
    }
    
    // Add project
    addProject(project) {
        const data = this.getPortfolioData();
        project.id = this.generateId();
        project.order = data.projects.length;
        data.projects.push(project);
        console.log('➕ Adding project:', project.title);
        return this.saveData(data);
    }
    
    // Update project
    updateProject(id, projectData) {
        const data = this.getPortfolioData();
        const index = data.projects.findIndex(proj => proj.id === id);
        if (index !== -1) {
            data.projects[index] = { ...data.projects[index], ...projectData };
            console.log('📝 Updating project:', projectData.title);
            return this.saveData(data);
        }
        return false;
    }
    
    // Delete project
    deleteProject(id) {
        const data = this.getPortfolioData();
        data.projects = data.projects.filter(proj => proj.id !== id);
        console.log('🗑️ Deleting project:', id);
        return this.saveData(data);
    }
    
    // Update skills
    updateSkills(category, skills) {
        const data = this.getPortfolioData();
        data.skills[category] = skills;
        console.log('🛠️ Updating skills for:', category);
        return this.saveData(data);
    }
    
    // Update settings
    updateSettings(settings) {
        const data = this.getPortfolioData();
        data.settings = { ...data.settings, ...settings };
        console.log('⚙️ Updating settings');
        return this.saveData(data);
    }
    
    // Export data as JSON
    exportData() {
        const data = this.getPortfolioData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Update last backup time
        data.settings.lastBackup = new Date().toISOString();
        this.saveData(data);
        
        console.log('💾 Backup exported');
        return true;
    }
    
    // Import data from JSON
    importData(jsonString) {
        try {
            const importedData = JSON.parse(jsonString);
            
            // Validate data structure
            if (!importedData.profile || !importedData.experience || !importedData.projects) {
                throw new Error('Invalid data format');
            }
            
            console.log('📥 Importing backup data');
            this.saveData(importedData);
            return true;
        } catch (error) {
            console.error('❌ Import error:', error);
            return false;
        }
    }
    
    // Reset to default data
    resetData() {
        console.log('🔄 Resetting to default data');
        const defaultData = this.getDefaultData();
        this.saveData(defaultData);
        return true;
    }
    
    // Get database statistics
    getStats() {
        const data = this.getPortfolioData();
        const jsonSize = JSON.stringify(data).length;
        
        return {
            profileComplete: data.profile.name && data.profile.about ? 'Complete' : 'Incomplete',
            experienceCount: data.experience.length,
            projectCount: data.projects.length,
            dbSize: Math.round(jsonSize / 1024 * 100) / 100 + ' KB',
            lastUpdated: data.profile.lastUpdated,
            lastBackup: data.settings.lastBackup
        };
    }
    
    // Trigger update event for live reload
    triggerUpdateEvent() {
        console.log('🔔 Dispatching update event...');
        try {
            const event = new CustomEvent('portfolioDataUpdated', {
                detail: { 
                    timestamp: new Date().toISOString(),
                    source: 'database'
                }
            });
            window.dispatchEvent(event);
            
            // Also update localStorage for cross-tab communication
            localStorage.setItem('portfolio_update_trigger', Date.now().toString());
            
            console.log('✅ Update event dispatched');
        } catch (error) {
            console.error('❌ Error dispatching update event:', error);
        }
    }
}

// Initialize database globally
const portfolioDB = new PortfolioDB();