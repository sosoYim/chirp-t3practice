import { api } from "@/utils/api";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import { PageLayout } from "@/components/layout";
import Image from "next/image";
import { LoadingPage } from "@/components/loading";
import { PostView } from "@/components/postview";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading) return <LoadingPage />;
  if (!data || !data.length) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilView: NextPage<{ username: string }> = ({ username }) => {
  // isLoading이 없음 => getStaticProps에서 캐시된 값을 사용한다.
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  console.log(data);
  return (
    <>
      <Head>
        <title>{data.username}</title>
        <meta name="description" content="프로필 자세히보기" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="relative h-48 bg-slate-600">
          <Image
            src={data.profilePicture}
            alt={`${data.username ?? ""}'s profile`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? ""
        }`}</div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

// serversideprops는 캐시되지 않는다. 타입정의도 클라이언트에 다시 해줘야 한다. 클라이언트에서 또 로딩해야한다?
// 페이지가 열리기 전에 서버 정보를 받아오게 하는 팁 => getStaticProps에서 createServerSideHelpers를 이용하여 프리패치한다.
export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: { trpcState: ssg.dehydrate(), username },
  };
};

// statis props를 사용하려면 패스를 정의해야한다.
export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilView;
