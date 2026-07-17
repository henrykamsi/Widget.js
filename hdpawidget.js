// ============================================
// HDPA WIDGET - COMPLETE v2.1 (FIXED)
// Henry Authority for Data Protection and Regulatory Accountability
// ============================================

// ============================================
// SECTION 1: FIREBASE IMPORTS
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    setDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ============================================
// SECTION 2: FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyA7p9HknzV6mmX3Fe78U-l46DqY0fikC58",
    authDomain: "hgt-policy.firebaseapp.com",
    projectId: "hgt-policy",
    storageBucket: "hgt-policy.firebasestorage.app",
    messagingSenderId: "440193588775",
    appId: "1:440193588775:web:49fe3fb7d8ee3e008cf802",
    measurementId: "G-X18YPTYQCE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// SECTION 3: CONSTANTS & VARIABLES
// ============================================
const HOSTNAME = window.location.hostname;
const FULL_URL = window.location.href;
const CONTACT_EMAIL = "kamsih924@gmail.com";
const HDPA_FULL_NAME = "Henry Authority for Data Protection and Regulatory Accountability";

// Hostname variations for blocking
const HOST_VARIATIONS = [
    HOSTNAME,
    HOSTNAME.replace(/^www\./, ''),
    window.location.host
];
const UNIQUE_HOSTS = [...new Set(HOST_VARIATIONS)].filter(h => h && h.length > 2);

// ============================================
// SECTION 4: HEARTBEAT SYSTEM
// ============================================
async function sendHeartbeat() {
    try {
        const heartbeatRef = doc(db, "widget_status", HOSTNAME);
        await setDoc(heartbeatRef, {
            hostname: HOSTNAME,
            last_seen: new Date().toISOString(),
            online: true,
            url: FULL_URL,
            userAgent: navigator.userAgent,
            version: "2.1"
        }, { merge: true });
    } catch (e) {
        console.log("Heartbeat error:", e);
    }
}

sendHeartbeat();
setInterval(sendHeartbeat, 2592000000);

// ============================================
// SECTION 5: 3-CLICK SURVEY
// ============================================
let clickCount = 0;
let lastSurveyDate = localStorage.getItem('hdpasurvey_date');

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function showSurveyPopup() {
    if (lastSurveyDate === getToday()) return;

    const overlay = document.createElement('div');
    overlay.id = 'hdpasurvey-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.7); z-index: 10000000;
        display: flex; justify-content: center; align-items: center;
        backdrop-filter: blur(5px);
        font-family: 'Segoe UI', Tahoma, sans-serif;
    `;

    overlay.innerHTML = `
        <div style="
            background: white; border-radius: 16px; padding: 35px;
            max-width: 450px; width: 90%; max-height: 90vh;
            overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            position: relative;
        ">
            <button onclick="document.getElementById('hdpasurvey-overlay').remove()" style="
                position: absolute; top: 12px; right: 16px;
                background: none; border: none; font-size: 28px;
                cursor: pointer; color: #999;
            ">&times;</button>

            <h2 style="color: #031124; margin: 0 0 5px 0; font-size: 24px;">
                ⭐ HGT Welfare
            </h2>
            <p style="color: #666; margin-bottom: 25px; font-size: 16px;">
                How is this website treating you?
            </p>

            <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 600; font-size: 14px;">
                Your Name
            </label>
            <input id="hdpasurvey-name" type="text" placeholder="Enter your name" style="
                width: 100%; padding: 12px; margin-bottom: 18px;
                border: 2px solid #e0e0e0; border-radius: 8px;
                font-size: 14px; box-sizing: border-box;
            ">

            <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 14px;">
                Rating
            </label>
            <div id="hdpasurvey-stars" style="display: flex; gap: 8px; margin-bottom: 18px; font-size: 36px; cursor: pointer;">
                ${[1,2,3,4,5].map(i => `
                    <span data-rating="${i}" style="color: #ddd; transition: color 0.2s; cursor: pointer; user-select: none;">★</span>
                `).join('')}
            </div>

            <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 600; font-size: 14px;">
                Feedback
            </label>
            <textarea id="hdpasurvey-feedback" placeholder="Share your experience..." style="
                width: 100%; padding: 12px; margin-bottom: 18px;
                border: 2px solid #e0e0e0; border-radius: 8px;
                font-size: 14px; box-sizing: border-box;
                resize: vertical; min-height: 80px; font-family: inherit;
            "></textarea>

            <button id="hdpasurvey-submit" style="
                background: #008751; color: white; border: none;
                padding: 14px; width: 100%; border-radius: 8px;
                font-weight: bold; font-size: 16px; cursor: pointer;
            ">Post Review</button>

            <div id="hdpasurvey-success" style="display: none; text-align: center; padding: 20px; color: #008751; font-size: 18px; font-weight: bold;">
                ✅ Review Sent!
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    let selectedRating = 0;
    const stars = overlay.querySelectorAll('#hdpasurvey-stars span');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            selectedRating = rating;
            stars.forEach((s, index) => {
                s.style.color = index < rating ? '#ff9800' : '#ddd';
            });
        });
    });

    document.getElementById('hdpasurvey-submit').addEventListener('click', async function() {
        const name = document.getElementById('hdpasurvey-name').value.trim();
        const feedback = document.getElementById('hdpasurvey-feedback').value.trim();

        if (!name) { alert('Please enter your name.'); return; }
        if (selectedRating === 0) { alert('Please select a star rating.'); return; }
        if (!feedback) { alert('Please provide feedback.'); return; }

        this.innerText = 'Sending...';
        this.disabled = true;

        try {
            await addDoc(collection(db, "reviews"), {
                name, rating: selectedRating, feedback,
                websiteURL: FULL_URL, hostname: HOSTNAME,
                timestamp: new Date().toISOString()
            });

            document.getElementById('hdpasurvey-submit').style.display = 'none';
            document.getElementById('hdpasurvey-success').style.display = 'block';
            localStorage.setItem('hdpasurvey_date', getToday());

            setTimeout(() => {
                const el = document.getElementById('hdpasurvey-overlay');
                if (el) el.remove();
            }, 3000);

        } catch (error) {
            alert('Failed to send. Please try again.');
            this.innerText = 'Post Review';
            this.disabled = false;
        }
    });
}

document.addEventListener('click', function() {
    clickCount++;
    if (clickCount >= 1000000000000000) {
        clickCount = 0;
        showSurveyPopup();
    }
});

// ============================================
// SECTION 6: MAIN FUNCTION
// ============================================
async function checkAccessAndInit() {
    try {
        let blocked = false;
        let blockData = null;

        for (const host of UNIQUE_HOSTS) {
            try {
                const accessRef = doc(db, "access_control", host);
                const accessSnap = await getDoc(accessRef);
                if (accessSnap.exists() && accessSnap.data().is_active === false) {
                    blocked = true;
                    blockData = accessSnap.data();
                    blockData.host = host;
                    break;
                }
            } catch (e) {}
        }

        if (blocked) {
            showBlockScreen(blockData);
            return;
        }

        showWidget();

    } catch (error) {
        console.error("HDPA Widget Error:", error);
        showWidget();
    }
}

// ============================================
// SECTION 7: BLOCK SCREEN
// ============================================
function showBlockScreen(data) {
    // Remove any existing container
    const oldContainer = document.getElementById('hdpa-widget-container');
    if (oldContainer) oldContainer.remove();

    // Create new container
    const container = document.createElement('div');
    container.id = 'hdpa-widget-container';
    container.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        z-index: 9999999; background: #031124;
        display: flex; justify-content: center; align-items: center;
    `;
    document.body.appendChild(container);

    // Show website content behind block
    document.documentElement.style.display = 'block';
    document.body.style.display = '';

    container.innerHTML = `
        <div style="
            display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            color: white; font-family: 'Segoe UI', Tahoma, sans-serif;
            text-align: center; padding: 30px; max-width: 700px;
            width: 100%; box-sizing: border-box;
        ">
            <div style="font-size: 72px; margin-bottom: 20px;">🔒</div>

            <h1 style="
                color: #ff4c4c; font-size: 38px; margin: 0 0 20px 0;
                text-shadow: 0 0 30px rgba(255,76,76,0.3);
                font-weight: 800;
            ">ACCESS DENIED</h1>

            <div style="
                background: rgba(255,255,255,0.05);
                padding: 30px; border-radius: 12px;
                margin: 10px 0 25px 0;
                border: 1px solid rgba(255,76,76,0.2);
                width: 100%; box-sizing: border-box;
            ">
                <p style="font-size: 18px; margin: 0; line-height: 1.8; color: #e0e0e0;">
                    This website has violated the terms and conditions of the
                    <br><strong style="color: #48abe0;">${HDPA_FULL_NAME}</strong>
                    <br><span style="color: #ff4c4c;">(HDPA)</span>
                </p>
                <p style="font-size: 16px; margin: 15px 0 0 0; color: #aaa;">
                    ${data.reason || 'Privacy policy violation detected.'}
                </p>
            </div>

            <div style="
                background: rgba(72,171,224,0.1);
                padding: 15px 25px; border-radius: 8px;
                margin-bottom: 30px; border: 1px solid rgba(72,171,224,0.2);
                width: 100%; box-sizing: border-box;
            ">
                <p style="margin: 0; color: #aaa; font-size: 14px;">For appeals or inquiries, please contact:</p>
                <p style="margin: 5px 0 0 0; color: #48abe0; font-size: 16px; font-weight: 600;">
                    📧 ${CONTACT_EMAIL}
                </p>
            </div>

            <button id="hdpa-close-tab-btn" style="
                background: #ff4c4c; color: white; border: none;
                padding: 14px 40px; border-radius: 8px;
                font-weight: bold; font-size: 16px; cursor: pointer;
                margin-bottom: 30px;
            ">Close Tab</button>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; width: 100%; color: #666; font-size: 13px;">
                Copyright 2026 HDPA All Rights Reserved
            </div>
        </div>
    `;

    document.getElementById('hdpa-close-tab-btn').addEventListener('click', function() {
        window.close();
        setTimeout(() => {
            if (!window.closed) {
                window.location.href = 'about:blank';
                document.body.innerHTML = `
                    <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#031124;color:white;font-family:'Segoe UI',sans-serif;text-align:center;padding:20px;">
                        <div>
                            <h2 style="color:#48abe0;">Please close this tab manually</h2>
                            <p style="color:#aaa;margin:10px 0;">Thank you for your cooperation.</p>
                            <p style="color:#666;font-size:13px;margin-top:20px;">${HDPA_FULL_NAME}</p>
                        </div>
                    </div>
                `;
            }
        }, 500);
    });
}

// ============================================
// SECTION 8: SHOW WIDGET - FIXED VERSION
// ============================================
function showWidget() {
    // Remove any existing container
    const oldContainer = document.getElementById('hdpa-widget-container');
    if (oldContainer) oldContainer.remove();

    // 🔥 UNHIDE THE WEBSITE CONTENT FIRST
    document.documentElement.style.display = 'block';
    document.body.style.display = '';
    document.querySelectorAll('body > *').forEach(el => {
        if (el.id !== 'hdpa-widget-container') {
            el.style.display = '';
        }
    });

    // Create container for widget
    const container = document.createElement('div');
    container.id = 'hdpa-widget-container';
    container.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        z-index: 9999999; background: #031124;
        display: flex; justify-content: center; align-items: center;
        pointer-events: none;
    `;
    document.body.appendChild(container);

    container.innerHTML = `
        <!-- Splash Screen -->
        <div id="hdpa-splash" style="
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #031124; z-index: 999999; display: flex;
            flex-direction: column; justify-content: center; align-items: center;
            transition: opacity 0.8s ease; padding: 20px; box-sizing: border-box;
            text-align: center; pointer-events: all;
        ">
            <img src="https://cdn.phototourl.com/free/2026-07-13-b04fcd38-f6d4-4406-b3f8-daf40903fda0.png"
                 alt="HDPA Logo"
                 style="max-width: 240px; height: auto; margin-bottom: 25px; animation: pulse 2s infinite;
                        display: block; width: auto; object-fit: contain;">

            <h2 style="
                color: #ffffff; margin: 0 0 15px 0; font-size: 24px; font-weight: 700;
                font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 700px;
                text-shadow: 0 0 10px rgba(72,171,224,0.3);
            ">
                This website is under the protection of
                <br><span style="color: #48abe0;">${HDPA_FULL_NAME}</span>
            </h2>

            <div style="
                width: 80%; max-width: 500px; margin: 30px auto 10px auto;
                background: rgba(255,255,255,0.1); border-radius: 10px;
                height: 10px; overflow: hidden; position: relative;
            ">
                <div id="hdpa-progress-bar" style="
                    width: 0%; height: 100%;
                    background: linear-gradient(90deg, #ff9800, #ffc107);
                    border-radius: 10px;
                    transition: width 0.3s ease;
                "></div>
            </div>
            <div style="color: #aaa; font-size: 14px; margin-top: 8px;">
                Loading... <span id="hdpa-progress-text">0%</span>
            </div>

            <div style="
                position: absolute; bottom: 30px; left: 0; right: 0;
                text-align: center; color: #666; font-size: 13px;
            ">
                Copyright 2026 HDPA All Rights Reserved
            </div>
        </div>

        <!-- Floating Widget Button -->
        <div id="hdpa-widget-btn" style="
            position: fixed; bottom: 20px; right: 20px; z-index: 999998;
            width: 56px; height: 56px; border-radius: 50%;
            background: #ff9800; color: white; display: flex;
            justify-content: center; align-items: center;
            box-shadow: 0 4px 20px rgba(255,152,0,0.4);
            cursor: pointer; user-select: none;
            transition: left 0.5s ease, right 0.5s ease, transform 0.2s ease;
            pointer-events: all;
        ">
            <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: white;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
        </div>

        <!-- Report Modal -->
        <div id="hdpa-report-modal" style="
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.6); z-index: 1000000;
            display: none; justify-content: center; align-items: center;
            padding: 20px; box-sizing: border-box; backdrop-filter: blur(5px);
            font-family: 'Segoe UI', Tahoma, sans-serif;
            pointer-events: all;
        ">
            <div style="
                background: #ffffff; border-radius: 16px; width: 100%;
                max-width: 450px; padding: 30px; box-sizing: border-box;
                position: relative; max-height: 90vh; overflow-y: auto;
            ">
                <button id="hdpa-close-btn" style="
                    position: absolute; top: 15px; right: 15px;
                    background: none; border: none; font-size: 28px;
                    cursor: pointer; color: #999;
                ">&times;</button>

                <h3 style="margin: 0 0 20px 0; color: #031124; font-size: 22px;">📋 Report Issue</h3>

                <label style="display: block; margin-bottom: 5px; color: #555; font-size: 13px; font-weight: 600;">
                    REPORT TITLE
                </label>
                <input id="hdpa-report-title" type="text" placeholder="e.g., Unwanted Tracking" style="
                    width: 100%; padding: 12px; margin-bottom: 15px;
                    border: 2px solid #e0e0e0; border-radius: 8px;
                    box-sizing: border-box; font-family: inherit; font-size: 14px;
                    outline: none;
                ">

                <label style="display: block; margin-bottom: 5px; color: #555; font-size: 13px; font-weight: 600;">
                    DESCRIPTION
                </label>
                <textarea id="hdpa-report-desc" placeholder="Explain your experience here..." style="
                    width: 100%; padding: 12px; margin-bottom: 15px;
                    border: 2px solid #e0e0e0; border-radius: 8px;
                    box-sizing: border-box; font-family: inherit; font-size: 14px;
                    resize: vertical; min-height: 100px; outline: none;
                "></textarea>

                <label style="display: block; margin-bottom: 5px; color: #555; font-size: 13px; font-weight: 600;">
                    YOUR EMAIL
                </label>
                <input id="hdpa-report-email" type="email" value="${CONTACT_EMAIL}" style="
                    width: 100%; padding: 12px; margin-bottom: 15px;
                    border: 2px solid #e0e0e0; border-radius: 8px;
                    box-sizing: border-box; font-family: inherit; font-size: 14px;
                    outline: none;
                ">

                <!-- Enable Notifications -->
                <div style="
                    display: flex; align-items: center; gap: 12px;
                    margin-bottom: 18px; padding: 12px;
                    background: #f5f5f5; border-radius: 8px;
                ">
                    <button id="hdpa-enable-notifications" style="
                        background: #2196F3; color: white; border: none;
                        padding: 8px 16px; border-radius: 6px;
                        cursor: pointer; font-weight: 600; font-size: 13px;
                    ">🔔 Enable Notifications</button>
                    <span id="hdpa-notif-status" style="color: #888; font-size: 12px;">(Optional)</span>
                </div>

                <button id="hdpa-submit-btn" style="
                    background: #008751; color: white; border: none;
                    padding: 14px; width: 100%; border-radius: 8px;
                    font-weight: bold; font-size: 16px; cursor: pointer;
                ">📤 Post Report</button>
            </div>
        </div>

        <!-- Toast -->
        <div id="hdpa-toast" style="
            position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
            background: #333; color: #fff; padding: 12px 24px;
            border-radius: 24px; font-size: 14px; z-index: 1000001;
            opacity: 0; transition: opacity 0.3s ease;
            pointer-events: none; font-family: 'Segoe UI', Tahoma, sans-serif;
            white-space: nowrap; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        "></div>

        <style>
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            #hdpa-widget-btn:hover { transform: scale(1.1); }
            #hdpa-report-title:focus, #hdpa-report-desc:focus, #hdpa-report-email:focus {
                border-color: #48abe0;
            }
            #hdpa-close-btn:hover { color: #333; }
            #hdpa-submit-btn:hover { background: #006b40; }
            #hdpa-enable-notifications:hover { background: #1976D2; }
        </style>
    `;

    // ============================================
    // WIDGET LOGIC
    // ============================================

    // Progress Bar Animation (10 seconds)
    const progressBar = document.getElementById('hdpa-progress-bar');
    const progressText = document.getElementById('hdpa-progress-text');
    let progress = 0;
    const totalDuration = 10000;
    const intervalTime = 100;
    const steps = totalDuration / intervalTime;
    const increment = 100 / steps;

    const progressInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            setTimeout(() => {
                const splash = document.getElementById('hdpa-splash');
                if (splash) {
                    splash.style.opacity = '0';
                    setTimeout(() => {
                        splash.style.display = 'none';
                        // 🔥 REMOVE the container so website shows through
                        const containerEl = document.getElementById('hdpa-widget-container');
                        if (containerEl) {
                            containerEl.style.background = 'transparent';
                            containerEl.style.pointerEvents = 'none';
                        }
                    }, 800);
                }
            }, 200);
        }
        if (progressBar) {
            progressBar.style.width = Math.min(progress, 100) + '%';
        }
        if (progressText) {
            progressText.innerText = Math.min(Math.round(progress), 100) + '%';
        }
    }, intervalTime);

    // Widget Position Toggle (every 60 seconds)
    const widgetBtn = document.getElementById('hdpa-widget-btn');
    let isRight = true;

    setInterval(() => {
        if (!widgetBtn) return;
        if (isRight) {
            widgetBtn.style.right = 'auto';
            widgetBtn.style.left = '20px';
            isRight = false;
        } else {
            widgetBtn.style.left = 'auto';
            widgetBtn.style.right = '20px';
            isRight = true;
        }
    }, 60000);

    // Long Press
    let pressTimer;
    let isLongPress = false;
    const toast = document.getElementById('hdpa-toast');

    function showToast(msg) {
        if (!toast) return;
        toast.innerText = msg;
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 2500);
    }

    function startPress() {
        isLongPress = false;
        pressTimer = setTimeout(() => {
            isLongPress = true;
            showToast('⚡ Powered by Henry Global Tech Industry (HGT)');
        }, 1000);
    }

    function cancelPress() { clearTimeout(pressTimer); }

    if (widgetBtn) {
        widgetBtn.addEventListener('mousedown', startPress);
        widgetBtn.addEventListener('touchstart', startPress, { passive: true });
        widgetBtn.addEventListener('mouseup', cancelPress);
        widgetBtn.addEventListener('touchend', cancelPress);
        widgetBtn.addEventListener('mouseleave', cancelPress);
    }

    // Modal Open/Close
    const modal = document.getElementById('hdpa-report-modal');
    const closeBtn = document.getElementById('hdpa-close-btn');

    if (widgetBtn) {
        widgetBtn.addEventListener('click', () => {
            if (!isLongPress && modal) {
                modal.style.display = 'flex';
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    // ============================================
    // SECTION 9: ENABLE NOTIFICATIONS - FIXED
    // ============================================
    const notifBtn = document.getElementById('hdpa-enable-notifications');
    const notifStatus = document.getElementById('hdpa-notif-status');

    if (notifBtn) {
        notifBtn.addEventListener('click', async () => {
            if (!('Notification' in window)) {
                alert('This browser does not support notifications.');
                return;
            }

            // 🔥 Request permission - this triggers the browser popup
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                notifStatus.innerText = '✅ Enabled';
                notifStatus.style.color = '#008751';
                notifBtn.style.background = '#4CAF50';
                notifBtn.innerText = '✅ Notifications On';

                // Store subscription in Firestore
                try {
                    await addDoc(collection(db, "user_subscriptions"), {
                        hostname: HOSTNAME,
                        websiteURL: FULL_URL,
                        userAgent: navigator.userAgent,
                        subscribedAt: new Date().toISOString(),
                        permission: 'granted'
                    });
                    showToast('✅ Notifications enabled!');
                } catch (e) {
                    console.log('Subscription save error:', e);
                }

                // Send a test notification
                new Notification('HDPA Notification', {
                    body: 'You will now receive updates from HDPA.',
                    icon: 'https://cdn.phototourl.com/free/2026-07-13-b04fcd38-f6d4-4406-b3f8-daf40903fda0.png'
                });

            } else {
                notifStatus.innerText = '❌ Blocked';
                notifStatus.style.color = '#ff4c4c';
                alert('Please enable notifications in your browser settings.');
            }
        });
    }

    // ============================================
    // SECTION 10: LISTEN FOR ADMIN NOTIFICATIONS
    // ============================================
    function listenForNotifications() {
        const notifRef = doc(db, "notifications", "current");
        onSnapshot(notifRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const lastNotifId = localStorage.getItem('hdpa_last_notif_id');

                if (data.id && data.id !== lastNotifId && data.sent !== false) {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(data.title || 'HDPA Update', {
                            body: data.body || 'You have a new message from HDPA.',
                            icon: 'https://cdn.phototourl.com/free/2026-07-13-b04fcd38-f6d4-4406-b3f8-daf40903fda0.png'
                        });
                        localStorage.setItem('hdpa_last_notif_id', data.id);
                    }
                    showToast('📨 ' + (data.title || 'HDPA Update') + ': ' + (data.body || ''));
                }
            }
        }, (error) => {
            console.log('Notification listener error:', error);
        });
    }

    listenForNotifications();

    // ============================================
    // SECTION 11: SUBMIT REPORT
    // ============================================
    const submitBtn = document.getElementById('hdpa-submit-btn');

    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const title = document.getElementById('hdpa-report-title');
            const desc = document.getElementById('hdpa-report-desc');
            const email = document.getElementById('hdpa-report-email');

            if (!title || !desc || !email) return;

            const titleVal = title.value.trim();
            const descVal = desc.value.trim();
            const emailVal = email.value.trim() || CONTACT_EMAIL;

            if (!titleVal || !descVal) {
                alert('Please complete both title and description fields.');
                return;
            }

            submitBtn.innerText = '⏳ Posting...';
            submitBtn.disabled = true;

            try {
                await addDoc(collection(db, "reports"), {
                    title: titleVal,
                    description: descVal,
                    email: emailVal,
                    timestamp: new Date().toISOString(),
                    websiteURL: FULL_URL,
                    hostname: HOSTNAME
                });

                alert('✅ Report successfully sent to HDPA Data Servers.');
                if (modal) modal.style.display = 'none';
                if (title) title.value = '';
                if (desc) desc.value = '';

            } catch (error) {
                alert('❌ Failed to send. Please try again.');
                console.error('Report error:', error);
            }

            submitBtn.innerText = '📤 Post Report';
            submitBtn.disabled = false;
        });
    }

    setTimeout(() => {
        showToast('🛡️ Protected by HDPA');
    }, 11500);
}

// ============================================
// SECTION 12: START THE APP
// ============================================
checkAccessAndInit();
