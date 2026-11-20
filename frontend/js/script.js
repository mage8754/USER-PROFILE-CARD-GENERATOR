const form = document.querySelector('#profile-form');
const generateButton = document.querySelector('#generate-button');
const emptyState = document.querySelector('#empty-state');
const profileCard = document.querySelector('#profile-card');
const previewActions = document.querySelector('#preview-actions');
const toastRegion = document.querySelector('#toast-region');

let currentProfile = null;
let toastTimer;

const fields = ['name', 'title', 'bio', 'email', 'location', 'imageUrl', 'linkedin', 'github'];

function setFieldError(fieldName, message = '') {
  const input = document.querySelector(`#${fieldName}`);
  const error = document.querySelector(`#${fieldName}-error`);
  if (!input || !error) return;

  error.textContent = message;
  if (message) {
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.removeAttribute('aria-invalid');
  }
}

function clearErrors() {
  [...fields, 'skills'].forEach((field) => setFieldError(field));
}

function isHttpUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateForm() {
  clearErrors();
  let valid = true;
  const required = ['name', 'title', 'bio', 'email', 'location'];

  required.forEach((fieldName) => {
    const input = document.querySelector(`#${fieldName}`);
    if (!input.value.trim()) {
      setFieldError(fieldName, 'This field is required.');
      valid = false;
    }
  });

  const email = document.querySelector('#email');
  if (email.value.trim() && !email.validity.valid) {
    setFieldError('email', 'Enter a valid email address.');
    valid = false;
  }

  const skillValues = document.querySelector('#skills').value
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
  if (!skillValues.length) {
    setFieldError('skills', 'Add at least one skill.');
    valid = false;
  } else if (skillValues.length > 12) {
    setFieldError('skills', 'Add no more than 12 skills.');
    valid = false;
  }

  [
    ['imageUrl', 'Profile image URL'],
    ['linkedin', 'LinkedIn URL'],
    ['github', 'GitHub URL']
  ].forEach(([fieldName, label]) => {
    const value = document.querySelector(`#${fieldName}`).value.trim();
    if (value && !isHttpUrl(value)) {
      setFieldError(fieldName, `${label} must start with http:// or https://.`);
      valid = false;
    }
  });

  if (!valid) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
  }
  return valid;
}

function getRequestPayload() {
  const skills = [...new Set(
    document.querySelector('#skills').value
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
  )];
  const socialLinks = {};
  const linkedin = document.querySelector('#linkedin').value.trim();
  const github = document.querySelector('#github').value.trim();

  if (linkedin) socialLinks.linkedin = linkedin;
  if (github) socialLinks.github = github;

  return {
    name: document.querySelector('#name').value.trim(),
    title: document.querySelector('#title').value.trim(),
    bio: document.querySelector('#bio').value.trim(),
    imageUrl: document.querySelector('#imageUrl').value.trim(),
    email: document.querySelector('#email').value.trim(),
    skills,
    location: document.querySelector('#location').value.trim(),
    socialLinks
  };
}

function initialsFor(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function renderProfile(profile) {
  currentProfile = profile;
  document.querySelector('#card-name').textContent = profile.name;
  document.querySelector('#card-title').textContent = profile.title;
  document.querySelector('#card-bio').textContent = profile.bio;
  document.querySelector('#avatar-initials').textContent = initialsFor(profile.name);

  const image = document.querySelector('#card-image');
  const imageUrl = safeExternalUrl(profile.imageUrl);
  image.onerror = () => image.classList.add('is-hidden');
  image.onload = () => image.classList.remove('is-hidden');
  image.src = imageUrl || '';
  image.classList.toggle('is-hidden', !imageUrl);

  const skillsContainer = document.querySelector('#card-skills');
  skillsContainer.replaceChildren();
  profile.skills.forEach((skill) => {
    const badge = document.createElement('span');
    badge.className = 'skill-badge';
    badge.textContent = skill;
    skillsContainer.append(badge);
  });

  const emailLink = document.querySelector('#card-email');
  emailLink.href = `mailto:${profile.email}`;
  emailLink.querySelector('.contact-text').textContent = profile.email;
  document.querySelector('#card-location .contact-text').textContent = profile.location;

  const socialsContainer = document.querySelector('#card-socials');
  socialsContainer.replaceChildren();
  const socialLinks = profile.socialLinks || {};
  ['linkedin', 'github'].forEach((platform) => {
    const href = safeExternalUrl(socialLinks[platform] || '');
    if (!href) return;
    const link = document.createElement('a');
    link.className = 'social-link';
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = platform === 'linkedin' ? 'LinkedIn ↗' : 'GitHub ↗';
    socialsContainer.append(link);
  });

  socialsContainer.classList.toggle('is-hidden', !socialsContainer.childElementCount);
  emptyState.classList.add('is-hidden');
  profileCard.classList.remove('is-hidden');
  previewActions.classList.remove('is-hidden');
}

function showToast(message, type = 'success') {
  window.clearTimeout(toastTimer);
  toastRegion.replaceChildren();

  const toast = document.createElement('div');
  toast.className = `toast${type === 'error' ? ' toast-error' : ''}`;
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = type === 'error' ? '!' : '✓';
  const text = document.createElement('span');
  text.textContent = message;
  toast.append(icon, text);
  toastRegion.append(toast);
  toastTimer = window.setTimeout(() => toast.remove(), 3800);
}

function setLoading(isLoading) {
  generateButton.disabled = isLoading;
  generateButton.classList.toggle('is-loading', isLoading);
  generateButton.querySelector('.button-label').textContent = isLoading
    ? 'Creating your profile…'
    : 'Generate my profile';
}

async function submitProfile(event) {
  event.preventDefault();
  if (!validateForm()) {
    showToast('A few details need your attention.', 'error');
    return;
  }

  setLoading(true);
  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getRequestPayload())
    });

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error('The server returned an unreadable response. Please try again.');
    }

    if (!response.ok || !result.success || !result.profile) {
      if (Array.isArray(result.errors)) {
        result.errors.forEach((error) => {
          const field = error.field.split('.')[0];
          if (field === 'socialLinks') {
            const socialField = error.field.endsWith('linkedin') ? 'linkedin' : 'github';
            setFieldError(socialField, error.message);
          } else {
            setFieldError(field, error.message);
          }
        });
      }
      throw new Error(result.message || 'Unable to generate your profile.');
    }

    renderProfile(result.profile);
    document.querySelector('#preview-caption').textContent = 'Your new introduction is ready to share.';
    showToast(result.message || 'Your profile is ready!');
  } catch (error) {
    showToast(
      error instanceof TypeError
        ? 'Could not reach the server. Check your connection and try again.'
        : error.message,
      'error'
    );
  } finally {
    setLoading(false);
  }
}

async function copyProfile() {
  if (!currentProfile) return;
  const { name, title, bio, email, location, skills, socialLinks = {} } = currentProfile;
  const lines = [
    `${name} — ${title}`,
    bio,
    `Skills: ${skills.join(', ')}`,
    `Email: ${email}`,
    `Location: ${location}`,
    ...Object.entries(socialLinks).map(([platform, url]) => `${platform}: ${url}`)
  ];

  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    showToast('Profile details copied to your clipboard.');
  } catch {
    showToast('Clipboard access is unavailable in this browser.', 'error');
  }
}

async function downloadProfile() {
  if (!currentProfile || typeof window.html2canvas !== 'function') {
    showToast('The image export tool is not available. Please refresh and try again.', 'error');
    return;
  }

  const button = document.querySelector('#download-button');
  button.disabled = true;
  try {
    const canvas = await window.html2canvas(profileCard, {
      backgroundColor: '#ffffff',
      scale: Math.min(window.devicePixelRatio || 1, 2),
      useCORS: true,
      logging: false
    });
    const link = document.createElement('a');
    link.download = `${currentProfile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-profile.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Your profile card has been downloaded.');
  } catch (error) {
    console.error('Profile card export failed:', error);
    showToast('Could not export this card. Try a profile image hosted with CORS enabled.', 'error');
  } finally {
    button.disabled = false;
  }
}

function updateBioCount() {
  const length = document.querySelector('#bio').value.length;
  document.querySelector('#bio-count').textContent = `${length} / 500`;
}

function resetProfile() {
  currentProfile = null;
  clearErrors();
  profileCard.classList.add('is-hidden');
  previewActions.classList.add('is-hidden');
  emptyState.classList.remove('is-hidden');
  document.querySelector('#preview-caption').textContent = 'A polished introduction, ready to share anywhere.';
  document.querySelector('#bio-count').textContent = '0 / 500';
  document.querySelector('#card-image').src = '';
  toastRegion.replaceChildren();
}

form.addEventListener('submit', submitProfile);
form.addEventListener('reset', () => window.setTimeout(resetProfile));
document.querySelector('#bio').addEventListener('input', updateBioCount);
document.querySelector('#copy-button').addEventListener('click', copyProfile);
document.querySelector('#download-button').addEventListener('click', downloadProfile);
