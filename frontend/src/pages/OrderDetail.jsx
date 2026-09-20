import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import PresenceDot from "../components/PresenceDot";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleString();
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const fileInputRef = useRef(null);

  async function loadAll() {
    try {
      const [orderData, fileData, commentData] = await Promise.all([
        api.getOrder(orderId),
        api.listFiles(orderId),
        api.listComments(orderId),
      ]);
      setOrder(orderData);
      setFiles(fileData);
      setComments(commentData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
  }, [orderId]);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      await api.uploadFile(orderId, file);
      const fileData = await api.listFiles(orderId);
      setFiles(fileData);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteFile(fileId) {
    try {
      await api.deleteFile(fileId);
      setFiles(files.filter((f) => f.id !== fileId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSendComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSendingComment(true);
    try {
      const newComment = await api.addComment(orderId, commentText);
      setComments([...comments, newComment]);
      setCommentText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingComment(false);
    }
  }

  if (error && !order) return <p className="mx-auto max-w-3xl px-6 py-10 text-amber">{error}</p>;
  if (!order) return <p className="mx-auto max-w-3xl px-6 py-10 text-charcoal/60">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to=".." relative="path" className="text-sm text-charcoal/50 hover:text-amber">Back</Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Order #{order.order_number}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-charcoal/60">
            <span>{order.page_count} page(s) - ${order.payment_amount.toFixed(0)}</span>
            {order.bidder_id && (
              <span className="inline-flex items-center gap-1">
                <PresenceDot userId={order.bidder_id} />
                Bidder: {order.bidder_name}
              </span>
            )}
            {order.writer_name && (
              <span className="inline-flex items-center gap-1">
                <PresenceDot userId={order.writer_id} />
                Writer: {order.writer_name}
              </span>
            )}
          </p>
        </div>
        <span className="whitespace-nowrap rounded-full border border-line px-3 py-1 text-xs capitalize text-charcoal/70">{order.status.replace(/_/g, " ")}</span>
      </div>

      <p className="mt-4 rounded border border-line bg-white/60 p-4 text-sm leading-relaxed text-charcoal/85">{order.instructions}</p>

      {error && <p className="mt-4 rounded border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">{error}</p>}

      <h2 className="mt-8 font-display text-lg text-ink">Files</h2>
      <div className="mt-3 space-y-2">
        {files.length === 0 && <p className="text-sm text-charcoal/60">No files uploaded yet.</p>}
        {files.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded border border-line bg-white/60 px-4 py-3 text-sm">
            <div>
              <a href={api.downloadFileUrl(f.id)} className="text-ink hover:text-amber" target="_blank" rel="noreferrer">{f.original_filename}</a>
              <p className="mt-0.5 text-xs text-charcoal/50">{formatSize(f.file_size)} - uploaded by {f.uploaded_by_name} - {formatTime(f.uploaded_at)}</p>
            </div>
            <button onClick={() => handleDeleteFile(f.id)} className="text-xs text-charcoal/50 hover:text-amber">Delete</button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <input ref={fileInputRef} type="file" onChange={handleFileChange} disabled={uploading} className="text-sm text-charcoal/70 file:mr-3 file:rounded file:border file:border-line file:bg-white/70 file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-amber" />
        {uploading && <p className="mt-1 text-xs text-charcoal/50">Uploading...</p>}
      </div>

      <h2 className="mt-10 font-display text-lg text-ink">Comments</h2>
      <div className="mt-3 space-y-3">
        {comments.length === 0 && <p className="text-sm text-charcoal/60">No comments yet.</p>}
        {comments.map((c) => (
          <div key={c.id} className="rounded border border-line bg-white/60 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="capitalize text-ink">{c.author_name} <span className="text-charcoal/50">({c.author_role})</span></span>
              <span className="text-xs text-charcoal/40">{formatTime(c.created_at)}</span>
            </div>
            <p className="mt-1 text-charcoal/80">{c.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendComment} className="mt-4 flex gap-2">
        <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 rounded border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-amber" />
        <button type="submit" disabled={sendingComment} className="rounded bg-amber px-4 py-2 text-sm text-white hover:bg-amber/90 disabled:opacity-60">{sendingComment ? "Sending..." : "Send"}</button>
      </form>
    </div>
  );
}
