import { Routes, Route } from "react-router-dom";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserProfile
} from "@clerk/clerk-react";

import Sidebar from "./components/Sidebar";
import QueryBox from "./components/QueryBox";
import Library from "./pages/library";

function App() {
  return (
    <Routes>
      {/* Home route */}
      <Route
        path="/"
        element={
          <>
            <SignedIn>
              <div className="flex h-screen font-sans">
                <Sidebar />
                <QueryBox />
              </div>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />

      {/* Library route */}
      <Route
        path="/library"
        element={
          <>
            <SignedIn>
              <div className="flex h-screen font-sans">
                <Sidebar />
                <Library />
              </div>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />

      {/* Clerk routes */}
      <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
      <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
      <Route path="/user/*" element={<UserProfile routing="path" path="/user" />} />
    </Routes>
  );
}

export default App;
