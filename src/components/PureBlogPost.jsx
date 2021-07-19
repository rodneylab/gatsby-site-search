import { MDXProvider } from '@mdx-js/react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { v4 as uuidv4 } from 'uuid';
import { getSimilarWords } from '../utilities/search';
import { isBrowser } from '../utilities/utilities';
import BannerImage from './BannerImage';
import { PureLayout as Layout } from './Layout';
import { ExternalLink, TwitterMessageLink } from './Link';
import { PureSEO as SEO } from './SEO';

const PureBlogPost = ({ children, data }) => {
  const [similarWords, setSimilarWords] = useState([]);
  const { frontmatter, rawBody, slug } = data.post;
  const { bannerImage, featuredImageAlt, seoMetaDescription, postTitle } = frontmatter;
  const { siteUrl } = data.site.siteMetadata;

  let searchTerm = '';
  if (isBrowser) {
    const searchParam = new URLSearchParams(window.location.search.substring(1)).get('s');
    if (searchParam !== null) {
      searchTerm = searchParam;
    }
  }

  useEffect(() => {
    setSimilarWords(getSimilarWords(searchTerm, rawBody));
  }, [searchTerm]);

  const highlightWords = (childrenProp) => {
    const result = [];
    React.Children.forEach(childrenProp, (child) => {
      if (child.props && child.props.children) {
        const newChild = React.cloneElement(child, {
          children: highlightWords(child.props.children),
          key: uuidv4(),
        });
        result.push(newChild);
      } else if (!child.props) {
        const parts = child.split(new RegExp(`(${similarWords.join('|')})`, 'gi'));
        const highlightedChild = parts.map((part) => {
          if (part !== '') {
            if (similarWords.includes(part.toLowerCase())) {
              return (
                <mark className="highlight" key={uuidv4()}>
                  {part}
                </mark>
              );
            }
            return part;
          }
          return null;
        });
        result.push(highlightedChild);
      } else {
        result.push(child);
      }
    });
    return result;
  };

  const shortcodes = {
    ExternalLink,
    Link,
    TwitterMessageLink,
    wrapper:
      searchTerm === '' ? null : ({ children: mdxChildren }) => <>{highlightWords(mdxChildren)}</>,
  };

  useEffect(() => {
    const highlights = document.querySelectorAll('.highlight');
    if (highlights[0]) {
      highlights[0].scrollIntoView(true);
    }
  }, [searchTerm, shortcodes]);

  return (
    <>
      <SEO data={data} title={postTitle} metadescription={seoMetaDescription} />
      <Helmet>
        <link rel="canonical" href={`${siteUrl}/${slug}`} />
      </Helmet>
      <Layout data={data}>
        <article>
          <h1>{postTitle}</h1>
          <BannerImage imageData={bannerImage} alt={featuredImageAlt} />
          <section itemProp="articleBody">
            <MDXProvider components={shortcodes}>{children}</MDXProvider>
          </section>
        </article>
      </Layout>
    </>
  );
};

PureBlogPost.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        siteUrl: PropTypes.string,
      }),
    }),
    post: PropTypes.shape({
      rawBody: PropTypes.string,
      slug: PropTypes.string,
      frontmatter: PropTypes.shape({
        postTitle: PropTypes.string,
        featuredImageAlt: PropTypes.string,
        seoMetaDescription: PropTypes.string,
        bannerImage: PropTypes.shape({
          localFile: PropTypes.shape({
            childImageSharp: PropTypes.shape({
              gatsbyImageData: PropTypes.shape({
                layout: PropTypes.string,
              }),
            }),
          }),
        }).isRequired,
      }),
    }),
  }).isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export { PureBlogPost as default };
