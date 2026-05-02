import api from '../lib/axios';

export async function getSignedUrl(path: string, bucket = 'Images'): Promise<string> {
  const { data } = await api.get('/upload/signed-url', {
    params: { path, bucket },
  });
  return data.signed_url;
}
