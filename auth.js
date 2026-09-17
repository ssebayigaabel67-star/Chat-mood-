// ============================================================
// MOODCHAT — AUTHENTICATION
// ============================================================


// ============================================================
// FIREBASE CONFIGURATION
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyByPYENG0Mcb7DA6VRD5znTFGdGdvX-U0E",
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

console.log(
  "MOODCHAT Firebase initialized successfully."
);


// ============================================================
// HELPERS
// ============================================================

const $ = (id) => {
  return document.getElementById(id);
};

let authMode = "login";


// ============================================================
// TOAST
// ============================================================

function showToast(message) {

  const toast = $("toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(
    window.__moodchatToastTimer
  );

  window.__moodchatToastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 2500);
}


// ============================================================
// LOGIN / SIGNUP MODE
// ============================================================

function setAuthMode(mode) {

  authMode = mode;

  const signup =
    mode === "signup";


  // ==========================================================
  // TABS
  // ==========================================================

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


  // ==========================================================
  // USERNAME FIELD
  // ==========================================================

  const usernameField =
    $("usernameField");

  if (usernameField) {

    usernameField.classList.toggle(
      "hidden",
      !signup
    );

  }


  // ==========================================================
  // GENDER FIELD
  // ==========================================================

  const genderField =
    $("genderField");

  if (genderField) {

    genderField.classList.toggle(
      "hidden",
      !signup
    );

  }


  // ==========================================================
  // BUTTON TEXT
  // ==========================================================

  const submitButton =
    $("authSubmitBtn");

  if (submitButton) {

    submitButton.textContent =
      signup
        ? "Create Account"
        : "Login";

  }


  // ==========================================================
  // DESCRIPTION
  // ==========================================================

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
      "No authenticated user."
    );
  }


  const profileRef =
    db
      .collection("profiles")
      .doc(user.uid);


  await profileRef.set({

    uid: user.uid,

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

}


// ============================================================
// FIREBASE ERROR MESSAGE
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

      return "Email and password sign-in is not enabled in Firebase.";


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

const loginTab =
  $("loginTab");

if (loginTab) {

  loginTab.addEventListener(
    "click",
    () => {

      setAuthMode("login");

    }
  );

}


// ============================================================
// SIGNUP TAB
// ============================================================

const signupTab =
  $("signupTab");

if (signupTab) {

  signupTab.addEventListener(
    "click",
    () => {

      setAuthMode("signup");

    }
  );

}


// ============================================================
// LOGIN / SIGN UP FORM
// ============================================================

const authForm =
  $("authForm");

if (authForm) {

  authForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // ======================================================
      // GET FORM VALUES
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
      // BASIC VALIDATION
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


      button.disabled = true;


      const oldText =
        button.textContent;


      button.textContent =
        signup
          ? "Creating..."
          : "Logging in...";


      // ======================================================
      // FIREBASE AUTHENTICATION
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


          // ==================================================
          // CREATE FIRESTORE PROFILE
          // ==================================================

          await createUserProfile(
            user,
            username,
            gender
          );


          console.log(
            "MOODCHAT account created:",
            user.uid
          );


          showToast(
            "Account created successfully."
          );


          // Firebase auth state listener
          // will redirect to Homepage.html.

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


          // Firebase auth state listener
          // will redirect to Homepage.html.

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

        button.disabled = false;

        button.textContent =
          oldText;

      }

    }
  );

}


// ============================================================
// CHECK LOGIN STATE
// ============================================================

auth.onAuthStateChanged(
  async (user) => {

    // ========================================================
    // NOT LOGGED IN
    // ========================================================

    if (!user) {

      console.log(
        "MOODCHAT: No user currently signed in."
      );

      return;

    }


    // ========================================================
    // USER IS LOGGED IN
    // ========================================================

    console.log(
      "MOODCHAT: User is signed in:",
      user.uid
    );


    try {

      // ======================================================
      // GET PROFILE
      // ======================================================

      const profileRef =
        db
          .collection("profiles")
          .doc(user.uid);


      const profile =
        await profileRef.get();


      // ======================================================
      // PROFILE DOES NOT EXIST
      // ======================================================

      if (!profile.exists) {

        const fallbackUsername =
          user.email
            ? user.email
                .split("@")[0]
            : "User";


        await createUserProfile(
          user,
          fallbackUsername,
          ""
        );


        console.log(
          "MOODCHAT: Missing profile created."
        );

      }


      // ======================================================
      // GO TO HOMEPAGE
      // ======================================================

      console.log(
        "MOODCHAT: Opening Homepage.html..."
      );


      window.location.replace(
        "Homepage.html"
      );

    }


    // ========================================================
    // PROFILE ERROR
    // ========================================================

    catch (error) {

      console.error(
        "MOODCHAT profile loading error:",
        error
      );


      showToast(
        "Could not load your profile."
      );


      try {

        await auth.signOut();

      }

      catch (signOutError) {

        console.error(
          "MOODCHAT sign-out error:",
          signOutError
        );

      }

    }

  }
);


// ============================================================
// DEFAULT MODE
// ============================================================

setAuthMode(
  "login"
);


// ============================================================
// DEBUG MESSAGE
// ============================================================

console.log(
  "MOODCHAT auth.js loaded successfully."
);