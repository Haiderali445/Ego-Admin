import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ExperiencePage } from './pages/experience/ExperiencePage';
import { EducationPage } from './pages/education/EducationPage';
import { SkillsPage } from './pages/skills/SkillsPage';
import { ServicesPage } from './pages/services/ServicesPage';
import { SolutionsPage } from './pages/solutions/SolutionsPage';
import { TestimonialsPage } from './pages/testimonials/TestimonialsPage';
import { PricingPage } from './pages/pricing/PricingPage';
import { SiteConfigPage } from './pages/site-config/SiteConfigPage';
import { TerminalPage } from './pages/terminal/TerminalPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Gate */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Application Routes (No Viewers Allowed) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="experience" element={<ExperiencePage />} />
          <Route path="education" element={<EducationPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="solutions" element={<SolutionsPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="site-config" element={<SiteConfigPage />} />
          <Route path="terminal" element={<TerminalPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
