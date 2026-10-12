import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Modal, Popconfirm, Tag, message } from 'antd';
import { User, Save, Plus, Edit2, Trash2 } from 'lucide-react';
import { profileService } from '../../services/modules/profile/profile.service';
import { MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

const ImagePreview = ({ src, alt, aspectClass }) => {
  const [failedSource, setFailedSource] = useState('');

  useEffect(() => {
    setFailedSource('');
  }, [src]);

  return (
    <div className={`overflow-hidden rounded-md border border-border bg-muted ${aspectClass}`}>
      {src && failedSource !== src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-contain"
          onError={() => setFailedSource(src)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
          <User className="h-5 w-5" />
          <span>{src ? 'Image could not be loaded' : 'No image URL'}</span>
        </div>
      )}
    </div>
  );
};

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { is2FAVerified } = useAuth();
  const [form] = Form.useForm();
  const [focusForm] = Form.useForm();
  const [newTitle, setNewTitle] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [editingFocus, setEditingFocus] = useState(null);
  const profileImageUrl = Form.useWatch('profile', form);
  const heroImageUrl = Form.useWatch('heroimage', form);

  const { data: profile = {}, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
  });

  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      form.setFieldsValue(profile);
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (values) => profileService.updateProfile(profile?.id, values),
    onSuccess: () => {
      message.success('Master profile updated');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err) => message.error(err.message || 'Update failed'),
  });

  const addTitleMutation = useMutation({
    mutationFn: (title) => profileService.addTypewriterTitle(profile?.id, title),
    onSuccess: () => {
      message.success('Typewriter title added');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setNewTitle('');
    },
    onError: (err) => message.error(err.message || 'Failed to add title'),
  });

  const deleteTitleMutation = useMutation({
    mutationFn: (id) => profileService.deleteTypewriterTitle(id),
    onSuccess: () => {
      message.success('Typewriter title deleted');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err) => message.error(err.message || 'Deletion failed'),
  });

  const addInterestMutation = useMutation({
    mutationFn: (interest) => profileService.addInterest(profile?.id, interest),
    onSuccess: () => {
      message.success('Interest added');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setNewInterest('');
    },
    onError: (err) => message.error(err.message || 'Failed to add interest'),
  });

  const deleteInterestMutation = useMutation({
    mutationFn: (id) => profileService.deleteInterest(id),
    onSuccess: () => {
      message.success('Interest deleted');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err) => message.error(err.message || 'Deletion failed'),
  });

  const saveFocusMutation = useMutation({
    mutationFn: (values) => profileService.upsertAboutFocus({
      id: editingFocus?.id || `${values.label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      profile_id: profile?.id,
      label: values.label,
      title: values.title,
      description: values.description,
    }),
    onSuccess: () => {
      message.success(editingFocus ? 'Focus card updated' : 'Focus card added');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsFocusModalOpen(false);
      setEditingFocus(null);
      focusForm.resetFields();
    },
    onError: (err) => message.error(err.message || 'Focus card save failed'),
  });

  const deleteFocusMutation = useMutation({
    mutationFn: (id) => profileService.deleteAboutFocus(id),
    onSuccess: () => {
      message.success('Focus card deleted');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err) => message.error(err.message || 'Focus card deletion failed'),
  });

  const openFocusModal = (item = null) => {
    setEditingFocus(item);
    focusForm.setFieldsValue(item || { label: '', title: '', description: '' });
    setIsFocusModalOpen(true);
  };

  const saveFocus = async () => {
    try {
      saveFocusMutation.mutate(await focusForm.validateFields());
    } catch {
      // Form validation error
    }
  };

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      updateProfileMutation.mutate(values);
    } catch {
      // Form error
    }
  };

  return (
    <div>
      <PageHeader
        title="Master Profile & Identity"
        subtitle="Manage master profile records, typewriter rotation titles, and interests"
        metrics={[
          <MetricTile
            key="name"
            label="Profile Name"
            value={profile?.name || '—'}
            icon={User}
            subtext={profile?.designation || 'Active user'}
          />,
        ]}
        actions={
          <Button
            type="primary"
            icon={<Save className="w-4 h-4 inline mr-1" />}
            disabled={!is2FAVerified}
            loading={updateProfileMutation.isPending}
            onClick={handleSaveProfile}
          >
            Save Profile
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info (2 Cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-md p-6">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border">
            Personal & Professional Details
          </h2>
          <Form form={form} layout="vertical" disabled={isLoading}>
            <div className="mb-4">
              <p className="text-xs font-semibold text-foreground mb-3">Profile Images</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_96px] items-start gap-3">
                  <Form.Item
                    name="profile"
                    label="Profile Image CDN URL"
                    rules={[{ type: 'url', message: 'Enter a valid image URL' }]}
                    className="mb-0 min-w-0"
                  >
                    <Input type="url" placeholder="https://cdn.example.com/profile.jpg" />
                  </Form.Item>
                  <ImagePreview
                    src={profileImageUrl}
                    alt="Profile image preview"
                    aspectClass="aspect-square w-24"
                  />
                </div>
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_96px] items-start gap-3">
                  <Form.Item
                    name="heroimage"
                    label="Hero Image CDN URL"
                    rules={[{ type: 'url', message: 'Enter a valid image URL' }]}
                    className="mb-0 min-w-0"
                  >
                    <Input type="url" placeholder="https://cdn.example.com/hero.jpg" />
                  </Form.Item>
                  <ImagePreview
                    src={heroImageUrl}
                    alt="Hero image preview"
                    aspectClass="aspect-square w-24"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input placeholder="Haider Ali" />
              </Form.Item>
              <Form.Item name="designation" label="Designation / Title" rules={[{ required: true }]}>
                <Input placeholder="Lead Systems Architect" />
              </Form.Item>
            </div>
            <Form.Item name="description" label="Biography / Summary">
              <Input.TextArea rows={3} placeholder="Full engineering bio..." />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="email" label="Contact Email">
                <Input placeholder="haider@..." />
              </Form.Item>
              <Form.Item name="phone" label="Phone Number">
                <Input placeholder="+1..." />
              </Form.Item>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Form.Item name="github" label="GitHub URL">
                <Input placeholder="https://github.com/..." />
              </Form.Item>
              <Form.Item name="linkedin" label="LinkedIn URL">
                <Input placeholder="https://linkedin.com/in/..." />
              </Form.Item>
              <Form.Item name="resumeurl" label="Resume URL">
                <Input placeholder="https://..." />
              </Form.Item>
            </div>
          </Form>
        </div>

        {/* Child Relational Managers (1 Col) */}
        <div className="space-y-6">
          {/* Typewriter Titles */}
          <div className="bg-card border border-border rounded-md p-5">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Typewriter Titles ({profile?.profile_typewriter_titles?.length || 0})
            </h2>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {profile?.profile_typewriter_titles?.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded bg-muted text-xs">
                  <span className="font-mono">{t.title}</span>
                  <Popconfirm
                    title="Remove title?"
                    disabled={!is2FAVerified}
                    onConfirm={() => deleteTitleMutation.mutate(t.id)}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      disabled={!is2FAVerified}
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    />
                  </Popconfirm>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                size="small"
                placeholder="New rotation title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Button
                size="small"
                type="primary"
                disabled={!is2FAVerified || !newTitle.trim()}
                onClick={() => addTitleMutation.mutate(newTitle.trim())}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-card border border-border rounded-md p-5">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Interests ({profile?.profile_interests?.length || 0})
            </h2>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {profile?.profile_interests?.map((i) => (
                <Tag
                  key={i.id}
                  closable={is2FAVerified}
                  onClose={() => deleteInterestMutation.mutate(i.id)}
                  className="bg-muted border-border text-foreground text-xs m-0"
                >
                  {i.interest}
                </Tag>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                size="small"
                placeholder="New interest tag..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
              />
              <Button
                size="small"
                type="primary"
                disabled={!is2FAVerified || !newInterest.trim()}
                onClick={() => addInterestMutation.mutate(newInterest.trim())}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-md p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                About Focus ({profile?.about_focus?.length || 0})
              </h2>
              <Button
                size="small"
                type="primary"
                disabled={!is2FAVerified}
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => openFocusModal()}
              >
                Add Card
              </Button>
            </div>
            <div className="space-y-2">
              {profile?.about_focus?.map((item) => (
                <div key={item.id} className="rounded border border-border bg-muted/50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono uppercase text-primary">{item.label}</p>
                      <p className="mt-1 text-xs font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="text"
                        size="small"
                        disabled={!is2FAVerified}
                        aria-label="Edit focus card"
                        icon={<Edit2 className="h-3.5 w-3.5" />}
                        onClick={() => openFocusModal(item)}
                      />
                      <Popconfirm
                        title="Delete focus card?"
                        disabled={!is2FAVerified}
                        onConfirm={() => deleteFocusMutation.mutate(item.id)}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          disabled={!is2FAVerified}
                          aria-label="Delete focus card"
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                        />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={editingFocus ? 'Edit About Focus Card' : 'Add About Focus Card'}
        open={isFocusModalOpen}
        onOk={saveFocus}
        onCancel={() => {
          setIsFocusModalOpen(false);
          setEditingFocus(null);
          focusForm.resetFields();
        }}
        confirmLoading={saveFocusMutation.isPending}
        okText="Save Card"
      >
        <Form form={focusForm} layout="vertical" className="mt-4">
          <Form.Item name="label" label="Category Label" rules={[{ required: true, message: 'Label is required' }]}>
            <Input placeholder="Architecture" />
          </Form.Item>
          <Form.Item name="title" label="Card Title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input placeholder="Thinking in systems" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Description is required' }]}>
            <Input.TextArea rows={4} maxLength={600} showCount placeholder="Describe this engineering perspective..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
