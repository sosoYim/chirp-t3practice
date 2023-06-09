import { type NextPage } from "next";
import Head from "next/head";
import { SignIn, SignInButton, useUser } from "@clerk/nextjs";
import { api } from "@/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "@/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "@/components/layout";
import { PostView } from "@/components/postview";

const CreatePostWizard = () => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const ctx = api.useContext();

  const { mutate: createPost, isLoading: isPosting } =
    api.posts.create.useMutation({
      onSuccess: () => {
        setContent("");
        void ctx.posts.getAll.invalidate();
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to post! Please try again later.");
        }
      },
    });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt={`@${user.username || ""} profil image`}
        className="h-16 w-16 rounded-full"
        width={56}
        height={56}
      />

      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent p-4 outline-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (content !== "") {
              createPost({ content });
            }
          }
        }}
      />

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      {content !== "" && !isPosting && (
        <button onClick={() => createPost({ content })}>Post</button>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  // Clerk, ReactQuery 는 로딩 스테이트가 반대다 (isLoaded, isLoading)
  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {[...data]?.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if user isn't loaded yet
  if (!userLoaded) return <LoadingPage />;

  return (
    <>
      <Head>
        <title>이모지 담벼락</title>
        <meta name="description" content="👾" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="border-b border-slate-400 p-4">
          {isSignedIn ? (
            <div className="flex justify-center">
              {/* <SignOutButton /> */}
              <CreatePostWizard />
            </div>
          ) : (
            <SignInButton />
          )}
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
