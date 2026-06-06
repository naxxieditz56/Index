import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, updateDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// अपनी पुरानी Firebase Config डिटेल्स यहाँ पेस्ट करें
const firebaseConfig = { apiKey: "YOUR_API_KEY", authDomain: "YOUR_AUTH_DOMAIN", projectId: "YOUR_PROJECT_ID", storageBucket: "YOUR_STORAGE_BUCKET", messagingSenderId: "YOUR_MESSAGING_SENDER_ID", appId: "YOUR_APP_ID" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. नया टास्क लोड करना
window.addNewTask = async () => {
    const title = document.getElementById('taskTitle').value;
    const reward = parseFloat(document.getElementById('taskReward').value);

    if(!title || !reward) return alert("सभी डिटेल्स भरें!");

    try {
        await addDoc(collection(db, "tasks"), { title: title, rewardPoints: reward, isActive: true });
        alert("नया टास्क सफलतापूर्वक जोड़ दिया गया है!");
        location.reload();
    } catch(e) { console.error(e); }
};

// 2. किसी भी यूजर का बैलेंस एडमिन पैनल से बदलना
window.updateUserBalanceAdmin = async () => {
    const uid = document.getElementById('targetUserId').value;
    const balance = parseFloat(document.getElementById('newBalance').value);

    if(!uid || isNaN(balance)) return alert("सही UID और बैलेंस डालें!");

    try {
        await updateDoc(doc(db, "users", uid), { walletBalance: balance });
        alert("यूजर का बैलेंस अपडेट हो गया है!");
        location.reload();
    } catch(e) { console.error(e); }
};

// 3. सभी यूजर्स का डेटा टेबल में दिखाना
async function loadAllUsers() {
    const tbody = document.getElementById('userTableBody');
    const querySnapshot = await getDocs(collection(db, "users"));
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = `<tr>
            <td>${data.name || 'N/A'}</td>
            <td>${data.email}</td>
            <td>₹${(data.walletBalance || 0).toFixed(2)}</td>
            <td>${data.referralCode}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}
window.onload = loadAllUsers;

