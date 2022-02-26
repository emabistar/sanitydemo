
import React, { useState } from 'react'
import Header from '../../Components/Header'
import sanityClient from '../../client'
import { Post } from '../../typings'
import { GetStaticProps } from 'next'
import imageUrlBuilder from '@sanity/image-url'
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from "react-hook-form";


const builder = imageUrlBuilder(sanityClient)
function urlFor(source: any) {
    return builder.image(source)
}

interface IFormInput {
    _id: string,
    name: string,
    email: string,
    comment: string,
}
interface Props {
    post: Post;
}
function Post({ post }: Props) {
    // added submitted state false true
    console.log(post)
    const [submited, setSubmited] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IFormInput>();
    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        await fetch('/api/createComment', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(() => {
            //console.log(data)
            setSubmited(true)

        }).catch((err) => {
            console.log(err)
            setSubmited(false)

        })
    };


    return (
        <main>
            <Header />
            <div className="m-5 p-5  ">
                <img className="h-60 w-full object-cover group-hover:scale-105
              transition-transform duration-200  easy-in-out" src={urlFor(post.mainImage).url()!} alt="" />
                <p className="text-2xl font-bold font-light  mx-auto">{post.title}</p>
                <p className="text-xl font-extralight mx-auto">{post.description}</p>

                <div className="flex items-center space-x-2 ">
                    <img className="h-12 w-12 rounded-full    " src={urlFor(post.author.image).url()!} alt="" />
                    <p className="text-sm  ">{post.description}  :by  <span className="font-bold mr-2 text-green-500">{post.author.name}</span>
                        <strong> Published at {new Date(post._createdAt).toLocaleString()} </strong></p>

                </div>
                <div className=" ">

                    <PortableText
                        className="mt-5 space-y-5 md:flex items-center space-x-4     "
                        dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                        projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                        content={post.body}
                        serializers={{
                            h1: (props: any) => (
                                <h1 className="text-2xl font-bold  my-5"{...props} />
                            ),
                            h2: (props: any) => (
                                <h2 className="text-xl font-bold  my-5"{...props} />
                            ),
                            li: ({ children }: any) => (
                                <li className="ml-4 list-disc">{children}</li>
                            ),
                            link: ({ href, children }: any) => (
                                <a href={href} className="text-blue-500 hover:underline">{children}</a>
                            ),

                        }
                        }
                    />

                </div>
                <hr className="max-w-2xl  my-5 mx-auto  border border-yellow-500" />
                {/* Check if the form is submitted show this message othewise */}
                {submited ? (
                    <h2 className="text-center  bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">Thank you your message was submitetd successfully</h2>
                ) : (

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-5 max-w-3xl  mx-auto mb-10">
                        <h3 className="text-green-500"> Emjoyed this article ?</h3>
                        <h4 className="text-2xl font-bold mb-3">Leave a comment below </h4>
                        <input
                            {...register("_id")}
                            type="hidden"
                            name="_id"
                            value={post._id}
                        />
                        <label className="block mb-5 ">
                            <span className="ml-5 ">Name</span>
                            <input
                                {...register("name", { required: true })}
                                className="p-5 ml-5  w-full 
                         shadow border rounded-lg" placeholder="Jhon Doe" type="text" />
                        </label>
                        <label className="block mb-5">
                            <span className="ml-5 ">Email</span>
                            <input
                                {...register("email", { required: true })}
                                className="p-5 
                         ml-5 ring-yellow-500   shadow border rounded-lg  w-full" placeholder="email" type="email" />
                        </label>
                        <label className="block mb-5" >
                            <span className="ml-5 ">Comment</span>
                            <textarea
                                {...register("comment", { required: true })}
                                className="p-5 ml-5 shadow border rounded-lg w-full" placeholder="commet" rows={4} ></textarea>
                        </label>
                        <div className='flex flex-col p-5'>
                            {errors.name && (<span className="text-red-500">-The Name field is required</span>)}
                            {errors.comment && (<span className="text-red-500">-The comment field is required</span>)}
                            {errors.email && (<span className="text-red-500">-The Email field is required</span>)}
                        </div>
                        <input type="submit" className="shadow  w-1/3 ml-5 text-white  px-4 py-6 rounded-lg  itms-center bg-green-500 hover:bg-green-300" />
                    </form>)}
                {/***Comments */}


                <div className="flex flex-col p-10  my-10 max-w-3xl mx-auto shadow-green-300 shadow space-y-2">
                    <h3>Comments</h3>
                    <hr className="pb-2" />
                    {post.comments.map((comment) => (
                        <div key={comment._id}>
                            <p>
                                <span className="text-green-500 mr-2">{comment.name} : </span>
                                {comment.comment}
                            </p>
                        </div>

                    ))}
                </div>



            </div >

        </main >
    );
}

export default Post

export const getStaticPaths = async () => {
    const query = `*[_type == "post"]{
            _id,
            slug {
            current
        }
    }`;

    const posts = await sanityClient.fetch(query);
    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current
        },
    }));
    return {
        paths,
        fallback: "blocking",
    };
};
export const getStaticProps: GetStaticProps = async ({ params }) => {
    const query = `*[_type == "post" && slug.current == $slug][0]{
            _id,
            _createdAt,
            title,
            author -> {
                name,
                image
            },
            'comments':*[
        _type == "comment" && 
        post._ref == ^._id && 
        approved == true],
        description,
        mainImage,
        slug,
        body[]{
            ...,
            asset -> {
                ...,
                "_key": _id
            }
        }
      }`
    const post = await sanityClient.fetch(query, {
        slug: params?.slug,
    });
    if (!post) {
        return {
            notFound: true
        }
    }
    return {
        props: {
            post,
        },
        revalidate: 60,
    }
}



