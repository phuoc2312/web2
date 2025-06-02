import React, { useState } from 'react';
import { useParams, useNotify, useRedirect } from 'react-admin';
import axios from 'axios';
import './css/BlogPostImageUpdate.css'; // Tạo tệp CSS tương tự ProductImageUpdate.css

const BlogPostImageUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const notify = useNotify();
  const redirect = useRedirect();
  const token = localStorage.getItem('jwt-token');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      notify('Vui lòng chọn một tệp hình ảnh.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      await axios.put(`http://localhost:8080/api/admin/blogs/${id}/image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      notify('Cập nhật hình ảnh thành công.');
      redirect('/BlogPosts');
    } catch (error) {
      notify('Lỗi khi cập nhật hình ảnh.');
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h2>Cập nhật hình ảnh cho bài viết {id}</h2>
      <div className="image-preview">
        {preview ? (
          <img src={preview} alt="Image preview" className="preview-img" />
        ) : (
          <p>Chưa có hình ảnh</p>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file-input"
      />
      <button onClick={handleUpload} className="upload-button">Cập nhật</button>
    </div>
  );
};

export default BlogPostImageUpdate;