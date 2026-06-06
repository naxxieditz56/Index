import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, increment, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// अपनी पुरानी Firebase Config डिटेल्स यहाँ पेस्ट करें
const firebaseConfig = { apiKey: "YOUR_API_KEY", authDomain: "YOUR_AUTH_DOMAIN", projectId: "YOUR_PROJECT_ID", storageBucket: "YOUR_STORAGE_BUCKET", messagingSenderId: "YOUR_MESSAGING_SENDER_ID", appId: "YOUR_APP_ID" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// URL से रेफरल कोड रीड करना
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref');
if (refCode) { sessionStorage.setItem('join_ref_code', refCode); }

// साझा रजिस्ट्रेशन प्रोफाइल क्रिएटर फंक्शन
async function createUserProfileInFirestore(uid, email, displayName) {
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
        let referredBy = "";
        let referredByMaster = "";
        const savedRefCode = sessionStorage.getItem('join_ref_code');

        if (savedRefCode) {
            const q = query(collection(db, "users"), where("referralCode", "==", savedRefCode));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const parentDoc = querySnapshot.docs[0];
                referredBy = parentDoc.id; 
                referredByMaster = parentDoc.data().referredBy || ""; 
            }
        }

        const myNewRefCode = "SE" + Math.floor(100000 + Math.random() * 900000);
        await setDoc(userDocRef, {
            uid: uid, name: displayName || email.split('@')[0], email: email, walletBalance: 0,
            referredBy: referredBy, referredByMaster: referredByMaster, referralCode: myNewRefCode
        });
        sessionStorage.removeItem('join_ref_code');
    }
    window.location.href = "dashboard.html";
}

// 1. गूगल लॉगिन
window.loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        await createUserProfileInFirestore(result.user.uid, result.user.email, result.user.displayName);
    } catch (e) { console.error(e); }
};

// 2. ईमेल लॉगिन और साइनअप कम्बाइंड हैंडलर
window.handleEmailAuth = async () => {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passInput').value;

    if(!email || !password) return alert("कृपया ईमेल और पासवर्ड दोनों दर्ज करें!");

    try {
        // पहले लॉगिन करने की कोशिश करें
        const result = await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
    } catch (loginError) {
        // अगर अकाउंट नहीं है, तो नया अकाउंट बनाएं (Sign Up)
        if (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/invalid-credential') {
            try {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await createUserProfileInFirestore(result.user.uid, email, "");
            } catch (signupError) {
                alert("साइनअप एरर: " + signupError.message);
            }
        } else {
            alert("लॉगिन एरर: " + loginError.message);
        }
    }
};

// 3. ऑथेंटिकेशन स्टेट ऑब्जर्वर
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            if(document.getElementById('username')) document.getElementById('username').innerText = `नमस्ते, ${data.name} 👋`;
            if(document.getElementById('userBalance')) document.getElementById('userBalance').innerText = `₹${data.walletBalance.toFixed(2)}`;
            if(document.getElementById('myRefCode')) document.getElementById('myRefCode').innerText = data.referralCode;
        }
    } else {
        const path = window.location.pathname;
        if (!path.endsWith('index.html') && path !== '/' && !path.endsWith('admin.html')) {
            window.location.href = "index.html";
        }
    }
});

// 4. टास्क रिवॉर्ड ट्रिगर लॉजिक
window.triggerReward = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) return;
        const userData = userSnap.data();

        await updateDoc(userDocRef, { walletBalance: increment(10) });
        if (userData.referredBy) { await updateDoc(doc(db, "users", userData.referredBy), { walletBalance: increment(1) }); }
        if (userData.referredByMaster) { await updateDoc(doc(db, "users", userData.referredByMaster), { walletBalance: increment(0.50) }); }

        alert("रिवॉर्ड सफलतापूर्वक जुड़ गया है!");
        window.location.href = "dashboard.html";
    } catch (e) { console.error(e); }
};
