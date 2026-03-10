/**
 * Registry para callbacks de foto, evitando passar funções pelos params de navegação
 * (que causa warning de valores não-serializáveis).
 */
let pendingCallback: ((uri: string) => void) | null = null;

export const setPhotoCallback = (cb: ((uri: string) => void) | null) => {
  pendingCallback = cb;
};

export const consumePhotoCallback = (): ((uri: string) => void) | null => {
  const cb = pendingCallback;
  pendingCallback = null;
  return cb;
};
