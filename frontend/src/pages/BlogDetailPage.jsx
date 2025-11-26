import { useEffect, useState } from "react";
import { fetchPostById } from "../api/blogApi";
import { useParams } from "react-router-dom";

function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPostById(id);
        setPost(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-slate-600">
        Loading...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center py-10 text-red-600">
        Post not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{post.title}</h1>

      <p className="text-slate-500 text-sm mt-2">
        {new Date(post.created_at).toLocaleDateString()} — {post.author_name}
      </p>

      {post.featured_image && (
        <img
          src={post.featured_image}
          alt={post.title}
          className="w-full rounded-xl my-6"
        />
      )}

      {/* Content supports HTML (rich text) */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      ></div>
    </div>
  );
}

export default BlogDetailPage;
