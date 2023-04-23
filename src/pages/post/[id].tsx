import { api } from "@/utils/api";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import { PageLayout } from "@/components/layout";
import { PostView } from "@/components/postview";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  // isLoading이 없음 => getStaticProps에서 캐시된 값을 사용한다.
  const { data } = api.posts.getById.useQuery({
    id,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
        <meta name="description" content="프로필 자세히보기" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

// serversideprops는 캐시되지 않는다. 타입정의도 클라이언트에 다시 해줘야 한다. 클라이언트에서 또 로딩해야한다?
// 페이지가 열리기 전에 서버 정보를 받아오게 하는 팁 => getStaticProps에서 createServerSideHelpers를 이용하여 프리패치한다.
export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.posts.getById.prefetch({ id });
  return {
    props: { trpcState: ssg.dehydrate(), id },
  };
};

// statis props를 사용하려면 패스를 정의해야한다.
export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
