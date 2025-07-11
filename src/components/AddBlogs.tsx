import { useEffect, useState } from "react";

const API_BASE = "https://bigwigdigitalbackend.onrender.com";

interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  tags?: string;
  coverImage?: string;
}

const AddBlog = ({
  onClose,
  onSuccess,
  existingBlog = null,
}: {
  onClose: () => void;
  onSuccess: () => void;
  existingBlog?: BlogPost | null;
}) => {
  const [formData, setFormData] = useState({
    title: existingBlog?.title || "",
    slug: existingBlog?.slug || "",
    excerpt: existingBlog?.excerpt || "",
    content: existingBlog?.content || "",
    prompt: "",
    author: existingBlog?.author || "",
    tags: existingBlog?.tags || "",
    coverImage: null as File | null,
  });

  const [useAI, setUseAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingBlog) {
      setFormData({
        title: existingBlog.title,
        slug: existingBlog.slug,
        excerpt: existingBlog.excerpt,
        content: existingBlog.content,
        prompt: "",
        author: existingBlog.author,
        tags: existingBlog?.tags || "",
        coverImage: null,
      });
      setUseAI(false);
    }
  }, [existingBlog]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "title") {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: existingBlog ? prev.slug : autoSlug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, coverImage: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const blogData = new FormData();
    blogData.append("title", formData.title);
    blogData.append("slug", formData.slug);
    blogData.append("excerpt", formData.excerpt);
    blogData.append("author", formData.author);
    blogData.append("tags", formData.tags);

    if (useAI) {
      blogData.append("prompt", formData.prompt);
    } else {
      blogData.append("content", formData.content);
    }

    if (formData.coverImage) {
      blogData.append("coverImage", formData.coverImage);
    }

    try {
      const method = existingBlog ? "PUT" : "POST";
      const endpoint = existingBlog
        ? `${API_BASE}/${existingBlog.slug}`
        : `${API_BASE}/add`;

      const res = await fetch(endpoint, {
        method,
        body: blogData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(
          existingBlog ? "Blog updated successfully" : "Blog added successfully"
        );
        onSuccess();
        onClose();
      } else {
        alert(
          data.error || `Failed to ${existingBlog ? "update" : "add"} blog`
        );
      }
    } catch (err) {
      alert(`Error ${existingBlog ? "updating" : "adding"} blog`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 w-full max-w-2xl rounded-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4">
          {existingBlog ? "Edit Blog" : "Add New Blog"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="w-full p-2 border"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="slug"
            placeholder="Slug"
            className="w-full p-2 border"
            value={formData.slug}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="excerpt"
            placeholder="Excerpt"
            className="w-full p-2 border"
            value={formData.excerpt}
            onChange={handleChange}
            required
          />

          {/* AI toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!useAI}
                onChange={() => setUseAI(false)}
              />
              Write Content Manually
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={useAI}
                onChange={() => setUseAI(true)}
              />
              Generate Using AI
            </label>
          </div>

          {!useAI ? (
            <textarea
              name="content"
              placeholder="Content (HTML supported)"
              className="w-full p-2 border h-32"
              value={formData.content}
              onChange={handleChange}
              required
            />
          ) : (
            <textarea
              name="prompt"
              placeholder="Enter prompt to generate blog content"
              className="w-full p-2 border h-32"
              value={formData.prompt}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="text"
            name="author"
            placeholder="Author"
            className="w-full p-2 border"
            value={formData.author}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            className="w-full p-2 border"
            value={formData.tags}
            onChange={handleChange}
          />
          <input
            type="file"
            accept="image/*"
            className="w-full"
            onChange={handleImageChange}
            required={!existingBlog}
          />

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded ${
                submitting
                  ? "bg-[var(--primary-color)] cursor-not-allowed"
                  : "bg-[var(--primary-color)] hover:opacity-90"
              }`}
              disabled={submitting}
            >
              {submitting
                ? existingBlog
                  ? "Updating..."
                  : "Adding..."
                : existingBlog
                ? "Update"
                : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;
