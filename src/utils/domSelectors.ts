export const DOM_SELECTORS = {
  terminal: {
    group: '.terminal-group',
    instance: '.terminal-instance',
    panel: '.part.panel',
    integratedTerminal: '.panel.integrated-terminal',
    xterm: '.xterm',
    viewport: '.xterm-viewport',
    screen: '.xterm-screen',
    container: '.terminal-container',
    tabs: '.terminal-tabs-container',
    tab: '.terminal-tab',
    splitView: '.split-view-view',
  },
  video: {
    container: '#tvb-video-box',
    video: '#tvb-vid',
    style: '#tvb-style',
  },
  workbench: {
    part: '.part',
    editorPart: '.part.editor',
    sidebarPart: '.part.sidebar',
    panelPart: '.part.panel',
    auxiliaryBarPart: '.part.auxiliarybar',
  },
};

export function getTerminalSelectors(): string[] {
  return [
    DOM_SELECTORS.terminal.group,
    DOM_SELECTORS.terminal.instance,
    DOM_SELECTORS.terminal.integratedTerminal,
    DOM_SELECTORS.terminal.panel,
    DOM_SELECTORS.terminal.viewport,
  ];
}

export function getVideoContainerSelector(): string {
  return DOM_SELECTORS.video.container;
}

export function getVideoElementSelector(): string {
  return DOM_SELECTORS.video.video;
}

export function getStyleElementSelector(): string {
  return DOM_SELECTORS.video.style;
}

export function getFallbackTerminalSelector(): string {
  return '[class*="terminal"]';
}
