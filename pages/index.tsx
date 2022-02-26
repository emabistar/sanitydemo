import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Header from '../Components/Header'
import { Post } from '../typings'
import imageUrlBuilder from '@sanity/image-url'

import sanityClient from '../client'
const builder = imageUrlBuilder(sanityClient)

// Then we like to make a simple function like this that gives the
// builder an image and returns the builder for you to specify additional
// parameters:
function urlFor(source: any) {
  return builder.image(source)
}

interface Props {
  posts: [Post];
}

export default function Home({ posts }: Props) {
  console.log(posts)
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Medium Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="flex justify-between  items-center
       bg-green-400 border-y  border-black py-10 lg:py-0">
        <div className="px-10 space-y-5">
          <h1 className="text-6xl  max-w-xl  font-serif" > <span className="underline">Medium</span> is a place to write, read, and comment</h1>
          <h2>
            It's easy and free to post  your thinking on any topic and connect with millions of reader worlwide.
          </h2>
        </div>

        <img className="hidden md:inline-flex h-32 lg:h-full"
          src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png"
          alt="hero" />

      </div>
      {/* Posts */}
      <div className="grid  grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-3
      md:gap-2 p-2 md:p-2">
        {posts.map((post) => (
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className="px-4 py-5  border rounded-lg  group cursor-pointer overflow-hidden">
              <img className="h-60 w-full object-cover group-hover:scale-105
              transition-transform duration-200  easy-in-out" src={urlFor(post.mainImage).url()!} alt="" />
              <p className="text-2xl font-bold">{post.title}</p>
              <div className="flex ">

                <p className="text-sm">{post.description}  :by  <span className="font-bold">{post.author.name}</span> </p>
                <img className="h-12 w-12 rounded-full   " src={urlFor(post.author.image).url()!} alt="" />
              </div>
            </div>

          </Link>
        ))}
      </div>

    </div>
  )
}
// client.js


import Link from 'next/link'
export const getServerSideProps = async () => {
  const query = `*[_type == "post"]{
    _id,
    title,
    author->{
    name,
    image
  },'comments':*[
    _type == "comment" && 
    post._ref == ^._id && 
    approved == true],
  description,
  mainImage,
  slug,
  
  }`;
  const posts = await sanityClient.fetch(query);
  return {
    props: {
      posts,
    }
  }
};




