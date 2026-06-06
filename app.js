import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, increment, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 1. FIREBASE CONFIGURATION (अपनी डिटेल्स यहाँ भरें)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// URL से रेफरल कोड डिटेक्ट करना
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref');
if (refCode) { sessionStorage.setItem('join_ref_code', refCode); }

// 2. गूगल लॉगिन और ऑटो-रेफरल लिंकेज
window.loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userDocRef = doc(db, "users", user.uid);
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
                    referredBy = parentDoc.id; // Tier 1 Parent
                    referredByMaster = parentDoc.data().referredBy || ""; // Tier 2 Grandparent
                }
            }

            const myNewRefCode = "SE" + Math.floor(100000 + Math.random() * 900000);
            await setDoc(userDocRef, {
                uid: user.uid, name: user.displayName, email: user.email, walletBalance: 0,
                referredBy: referredBy, referredByMaster: referredByMaster, referralCode: myNewRefCode
            });
        }
        window.location.href = "dashboard.html";
    } catch (e) { console.error(e); }
};

// 3. डैशबोर्ड पर रीयल-टाइम डेटा लोड करना
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
        if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
            window.location.href = "index.html";
        }
    }
});

// 4. MULTI-TIER REWARD CORE LOGIC
window.triggerReward = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) return;
        const userData = userSnap.data();

        // 1. यूजर को खुद का टास्क रिवॉर्ड (₹10)
        await updateDoc(userDocRef, { walletBalance: increment(10) });
        await addDoc(collection(db, "transactions"), { userId: user.uid, type: "credit", source: "task_complete", amount: 10, timestamp: serverTimestamp() });

        // 2. Tier 1 कमीशन (10% = ₹1)
        if (userData.referredBy) {
            await updateDoc(doc(db, "users", userData.referredBy), { walletBalance: increment(1) });
            await addDoc(collection(db, "transactions"), { userId: userData.referredBy, type: "credit", source: "referral_tier1", amount: 1, timestamp: serverTimestamp() });
        }

        // 3. Tier 2 कमीशन (5% = ₹0.50)
        if (userData.referredByMaster) {
            await updateDoc(doc(db, "users", userData.referredByMaster), { walletBalance: increment(0.50) });
            await addDoc(collection(db, "transactions"), { userId: userData.referredByMaster, type: "credit", source: "referral_tier2", amount: 0.50, timestamp: serverTimestamp() });
        }

        alert("₹10 आपके वॉलेट में जोड़ दिए गए हैं और टीम कमीशन बांट दिया गया है!");
        window.location.href = "dashboard.html";
    } catch (e) { console.error(e); }
};

