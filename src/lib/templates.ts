export interface PostTemplate {
  id: string;
  name: string;
  content: string;
  post_type: 'text' | 'image' | 'link' | 'video';
  savedAt: string;
}

const TEMPLATES_KEY = 'linkedinflow_templates';

export function loadTemplates(): PostTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTemplate(post: { content: string; post_type?: string }): PostTemplate {
  const templates = loadTemplates();
  const firstLine = post.content.split('\n')[0].slice(0, 50).trim();
  const template: PostTemplate = {
    id: `tpl_${Date.now()}`,
    name: firstLine || 'Untitled template',
    content: post.content,
    post_type: (post.post_type as PostTemplate['post_type']) ?? 'text',
    savedAt: new Date().toISOString(),
  };
  templates.unshift(template);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates.slice(0, 20)));
  return template;
}

export function deleteTemplate(id: string): void {
  const templates = loadTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}
