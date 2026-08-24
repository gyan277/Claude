export interface OfficialResponse {
  text: string;
  respondedBy: string;
  respondedAt: string;
}

const STORAGE_KEY = 'dodow-amanmuo:official-responses';

function readAll(): Record<string, OfficialResponse> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, OfficialResponse>) : {};
  } catch {
    return {};
  }
}

export function getOfficialResponse(policyId: string): OfficialResponse | null {
  return readAll()[policyId] ?? null;
}

export function setOfficialResponse(policyId: string, response: OfficialResponse): void {
  const all = readAll();
  all[policyId] = response;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function listOfficialResponses(): Record<string, OfficialResponse> {
  return readAll();
}
