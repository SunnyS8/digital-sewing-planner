import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Dashboard } from '@/pages/Dashboard'
import { MeasurementsPage } from '@/pages/MeasurementsPage'
import { ProjectListPage } from '@/pages/ProjectListPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { FittingRoomPage } from '@/pages/FittingRoomPage'
import { FabricLibraryPage } from '@/pages/FabricLibraryPage'
import { PatternsPage } from '@/pages/PatternsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/measurements" element={<MeasurementsPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/new" element={<ProjectDetailPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/fitting" element={<FittingRoomPage />} />
          <Route path="/fabrics" element={<FabricLibraryPage />} />
          <Route path="/patterns" element={<PatternsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
