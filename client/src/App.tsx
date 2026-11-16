import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from "./utils/ScrollToTop";
import { useAuthInit } from './hook/useAuthInit';
import { useAppDispatch } from './hook/storeHooks';
import { createPostThunk } from './features/feed/model/feedSlice';


import Layout from './components/Layout/Layout';
import FeedPage from './pages/FeedPage/FeedPage';
import ExplorePage from './pages/ExplorePage/ExplorePage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import MessagesPage from './pages/MessagesPage/MessagesPage';
import PostPage from './pages/PostPage/PostPage';
import SearchPage from './pages/SearchPage/SearchPage';
import styles from './App.module.css';

function App() {
  const { user, isAuth, isReady } = useAuthInit();
  const dispatch = useAppDispatch();

  if (!isReady) {
    return (
      <div style={{ background: '#000', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  const handleAddNewPost = async (data: { file: File | null; caption: string }) => {
    try {
      const formData = new FormData();
      formData.append('description', data.caption);
      if (data.file) formData.append('image', data.file);
      return await dispatch(createPostThunk(formData)).unwrap();
    } catch (error) {
      console.error("Ошибка при создании поста:", error);
      throw error;
    }
  };

  return (

    <div className={styles.appContainer}>
      <ScrollToTop />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { zIndex: 99999, background: '#333', color: '#fff' }
        }}
      />

      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/login" element={!isAuth ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!isAuth ? <SignUpPage /> : <Navigate to="/" replace />} />

        <Route path="/" element={isAuth && user ? (
          <Layout user={user} onAddNewPost={handleAddNewPost} />
        ) : (
          <Navigate to="/login" replace />
        )}>
          <Route index element={<FeedPage />} />
          <Route path="post/:postId" element={<PostPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="accounts/edit" element={<SettingsPage user={user!} />} />
          <Route path="settings" element={<Navigate to="/accounts/edit" replace />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuth ? "/" : "/login"} replace />} />
      </Routes>
    </div>

  );
}

export default App;