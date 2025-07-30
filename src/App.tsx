import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthPage, EditProfile, ViewProfile, ProfileCompletion, UserDashboard, Feed, GoogleAuth, Chat, AllUsers } from './pages';
import { Toaster } from 'sonner';
import ChangePassword from "@/pages/change-password/ChangePassword"
import ResetPassword from "@/pages/reset-password/ResetPassword"
import { type RootState } from './store/store';
import { useSocket } from './utils/useSocket';
import { useEffect } from 'react';
import { loadUserFromStorage } from './slices/authSlice';
import { useAppDispatch, useAppSelector } from './store/hooks';

function App() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state: RootState) => state.auth.user);
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, []);

  useSocket(authUser?._id);
  return (
    <>
      <Router>
        <Toaster richColors position='top-right' />
        <Routes>
          <Route path='/' element={<AuthPage />} />
          <Route path='/login' element={<AuthPage />} />
          <Route path='/profile-completion' element={<ProfileCompletion />} />
          <Route path='edit-profile' element={<EditProfile />} />
          <Route path='view-profile' element={<ViewProfile />} />
          <Route path='/user-dashboard' element={<UserDashboard />} />
          <Route path='/google-auth' element={<GoogleAuth />} />
          <Route path='/feed' element={<Feed />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/users' element={<AllUsers />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Router >
    </>
  )
}

export default App
