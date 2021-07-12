import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import BlogRoll from '../components/BlogRoll';
import Card from '../components/Card';
import { PureLayout as Layout } from '../components/Layout';
import Search from '../components/Search';
import { PureSEO as SEO } from '../components/SEO';
import { isBrowser } from '../utilities/utilities';

export default function Home({ data, pageContext }) {
  const { allPosts } = pageContext.postData;
  if (isBrowser) {
    const searchParam = new URLSearchParams(window.location.search.substring(1)).get('s');
    if (searchParam !== null) {
      return (
        <>
          <Layout data={data} hideSearch>
            <Search data={data} posts={allPosts} />
          </Layout>
        </>
      );
    }
  }
  return (
    <>
      <SEO
        data={data}
        title="Home"
        metadescription="Climate - Gatsby v3 MDX Blog Starter - starter code by Rodney Lab to help you get going on your next blog site"
      />
      <Layout data={data}>
        <>
          <header>
            <h1>Climate &mdash; Gatsby 3 Starter</h1>
            <h2>Gatsby 3 Starter for MDX Blog Sites</h2>
          </header>
          <Card>
            <h2>About me</h2>
            <p>
              I live and breathe analogue photography. I show you my favourite analogue film cameras
              on this site. Hopefully if you are not into analogue photography yet, some of my
              enthusiasm will rub off onto you.
            </p>
          </Card>
          <BlogRoll />
        </>
      </Layout>
    </>
  );
}

Home.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      buildTime: PropTypes.string,
    }),
  }).isRequired,
  pageContext: PropTypes.shape({
    postData: PropTypes.shape({
      allPosts: PropTypes.arrayOf(
        PropTypes.shape({
          categories: PropTypes.arrayOf(PropTypes.string),
          featuredImageAlt: PropTypes.string,
          postTitle: PropTypes.string,
          seoMetaDescription: PropTypes.string,
          tags: PropTypes.arrayOf(PropTypes.string),
        }),
      ),
    }),
  }).isRequired,
};

export const query = graphql`
  query Home {
    site {
      ...LayoutFragment
      ...SEOFragment
    }
    ...BlogRollFragment
  }
`;
