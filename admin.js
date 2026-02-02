import { db, storage } from './firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const blogForm = document.getElementById('blogForm');
const blogList = document.getElementById('adminBlogList');

// CREATE POST
blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const imageFile = document.getElementById('image').files[0];

    try {
        let imageUrl = "";
        if(imageFile) {
            const storageRef = ref(storage, `blog-images/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        await addDoc(collection(db, "posts"), {
            title,
            content,
            imageUrl,
            createdAt: new Date().toISOString()
        });

        alert("Post Added!");
        location.reload();
    } catch (err) {
        console.error(err);
    }
});

// READ & DELETE
async function loadAdminPosts() {
    const querySnapshot = await getDocs(collection(db, "posts"));
    blogList.innerHTML = '';
    querySnapshot.forEach((postDoc) => {
        const data = postDoc.data();
        blogList.innerHTML += `
            <div class="admin-item">
                <span>${data.title}</span>
                <button onclick="deletePost('${postDoc.id}')">Delete</button>
            </div>
        `;
    });
}

window.deletePost = async (id) => {
    if(confirm("Delete this post?")) {
        await deleteDoc(doc(db, "posts", id));
        loadAdminPosts();
    }
};

loadAdminPosts();

