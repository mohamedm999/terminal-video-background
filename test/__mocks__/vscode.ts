export const workspace = {
  workspaceFolders: undefined,
  getConfiguration: () => ({
    get: (key: string, defaultValue: unknown) => defaultValue,
    update: async () => {},
    inspect: (key: string) => ({
      key: `terminalVideo.${key}`,
      defaultValue: undefined,
      globalValue: undefined,
      workspaceValue: undefined,
    }),
  }),
  onDidChangeConfiguration: () => ({ dispose: () => {} }),
  onDidChangeWorkspaceFolders: () => ({ dispose: () => {} }),
};

export const window = {
  showInformationMessage: async () => undefined,
  showWarningMessage: async () => undefined,
  showErrorMessage: async () => undefined,
  showOpenDialog: async () => undefined,
  createOutputChannel: () => ({
    appendLine: () => {},
    show: () => {},
    dispose: () => {},
  }),
  onDidChangeWindowState: () => ({ dispose: () => {} }),
};

export const commands = {
  registerCommand: () => ({ dispose: () => {} }),
  executeCommand: async () => {},
};

export const env = {
  clipboard: {
    writeText: async () => {},
  },
};

export const ConfigurationTarget = {
  Global: 1,
  Workspace: 2,
  WorkspaceFolder: 3,
};
