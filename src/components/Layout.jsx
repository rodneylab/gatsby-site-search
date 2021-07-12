import dayjs from 'dayjs';
import { graphql, Link, navigate } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';
import PropTypes from 'prop-types';
import React from 'react';
import { COPYRIGHT_ENTITY } from '../constants/entities';
import {
  CameraIcon,
  FacebookIcon,
  GithubIcon,
  LinkedinIcon,
  SearchIcon,
  TwitterIcon,
} from './Icons';
import {
  container,
  footerContainer,
  footerIcons,
  headerContainer,
  hoverJump,
  logo,
  mainContainer,
  nav,
} from './Layout.module.scss';
import { ExternalLink } from './Link';

const FooterIcons = ({
  siteMetadata: { facebookPage, githubPage, linkedinProfile, twitterUsername },
}) => (
  <div className={footerIcons}>
    <ul>
      <li className={hoverJump}>
        <ExternalLink
          aria-label="Go to the Rodney Lab Facebook page"
          href={facebookPage}
          showExternalIcon={false}
        >
          <FacebookIcon />
        </ExternalLink>
      </li>
      <li className={hoverJump}>
        <ExternalLink
          aria-label="Go to the Rodney Lab Twitter page"
          href={`https://twitter.com/intent/user?screen_name=${twitterUsername.slice(1)}`}
          showExternalIcon={false}
        >
          <TwitterIcon />
        </ExternalLink>
      </li>
      <li className={hoverJump}>
        <ExternalLink
          aria-label="Go to the Rodney Lab Linked In page"
          href={`https://uk.linkedin.com/in/${linkedinProfile}`}
          showExternalIcon={false}
        >
          <LinkedinIcon />
        </ExternalLink>
      </li>
      <li className={hoverJump}>
        <ExternalLink
          aria-label="Go to the Rodney Lab Git Hub page"
          href={`https://github.com/${githubPage}`}
          showExternalIcon={false}
        >
          <GithubIcon />
        </ExternalLink>
      </li>
    </ul>
  </div>
);

FooterIcons.propTypes = {
  siteMetadata: PropTypes.shape({
    facebookPage: PropTypes.string,
    githubPage: PropTypes.string,
    linkedinProfile: PropTypes.string,
    twitterUsername: PropTypes.string,
  }).isRequired,
};

const RodneyLabCredit = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      color: '#032539',
      fontFamily: 'Lato',
    }}
  >
    A project by{' '}
    <span style={{ display: 'flex', alignItems: 'center' }}>
      <a
        className={hoverJump}
        aria-label="Open Rodney Lab site"
        href="https://rodneylab.com"
        rel="noopener"
        style={{ display: 'flex', alignItems: 'center', margin: '0 0.25rem' }}
      >
        <StaticImage
          alt="Rodney Lab logo"
          src="../images/rodneylab-logo.png"
          layout="fixed"
          width={16}
          height={16}
          tracedSVGOptions={{
            color: '#1c768f',
            background: '#ffffff',
          }}
        />
      </a>{' '}
      <a aria-label="Open Rodney Lab site" href="https://rodneylab.com" rel="noopener">
        <span style={{ fontWeight: 300 }}>RODNEY LAB</span>
      </a>
      .
    </span>
  </div>
);

export const PureLayout = ({ children, data: { site }, hideSearch }) => {
  const { buildTime, siteMetadata } = site;
  const copyrightYear = dayjs(buildTime).format('YYYY');

  return (
    <div className={container}>
      <header className={headerContainer}>
        <Link aria-label="Jump to home page" to="/" className={hoverJump}>
          <span className={logo}>
            <CameraIcon />
          </span>
        </Link>
        <nav className={nav}>
          <ul>
            <li>
              <Link aria-label="Jump to home page" to="/">
                Home
              </Link>
            </li>
            <li>
              <Link aria-label="Jump to contact page" to="/contact/">
                Contact
              </Link>
            </li>
            {!hideSearch ? (
              <li>
                <button
                  type="button"
                  className={hoverJump}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate('/?s=');
                  }}
                >
                  <SearchIcon />
                </button>
              </li>
            ) : null}
          </ul>
        </nav>
      </header>
      <main className={mainContainer}>{children}</main>
      <footer className={footerContainer}>
        <div>
          Created by{' '}
          <a aria-label="Open Rodney Lab Site" href="https://rodneylab.com" rel="noopener">
            Rodney Lab
          </a>
          .{` Copyright ${COPYRIGHT_ENTITY} ${copyrightYear}.`}
        </div>
        <FooterIcons siteMetadata={siteMetadata} />
        <RodneyLabCredit />
      </footer>
    </div>
  );
};

PureLayout.defaultProps = {
  hideSearch: false,
};

PureLayout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  data: PropTypes.shape({
    site: PropTypes.shape({
      buildTime: PropTypes.string,
      siteMetadata: PropTypes.shape({
        facebookPage: PropTypes.string,
        githubPage: PropTypes.string,
        linkedinProfile: PropTypes.string,
        twitterUsername: PropTypes.string,
      }),
    }),
  }).isRequired,
  hideSearch: PropTypes.bool,
};

export const query = graphql`
  fragment LayoutFragment on Site {
    buildTime
    siteMetadata {
      facebookPage
      githubPage
      linkedinProfile
      twitterUsername
    }
  }
`;

const Layout = ({ children }) => <PureLayout>{children}</PureLayout>;

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export { Layout as default };
