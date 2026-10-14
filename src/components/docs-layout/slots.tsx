'use client';
import type { ComponentProps } from 'react';
import { useTreePath } from 'fumadocs-ui/contexts/tree';
import { SidebarProvider, SidebarTrigger, useSidebar } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { cn } from '@/lib/cn';
import { nodeText } from '@/lib/docs-nav';
import { ConsoleTopBar, type TopBarTarget } from '@/components/console/top-bar';
import { ReleaseStatusBar, type StatusBarTarget } from '@/components/console/status-bar';
import { PathCrumbs, type Crumb } from '@/components/console/path-crumbs';
import { ConsoleRail, DRAWER_ID } from './rail';

function useDocsCrumbs(): Crumb[] {
  const path = useTreePath();
  const crumbs: Crumb[] = [{ label: 'Docs', href: '/docs' }];
  for (const node of path) {
    if (node.type === 'folder') crumbs.push({ label: nodeText(node.name) });
    else if (node.type === 'page') crumbs.push({ label: nodeText(node.name), href: node.url });
  }
  return crumbs;
}

export interface ConsoleSlotHandlers {
  onTopBarLink?: (target: TopBarTarget) => void;
  onStatusBarLink?: (target: StatusBarTarget) => void;
}

/** DocsLayout slots for Design B: Console shell grid, top bar + path chips, icon rail / drawer, release status bar. */
export function createConsoleSlots({ onTopBarLink, onStatusBarLink }: ConsoleSlotHandlers = {}): DocsLayoutProps['slots'] {
  function Container({ children, className, ...props }: ComponentProps<'div'>) {
    return (
      <div id="nd-docs-layout" {...props} className={cn('console-grid', className)}>
        <a href="#nd-page" className="console-skip-link">
          Skip to content
        </a>
        {children}
        <ReleaseStatusBar className="[grid-area:status]" onLinkClick={onStatusBarLink} />
      </div>
    );
  }

  function Header() {
    const crumbs = useDocsCrumbs();
    const { open, setOpen } = useSidebar();
    return (
      <>
        <ConsoleTopBar
          chip="Docs"
          className="[grid-area:header]"
          center={<PathCrumbs items={crumbs} />}
          menu={{ open, onToggle: () => setOpen(!open), controls: DRAWER_ID }}
          onLinkClick={onTopBarLink}
        />
        <div className="overflow-x-auto border-b border-seam-soft px-5 py-3 [grid-area:crumbs] lg:hidden">
          <PathCrumbs items={crumbs} />
        </div>
      </>
    );
  }

  return {
    container: Container,
    header: Header,
    sidebar: { provider: SidebarProvider, root: ConsoleRail, trigger: SidebarTrigger, useSidebar },
  };
}
