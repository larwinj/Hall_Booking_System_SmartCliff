
// Data management
let data = {};
const STORAGE_KEY = 'venuevista-content';
let isSaving = false;

const defaultData = {
    hero: {
        video: "/Admin/Features/ContentManagement/Customer/Assets/HomePagevideo.mp4"
    },
    features: [
        {
            title: "Easy Online Booking",
            description: "Reserve your venue in minutes with our intuitive platform.",
            iconKey: "check",
            icon: '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        },
        {
            title: "Flexible Options",
            description: "Choose from a variety of venues to suit any event size.",
            iconKey: "arrows",
            icon: '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>'
        },
        {
            title: "Transparent Pricing",
            description: "Clear pricing with no hidden fees.",
            iconKey: "dollar",
            icon: '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path></svg>'
        }
    ],
    about: {
        title: "About VenueVista",
        description: "At VenueVista, we believe every event deserves the perfect venue. Our platform simplifies the booking process, offering a seamless experience for events of all sizes, from intimate meetings to grand celebrations.\n\nWith real-time availability, secure payments, and dedicated support, we ensure your planning is stress-free, allowing you to focus on creating unforgettable memories."
    },
    facilities: [
        {
            title: "Spacious Parking",
            description: "Ample parking space for all your guests, ensuring convenience and accessibility.",
            image: "/Admin/Features/ContentManagement/Customer/Assets/parking.png"
        },
        {
            title: "Catering Services",
            description: "Delicious food and beverage options tailored to your event's needs.",
            image: "/Admin/Features/ContentManagement/Customer/Assets/Beverage.png"
        },
        {
            title: "Audio-Visual Equipment",
            description: "State-of-the-art AV systems for presentations and entertainment.",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
        }
    ]
};

const iconMap = {
    check: '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
    arrows: '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>',
    dollar: '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path></svg>'
};

async function loadData() {
    try {
        const res = await fetch('http://localhost:3000/content');
        if (!res.ok) throw new Error('Failed to fetch');
        data = await res.json();
    } catch (e) {
        console.error('Load error:', e);
        const stored = localStorage.getItem(STORAGE_KEY);
        data = stored ? JSON.parse(stored) : defaultData;
    }
    // Ensure data is populated correctly
    if (!data.hero) data.hero = defaultData.hero;
    if (!data.features || !Array.isArray(data.features)) data.features = defaultData.features;
    if (!data.about) data.about = defaultData.about;
    if (!data.facilities || !Array.isArray(data.facilities)) data.facilities = defaultData.facilities;
}

async function saveData() {
    if (isSaving) return;
    isSaving = true;
    try {
        const res = await fetch('http://localhost:3000/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to save');
        // Only save to localStorage if necessary, and avoid large files
        const slimData = {
            hero: { video: data.hero.video.startsWith('data:') ? '[Base64 Video]' : data.hero.video },
            features: data.features,
            about: data.about,
            facilities: data.facilities.map(f => ({
                title: f.title,
                description: f.description,
                image: f.image.startsWith('data:') ? '[Base64 Image]' : f.image
            }))
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slimData));
    } catch (e) {
        console.error('Save error:', e);
        alert('Failed to save to db.json. Ensure json-server is running with: npx json-server --watch db.json. Changes saved to localStorage (limited data).');
        const slimData = {
            hero: { video: data.hero.video.startsWith('data:') ? '[Base64 Video]' : data.hero.video },
            features: data.features,
            about: data.about,
            facilities: data.facilities.map(f => ({
                title: f.title,
                description: f.description,
                image: f.image.startsWith('data:') ? '[Base64 Image]' : f.image
            }))
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(slimData));
        } catch (storageError) {
            console.error('LocalStorage error:', storageError);
            alert('LocalStorage quota exceeded. Only text data saved. Consider clearing localStorage or reducing file sizes.');
        }
    } finally {
        isSaving = false;
    }
}

// Render functions
function renderFeatures() {
    const container = document.getElementById('features-container');
    container.innerHTML = '';
    data.features.forEach((feature, index) => {
        const div = document.createElement('div');
        div.className = 'border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50 shadow-sm';
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <h4 class="font-semibold text-gray-800">Feature ${index + 1}</h4>
                <button onclick="deleteFeature(${index})" class="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
            </div>
            <input type="text" value="${feature.title || ''}" placeholder="Feature title" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm" onchange="updateFeature(${index}, 'title', this.value)">
            <textarea rows="3" placeholder="Feature description" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm" onchange="updateFeature(${index}, 'description', this.value)">${feature.description || ''}</textarea>
            <select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm" onchange="updateFeature(${index}, 'iconKey', this.value)">
                <option value="check" ${feature.iconKey === 'check' ? 'selected' : ''}>Check Circle</option>
                <option value="arrows" ${feature.iconKey === 'arrows' ? 'selected' : ''}>Arrows</option>
                <option value="dollar" ${feature.iconKey === 'dollar' ? 'selected' : ''}>Dollar</option>
            </select>
        `;
        container.appendChild(div);
    });
}

function renderFacilities() {
    const container = document.getElementById('facilities-container');
    container.innerHTML = '';
    data.facilities.forEach((facility, index) => {
        const div = document.createElement('div');
        div.className = 'border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50 shadow-sm';
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <h4 class="font-semibold text-gray-800">Facility ${index + 1}</h4>
                <button onclick="deleteFacility(${index})" class="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
            </div>
            <input type="text" value="${facility.title || ''}" placeholder="Facility title" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm" onchange="updateFacility(${index}, 'title', this.value)">
            <textarea rows="3" placeholder="Facility description" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm" onchange="updateFacility(${index}, 'description', this.value)">${facility.description || ''}</textarea>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer group" onclick="document.getElementById('facility-image-${index}').click()">
                <svg class="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V8m0 0L3 12m4-4l4 4m6 0v8m0 0l4-4m-4 4l-4-4"></path>
                </svg>
                <p class="text-gray-600 group-hover:text-primary-600 transition-colors">Upload facility image</p>
                <p class="text-sm text-gray-500 mt-1">${facility.image ? 'Image uploaded' : 'No image selected'}</p>
                <input type="file" id="facility-image-${index}" class="hidden" accept="image/*" onchange="handleFacilityImage(${index}, event)">
            </div>
        `;
        container.appendChild(div);
    });
}

// Update functions with debounce
const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

const debouncedUpdatePreview = debounce(updatePreview, 300);

function updateFeature(index, field, value) {
    if (field === 'iconKey') {
        data.features[index].iconKey = value;
        data.features[index].icon = iconMap[value];
    } else {
        data.features[index][field] = value;
    }
    renderFeatures();
    debouncedUpdatePreview();
}

function deleteFeature(index) {
    if (confirm('Are you sure you want to delete this feature?')) {
        data.features.splice(index, 1);
        renderFeatures();
        updatePreview();
    }
}

function addFeature() {
    data.features.push({
        title: '',
        description: '',
        iconKey: 'check',
        icon: iconMap['check']
    });
    renderFeatures();
    debouncedUpdatePreview();
}

function updateFacility(index, field, value) {
    data.facilities[index][field] = value;
    renderFacilities();
    debouncedUpdatePreview();
}

function handleFacilityImage(index, event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { // Limit to 2MB
            alert('Image size exceeds 2MB. Please upload a smaller file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            data.facilities[index].image = ev.target.result;
            renderFacilities();
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // Limit to 5MB
            alert('Video size exceeds 5MB. Please upload a smaller file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            data.hero.video = ev.target.result;
            updatePreview();
            document.getElementById('videoFileName').textContent = 'Video uploaded';
        };
        reader.readAsDataURL(file);
    }
}

function deleteFacility(index) {
    if (confirm('Are you sure you want to delete this facility?')) {
        data.facilities.splice(index, 1);
        renderFacilities();
        updatePreview();
    }
}

function addFacility() {
    data.facilities.push({
        title: '',
        description: '',
        image: ''
    });
    renderFacilities();
    debouncedUpdatePreview();
}

function updateAbout(field, value) {
    data.about[field] = value;
    debouncedUpdatePreview();
}

// Preview generation
function generateHeroPreview(heroData) {
    return `
        <section class="relative min-h-[400px] overflow-hidden flex justify-center items-center rounded-xl shadow-md">
            <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover">
                <source src="${heroData.video}" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div class="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/70"></div>
            <div class="relative z-10 text-center px-4">
                <h1 class="text-4xl font-extrabold text-white mb-4 leading-tight">
                    Discover Your Perfect
                    <span class="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">Event Space</span>
                </h1>
                <p class="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
                    Unlock premium venues for unforgettable occasions, from intimate gatherings to grand celebrations with VenueVista.
                </p>
            </div>
        </section>
    `;
}

function generateFeaturesPreview(featuresData) {
    let html = `
        <section class="py-12 bg-gray-50 rounded-xl shadow-md">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold text-gray-800 mb-4">Why Choose VenueVista?</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Discover the benefits of booking with us for a seamless event experience.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
    `;
    featuresData.forEach(f => {
        html += `
            <div class="text-center group">
                <div class="w-16 h-16 bg-primary-600 rounded-xl mx-auto mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    ${f.icon}
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-3">${f.title}</h3>
                <p class="text-gray-600">${f.description}</p>
            </div>
        `;
    });
    html += '</div></section>';
    return html;
}

function generateAboutPreview(aboutData) {
    return `
        <section class="py-12 bg-blue-50 rounded-xl shadow-md">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 px-4 items-center">
                <div>
                    <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205" alt="About VenueVista"
                        class="w-full h-64 object-cover rounded-2xl shadow-lg">
                </div>
                <div>
                    <h2 class="text-4xl font-bold text-gray-800 mb-8">${aboutData.title}</h2>
                    <p class="text-gray-600 leading-relaxed whitespace-pre-wrap">${aboutData.description}</p>
                </div>
            </div>
        </section>
    `;
}

function generateFacilitiesPreview(facilitiesData) {
    let html = `
        <section class="py-12 bg-white rounded-xl shadow-md">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold text-gray-800 mb-4">Our Facilities</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Top-notch amenities to ensure your event is a success.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
    `;
    facilitiesData.forEach(f => {
        html += `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div class="h-48 relative overflow-hidden">
                    <img src="${f.image || 'https://placehold.co/400x300?text=Image+Not+Found'}" alt="${f.title}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105">
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${f.title}</h3>
                    <p class="text-gray-600">${f.description}</p>
                </div>
            </div>
        `;
    });
    html += '</div></section>';
    return html;
}

function generateFullPreview() {
    return `
        <div class="space-y-12">
            ${generateHeroPreview(data.hero)}
            ${generateFeaturesPreview(data.features)}
            ${generateAboutPreview(data.about)}
            ${generateFacilitiesPreview(data.facilities)}
        </div>
    `;
}

function updatePreview() {
    document.getElementById('preview-content').innerHTML = generateFullPreview();
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    renderFeatures();
    renderFacilities();
    document.getElementById('videoFileName').textContent = data.hero.video ? (data.hero.video.startsWith('data:') ? 'Video uploaded' : 'Default video loaded') : 'No video selected';
    document.getElementById('about-title').value = data.about.title || '';
    document.getElementById('about-desc').value = data.about.description || '';
    setupAboutListeners();
    updatePreview();

    // Mobile menu
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.remove('hidden');
    });
    document.getElementById('closeMobileMenu').addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.add('hidden');
    });
    document.querySelector('#mobileMenu .bg-black').addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.add('hidden');
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', updatePreview);
});

function setupAboutListeners() {
    document.getElementById('about-title').addEventListener('input', (e) => updateAbout('title', e.target.value));
    document.getElementById('about-desc').addEventListener('input', (e) => updateAbout('description', e.target.value));
}

document.getElementById('add-feature').addEventListener('click', addFeature);
document.getElementById('add-facility').addEventListener('click', addFacility);

document.getElementById('saveBtn').addEventListener('click', async (e) => {
    const btn = e.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg class="animate-spin h-5 w-5 mr-3 inline" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...';
    btn.disabled = true;
    await saveData();
    btn.innerHTML = 'Saved!';
    btn.classList.add('bg-green-600', 'hover:bg-green-700');
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('bg-green-600', 'hover:bg-green-700');
    }, 2000);
});

document.getElementById('fullscreenBtn').addEventListener('click', () => {
    const preview = document.getElementById('preview-content');
    if (preview.requestFullscreen) {
        preview.requestFullscreen();
    } else if (preview.webkitRequestFullscreen) {
        preview.webkitRequestFullscreen();
    } else if (preview.msRequestFullscreen) {
        preview.msRequestFullscreen();
    }
});

document.getElementById('videoUploadBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4';
    input.onchange = handleVideoUpload;
    input.click();
});

// Accordion
document.querySelectorAll('[data-toggle]').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const section = toggle.dataset.toggle;
        const content = document.querySelector(`[data-content="${section}"]`);
        const icon = document.querySelector(`[data-icon="${section}"]`);

        document.querySelectorAll('[data-content]').forEach(c => {
            if (c !== content) c.classList.add('hidden');
        });
        document.querySelectorAll('[data-icon]').forEach(i => {
            if (i !== icon) i.classList.remove('rotate-180');
        });

        content.classList.toggle('hidden');
        icon.classList.toggle('rotate-180');
    });
});