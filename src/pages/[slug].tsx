import { type NextPage } from "next";
import Head from "next/head";

const ProfilView: NextPage = () => {
  return (
    <>
      <Head>
        <title>게시글</title>
        <meta name="description" content="게시글 자세히보기" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div>Profile View</div>
      </main>
    </>
  );
};

export default ProfilView;
