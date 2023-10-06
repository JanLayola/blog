import request from "graphql-request";
import Head from "next/head";
import Container from "../../components/container";
import Layout from "../../components/layout";
import { AppProvider } from "../../components/contexts/appContext";
import MinimalPosts from "../../components/minimal-posts";
import Footer from "../../components/footer";
import PersonalHeader from "../../components/personal-theme-header";
import {
  Post,
  Publication,
  TagPostsByPublicationDocument,
  TagPostsByPublicationQuery,
  TagPostsByPublicationQueryVariables,
} from "../../generated/graphql";
import addPublicationJsonLd from "@starter-kit/utils/seo/addPublicationJsonLd";
import { getAutogeneratedPublicationOG } from "@starter-kit/utils/social/og";

type Props = {
  posts: Post[];
  publication: Publication;
  tag: string;
};

export default function Tag({ publication, posts, tag }: Props) {
  const title = `#${tag} - ${publication.title}`;

  return (
    <AppProvider publication={publication}>
      <Layout>
        <Head>
          <title>{title}</title>
          <meta property="og:image" content={publication.ogMetaData.image || getAutogeneratedPublicationOG(publication)} />
          <meta property="twitter:image" content={publication.ogMetaData.image || getAutogeneratedPublicationOG(publication)} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(addPublicationJsonLd(publication)) }}
          />
        </Head>
        <Container className="flex flex-col items-stretch max-w-2xl gap-10 px-5 py-10 mx-auto">
          <PersonalHeader />
          <div className="flex flex-col gap-1 pt-5">
             <p className="font-bold uppercase text-slate-500 dark:text-neutral-400">
              Tag
           </p>
             <h1 className="text-4xl font-bold text-slate-900 dark:text-neutral-50">
               #{tag}
             </h1>
          </div>
          {posts.length > 0 && (
            <MinimalPosts context="home" posts={posts} />
          )}
          <Footer />
        </Container>
      </Layout>
    </AppProvider>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const data = await request<
    TagPostsByPublicationQuery,
    TagPostsByPublicationQueryVariables
  >(
    process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT,
    TagPostsByPublicationDocument,
    {
      host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
      first: 20,
      tagSlug: params.slug,
    }
  );

  // Extract the posts data from the GraphQL response
  const publication = data.publication;
  const posts = publication.posts.edges.map((edge) => edge.node);

  return {
    props: {
      posts,
      publication,
      tag: params.slug,
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}