// ============================================================
// MOODCHAT — AUTHENTICATION
// ============================================================


// ============================================================
// FIREBASE CONFIGURATION
// ============================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyByPYngE0Mcb7DA6VRD5znTFGdGdvX-U0E",

  authDomain:
    "moodchat-c8acf.firebaseapp.com",

  databaseURL:
    "https://moodchat-c8acf-default-rtdb.firebaseio.com",

  projectId:
    "moodchat-c8acf",

  storageBucket:
    "moodchat-c8acf.firebasestorage.app",

  messagingSenderId:
    "175563017140",

  appId:
    "1:175563017140:web:5c2bf6cbf9896363fc00e1",

  measurementId:
    "G-52548DKTVH"

};


// ============================================================
// START FIREBASE
// ============================================================

if (!firebase.apps.length) {

  firebase.initializeApp(
    firebaseConfig
  );

}

const auth =
  firebase.auth();

const db =
  firebase.firestore();


console.log(
  "MOODCHAT Firebase initialized successfully."
);


// ============================================================
// HELPERS
// ============================================================

const $ = (id) =>
  document.getElementById(id);


let authMode =
  "login";


// ============================================================
// TOAST
// ============================================================

function showToast(message) {

  const toast =
    $("toast");

  if (!toast) {
    return;
  }

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    window.__moodchatToastTimer
  );

  window.__moodchatToastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2500);

}


// ============================================================
// GO TO HOMEPAGE
// ============================================================

function goToHomepage() {

  console.log(
    "MOODCHAT: Redirecting to Homepage.html"
  );

  window.location.href =
    "./Homepage.html";

}


// ============================================================
// LOGIN / SIGNUP MODE
// ============================================================

function setAuthMode(mode) {

  authMode =
    mode;

  const signup =
    mode === "signup";


  const loginTab =
    $("loginTab");

  const signupTab =
    $("signupTab");


  if (loginTab) {

    loginTab.classList.toggle(
      "active",
      !signup
    );

  }


  if (signupTab) {

    signupTab.classList.toggle(
      "active",
      signup
    );

  }


  const usernameField =
    $("usernameField");

  if (usernameField) {

    usernameField.classList.toggle(
      "hidden",
      !signup
    );

  }


  const genderField =
    $("genderField");

  if (genderField) {

    genderField.classList.toggle(
      "hidden",
      !signup
    );

  }


  const button =
    $("authSubmitBtn");

  if (button) {

    button.textContent =
      signup
        ? "Create Account"
        : "Login";

  }


  const authSub =
    $("authSub");

  if (authSub) {

    authSub.textContent =
      signup
        ? "Create your account, choose a mood and meet people."
        : "Talk to people who feel the same way you do.";

  }

}


// ============================================================
// CREATE USER PROFILE
// ============================================================

async function createUserProfile(
  user,
  username,
  gender
) {

  if (!user) {

    throw new Error(
      "No Firebase user."
    );

  }


  await db
    .collection("profiles")
    .doc(user.uid)
    .set({

      uid:
        user.uid,

      username:
        username || "User",

      email:
        user.email || "",

      gender:
        gender || "",

      current_mood:
        null,

      points:
        0,

      rank:
        0,

      photoURL:
        "",

      createdAt:
        firebase.firestore.FieldValue
          .serverTimestamp(),

      updatedAt:
        firebase.firestore.FieldValue
          .serverTimestamp()

    }, {

      merge: true

    });


  console.log(
    "MOODCHAT profile created."
  );

}


// ============================================================
// ERROR MESSAGE
// ============================================================

function getAuthErrorMessage(code) {

  switch (code) {

    case "auth/email-already-in-use":

      return "That email is already registered.";


    case "auth/invalid-email":

      return "Please enter a valid email.";


    case "auth/invalid-credential":

      return "Email or password is incorrect.";


    case "auth/user-not-found":

      return "Email or password is incorrect.";


    case "auth/wrong-password":

      return "Email or password is incorrect.";


    case "auth/weak-password":

      return "Password must be at least 6 characters.";


    case "auth/network-request-failed":

      return "Check your internet connection.";


    case "auth/too-many-requests":

      return "Too many attempts. Try again later.";


    case "auth/operation-not-allowed":

      return "Email and password authentication is not enabled.";


    case "auth/api-key-not-valid":

      return "The Firebase API key is invalid.";


    case "auth/user-disabled":

      return "This account has been disabled.";


    default:

      return "Authentication failed. Please try again.";

  }

}


// ============================================================
// LOGIN TAB
// ============================================================

if ($("loginTab")) {

  $("loginTab").addEventListener(
    "click",
    () => {

      setAuthMode(
        "login"
      );

    }
  );

}


// ============================================================
// SIGNUP TAB
// ============================================================

if ($("signupTab")) {

  $("signupTab").addEventListener(
    "click",
    () => {

      setAuthMode(
        "signup"
      );

    }
  );

}


// ============================================================
// AUTH FORM
// ============================================================

if ($("authForm")) {

  $("authForm").addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // ======================================================
      // VALUES
      // ======================================================

      const email =
        $("email")
          ? $("email")
              .value
              .trim()
          : "";


      const password =
        $("password")
          ? $("password")
              .value
          : "";


      const username =
        $("username")
          ? $("username")
              .value
              .trim()
          : "";


      const gender =
        $("gender")
          ? $("gender")
              .value
          : "";


      const signup =
        authMode === "signup";


      // ======================================================
      // VALIDATION
      // ======================================================

      if (!email) {

        showToast(
          "Enter your email."
        );

        return;

      }


      if (password.length < 6) {

        showToast(
          "Password must be at least 6 characters."
        );

        return;

      }


      if (signup) {

        if (username.length < 2) {

          showToast(
            "Enter a username."
          );

          return;

        }


        if (!gender) {

          showToast(
            "Select your gender."
          );

          return;

        }

      }


      // ======================================================
      // BUTTON
      // ======================================================

      const button =
        $("authSubmitBtn");


      if (!button) {

        return;

      }


      const originalText =
        button.textContent;


      button.disabled =
        true;


      button.textContent =
        signup
          ? "Creating..."
          : "Logging in...";


      // ======================================================
      // FIREBASE
      // ======================================================

      try {

        // ====================================================
        // SIGN UP
        // ====================================================

        if (signup) {

          const result =
            await auth
              .createUserWithEmailAndPassword(
                email,
                password
              );


          const user =
            result.user;


          if (!user) {

            throw new Error(
              "Firebase did not return a user."
            );

          }


          console.log(
            "MOODCHAT account created:",
            user.uid
          );


          // ==================================================
          // CREATE PROFILE
          // ==================================================

          try {

            await createUserProfile(
              user,
              username,
              gender
            );

          } catch (profileError) {

            console.error(
              "Profile creation error:",
              profileError
            );

            // Account already exists in Firebase Auth.
            // Homepage can create/load the profile later.

          }


          showToast(
            "Account created successfully."
          );


          // ==================================================
          // REDIRECT
          // ==================================================

          setTimeout(() => {

            goToHomepage();

          }, 300);

        }


        // ====================================================
        // LOGIN
        // ====================================================

        else {

          const result =
            await auth
              .signInWithEmailAndPassword(
                email,
                password
              );


          if (!result.user) {

            throw new Error(
              "Firebase login returned no user."
            );

          }


          console.log(
            "MOODCHAT login successful:",
            result.user.uid
          );


          showToast(
            "Welcome back."
          );


          // ==================================================
          // REDIRECT IMMEDIATELY
          // ==================================================

          setTimeout(() => {

            goToHomepage();

          }, 300);

        }

      }


      // ======================================================
      // ERROR
      // ======================================================

      catch (error) {

        console.error(
          "MOODCHAT authentication error:",
          error
        );


        showToast(
          getAuthErrorMessage(
            error.code
          )
        );

      }


      // ======================================================
      // RESTORE BUTTON
      // ======================================================

      finally {

        button.disabled =
          false;

        button.textContent =
          originalText;

      }

    }
  );

}


// ============================================================
// CHECK EXISTING LOGIN
// ============================================================

auth.onAuthStateChanged(
  (user) => {

    if (!user) {

      console.log(
        "MOODCHAT: No user currently signed in."
      );

      return;

    }


    console.log(
      "MOODCHAT: Existing login detected:",
      user.uid
    );

    /*
      IMPORTANT:

      We do NOT query Firestore here.

      This prevents a Firestore/profile problem
      from stopping the user from opening Homepage.html.
    */

  }
);


// ============================================================
// DEFAULT MODE
// ============================================================

setAuthMode(
  "login"
);


// ============================================================
// DEBUG
// ============================================================

console.log(
  "MOODCHAT auth.js loaded successfully."
);