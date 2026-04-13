import axios from 'axios'

export interface ChangeItem {
  selector: string
  original_text: string
  new_text: string
  reason: string
  cro_principle: string
}

export interface PersonalizeResponse {
  session_id: string
  modified_html: string
  changes: ChangeItem[]
  summary: string
  original_url: string
}

// In dev: Vite proxies /api → localhost:8000
// In prod: set VITE_API_BASE_URL to your Railway backend URL
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export async function personalizePage(
  pageUrl: string,
  adFile?: File,
  adUrl?: string,
): Promise<PersonalizeResponse> {
  const formData = new FormData()
  formData.append('page_url', pageUrl)
  if (adFile) formData.append('ad_file', adFile)
  if (adUrl) formData.append('ad_url', adUrl)

  const { data } = await axios.post<PersonalizeResponse>(
    `${API_BASE}/api/personalize`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    },
  )

  return data
}

export function previewUrl(sessionId: string): string {
  return `${API_BASE}/api/preview/${sessionId}`
}
