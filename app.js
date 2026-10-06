import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";

/*
  IMPORTANT: Firebase Console -> Project settings -> Your apps -> Web app
  se apna config yahan paste karein.
*/
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const $ = id => document.getElementById(id);
const home = $("home"), chat = $("chat");
let roomId = "", myName = "", unsubscribe = null;

function makeRoomId() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 16);
}
function roomLink(id) {
  return `${location.origin}${location.pathname}?room=${encodeURIComponent(id)}`;
}
function enterRoom(id, name) {
  roomId = id;
  myName = name.trim() || "Guest";
  $("roomLabel").textContent = "Room: " + roomId;
  home.classList.add("hidden");
  chat.classList.remove("hidden");
  history.replaceState({}, "", `?room=${encodeURIComponent(roomId)}`);
  listenMessages();
}
function listenMessages() {
  if (unsubscribe) unsubscribe();
  const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt"));
  unsubscribe = onSnapshot(q, snap => {
    const box = $("messages");
    box.innerHTML = "";
    snap.forEach(d => {
      const m = d.data();
      const el = document.createElement("div");
      el.className = "msg" + (m.sender === myName ? " mine" : "");
      const who = document.createElement("div");
      who.className = "who";
      who.textContent = m.sender || "Guest";
      el.appendChild(who);
      if (m.text) {
        const t = document.createElement("div");
        t.textContent = m.text;
        el.appendChild(t);
      }
      if (m.imageUrl) {
        const img = document.createElement("img");
        img.src = m.imageUrl;
        img.alt = "Shared image";
        img.loading = "lazy";
        el.appendChild(img);
      }
      const time = document.createElement("time");
      time.textContent = m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : "";
      el.appendChild(time);
      box.appendChild(el);
    });
    box.scrollTop = box.scrollHeight;
  }, err => {
    console.error(err);
    $("uploadStatus").textContent = "Chat load nahi hui. Firebase rules/config check karein.";
  });
}

$("createBtn").onclick = () => {
  const name = $("nameInput").value.trim();
  if (!name) return alert("Pehle apna naam likhiye.");
  enterRoom(makeRoomId(), name);
};
$("joinBtn").onclick = () => {
  const name = $("nameInput").value.trim();
  const id = $("roomInput").value.trim();
  if (!name || !id) return alert("Naam aur Room ID dono likhiye.");
  enterRoom(id, name);
};
$("copyBtn").onclick = async () => {
  await navigator.clipboard.writeText(roomLink(roomId));
  $("copyBtn").textContent = "Copied!";
  setTimeout(() => $("copyBtn").textContent = "Link copy", 1400);
};

$("sendForm").onsubmit = async e => {
  e.preventDefault();
  const input = $("messageInput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  await addDoc(collection(db, "rooms", roomId, "messages"), {
    sender: myName, text, imageUrl: "", createdAt: serverTimestamp()
  });
};

$("imageInput").onchange = async e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert("Image 5 MB se chhoti rakhein.");
    e.target.value = "";
    return;
  }
  $("uploadStatus").textContent = "Image upload ho rahi hai...";
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `rooms/${roomId}/${crypto.randomUUID()}-${safeName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, {contentType: file.type});
    const url = await getDownloadURL(storageRef);
    await addDoc(collection(db, "rooms", roomId, "messages"), {
      sender: myName, text: "", imageUrl: url, createdAt: serverTimestamp()
    });
    $("uploadStatus").textContent = "";
  } catch (err) {
    console.error(err);
    $("uploadStatus").textContent = "Image send nahi hui. Storage rules check karein.";
  }
  e.target.value = "";
};

// If someone opens a shared room link, ask only for their display name.
const params = new URLSearchParams(location.search);
const sharedRoom = params.get("room");
if (sharedRoom) {
  const name = prompt("Chat mein aapka naam kya rahega?");
  if (name) enterRoom(sharedRoom, name);
}
