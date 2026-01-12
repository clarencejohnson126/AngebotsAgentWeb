import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // For MVP, we only support German
  const locale = 'de';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
