import React, { useEffect, useRef, useState } from 'react';
import { Folder, ChevronDown } from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface ProjectSelectorProps {
  currentProjectId: string;
  onProjectChange: (id: string) => void;
}

export function ProjectSelector({ currentProjectId, onProjectChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .catch((err) => console.error('Error fetching workspaces:', err));
  }, []);

  // Close the dropdown when clicking outside of it.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition focus:outline-none"
      >
        <Folder className="w-4 h-4 text-indigo-400" />
        {currentProject ? currentProject.name : 'Select Project Workspace...'}
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-64 rounded-lg border border-slate-800 bg-slate-900 shadow-xl py-1">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                onProjectChange(project.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs font-mono transition block ${
                project.id === currentProjectId
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="block">{project.name}</span>
              <span className="block text-[10px] opacity-60">{project.id}</span>
            </button>
          ))}
          {projects.length === 0 && (
            <p className="px-4 py-2.5 text-xs text-slate-500">No projects found.</p>
          )}
        </div>
      )}
    </div>
  );
}
