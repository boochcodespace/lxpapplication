'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import AppShell from '@/components/layout/AppShell';
import ProjectCard from '@/components/projects/ProjectCard';
import NewProjectModal from '@/components/projects/NewProjectModal';
import ADDIEProgress from '@/components/projects/ADDIEProgress';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import MaterialCard from '@/components/materials/MaterialCard';
import MaterialUpload from '@/components/materials/MaterialUpload';
import MaterialViewer from '@/components/materials/MaterialViewer';
import Button from '@/components/ui/Button';
import NeedsAnalysisWizard from '@/components/analysis/NeedsAnalysisWizard';
import OutlineBuilder from '@/components/outline/OutlineBuilder';
import DesignDocGenerator from '@/components/design-doc/DesignDocGenerator';
import QADashboard from '@/components/qa/QADashboard';

function DashboardView() {
  const projects = useAppStore((s) => s.projects);
  const setActiveProject = useAppStore((s) => s.setActiveProject);
  const [showNewProject, setShowNewProject] = useState(false);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Course Development Dashboard</h1>
          <p className="text-sm text-surface-600 mt-1">
            Manage your instructional design projects with AI guidance
          </p>
        </div>
        <Button onClick={() => setShowNewProject(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      </div>

      {/* Active projects */}
      <section>
        <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">
          Active Projects ({projects.filter((p) => p.status === 'active').length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects
            .filter((p) => p.status === 'active')
            .map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={(id) => setActiveProject(id)}
              />
            ))}
        </div>
      </section>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="text-center py-20">
          <svg
            className="mx-auto h-12 w-12 text-surface-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <h3 className="text-lg font-medium text-surface-700 mb-1">No projects yet</h3>
          <p className="text-sm text-surface-500 mb-4">
            Create your first course development project to get started.
          </p>
          <Button onClick={() => setShowNewProject(true)}>Create Project</Button>
        </div>
      )}

      <NewProjectModal open={showNewProject} onClose={() => setShowNewProject(false)} />
    </div>
  );
}

function ChatView() {
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const projects = useAppStore((s) => s.projects);
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);

  const activeProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null;

  if (!activeProject) return null;

  const projectMessages = messages.filter((m) => m.projectId === activeProjectId);

  const handleSend = (content: string) => {
    addMessage({
      projectId: activeProjectId!,
      role: 'user',
      content,
    });

    // Simulated assistant response
    setTimeout(() => {
      addMessage({
        projectId: activeProjectId!,
        role: 'assistant',
        content: `I received your message about: "${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"\n\nThis is a simulated response. In a full implementation, this would connect to an AI backend that uses the ADDIE methodology and instructional design principles to help you develop your course.\n\n**Next steps:**\n- Connect to an AI API for intelligent responses\n- Process uploaded materials for context\n- Generate course deliverables based on the current ADDIE phase`,
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Project info bar */}
      <div className="px-4 py-2 border-b border-surface-200 bg-white flex items-center gap-4">
        <ADDIEProgress
          phaseProgress={activeProject.phaseProgress}
          currentPhase={activeProject.currentPhase}
          compact
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {projectMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}

function MaterialsView() {
  const materials = useAppStore((s) => s.materials);
  const selectedMaterialId = useAppStore((s) => s.selectedMaterialId);
  const setSelectedMaterial = useAppStore((s) => s.setSelectedMaterial);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Source Materials</h1>
          <p className="text-sm text-surface-600 mt-1">
            Upload and manage materials for your course projects
          </p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? 'Close Upload' : 'Upload Materials'}
        </Button>
      </div>

      {/* Upload area */}
      {showUpload && (
        <div className="mb-6 p-4 rounded-xl border border-surface-200 bg-white">
          <MaterialUpload onUploadComplete={() => setShowUpload(false)} />
        </div>
      )}

      {/* Materials list */}
      <div className="space-y-3">
        {materials.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            onSelect={(id) => setSelectedMaterial(id)}
            isSelected={material.id === selectedMaterialId}
          />
        ))}
      </div>

      {/* Empty state */}
      {materials.length === 0 && !showUpload && (
        <div className="text-center py-20">
          <svg
            className="mx-auto h-12 w-12 text-surface-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
          <h3 className="text-lg font-medium text-surface-700 mb-1">No materials uploaded</h3>
          <p className="text-sm text-surface-500 mb-4">
            Upload SME content, reference materials, or existing courses.
          </p>
          <Button onClick={() => setShowUpload(true)}>Upload Your First Material</Button>
        </div>
      )}

      {/* Material viewer panel */}
      {selectedMaterialId && <MaterialViewer />}
    </div>
  );
}

export default function Home() {
  const activeView = useAppStore((s) => s.activeView);
  const activeProjectId = useAppStore((s) => s.activeProjectId);

  const renderProjectView = () => {
    if (!activeProjectId) return null;
    switch (activeView) {
      case 'analysis':
        return <NeedsAnalysisWizard projectId={activeProjectId} />;
      case 'outline':
        return <OutlineBuilder projectId={activeProjectId} />;
      case 'design-doc':
        return <DesignDocGenerator projectId={activeProjectId} />;
      case 'quality-assurance':
        return <QADashboard projectId={activeProjectId} />;
      case 'chat':
      default:
        return <ChatView />;
    }
  };

  return (
    <AppShell>
      {!activeProjectId && activeView === 'dashboard' && <DashboardView />}
      {!activeProjectId && activeView === 'materials' && <MaterialsView />}
      {activeProjectId && renderProjectView()}
    </AppShell>
  );
}
