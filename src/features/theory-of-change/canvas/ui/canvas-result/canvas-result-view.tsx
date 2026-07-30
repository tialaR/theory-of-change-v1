'use client';

import { useMemo } from 'react';
import type { AuthUser } from '@/features/auth/domain/auth.types';
import { UserMenu } from '@/features/auth/ui/user-menu/user-menu';
import { ResultExperience } from '@/features/theory-of-change/components/result-view/result-experience';
import type { CanvasProject } from '../../domain/canvas-project';
import { mapCanvasProjectToResultViewModel } from './canvas-result.mapper';

export function CanvasResultView({ project, user }: { project: CanvasProject; user: AuthUser }) {
  const viewModel = useMemo(() => mapCanvasProjectToResultViewModel(project), [project]);

  return (
    <ResultExperience
      mode="canvas-preview"
      viewModel={viewModel}
      headerTitle={project.title}
      backHref="/canvas"
      closeHref="/canvas"
      backLabel="Voltar ao Canvas"
      headerAccessory={<UserMenu initialUser={user} />}
    />
  );
}
