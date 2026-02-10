import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/installation">
            Get Started
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/api"
            style={{marginLeft: '1rem'}}>
            API Reference
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  {
    title: 'Freshness Monitoring',
    description: 'Detect stale data in your pipelines. Get alerts when tables haven\'t updated within your tolerance window.',
  },
  {
    title: 'Volume Anomaly Detection',
    description: 'Catch unexpected row count changes. Automatic baseline calculation with configurable deviation thresholds.',
  },
  {
    title: 'Schema Change Detection',
    description: 'Track column additions, removals, and type changes. Configurable adaptation modes: auto, manual, or alert-only.',
  },
  {
    title: '6 Database Connectors',
    description: 'PostgreSQL, DuckDB, BigQuery, Snowflake, MySQL, and Redshift. All with built-in query validation and timeout protection.',
  },
  {
    title: 'Security by Default',
    description: 'SQL injection protection, error sanitization, circuit breakers, and structured logging built into every connector.',
  },
  {
    title: 'Self-Hosted & MIT Licensed',
    description: 'Run on your own infrastructure. No vendor lock-in. Free forever. Extend with custom connectors and monitors.',
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md padding-vert--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {features.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageInstall() {
  return (
    <section className={styles.install}>
      <div className="container">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <Heading as="h2" className="text--center">Quick Install</Heading>
            <pre className={styles.installCode}>
              <code>pnpm install @freshguard/freshguard-core</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Open source data pipeline freshness monitoring engine">
      <HomepageHeader />
      <main>
        <HomepageInstall />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
