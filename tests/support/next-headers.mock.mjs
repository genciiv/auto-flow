let currentHeaders = new Headers();

export async function headers() {
  return currentHeaders;
}

export function setMockHeaders(values = {}) {
  currentHeaders = new Headers(values);
}

export function resetMockHeaders() {
  currentHeaders = new Headers();
}
