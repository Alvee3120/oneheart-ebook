import { useEffect, useState } from "react";
import { fetchPosts } from "../api/blogApi";
import { Link } from "react-router-dom";

function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchPosts();

        // 🔹 If DRF pagination is enabled: data.results is the array
        if (Array.isArray(data)) {
          setPosts(data);
        } else if (Array.isArray(data.results)) {
          setPosts(data.results);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load blog posts.");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-slate-600">
        Loading blog posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-10 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Blog</h1>

      {posts.length === 0 ? (
        <p className="text-slate-500">No posts available.</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              to={`/blog/${post.id}`}
              key={post.id}
              className="block bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition p-5"
            >
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-56 object-cover rounded-lg mb-4"
                />
              )}

              <h2 className="text-xl font-semibold text-slate-900">
                {post.title}
              </h2>

              <p className="text-slate-500 text-sm mt-1">
                {post.created_at
                  ? new Date(post.created_at).toLocaleDateString()
                  : ""}
              </p>

              <p className="text-slate-700 mt-3">{post.summary}</p>

              <p className="text-sky-600 font-medium mt-3">Read more →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogListPage;
