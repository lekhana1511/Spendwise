import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ExpensesPage } from '../pages/ExpensesPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { InsightsPage } from '../pages/InsightsPage';
import { AssistantPage } from '../pages/AssistantPage';
import { ProjectionPage } from '../pages/ProjectionPage';
import { ProfilePage } from '../pages/ProfilePage';
import { useApp } from '../store/AppContext';

export const AppRoutes: React.FC = () => {
  const { state } = useApp();
  const isAuthenticated = state.auth.isAuthenticated;

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Authenticated Dashboard Pages wrapped in AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/projection" element={<ProjectionPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />}
      />
    </Routes>
  );
};
