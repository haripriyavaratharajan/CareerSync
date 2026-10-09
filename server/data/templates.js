// Resume templates. The React renderer (client/src/components/Resume.jsx) reads `layout` + `style`.
// Add a template = add one object here; it is upserted into MongoDB on every server start.
const BASE = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements', 'customSections'];
const T = (key, name, description, layout, category, suits, style, defaultOrder = BASE) => ({
  key, name, description, layout, category, suits, defaultOrder, accentColor: style.accent,
  bestFor: suits.slice(0, 3),
  style: { accent2: style.accent, ink: '#1f1b2b', paper: '#ffffff', side: '#f4f1ee', sideInk: '#1f1b2b', band: style.accent, bandInk: '#ffffff',
    headFont: 'DM Sans', bodyFont: 'DM Sans', header: 'plain', heading: 'rule', skills: 'chips', timeline: false, density: 'normal', ...style },
});
const FRESH = ['summary', 'education', 'skills', 'projects', 'experience', 'certifications', 'achievements', 'customSections'];

export const TEMPLATES = [
  T('aurora', 'Aurora', 'Plum sidebar with a coral glow. Modern and confident.', 'sidebar-left', 'Modern', ['Any profession', 'Software', 'Marketing'],
    { accent: '#FF6B4A', accent2: '#D6336C', side: '#2B1442', sideInk: '#F4E9FF', headFont: 'Bricolage Grotesque', heading: 'bar', skills: 'chips' }),
  T('ats-clean', 'ATS Clean', 'Plain single column that applicant-tracking systems read perfectly.', 'single', 'ATS-friendly', ['Any profession', 'Corporate', 'Government'],
    { accent: '#111111', headFont: 'IBM Plex Sans', bodyFont: 'IBM Plex Sans', heading: 'rule', skills: 'plain' }),
  T('executive', 'Executive', 'Charcoal header band with gold details for senior roles.', 'single', 'Professional', ['Management', 'Human Resources', 'Operations'],
    { accent: '#B8892B', band: '#1F2A37', header: 'band', headFont: 'Playfair Display', heading: 'caps', skills: 'tags' }),
  T('scholar', 'Scholar', 'Centered serif layout for academia, research and teaching.', 'single', 'Academic', ['Education', 'Research', 'Science'],
    { accent: '#7A2E4D', headFont: 'Libre Baskerville', bodyFont: 'Lora', header: 'centered', heading: 'caps', skills: 'plain' }, ['summary', 'education', 'experience', 'projects', 'certifications', 'achievements', 'skills', 'customSections']),
  T('studio', 'Studio', 'Blush sidebar on the right, punchy pink accents.', 'sidebar-right', 'Creative', ['Design', 'Media', 'Marketing'],
    { accent: '#E5195F', accent2: '#FF9F1C', side: '#FFE1EC', sideInk: '#3B0A24', headFont: 'Space Grotesk', heading: 'pill', skills: 'chips' }),
  T('care', 'Care', 'Calm teal with rounded headings for health and wellness.', 'single', 'Healthcare', ['Healthcare', 'Pharmacy', 'Beauty / Wellness'],
    { accent: '#0E9F8E', accent2: '#12B886', header: 'split', heading: 'pill', skills: 'chips' }),
  T('blueprint', 'Blueprint', 'Technical two-column with mono headings and boxed titles.', 'two-column', 'Technical', ['Engineering', 'Manufacturing', 'Information Technology'],
    { accent: '#E8590C', headFont: 'IBM Plex Mono', bodyFont: 'IBM Plex Sans', heading: 'boxed', skills: 'grid' }),
  T('fresh-start', 'Fresh Start', 'Education and skills first. Made for students and freshers.', 'single', 'Entry level', ['Freshers', 'Students', 'Any profession'],
    { accent: '#12B886', accent2: '#82C91E', header: 'gradient', headFont: 'Poppins', heading: 'bar', skills: 'chips' }, FRESH),
  T('ledger', 'Ledger', 'Soft green sidebar with serif headings. Trustworthy.', 'sidebar-left', 'Business', ['Finance', 'Accounting', 'Banking'],
    { accent: '#166534', side: '#E6F2EA', sideInk: '#14332A', headFont: 'Merriweather', heading: 'rule', skills: 'tags' }),
  T('counsel', 'Counsel', 'Formal centered serif with burgundy accents.', 'single', 'Formal', ['Legal', 'Compliance', 'Government'],
    { accent: '#7C1D2E', headFont: 'Lora', bodyFont: 'Lora', header: 'centered', heading: 'caps', skills: 'plain' }),
  T('closer', 'Closer', 'Bold amber band. Built to be noticed in sales and business.', 'single', 'Bold', ['Sales', 'Business Development', 'Retail'],
    { accent: '#E8590C', band: '#F59F00', bandInk: '#2b1a00', header: 'band', headFont: 'Poppins', heading: 'bar', skills: 'chips' }),
  T('friendly', 'Friendly', 'Warm and approachable for service and hospitality.', 'single', 'Service', ['Customer Service', 'Hospitality', 'Retail'],
    { accent: '#F76707', accent2: '#0CA678', header: 'centered', headFont: 'Poppins', heading: 'pill', skills: 'chips' }),
  T('timeline', 'Timeline', 'Career story on a vertical timeline.', 'single', 'Modern', ['Any profession', 'Operations', 'Media'],
    { accent: '#7048E8', accent2: '#F06595', headFont: 'Space Grotesk', heading: 'bar', skills: 'chips', timeline: true }),
  T('mono-minimal', 'Mono Minimal', 'Airy, quiet and typographic. Lets the content speak.', 'single', 'Minimal', ['Design', 'Software', 'Research'],
    { accent: '#222222', headFont: 'IBM Plex Mono', bodyFont: 'IBM Plex Sans', heading: 'caps', skills: 'plain', density: 'airy' }),
  T('sunset', 'Sunset', 'Gradient header with a two-column body.', 'two-column', 'Creative', ['Marketing', 'Media', 'Any profession'],
    { accent: '#FF6B4A', accent2: '#D6336C', header: 'gradient', headFont: 'Bricolage Grotesque', heading: 'bar', skills: 'chips' }),
  T('workshop', 'Workshop', 'Heavy black and yellow blocks for trades and technical services.', 'single', 'Bold', ['Skilled Trades', 'Logistics', 'Manufacturing'],
    { accent: '#F08C00', band: '#212529', bandInk: '#FFD43B', header: 'band', headFont: 'Poppins', heading: 'boxed', skills: 'grid' }),
  T('harvest', 'Harvest', 'Earthy forest sidebar for agriculture, NGOs and community work.', 'sidebar-left', 'Community', ['Agriculture', 'Social Work', 'Government'],
    { accent: '#2F9E44', accent2: '#F59F00', side: '#173B2A', sideInk: '#E7F5EC', headFont: 'Bricolage Grotesque', heading: 'bar', skills: 'tags' }),
];
