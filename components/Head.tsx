import NextHead from 'next/head'
import { SEO } from '../constants'
interface Props {
  title?: string
  pageUrl?: string
  description?: string
}

export const Head = ({
  title,
  pageUrl,
  description,
}: // mainImage,
// iosApplink,
// androidAppLink,
Props) => {
  const metaName = {
    author: SEO.author,
    robots: 'index,follow',
    viewport: 'width=device-width, initial-scale=1',
    description: description || SEO.description,
    'theme-color': '#202124',
    'naver-site-verification': '',
    'msapplication-TileColor': '#202124',
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'google-site-verification': 'verification_token',
  }

  const metaProperty = {
    // 'fb:app_id': SEO.fbAppId,
    'article:author': SEO.author,
    // 'al:web:url': SEO.quizBuzzHomeUrl,
    // 'al:ios:url': iosApplink || SEO.quizBuzzHomeUrl,
    // 'al:ios:app_name': SEO.appName,
    // 'al:ios:app_store_id': SEO.appstoreId,
    // 'al:android:url': androidAppLink || SEO.quizBuzzHomeUrl,
    // 'al:android:package': SEO.androidPackageId,
    // 'al:android:app_name': SEO.appName,
    'og:url': pageUrl || SEO.siteUrl,
    'og:type': 'website',
    'og:title': title || SEO.title,
    // 'og:image': mainImage || SEO.mainImage,
    'og:locale': 'en_GB',
    'og:site_name': title || SEO.title,
    'og:description': description || SEO.description || '',
  }

  const hrefFavIcon = (size) => `/icons/favicon-${size}x${size}.png`
  const hrefAppleIcon = (size) => `/icons/apple-icon-${size}x${size}.png`
  const sizesFavIcon = [16, 32, 96]
  const sizesAppleIcon = [57, 60, 72, 76, 114, 120, 144, 152, 180]

  return (
    <NextHead>
      <title>{title || SEO.title}</title>
      <meta charSet="utf-8" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />

      <base href={process.env.WEBAPP_URL} />
      <link href={pageUrl || SEO.siteUrl} rel="canonical" />
      <link href="manifest.json" rel="manifest" />

      {Object.keys(metaName).map((name, i) => (
        <meta key={i} name={name} content={metaName[name]} />
      ))}
      {Object.keys(metaProperty).map((property, i) => (
        <meta key={i} property={property} content={metaProperty[property]} />
      ))}

      {/* created from https://www.favicon-generator.org */}
      {sizesFavIcon.map((size, i) => (
        <link
          key={i}
          sizes={`${size}x${size}`}
          href={hrefFavIcon(size)}
          rel="icon"
          type="image/png"
        />
      ))}
      {sizesAppleIcon.map((size, i) => (
        <link
          key={i}
          sizes={`${size}x${size}`}
          href={hrefAppleIcon(size)}
          rel="apple-touch-icon"
        />
      ))}

      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/icons/android-icon-192x192.png"
      />
    </NextHead>
  )
}
