export async function onRequest(context) {
  const { request, params } = context;
  const slug = params.slug || 'unknown';
  const urlObj = new URL(request.url);

  // 1. Tentukan URL Server 2 API Anda
  const apiEndpoint = `https://api.primestrategygh.pages.dev/api/endpoint?slug=${slug}&format=json`;

  let appData = {
    title: `Download ${slug.replace(/[-]/g, ' ').toUpperCase()} Versi Terbaru`,
    description: `Halaman resmi AMP untuk pengunduhan aplikasi ${slug} dengan cepat dan aman.`,
    download_link: `https://primestrategygh.com/store/apps/details/${slug}`
  };

  // 2. Fetch data secara real-time dari Server 2 API
  try {
    const apiRes = await fetch(apiEndpoint);
    if (apiRes.ok) {
      const jsonRes = await apiRes.json();
      if (jsonRes && jsonRes.data) {
        appData.title = jsonRes.data.title || appData.title;
        appData.description = jsonRes.data.description || appData.description;
        appData.download_link = jsonRes.data.download_link || appData.download_link;
      }
    }
  } catch (e) {
    // Jika API gagal dijangkau, gunakan fallback data di atas
  }

  // Canonical URL wajib menunjuk ke server utama (Server 1)
  const canonicalUrl = `https://primestrategygh.com/store/apps/details/${slug}`;

  // 3. Ambil template layout AMP dari folder public
  const templateUrl = `${urlObj.origin}/templates/amp-layout.html`;
  let htmlTemplate = '<h1>AMP Error Template</h1>';

  try {
    const templateRes = await fetch(templateUrl);
    if (templateRes.ok) {
      htmlTemplate = await templateRes.text();
    }
  } catch (e) {
    // Fallback error html
  }

  // 4. Inject data dinamis ke template AMP
  const finalAmpHtml = htmlTemplate
    .replace(/\{\{TITLE\}\}/g, appData.title)
    .replace(/\{\{DESCRIPTION\}\}/g, appData.description)
    .replace(/\{\{CANONICAL_URL\}\}/g, canonicalUrl)
    .replace(/\{\{DOWNLOAD_LINK\}\}/g, appData.download_link);

  return new Response(finalAmpHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600" // Cache kuat di Cloudflare Edge untuk bot Google
    }
  });
}
