import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: LÜTFEN KENDİ FIREBASE PROJENİZİN AYARLARINI BURAYA YAPIŞTIRIN!
// Firebase Console -> Project Settings -> General -> Your apps -> Firebase SDK snippet (Config)
const firebaseConfig = {
  apiKey: "API_KEY_BURAYA",
  authDomain: "PROJE_ID.firebaseapp.com",
  projectId: "PROJE_ID",
  storageBucket: "PROJE_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// YUKARIDAKİ AYARLAR YAPILANA KADAR TEST AMAÇLI LOCALSTORAGE KULLANACAĞIZ
let useLocalStorageFallback = true;
if (firebaseConfig.apiKey !== "API_KEY_BURAYA") {
    useLocalStorageFallback = false;
}

let app, auth, db;
if (!useLocalStorageFallback) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const addProjectForm = document.getElementById('add-project-form');
const projectsListEl = document.getElementById('admin-projects-list');

// ---- AUTHENTICATION ----
if (!useLocalStorageFallback) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            loadProjects();
        } else {
            loginSection.style.display = 'block';
            dashboardSection.style.display = 'none';
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                loginError.innerText = "Giriş başarısız: " + error.message;
            });
    });

    logoutBtn.addEventListener('click', () => {
        signOut(auth);
    });
} else {
    // LOCAL MOCK AUTHENTICATION
    let isLoggedIn = localStorage.getItem('mock_admin_logged_in') === 'true';
    
    function updateMockUI() {
        if (isLoggedIn) {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            loadProjects();
        } else {
            loginSection.style.display = 'block';
            dashboardSection.style.display = 'none';
        }
    }
    updateMockUI();

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        // Mock credentials
        if (email === 'admin@goyangrup.be' && password === 'admin123') {
            isLoggedIn = true;
            localStorage.setItem('mock_admin_logged_in', 'true');
            updateMockUI();
        } else {
            loginError.innerText = "Hatalı e-posta veya şifre. Demo için admin@goyangrup.be / admin123 kullanın.";
        }
    });

    logoutBtn.addEventListener('click', () => {
        isLoggedIn = false;
        localStorage.removeItem('mock_admin_logged_in');
        updateMockUI();
    });
}

// ---- FIRESTORE / DATA MANAGEMENT ----
async function loadProjects() {
    projectsListEl.innerHTML = '<p>Laden...</p>';
    
    let projects = [];
    if (!useLocalStorageFallback) {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            projects.push({ id: doc.id, ...doc.data() });
        });
    } else {
        projects = JSON.parse(localStorage.getItem('mock_projects') || '[]');
    }
    
    renderProjects(projects);
}

function renderProjects(projects) {
    if (projects.length === 0) {
        projectsListEl.innerHTML = '<p>Henüz proje eklenmemiş.</p>';
        return;
    }
    
    projectsListEl.innerHTML = '';
    projects.forEach(project => {
        const item = document.createElement('div');
        item.className = 'admin-project-item';
        item.innerHTML = `
            <div class="admin-project-info">
                <h4>${project.title}</h4>
                <p>${project.description}</p>
            </div>
            <button class="delete-btn" data-id="${project.id}"><i class="fa-solid fa-trash"></i></button>
        `;
        projectsListEl.appendChild(item);
    });

    // Attach delete listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if(confirm("Bu projeyi silmek istediğinize emin misiniz?")) {
                if(!useLocalStorageFallback) {
                    await deleteDoc(doc(db, "projects", id));
                } else {
                    let mockData = JSON.parse(localStorage.getItem('mock_projects') || '[]');
                    mockData = mockData.filter(p => p.id !== id);
                    localStorage.setItem('mock_projects', JSON.stringify(mockData));
                }
                loadProjects();
            }
        });
    });
}

addProjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('project-title').value;
    const desc = document.getElementById('project-desc').value;
    const icon = document.getElementById('project-icon').value || 'fa-solid fa-house';
    
    const newProject = {
        title: title,
        description: desc,
        icon: icon,
        createdAt: !useLocalStorageFallback ? serverTimestamp() : Date.now()
    };

    if (!useLocalStorageFallback) {
        await addDoc(collection(db, "projects"), newProject);
    } else {
        newProject.id = Date.now().toString();
        let mockData = JSON.parse(localStorage.getItem('mock_projects') || '[]');
        mockData.unshift(newProject);
        localStorage.setItem('mock_projects', JSON.stringify(mockData));
    }
    
    addProjectForm.reset();
    loadProjects();
});
