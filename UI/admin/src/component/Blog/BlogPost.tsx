import {
  List,
  Datagrid,
  TextField,
  DateField,
  ImageField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  Show,
  SimpleShowLayout,
  SimpleForm,
  TextInput,
  DateInput,
  required,
  minLength,
  email,
  useRecordContext,
  usePermissions,
} from "react-admin";
import { Link as RouterLink } from "react-router-dom";
import { useState } from 'react';
import { useNotify } from 'react-admin';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  image: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
}

const CustomImageField = ({ source }: { source: string }) => {
  const record = useRecordContext<BlogPost>();
  if (!record || !record[source]) {
    return <span>Chưa có hình ảnh</span>;
  }
  return (
    <RouterLink to={`/BlogPosts/${record.id}/update-image`}>
      <img src={record[source]} alt="Blog Post" style={{ width: "100px", height: "auto" }} />
    </RouterLink>
  );
};

const blogPostFilters = [
  <TextInput key="search" source="title" label="Tìm kiếm tiêu đề" alwaysOn />,
  <TextInput key="authorEmail" source="authorEmail" label="Tìm kiếm email tác giả" />,
];

export const BlogPostList = () => {
  const { permissions } = usePermissions();

  return (
    <List
      title="Blogs"
      filters={blogPostFilters}
      perPage={10}
      sort={{ field: "createdAt", order: "DESC" }}
      sx={{
        '& .RaList-content': {
          boxShadow: 'none',
        },
      }}
    >
      <Datagrid
        rowClick="edit"
        sx={{
          '& .RaDatagrid-headerCell': {
            fontWeight: 'bold',
          },
        }}
      >
        <TextField source="id" label="ID" />
        <TextField source="title" label="Tiêu đề" />
        <TextField source="authorEmail" label="Tác giả" />
        <CustomImageField source="image" label="Hình ảnh" />
        <DateField
          source="createdAt"
          label="Ngày tạo"
          locales="vi-VN"
          showTime
          options={{
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }}
        />
        {permissions === "ADMIN" && (
          <>
            <EditButton label="" sx={{ '& svg': { color: 'primary.main' } }} />
            <DeleteButton label="" sx={{ '& svg': { color: 'error.main' } }} />
          </>
        )}
      </Datagrid>
    </List>
  );
};

export const BlogPostCreate = () => {
  const notify = useNotify();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const transformData = (data: any) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('authorEmail', data.authorEmail);
    if (file) {
      formData.append('image', file);
    }
    return formData;
  };

  return (
    <Create title="Tạo bài viết mới" transform={transformData}>
      <SimpleForm>
        <TextInput
          source="title"
          label="Tiêu đề"
          validate={[required(), minLength(5)]}
          fullWidth
        />
        <TextInput
          source="content"
          label="Nội dung"
          multiline
          rows={10}
          validate={[required(), minLength(20)]}
          fullWidth
        />
        <TextInput
          source="authorEmail"
          label="Email tác giả"
          validate={[required(), email()]}
          fullWidth
        />


      </SimpleForm>
    </Create>
  );
};

export const BlogPostEdit = () => {
  const notify = useNotify();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const record = useRecordContext<BlogPost>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));

    }
  };

  const transformData = (data: any) => {
    console.log('Transformed data:', data, 'File:', file); // Ghi log dữ liệu
    if (!data.title || !data.content || !data.authorEmail) {
      notify('Vui lòng điền đầy đủ tiêu đề, nội dung và email tác giả.', { type: 'error' });
      throw new Error('Thiếu các trường bắt buộc');
    }
    if (data.content.length < 20) {
      notify('Nội dung phải có ít nhất 20 ký tự.', { type: 'error' });
      throw new Error('Nội dung không hợp lệ');
    }
    const updateData = {
      title: data.title,
      content: data.content,
      authorEmail: data.authorEmail,
    };
    if (file) {
      updateData.image = file;
    }
    return updateData;
  };

  return (
    <Edit title="Chỉnh sửa bài viết" transform={transformData}>
      <SimpleForm>
        <TextInput source="id" label="ID" disabled />
        <TextInput
          source="title"
          label="Tiêu đề"
          validate={[required('Tiêu đề là bắt buộc'), minLength(5, 'Tiêu đề phải có ít nhất 5 ký tự')]}
          fullWidth
        />
        <TextInput
          source="content"
          label="Nội dung"
          multiline
          rows={10}
          validate={[required('Nội dung là bắt buộc'), minLength(20, 'Nội dung phải có ít nhất 20 ký tự')]}
          fullWidth
        />
       
        <TextInput
          source="authorEmail"
          label="Email tác giả"
          validate={[required('Email là bắt buộc'), email('Email không hợp lệ')]}
          fullWidth
        />
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="image-upload"
            style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
          >
            Chọn hình ảnh (tùy chọn):
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'block' }}
          />
          {preview ? (
            <div style={{ marginTop: '16px' }}>
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd' }}
              />
            </div>
          ) : record?.image ? (
            <div style={{ marginTop: '16px' }}>
              <img
                src={record.image}
                alt="Current"
                style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd' }}
              />
              <p style={{ fontSize: '0.8rem', color: '#666' }}>Ảnh hiện tại</p>
            </div>
          ) : (
            <p>Chưa có hình ảnh</p>
          )}

        </div>
        <DateField
          source="createdAt"
          label="Ngày tạo"
          locales="vi-VN"
          options={{ year: 'numeric', month: '2-digit', day: '2-digit' }}
        />
        <DateField
          source="updatedAt"
          label="Ngày cập nhật"
          locales="vi-VN"
          options={{ year: 'numeric', month: '2-digit', day: '2-digit' }}
        />
      </SimpleForm>
    </Edit>
  );
};

export const BlogPostShow = () => (
  <Show title="Chi tiết bài viết">
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="title" label="Tiêu đề" />
      <TextField source="content" label="Nội dung" />
      <ImageField source="image" label="Hình ảnh" />
      <TextField source="authorEmail" label="Email tác giả" />
      <DateField
        source="createdAt"
        label="Ngày tạo"
        locales="vi-VN"
        options={{
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }}
      />
      <DateField
        source="updatedAt"
        label="Ngày cập nhật"
        locales="vi-VN"
        options={{
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }}
      />
    </SimpleShowLayout>
  </Show>
);