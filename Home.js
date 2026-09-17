// ============================================================
// MOODCHAT
// Home.js
// Main Mood Chat Application
// ============================================================


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyByPYENG0mE0M0",
  authDomain: "moodchat-c8acf.firebaseapp.com",
  databaseURL: "https://moodchat-c8acf-default-rtdb.firebaseio.com",
  projectId: "moodchat-c8acf",
  storageBucket: "moodchat-c8acf.firebasestorage.app",
  messagingSenderId: "175563017140",
  appId: "1:175563017140:web:5c2bf6cbf9896363fc00e1",
  measurementId: "G-52548DKTVH"
};


// ============================================================
// START FIREBASE
// ============================================================

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();


// ============================================================
// MOODS
// ============================================================

const MOODS = {

  flirty: {
    name: "Flirty",
    emoji: "😍",
    color: "#ff4f81"
  },

  sad: {
    name: "Sad",
    emoji: "😭",
    color: "#5d78d6"
  },

  vexed: {
    name: "Vexed",
    emoji: "😡",
    color: "#e94b45"
  },

  happy: {
    name: "Happy",
    emoji: "🥳",
    color: "#ff7a18"
  },

  bored: {
    name: "Bored",
    emoji: "😴",
    color: "#8064b8"
  },

  heartbroken: {
    name: "Heartbroken",
    emoji: "💔",
    color: "#bd4e75"
  }

};


// ============================================================
// STATE
// ============================================================

const state = {

  user: null,

  profile: null,

  mood: null,

  profiles: [],

  onlineUsers: {},

  selectedPrivateUser: null,

  publicUnsubscribe: null,

  privateUnsubscribe: null,

  presenceUnsubscribe: null,

  conversationsUnsubscribe: null,

  typingPublicRef: null,

  typingPrivateRef: null,

  typingTimer: null,

  privateTypingTimer: null

};


// ============================================================
// HELPERS
// ============================================================

const $ = (id) =>
  document.getElementById(id);


function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function formatTime(timestamp) {

  if (!timestamp) return "";

  let date;

  if (
    timestamp.toDate &&
    typeof timestamp.toDate === "function"
  ) {

    date = timestamp.toDate();

  } else if (timestamp instanceof Date) {

    date = timestamp;

  } else if (typeof timestamp === "number") {

    date = new Date(timestamp);

  } else {

    return "";

  }


  return date.toLocaleTimeString(
    [],
    {
      hour: "numeric",
      minute: "2-digit"
    }
  );

}


function getMood(mood) {

  return MOODS[mood] || null;

}


function defaultAvatar(name = "User") {

  const letter =
    String(name)
      .trim()
      .charAt(0)
      .toUpperCase() || "U";


  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
      >
        <rect
          width="200"
          height="200"
          rx="100"
          fill="#eadbd0"
        />
        <text
          x="100"
          y="115"
          text-anchor="middle"
          font-size="90"
          font-family="Arial"
          fill="#604d41"
        >
          ${letter}
        </text>
      </svg>
    `)
  );

}


function avatarFor(profile) {

  if (
    profile &&
    profile.photoURL &&
    typeof profile.photoURL === "string"
  ) {

    return profile.photoURL;

  }

  return defaultAvatar(
    profile?.username || "User"
  );

}


function showToast(message) {

  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(
    window.__moodToastTimer
  );

  window.__moodToastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 2500);

}


// ============================================================
// PROFILE
// ============================================================

async function loadMyProfile() {

  if (!state.user) return null;


  const ref =
    db
      .collection("profiles")
      .doc(state.user.uid);


  const snap =
    await ref.get();


  if (!snap.exists) {

    const profile = {

      uid: state.user.uid,

      username:
        state.user.email
          ? state.user.email.split("@")[0]
          : "User",

      email:
        state.user.email || "",

      gender: "",

      current_mood: null,

      points: 0,

      rank: 0,

      photoURL: "",

      createdAt:
        firebase.firestore.FieldValue
          .serverTimestamp()

    };


    await ref.set(profile);

    state.profile = profile;

    return profile;

  }


  state.profile = {

    uid: snap.id,

    ...snap.data()

  };


  return state.profile;

}


// ============================================================
// LOAD ALL REAL PROFILES
// ============================================================

async function loadAllProfiles() {

  try {

    const snap =
      await db
        .collection("profiles")
        .limit(300)
        .get();


    state.profiles =
      snap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));


    renderLeaderboard();

    renderProfile();

  } catch (error) {

    console.error(
      "Could not load profiles:",
      error
    );

  }

}


// ============================================================
// PROFILE UI
// ============================================================

function renderProfile() {

  const p = state.profile;

  if (!p) return;


  const avatar =
    avatarFor(p);


  if ($("topProfileAvatar")) {

    $("topProfileAvatar").src =
      avatar;

  }


  if ($("drawerAvatar")) {

    $("drawerAvatar").src =
      avatar;

  }


  if ($("myProfileAvatar")) {

    $("myProfileAvatar").src =
      avatar;

  }


  if ($("popoverProfileAvatar")) {

    $("popoverProfileAvatar").src =
      avatar;

  }


  const name =
    p.username || "User";


  if ($("drawerName")) {

    $("drawerName").textContent =
      name;

  }


  if ($("myProfileName")) {

    $("myProfileName").textContent =
      name;

  }


  if ($("myProfileEmail")) {

    $("myProfileEmail").textContent =
      p.email || "—";

  }


  if ($("profileUsername")) {

    $("profileUsername").textContent =
      p.username || "—";

  }


  if ($("profileGender")) {

    $("profileGender").textContent =
      p.gender || "—";

  }


  if ($("profilePoints")) {

    $("profilePoints").textContent =
      Number(p.points || 0);

  }


  if ($("popoverPoints")) {

    $("popoverPoints").textContent =
      Number(p.points || 0);

  }


  if ($("popoverProfileName")) {

    $("popoverProfileName").textContent =
      name;

  }


  if ($("popoverProfileHandle")) {

    $("popoverProfileHandle").textContent =
      "@" +
      String(name)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "");

  }


  const rank =
    getUserRank(p.uid);


  if ($("profileRank")) {

    $("profileRank").textContent =
      rank ? "#" + rank : "—";

  }


  if ($("popoverRank")) {

    $("popoverRank").textContent =
      rank ? "#" + rank : "—";

  }


  updateMoodUI();

}


// ============================================================
// RANK
// ============================================================

function getUserRank(uid) {

  const sorted =
    [...state.profiles]
      .sort(
        (a, b) =>
          Number(b.points || 0) -
          Number(a.points || 0)
      );


  const index =
    sorted.findIndex(
      user => user.uid === uid
    );


  return index >= 0
    ? index + 1
    : null;

}


// ============================================================
// MOOD UI
// ============================================================

function updateMoodUI() {

  const mood =
    getMood(state.mood);


  document.body.classList.remove(
    "mood-flirty",
    "mood-sad",
    "mood-vexed",
    "mood-happy",
    "mood-bored",
    "mood-heartbroken"
  );


  if (!mood) {

    if ($("topMoodText")) {

      $("topMoodText").textContent =
        "Choose mood";

    }

    if ($("sideMood")) {

      $("sideMood").textContent =
        "Choose mood";

    }

    if ($("myProfileMood")) {

      $("myProfileMood").textContent =
        "Choose mood";

    }

    return;

  }


  document.body.classList.add(
    "mood-" + state.mood
  );


  if ($("topMoodText")) {

    $("topMoodText").textContent =
      mood.emoji +
      " " +
      mood.name;

  }


  if ($("sideMood")) {

    $("sideMood").textContent =
      mood.emoji +
      " " +
      mood.name;

  }


  if ($("myProfileMood")) {

    $("myProfileMood").textContent =
      mood.emoji +
      " " +
      mood.name;

  }


  if ($("popoverMood")) {

    $("popoverMood").textContent =
      mood.emoji;

  }


  if ($("roomTitle")) {

    $("roomTitle").textContent =
      mood.emoji +
      " " +
      mood.name +
      " Chat";

  }


  if ($("roomSubtitle")) {

    $("roomSubtitle").textContent =
      "People feeling " +
      mood.name.toLowerCase();

  }

}


// ============================================================
// MOOD PICKER
// ============================================================

function openMoodPicker() {

  $("popupOverlay")
    ?.classList.add("open");

  $("moodPopover")
    ?.classList.add("open");

}


function closeMoodPicker() {

  $("popupOverlay")
    ?.classList.remove("open");

  $("moodPopover")
    ?.classList.remove("open");

}


async function setMood(moodKey) {

  if (
    !state.user ||
    !MOODS[moodKey]
  ) return;


  try {

    state.mood =
      moodKey;


    await db
      .collection("profiles")
      .doc(state.user.uid)
      .set({

        current_mood:
          moodKey,

        updatedAt:
          firebase.firestore.FieldValue
            .serverTimestamp()

      }, {
        merge: true
      });


    state.profile.current_mood =
      moodKey;


    await db
      .collection("profiles")
      .doc(state.user.uid)
      .collection("mood_history")
      .add({

        mood:
          moodKey,

        createdAt:
          firebase.firestore.FieldValue
            .serverTimestamp()

      });


    await updatePresence();


    updateMoodUI();


    $("chooseMoodScreen")
      ?.classList.add("hidden");


    $("moodChatContent")
      ?.classList.remove("hidden");


    $("publicComposer")
      ?.classList.remove("hidden");


    closeMoodPicker();


    startPublicMessages();


    showToast(
      "Mood changed to " +
      MOODS[moodKey].name
    );

  } catch (error) {

    console.error(
      "Mood error:",
      error
    );

    showToast(
      "Could not change your mood."
    );

  }

}


// ============================================================
// PRESENCE
// ============================================================

async function startPresence() {

  if (!state.user) return;


  const ref =
    rtdb.ref(
      "presence/" +
      state.user.uid
    );


  ref.onDisconnect().remove();


  await updatePresence();


  state.presenceUnsubscribe =
    rtdb
      .ref("presence")
      .on("value", snapshot => {

        state.onlineUsers =
          snapshot.val() || {};


        updateOnlineCount();

        renderLive();

        updatePrivateStatus();

      });

}


async function updatePresence() {

  if (!state.user) return;


  const ref =
    rtdb.ref(
      "presence/" +
      state.user.uid
    );


  await ref.set({

    username:
      state.profile?.username ||
      "User",

    mood:
      state.mood || null,

    gender:
      state.profile?.gender || "",

    lastSeen:
      firebase.database.ServerValue
        .TIMESTAMP

  });

}


function updateOnlineCount() {

  const count =
    Object.values(
      state.onlineUsers || {}
    )
    .filter(person => {

      return (
        person &&
        person.mood === state.mood
      );

    })
    .length;


  if ($("onlineCount")) {

    $("onlineCount").textContent =
      count +
      (count === 1
        ? " online"
        : " online");

  }

}


// ============================================================
// PUBLIC MESSAGES
// ============================================================

function startPublicMessages() {

  if (!state.user || !state.mood) {
    return;
  }


  if (state.publicUnsubscribe) {

    state.publicUnsubscribe();

    state.publicUnsubscribe =
      null;

  }


  state.publicUnsubscribe =
    db
      .collection("mood_messages")
      .where(
        "mood",
        "==",
        state.mood
      )
      .limit(100)
      .onSnapshot(
        snapshot => {

          const messages =
            snapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
              .sort(
                (a, b) =>
                  getMillis(a.createdAt) -
                  getMillis(b.createdAt)
              );


          renderPublicMessages(
            messages
          );

        },

        error => {

          console.error(
            "Public messages error:",
            error
          );

          showToast(
            "Could not load messages."
          );

        }
      );

}


function getMillis(timestamp) {

  if (!timestamp) return 0;


  if (
    timestamp.toMillis &&
    typeof timestamp.toMillis === "function"
  ) {

    return timestamp.toMillis();

  }


  if (timestamp instanceof Date) {

    return timestamp.getTime();

  }


  if (typeof timestamp === "number") {

    return timestamp;

  }


  return 0;

}


function renderPublicMessages(messages) {

  const feed =
    $("publicFeed");


  if (!feed) return;


  if (!messages.length) {

    feed.innerHTML = `

      <div class="empty-state">

        <span class="emoji">
          ${getMood(state.mood)?.emoji || "💬"}
        </span>

        <strong>
          No messages yet
        </strong>

        <span>
          Start the conversation.
        </span>

      </div>

    `;

    return;

  }


  feed.innerHTML =
    messages
      .map(message =>
        createMessageHTML(
          message
        )
      )
      .join("");


  feed
    .querySelectorAll(
      "[data-private-user]"
    )
    .forEach(element => {

      element.addEventListener(
        "click",
        () => {

          openPrivateChat(
            element.dataset.privateUser
          );

        }
      );

    });


  feed
    .querySelectorAll(
      "[data-image]"
    )
    .forEach(image => {

      image.addEventListener(
        "click",
        () => {

          openImage(
            image.dataset.image
          );

        }
      );

    });


  feed.scrollTop =
    feed.scrollHeight;

}


function createMessageHTML(message) {

  const mine =
    message.userId ===
    state.user?.uid;


  const mood =
    getMood(message.mood);


  const username =
    message.username ||
    "User";


  const photo =
    message.photoURL ||
    defaultAvatar(username);


  const text =
    escapeHTML(
      message.text || ""
    );


  const image =
    message.image_base64
      ? `
        <img
          class="message-image"
          data-image="${escapeHTML(
            message.image_base64
          )}"
          src="${escapeHTML(
            message.image_base64
          )}"
          alt="Image"
        >
      `
      : "";


  return `

    <div
      class="message ${mine ? "mine" : ""}"
    >

      <img
        class="message-avatar"
        src="${escapeHTML(photo)}"
        alt="${escapeHTML(username)}"
      >

      <div class="message-content">

        <div class="message-name">

          <span
            data-private-user="${escapeHTML(
              message.userId
            )}"
            style="
              cursor:pointer;
            "
          >
            ${escapeHTML(username)}
          </span>

          <span class="mood-badge">
            ${mood?.emoji || "🙂"}
          </span>

        </div>


        <div class="message-bubble">

          ${text}

          ${image}

        </div>


        <div class="message-time">

          ${formatTime(
            message.createdAt
          )}

        </div>

      </div>

    </div>

  `;

}


// ============================================================
// SEND PUBLIC TEXT
// ============================================================

async function sendPublicMessage() {

  if (!state.user || !state.mood) {

    showToast(
      "Choose a mood first."
    );

    return;

  }


  const input =
    $("messageInput");


  const text =
    input.value.trim();


  if (!text) return;


  input.value = "";


  try {

    await db
      .collection("mood_messages")
      .add({

        userId:
          state.user.uid,

        username:
          state.profile.username ||
          "User",

        handle:
          state.profile.username ||
          "",

        photoURL:
          state.profile.photoURL ||
          "",

        mood:
          state.mood,

        text:
          text,

        image_base64:
          "",

        createdAt:
          firebase.firestore.FieldValue
            .serverTimestamp()

      });


    await addPoints(10);


  } catch (error) {

    console.error(
      "Send public message error:",
      error
    );

    showToast(
      "Message could not be sent."
    );

  }

}


// ============================================================
// IMAGE COMPRESSION
// ============================================================

function compressImage(
  file,
  max = 700000
) {

  return new Promise(
    (resolve, reject) => {

      if (
        !file ||
        !file.type.startsWith("image/")
      ) {

        reject(
          new Error("Invalid image")
        );

        return;

      }


      const reader =
        new FileReader();


      reader.onerror =
        reject;


      reader.onload = () => {

        const image =
          new Image();


        image.onload = () => {

          let width =
            image.width;

          let height =
            image.height;


          const maxSide =
            900;


          if (
            width > maxSide ||
            height > maxSide
          ) {

            const scale =
              Math.min(
                maxSide / width,
                maxSide / height
              );


            width =
              Math.round(
                width * scale
              );


            height =
              Math.round(
                height * scale
              );

          }


          const canvas =
            document.createElement(
              "canvas"
            );


          canvas.width =
            width;

          canvas.height =
            height;


          const context =
            canvas.getContext("2d");


          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );


          let quality =
            0.78;


          let data =
            canvas.toDataURL(
              "image/jpeg",
              quality
            );


          while (
            data.length > max &&
            quality > 0.25
          ) {

            quality -= 0.08;

            data =
              canvas.toDataURL(
                "image/jpeg",
                quality
              );

          }


          if (data.length > max) {

            reject(
              new Error(
                "Image is too large"
              )
            );

            return;

          }


          resolve(data);

        };


        image.onerror =
          reject;


        image.src =
          reader.result;

      };


      reader.readAsDataURL(file);

    }
  );

}


// ============================================================
// SEND PUBLIC IMAGE
// ============================================================

async function sendPublicImage(file) {

  if (!state.user || !state.mood) {

    showToast(
      "Choose a mood first."
    );

    return;

  }


  try {

    showToast(
      "Preparing image..."
    );


    const base64 =
      await compressImage(file);


    await db
      .collection("mood_messages")
      .add({

        userId:
          state.user.uid,

        username:
          state.profile.username ||
          "User",

        handle:
          state.profile.username ||
          "",

        photoURL:
          state.profile.photoURL ||
          "",

        mood:
          state.mood,

        text:
          "📷 Image",

        image_base64:
          base64,

        createdAt:
          firebase.firestore.FieldValue
            .serverTimestamp()

      });


    await addPoints(10);


    showToast(
      "Image sent."
    );


  } catch (error) {

    console.error(
      "Image send error:",
      error
    );

    showToast(
      "Image could not be sent."
    );

  }

}


// ============================================================
// POINTS
// ============================================================

async function addPoints(amount) {

  if (!state.user) return;


  const ref =
    db
      .collection("profiles")
      .doc(state.user.uid);


  await ref.update({

    points:
      firebase.firestore.FieldValue
        .increment(amount)

  });


  if (state.profile) {

    state.profile.points =
      Number(
        state.profile.points || 0
      ) + amount;

  }


  const me =
    state.profiles.find(
      user =>
        user.uid ===
        state.user.uid
    );


  if (me) {

    me.points =
      Number(me.points || 0) +
      amount;

  }


  renderProfile();

  renderLeaderboard();

}


// ============================================================
// PRIVATE CHAT ID
// ============================================================

function getChatId(uid1, uid2) {

  return [
    uid1,
    uid2
  ]
  .sort()
  .join("_");

}


// ============================================================
// OPEN PRIVATE CHAT
// ============================================================

async function openPrivateChat(uid) {

  if (
    !uid ||
    uid === state.user?.uid
  ) return;


  const profile =
    state.profiles.find(
      user =>
        user.uid === uid
    );


  if (!profile) {

    try {

      const snap =
        await db
          .collection("profiles")
          .doc(uid)
          .get();


      if (!snap.exists) {

        showToast(
          "User profile not found."
        );

        return;

      }


      state.selectedPrivateUser = {

        uid: snap.id,

        ...snap.data()

      };

    } catch (error) {

      console.error(error);

      return;

    }

  } else {

    state.selectedPrivateUser =
      profile;

  }


  const person =
    state.selectedPrivateUser;


  $("privateName").textContent =
    person.username || "User";


  $("privateAvatar").src =
    avatarFor(person);


  updatePrivateStatus();

  updatePrivateMatch();


  $("privatePopover")
    ?.classList.add("open");


  startPrivateMessages(
    person.uid
  );


  $("privateMessageInput")
    ?.focus();

}


function closePrivateChat() {

  $("privatePopover")
    ?.classList.remove("open");


  if (state.privateUnsubscribe) {

    state.privateUnsubscribe();

    state.privateUnsubscribe =
      null;

  }


  state.selectedPrivateUser =
    null;

}


// ============================================================
// PRIVATE STATUS
// ============================================================

function updatePrivateStatus() {

  const person =
    state.selectedPrivateUser;


  if (!person) return;


  const online =
    !!state.onlineUsers?.[person.uid];


  if ($("privateStatus")) {

    $("privateStatus").textContent =
      online
        ? "🟢 Online"
        : "Offline";

  }

}


// ============================================================
// PRIVATE MOOD MATCH
// ============================================================

function updatePrivateMatch() {

  const person =
    state.selectedPrivateUser;


  if (!person) return;


  const myMood =
    getMood(state.mood);


  const theirMood =
    getMood(
      person.current_mood
    );


  const text =

    "You: " +
    (
      myMood
        ? myMood.emoji
        : "—"
    ) +

    " + Them: " +

    (
      theirMood
        ? theirMood.emoji
        : "—"
    ) +

    " = Perfect Match!";


  if ($("privateMatch")) {

    $("privateMatch").textContent =
      text;

  }

}


// ============================================================
// PRIVATE MESSAGES
// ============================================================

function startPrivateMessages(uid) {

  if (!state.user || !uid) {
    return;
  }


  if (state.privateUnsubscribe) {

    state.privateUnsubscribe();

    state.privateUnsubscribe =
      null;

  }


  const chatId =
    getChatId(
      state.user.uid,
      uid
    );


  state.privateUnsubscribe =
    db
      .collection("private_chats")
      .doc(chatId)
      .collection("messages")
      .orderBy(
        "createdAt",
        "asc"
      )
      .limit(100)
      .onSnapshot(
        snapshot => {

          const messages =
            snapshot.docs.map(
              doc => ({
                id: doc.id,
                ...doc.data()
              })
            );


          renderPrivateMessages(
            messages
          );

        },

        error => {

          console.error(
            "Private messages error:",
            error
          );

          showToast(
            "Could not load private chat."
          );

        }
      );

}


function renderPrivateMessages(messages) {

  const feed =
    $("privateFeed");


  if (!feed) return;


  if (!messages.length) {

    feed.innerHTML = `

      <div class="empty-state">

        <span class="emoji">
          💬
        </span>

        <strong>
          Start your private chat
        </strong>

        <span>
          Send the first message.
        </span>

      </div>

    `;

    return;

  }


  feed.innerHTML =
    messages
      .map(
        message =>
          createMessageHTML(
            message
          )
      )
      .join("");


  feed
    .querySelectorAll(
      "[data-image]"
    )
    .forEach(image => {

      image.addEventListener(
        "click",
        () => {

          openImage(
            image.dataset.image
          );

        }
      );

    });


  feed.scrollTop =
    feed.scrollHeight;

}


// ============================================================
// SEND PRIVATE TEXT
// ============================================================

async function sendPrivateMessage() {

  const person =
    state.selectedPrivateUser;


  if (!state.user || !person) {
    return;
  }


  const input =
    $("privateMessageInput");


  const text =
    input.value.trim();


  if (!text) return;


  input.value = "";


  await sendPrivateData(
    person.uid,
    text,
    ""
  );

}


// ============================================================
// SEND PRIVATE IMAGE
// ============================================================

async function sendPrivateImage(file) {

  const person =
    state.selectedPrivateUser;


  if (!state.user || !person) {
    return;
  }


  try {

    showToast(
      "Preparing image..."
    );


    const base64 =
      await compressImage(file);


    await sendPrivateData(
      person.uid,
      "📷 Image",
      base64
    );


    showToast(
      "Image sent."
    );


  } catch (error) {

    console.error(
      error
    );

    showToast(
      "Image could not be sent."
    );

  }

}


// ============================================================
// SEND PRIVATE DATA
// ============================================================

async function sendPrivateData(
  otherUid,
  text,
  imageBase64
) {

  const chatId =
    getChatId(
      state.user.uid,
      otherUid
    );


  const chatRef =
    db
      .collection("private_chats")
      .doc(chatId);


  await chatRef.set({

    members: [
      state.user.uid,
      otherUid
    ],

    lastMessage:
      text,

    lastMessageAt:
      firebase.firestore.FieldValue
        .serverTimestamp(),

    updatedAt:
      firebase.firestore.FieldValue
        .serverTimestamp()

  }, {
    merge: true
  });


  await chatRef
    .collection("messages")
    .add({

      userId:
        state.user.uid,

      username:
        state.profile.username ||
        "User",

      handle:
        state.profile.username ||
        "",

      photoURL:
        state.profile.photoURL ||
        "",

      mood:
        state.mood || null,

      text:
        text,

      image_base64:
        imageBase64 || "",

      createdAt:
        firebase.firestore.FieldValue
          .serverTimestamp()

    });


  await addPoints(10);

}


// ============================================================
// CONVERSATIONS
// ============================================================

function startConversations() {

  if (!state.user) return;


  if (state.conversationsUnsubscribe) {

    state.conversationsUnsubscribe();

    state.conversationsUnsubscribe =
      null;

  }


  state.conversationsUnsubscribe =
    db
      .collection("private_chats")
      .where(
        "members",
        "array-contains",
        state.user.uid
      )
      .limit(100)
      .onSnapshot(
        snapshot => {

          const chats =
            snapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
              .sort(
                (a, b) =>
                  getMillis(
                    b.lastMessageAt
                  ) -
                  getMillis(
                    a.lastMessageAt
                  )
              );


          renderConversations(
            chats
          );

        },

        error => {

          console.error(
            "Conversations error:",
            error
          );

        }
      );

}


function renderConversations(chats) {

  const container =
    $("conversationsList");


  if (!container) return;


  if (!chats.length) {

    container.innerHTML = `

      <div class="empty-state">

        <span class="emoji">
          💬
        </span>

        <strong>
          No private chats yet
        </strong>

        <span>
          Tap a person to start a private chat.
        </span>

      </div>

    `;

    return;

  }


  const html =
    chats.map(chat => {

      const otherUid =
        chat.members.find(
          uid =>
            uid !==
            state.user.uid
        );


      const person =
        state.profiles.find(
          user =>
            user.uid ===
            otherUid
        );


      const name =
        person?.username ||
        "User";


      const avatar =
        avatarFor(person || {
          username: name
        });


      return `

        <button
          class="conversation"
          type="button"
          data-conversation-user="${escapeHTML(
            otherUid
          )}"
        >

          <img
            class="conversation-avatar"
            src="${escapeHTML(avatar)}"
            alt="${escapeHTML(name)}"
          >

          <div class="conversation-info">

            <div class="conversation-name">
              ${escapeHTML(name)}
            </div>

            <div class="conversation-preview">
              ${escapeHTML(
                chat.lastMessage ||
                "No messages"
              )}
            </div>

          </div>

          <div class="conversation-time">
            ${formatTime(
              chat.lastMessageAt
            )}
          </div>

        </button>

      `;

    })
    .join("");


  container.innerHTML =
    html;


  container
    .querySelectorAll(
      "[data-conversation-user]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openPrivateChat(
            button.dataset
              .conversationUser
          );

        }
      );

    });

}


// ============================================================
// LIVE PEOPLE
// ============================================================

function renderLive() {

  const grid =
    $("livePeopleGrid");


  if (!grid) return;


  const people =
    Object.entries(
      state.onlineUsers || {}
    )
    .filter(
      ([uid, person]) =>
        uid !== state.user?.uid &&
        person
    )
    .map(
      ([uid, person]) => ({
        uid,
        ...person
      })
    )
    .filter(person => {

      if (!state.mood) {
        return true;
      }

      return person.mood === state.mood;

    });


  if (!people.length) {

    grid.innerHTML = `

      <div class="empty-state">

        <span class="emoji">
          🟢
        </span>

        <strong>
          Nobody else is online
        </strong>

        <span>
          Online people will appear here.
        </span>

      </div>

    `;

    return;

  }


  grid.innerHTML =
    people
      .map(person => {

        const mood =
          getMood(person.mood);


        const profile =
          state.profiles.find(
            user =>
              user.uid ===
              person.uid
          );


        const name =
          person.username ||
          profile?.username ||
          "User";


        const avatar =
          avatarFor(
            profile || {
              username: name
            }
          );


        return `

          <div
            class="live-card"
            data-live-user="${escapeHTML(
              person.uid
            )}"
          >

            <div class="live-avatar-wrap">

              <img
                class="live-avatar"
                src="${escapeHTML(avatar)}"
                alt="${escapeHTML(name)}"
              >

              <span class="online-dot"></span>

            </div>

            <div class="live-name">
              ${escapeHTML(name)}
            </div>

            <div class="live-mood">
              ${mood?.emoji || "🙂"}
              ${mood?.name || "No mood"}
            </div>

          </div>

        `;

      })
      .join("");


  grid
    .querySelectorAll(
      "[data-live-user]"
    )
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          openPrivateChat(
            card.dataset.liveUser
          );

        }
      );

    });

}


// ============================================================
// LEADERBOARD
// ============================================================

function renderLeaderboard() {

  const list =
    $("leaderboardList");


  if (!list) return;


  const users =
    [...state.profiles]
      .sort(
        (a, b) =>
          Number(b.points || 0) -
          Number(a.points || 0)
      );


  if (!users.length) {

    list.innerHTML = `

      <div class="empty-state">

        <span class="emoji">
          🏆
        </span>

        <strong>
          No rankings yet
        </strong>

        <span>
          Send messages to earn points.
        </span>

      </div>

    `;

    return;

  }


  list.innerHTML =
    users
      .map(
        (user, index) => {

          const mood =
            getMood(
              user.current_mood
            );


          return `

            <div class="leader-row">

              <div class="leader-position">
                #${index + 1}
              </div>

              <img
                class="leader-avatar"
                src="${escapeHTML(
                  avatarFor(user)
                )}"
                alt="${escapeHTML(
                  user.username ||
                  "User"
                )}"
              >

              <div class="leader-info">

                <div class="leader-name">

                  ${escapeHTML(
                    user.username ||
                    "User"
                  )}

                  ${mood?.emoji || ""}

                </div>

                <div class="leader-points">
                  ${Number(
                    user.points || 0
                  )} points
                </div>

              </div>

              <div class="leader-rank">
                #${index + 1}
              </div>

            </div>

          `;

        }
      )
      .join("");

}


// ============================================================
// PROFILE PHOTO
// ============================================================

async function changeProfilePhoto(file) {

  if (!state.user || !file) {
    return;
  }


  try {

    showToast(
      "Preparing photo..."
    );


    const base64 =
      await compressImage(
        file,
        650000
      );


    await db
      .collection("profiles")
      .doc(state.user.uid)
      .update({

        photoURL:
          base64,

        updatedAt:
          firebase.firestore.FieldValue
            .serverTimestamp()

      });


    state.profile.photoURL =
      base64;


    const me =
      state.profiles.find(
        user =>
          user.uid ===
          state.user.uid
      );


    if (me) {

      me.photoURL =
        base64;

    }


    renderProfile();


    showToast(
      "Profile photo updated."
    );


  } catch (error) {

    console.error(
      "Profile photo error:",
      error
    );

    showToast(
      "Photo could not be updated."
    );

  }

}


// ============================================================
// IMAGE VIEWER
// ============================================================

function openImage(src) {

  if (!src) return;


  const viewer =
    document.createElement(
      "div"
    );


  viewer.style.position =
    "fixed";

  viewer.style.inset =
    "0";

  viewer.style.zIndex =
    "5000";

  viewer.style.background =
    "rgba(0,0,0,.9)";

  viewer.style.display =
    "flex";

  viewer.style.alignItems =
    "center";

  viewer.style.justifyContent =
    "center";

  viewer.style.padding =
    "15px";


  viewer.innerHTML = `

    <button
      type="button"
      style="
        position:absolute;
        top:15px;
        right:15px;
        width:42px;
        height:42px;
        border:0;
        border-radius:50%;
        background:rgba(255,255,255,.15);
        color:#fff;
        font-size:22px;
        cursor:pointer;
      "
    >
      ✕
    </button>

    <img
      src="${escapeHTML(src)}"
      alt="Image"
      style="
        max-width:100%;
        max-height:90vh;
        object-fit:contain;
        border-radius:12px;
      "
    >

  `;


  viewer
    .querySelector("button")
    .addEventListener(
      "click",
      () => {

        viewer.remove();

      }
    );


  viewer.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        viewer
      ) {

        viewer.remove();

      }

    }
  );


  document.body.appendChild(
    viewer
  );

}


// ============================================================
// TYPING INDICATOR
// ============================================================

function setupPublicTyping() {

  const input =
    $("messageInput");


  if (!input) return;


  input.addEventListener(
    "input",
    () => {

      if (!state.user || !state.mood) {
        return;
      }


      const typingRef =
        rtdb.ref(
          "typing/public_" +
          state.mood +
          "/" +
          state.user.uid
        );


      typingRef.set({

        username:
          state.profile?.username ||
          "User",

        at:
          firebase.database.ServerValue
            .TIMESTAMP

      });


      clearTimeout(
        state.typingTimer
      );


      state.typingTimer =
        setTimeout(
          () => {

            typingRef.remove();

          },
          1800
        );

    }
  );

}


function setupPrivateTyping() {

  const input =
    $("privateMessageInput");


  if (!input) return;


  input.addEventListener(
    "input",
    () => {

      const person =
        state.selectedPrivateUser;


      if (!state.user || !person) {
        return;
      }


      const chatId =
        getChatId(
          state.user.uid,
          person.uid
        );


      const typingRef =
        rtdb.ref(
          "typing/private_" +
          chatId +
          "/" +
          state.user.uid
        );


      typingRef.set({

        username:
          state.profile?.username ||
          "User",

        at:
          firebase.database.ServerValue
            .TIMESTAMP

      });


      clearTimeout(
        state.privateTypingTimer
      );


      state.privateTypingTimer =
        setTimeout(
          () => {

            typingRef.remove();

          },
          1800
        );

    }
  );

}


// ============================================================
// LISTEN PUBLIC TYPING
// ============================================================

function startPublicTypingListener() {

  if (!state.mood) return;


  if (state.typingPublicRef) {

    state.typingPublicRef.off();

  }


  state.typingPublicRef =
    rtdb.ref(
      "typing/public_" +
      state.mood
    );


  state.typingPublicRef.on(
    "value",
    snapshot => {

      const data =
        snapshot.val() || {};


      const names =
        Object.entries(data)
          .filter(
            ([uid]) =>
              uid !==
              state.user?.uid
          )
          .map(
            ([, person]) =>
              person.username
          )
          .filter(Boolean);


      if ($("typingIndicator")) {

        $("typingIndicator").innerHTML =
          names.length
            ? `
              ${escapeHTML(
                names.join(", ")
              )}
              ${names.length === 1
                ? " is"
                : " are"} typing
              <span class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            `
            : "";

      }

    }
  );

}


// ============================================================
// LISTEN PRIVATE TYPING
// ============================================================

function startPrivateTypingListener() {

  const person =
    state.selectedPrivateUser;


  if (!person || !state.user) {
    return;
  }


  if (state.typingPrivateRef) {

    state.typingPrivateRef.off();

  }


  const chatId =
    getChatId(
      state.user.uid,
      person.uid
    );


  state.typingPrivateRef =
    rtdb.ref(
      "typing/private_" +
      chatId
    );


  state.typingPrivateRef.on(
    "value",
    snapshot => {

      const data =
        snapshot.val() || {};


      const other =
        Object.entries(data)
          .find(
            ([uid]) =>
              uid !==
              state.user.uid
          );


      if ($("privateTyping")) {

        $("privateTyping").innerHTML =
          other
            ? `
              ${escapeHTML(
                other[1].username ||
                person.username ||
                "User"
              )}
              is typing
              <span class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            `
            : "";

      }

    }
  );

}


// ============================================================
// VIEW NAVIGATION
// ============================================================

function showView(viewId) {

  document
    .querySelectorAll(".view")
    .forEach(view => {

      view.classList.remove(
        "active"
      );

    });


  const view =
    $(viewId);


  if (view) {

    view.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

      button.classList.remove(
        "active"
      );

    });


  const map = {

    chatView:
      "navChatBtn",

    messagesView:
      "navMessagesBtn",

    liveView:
      "navLiveBtn",

    leaderboardView:
      "navLeaderboardBtn",

    profileView:
      "navProfileBtn"

  };


  const buttonId =
    map[viewId];


  if (buttonId) {

    $(buttonId)
      ?.classList.add("active");

  }


  closeDrawer();


  if (
    viewId ===
    "messagesView"
  ) {

    startConversations();

  }


  if (
    viewId ===
    "liveView"
  ) {

    renderLive();

  }


  if (
    viewId ===
    "leaderboardView"
  ) {

    renderLeaderboard();

  }


  if (
    viewId ===
    "profileView"
  ) {

    renderProfile();

  }

}


// ============================================================
// DRAWER
// ============================================================

function openDrawer() {

  $("drawer")
    ?.classList.add("open");

  $("drawerBg")
    ?.classList.add("open");

}


function closeDrawer() {

  $("drawer")
    ?.classList.remove("open");

  $("drawerBg")
    ?.classList.remove("open");

}


// ============================================================
// PROFILE POPOVER
// ============================================================

function toggleProfilePopover() {

  $("profilePopover")
    ?.classList.toggle("open");

}


// ============================================================
// DARK MODE
// ============================================================

function setupDarkMode() {

  const saved =
    localStorage.getItem(
      "moodchat_dark_mode"
    );


  if (saved === "true") {

    document.body.classList.add(
      "dark-mode"
    );

  }

}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

  try {

    if (state.user) {

      await rtdb
        .ref(
          "presence/" +
          state.user.uid
        )
        .remove();

    }


    await auth.signOut();


    window.location.replace(
      "index.html"
    );


  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

    showToast(
      "Could not log out."
    );

  }

}


// ============================================================
// AUTH STATE
// ============================================================

auth.onAuthStateChanged(
  async user => {

    if (!user) {

      window.location.replace(
        "index.html"
      );

      return;

    }


    try {

      state.user =
        user;


      await loadMyProfile();


      state.mood =
        state.profile?.current_mood ||
        null;


      await loadAllProfiles();


      renderProfile();


      startPresence();

      startConversations();

      setupPublicTyping();

      setupPrivateTyping();

      startPublicTypingListener();


      if (state.mood) {

        $("chooseMoodScreen")
          ?.classList.add("hidden");


        $("moodChatContent")
          ?.classList.remove("hidden");


        $("publicComposer")
          ?.classList.remove("hidden");


        startPublicMessages();

      } else {

        $("chooseMoodScreen")
          ?.classList.remove("hidden");


        $("moodChatContent")
          ?.classList.add("hidden");


        $("publicComposer")
          ?.classList.add("hidden");


        setTimeout(
          openMoodPicker,
          400
        );

      }


      updateMoodUI();


      console.log(
        "MOODCHAT Home.js loaded successfully."
      );

    } catch (error) {

      console.error(
        "MOODCHAT startup error:",
        error
      );

      showToast(
        "Could not load MOODCHAT."
      );

    }

  }
);


// ============================================================
// EVENT LISTENERS
// ============================================================

$("menuBtn")
  ?.addEventListener(
    "click",
    openDrawer
  );


$("drawerBg")
  ?.addEventListener(
    "click",
    closeDrawer
  );


$("drawerClose")
  ?.addEventListener(
    "click",
    closeDrawer
  );


$("topMood")
  ?.addEventListener(
    "click",
    openMoodPicker
  );


$("chooseMoodBtn")
  ?.addEventListener(
    "click",
    openMoodPicker
  );


$("popupOverlay")
  ?.addEventListener(
    "click",
    () => {

      closeMoodPicker();

    }
  );


$("profileBtn")
  ?.addEventListener(
    "click",
    toggleProfilePopover
  );


$("navChatBtn")
  ?.addEventListener(
    "click",
    () => {

      showView(
        "chatView"
      );

    }
  );


$("navMessagesBtn")
  ?.addEventListener(
    "click",
    () => {

      showView(
        "messagesView"
      );

    }
  );


$("navLiveBtn")
  ?.addEventListener(
    "click",
    () => {

      showView(
        "liveView"
      );

    }
  );


$("navLeaderboardBtn")
  ?.addEventListener(
    "click",
    () => {

      showView(
        "leaderboardView"
      );

    }
  );


$("navProfileBtn")
  ?.addEventListener(
    "click",
    () => {

      showView(
        "profileView"
      );

    }
  );


$("logoutBtn")
  ?.addEventListener(
    "click",
    logout
  );


$("privateBackBtn")
  ?.addEventListener(
    "click",
    closePrivateChat
  );


$("sendMessageBtn")
  ?.addEventListener(
    "click",
    sendPublicMessage
  );


$("privateSendBtn")
  ?.addEventListener(
    "click",
    sendPrivateMessage
  );


$("publicImageBtn")
  ?.addEventListener(
    "click",
    () => {

      $("publicImageInput")
        ?.click();

    }
  );


$("privateImageBtn")
  ?.addEventListener(
    "click",
    () => {

      $("privateImageInput")
        ?.click();

    }
  );


$("publicImageInput")
  ?.addEventListener(
    "change",
    async event => {

      const file =
        event.target.files?.[0];


      if (file) {

        await sendPublicImage(
          file
        );

      }


      event.target.value = "";

    }
  );


$("privateImageInput")
  ?.addEventListener(
    "change",
    async event => {

      const file =
        event.target.files?.[0];


      if (file) {

        await sendPrivateImage(
          file
        );

      }


      event.target.value = "";

    }
  );


$("profileImageInput")
  ?.addEventListener(
    "change",
    async event => {

      const file =
        event.target.files?.[0];


      if (file) {

        await changeProfilePhoto(
          file
        );

      }


      event.target.value = "";

    }
  );


// ============================================================
// ENTER TO SEND
// ============================================================

$("messageInput")
  ?.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendPublicMessage();

      }

    }
  );


$("privateMessageInput")
  ?.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendPrivateMessage();

      }

    }
  );


// ============================================================
// MOOD BUTTONS
// ============================================================

document
  .querySelectorAll(
    ".mood-option"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        setMood(
          button.dataset.mood
        );

      }
    );

  });


// ============================================================
// INITIAL SETUP
// ============================================================

setupDarkMode();


// ============================================================
// CLEANUP
// ============================================================

window.addEventListener(
  "beforeunload",
  () => {

    if (state.typingPublicRef) {

      state.typingPublicRef.off();

    }


    if (state.typingPrivateRef) {

      state.typingPrivateRef.off();

    }

  }
);